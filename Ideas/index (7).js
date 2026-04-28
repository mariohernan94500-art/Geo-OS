import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import pm2 from 'pm2';
import { runOpenRouter, runGroq, runDeepSeek } from '../ai/index.js';
import { getDatabase } from '../database/sqlite.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const APPS_DIR = path.resolve(PROJECT_ROOT, 'apps');
const BASE_PORT = 4000;

// ─── JSON extraction helper ──────────────────────────────────────────────────

function extractJSON(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      let fixed = jsonMatch[0];
      // Remove trailing commas before } or ]
      fixed = fixed.replace(/,\s*([}\]])/g, '$1');
      try {
        return JSON.parse(fixed);
      } catch (e2) {
        console.error('[Generator] Failed to parse JSON even after fix:', e2.message);
        return null;
      }
    }
  }
  return null;
}

// ─── Sanitize idea into a kebab-case name ────────────────────────────────────

function sanitizeAppName(idea) {
  const stopWords = new Set([
    'una', 'un', 'el', 'la', 'los', 'las', 'de', 'del', 'en', 'con',
    'por', 'para', 'que', 'se', 'al', 'es', 'lo', 'su', 'como',
    'más', 'muy', 'tan', 'y', 'o', 'a', 'e', 'i', 'u',
    'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'and', 'or', 'is', 'it', 'that', 'this', 'so',
    'my', 'your', 'app', 'application', 'web', 'make', 'create', 'build'
  ]);

  const words = idea
    .toLowerCase()
    .replace(/[^a-záéíóúñü0-9\s-]/g, '')
    .split(/[\s-]+/)
    .filter(w => w.length > 1 && !stopWords.has(w));

  const selected = words.slice(0, 4);
  return selected.join('-') || 'generated-app';
}

// ─── PM2 helpers ─────────────────────────────────────────────────────────────

function startAppWithPM2(appName, backendDir) {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        console.error('[Generator] PM2 connect error:', err.message);
        return reject(err);
      }
      pm2.start(
        {
          script: path.resolve(backendDir, 'server.js'),
          name: `geo-${appName}`,
          cwd: backendDir,
          instances: 1,
          exec_mode: 'fork'
        },
        (err, proc) => {
          pm2.disconnect();
          if (err) {
            console.error('[Generator] PM2 start error:', err.message);
            return reject(err);
          }
          console.log(`[Generator] App ${appName} started with PM2`);
          resolve(proc);
        }
      );
    });
  });
}

function stopAppWithPM2(appName) {
  return new Promise((resolve) => {
    pm2.connect((err) => {
      if (err) {
        resolve();
        return;
      }
      pm2.delete(`geo-${appName}`, (err) => {
        pm2.disconnect();
        resolve();
      });
    });
  });
}

// ─── getNextPort ─────────────────────────────────────────────────────────────

export async function getNextPort() {
  const db = await getDatabase();
  const result = await db.get('SELECT MAX(port) as max_port FROM apps');
  const maxPort = result?.max_port || BASE_PORT - 1;
  return maxPort + 1;
}

// ─── listApps ────────────────────────────────────────────────────────────────

export async function listApps() {
  const db = await getDatabase();
  const apps = await db.all('SELECT * FROM apps ORDER BY created_at DESC');
  return apps;
}

// ─── getApp ──────────────────────────────────────────────────────────────────

export async function getApp(name) {
  const db = await getDatabase();
  const app = await db.get('SELECT * FROM apps WHERE name = ?', [name]);
  return app;
}

// ─── deleteApp ───────────────────────────────────────────────────────────────

export async function deleteApp(name) {
  const db = await getDatabase();
  const app = await db.get('SELECT * FROM apps WHERE name = ?', [name]);
  if (!app) throw new Error('App no encontrada');

  // Stop PM2 process
  await stopAppWithPM2(name);

  // Remove files
  const appDir = path.resolve(APPS_DIR, name);
  if (fs.existsSync(appDir)) {
    fs.rmSync(appDir, { recursive: true, force: true });
  }

  // Remove from DB
  await db.run('DELETE FROM apps WHERE name = ?', [name]);

  return { success: true, name };
}

// ─── createAppFromIdea (CRITICAL) ───────────────────────────────────────────

export async function createAppFromIdea(idea, port = null) {
  try {
    // 1. Determine port
    if (!port) {
      port = await getNextPort();
    }

    // 2. Sanitize app name
    const appName = sanitizeAppName(idea);

    // 3. Call OpenRouter with detailed architecture prompt
    const openRouterPrompt = `Eres un arquitecto de software senior. Diseña una aplicación web fullstack basada en esta idea: "${idea}".

Retorna SOLO un JSON válido sin markdown ni bloques de código, con esta estructura exacta:
{
  "name": "${appName}",
  "description": "Breve descripción de la app",
  "frontend": {
    "index.html": "CÓDIGO HTML COMPLETO aquí - debe ser una página funcional completa con estilo inline y scripts, que haga fetch al backend",
    "style.css": "CÓDIGO CSS COMPLETO aquí",
    "script.js": "CÓDIGO JS COMPLETO aquí - debe hacer fetch a la URL del backend"
  },
  "backend": {
    "server.js": "CÓDIGO JS COMPLETO aquí - servidor Express que escucha en puerto ${port} con CORS habilitado, rutas CRUD completas, y una ruta GET / de bienvenida",
    "routes.js": "CÓDIGO JS COMPLETO aquí - rutas Express Router con todas las operaciones CRUD",
    "db.json": "{}"
  }
}

REGLAS IMPORTANTES:
- El frontend DEBE hacer fetch a http://localhost:${port} (el backend)
- El backend DEBE usar Express con cors() y express.json()
- El backend DEBE tener rutas CRUD funcionales (GET, POST, PUT, DELETE)
- El backend DEBE escuchar en el puerto ${port}
- El frontend DEBE ser una interfaz completa y funcional, no un placeholder
- Todo el código debe ser completo y ejecutable, sin comentarios TODO
- NO uses markdown ni bloques de código, SOLO el JSON`;

    console.log(`[Generator] Calling OpenRouter for app "${appName}" on port ${port}...`);
    let aiResponse = await runOpenRouter(openRouterPrompt);

    // 4. Parse the JSON response
    let appData = extractJSON(aiResponse);

    // 5. If JSON parsing fails, retry with Groq using a simpler prompt
    if (!appData) {
      console.log('[Generator] OpenRouter JSON parse failed, retrying with Groq...');
      const groqPrompt = `Genera una app web simple para: "${idea}". Responde SOLO con JSON (sin markdown):
{"name":"${appName}","description":"desc","frontend":{"index.html":"<!DOCTYPE html>...","style.css":"body{...}","script.js":"fetch('http://localhost:${port}')..."},"backend":{"server.js":"import express from 'express'...","routes.js":"import {Router}...","db.json":"{}"}}
Backend en puerto ${port}. Todo funcional, sin TODO.`;

      aiResponse = await runGroq(groqPrompt);
      appData = extractJSON(aiResponse);

      // Second fallback: try DeepSeek
      if (!appData) {
        console.log('[Generator] Groq JSON parse also failed, retrying with DeepSeek...');
        const deepSeekPrompt = `Create a simple web app for: "${idea}". Return ONLY valid JSON (no markdown): {"name":"${appName}","description":"desc","frontend":{"index.html":"complete html","style.css":"complete css","script.js":"complete js fetching http://localhost:${port}"},"backend":{"server.js":"complete express server on port ${port}","routes.js":"complete CRUD routes","db.json":"{}"}}`;
        aiResponse = await runDeepSeek(deepSeekPrompt);
        appData = extractJSON(aiResponse);
      }
    }

    if (!appData) {
      throw new Error('Failed to generate app: all AI providers returned unparseable responses');
    }

    // Ensure the app name from our sanitized version
    appData.name = appData.name || appName;

    console.log(`[Generator] App data parsed successfully for "${appData.name}"`);

    // 6. Create directories
    const appDir = path.resolve(APPS_DIR, appData.name);
    const frontendDir = path.resolve(appDir, 'frontend');
    const backendDir = path.resolve(appDir, 'backend');

    fs.mkdirSync(frontendDir, { recursive: true });
    fs.mkdirSync(backendDir, { recursive: true });

    console.log(`[Generator] Directories created: ${appDir}`);

    // 7. Write all files
    // Frontend files
    if (appData.frontend && typeof appData.frontend === 'object') {
      for (const [fileName, content] of Object.entries(appData.frontend)) {
        try {
          const filePath = path.resolve(frontendDir, fileName);
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`[Generator] Wrote frontend file: ${fileName}`);
        } catch (writeErr) {
          console.error(`[Generator] Error writing frontend file ${fileName}:`, writeErr.message);
        }
      }
    }

    // Backend files
    if (appData.backend && typeof appData.backend === 'object') {
      for (const [fileName, content] of Object.entries(appData.backend)) {
        try {
          const filePath = path.resolve(backendDir, fileName);
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`[Generator] Wrote backend file: ${fileName}`);
        } catch (writeErr) {
          console.error(`[Generator] Error writing backend file ${fileName}:`, writeErr.message);
        }
      }
    }

    // 8. Add package.json for the generated app's backend
    const backendPackageJson = {
      name: appData.name,
      version: '1.0.0',
      type: 'module',
      scripts: { start: 'node server.js' },
      dependencies: { express: '^4.18.2', cors: '^2.8.5' }
    };

    try {
      fs.writeFileSync(
        path.resolve(backendDir, 'package.json'),
        JSON.stringify(backendPackageJson, null, 2)
      );
      console.log(`[Generator] package.json written for ${appData.name}`);
    } catch (pkgErr) {
      console.error(`[Generator] Error writing package.json:`, pkgErr.message);
    }

    // 9. Install dependencies for the generated app
    try {
      execSync('npm install', { cwd: backendDir, stdio: 'pipe', timeout: 60000 });
      console.log(`[Generator] Dependencies installed for ${appData.name}`);
    } catch (err) {
      console.error(`[Generator] npm install failed for ${appData.name}:`, err.message);
      // Continue anyway - the app might still work
    }

    // 10. Launch with PM2
    try {
      await startAppWithPM2(appData.name, backendDir);
    } catch (pm2Err) {
      console.error(`[Generator] PM2 launch failed for ${appData.name}:`, pm2Err.message);
      // Continue - we still want to save the app to DB
    }

    // 11. Save to SQLite
    const db = await getDatabase();
    const appId = uuidv4();
    await db.run(
      'INSERT INTO apps (id, name, description, status, port, metrics) VALUES (?, ?, ?, ?, ?, ?)',
      [
        appId,
        appData.name,
        appData.description || idea,
        'running',
        port,
        JSON.stringify({ cpu: 0, memory: 0, requests: 0 })
      ]
    );
    console.log(`[Generator] App ${appData.name} saved to database (id: ${appId})`);

    // 12. Save to memory.json (template for future learning)
    const memoryDir = path.resolve(PROJECT_ROOT, 'data');
    const memoryPath = path.resolve(memoryDir, 'memory.json');

    let memory = { templates: [], learned_patterns: [], generated_apps: [] };
    try {
      memory = JSON.parse(fs.readFileSync(memoryPath, 'utf-8'));
    } catch {
      // memory.json doesn't exist or is invalid — use defaults
    }

    if (!memory.generated_apps) {
      memory.generated_apps = [];
    }

    memory.generated_apps.push({
      name: appData.name,
      idea,
      port,
      created_at: new Date().toISOString()
    });

    try {
      fs.mkdirSync(memoryDir, { recursive: true });
      fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
      console.log(`[Generator] Memory updated with app ${appData.name}`);
    } catch (memErr) {
      console.error('[Generator] Error writing memory.json:', memErr.message);
    }

    // 13. Return the result
    return {
      success: true,
      name: appData.name,
      port,
      url: `http://localhost:${port}`,
      frontendUrl: `http://localhost:${port}/public`,
      description: appData.description || idea
    };
  } catch (err) {
    console.error('[Generator] createAppFromIdea error:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

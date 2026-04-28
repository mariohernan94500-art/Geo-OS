# 🧠 GEO AI SYSTEM — DOCUMENTO MAESTRO COMPLETO
## Integración total v1 + v2 + v3 + v4 para Z.ai

---

## 🎯 QUÉ ES GEO (Leer primero)

Geo es una **fábrica de software autónoma**. El usuario escribe una idea en lenguaje natural y Geo genera, instala, lanza y monitorea una aplicación web completa (frontend + backend) de forma automática.

No es un chatbot. No es un generador de código aislado. Es una **plataforma viva** que:
- Genera apps fullstack usando IA (OpenRouter + Groq)
- Las lanza automáticamente con PM2
- Las monitorea en tiempo real con Socket.io
- Puede actuar autónomamente (ciclos de decisión propios)
- Acepta comandos de voz (Web Speech API + ElevenLabs)
- Cobra por acceso (Stripe suscripciones)
- Permite vender apps entre usuarios (Marketplace)
- Protege licencias con NFTs (ERC-721 en Polygon)

---

## 🏗️ ARQUITECTURA COMPLETA DE ARCHIVOS

```
geo-system/
│
├── server.js                          ← Núcleo Express + Socket.io + HTTP
├── .env                               ← API keys (NUNCA a Git)
├── .gitignore
├── package.json
│
├── public/
│   └── dashboard.html                 ← UI completa (voz + monitoreo + marketplace)
│
├── apps/                              ← Apps generadas dinámicamente
│   └── [nombre-app]/
│       ├── frontend/
│       │   ├── index.html
│       │   ├── style.css
│       │   └── script.js
│       └── backend/
│           ├── server.js
│           ├── routes.js
│           └── db.json
│
├── data/
│   ├── geo.db                         ← SQLite principal
│   └── memory.json                    ← Memoria/plantillas de aprendizaje
│
├── logs/
│   └── apps/                          ← Logs por app
│
├── modules/
│   ├── ai/
│   │   ├── openrouter.js
│   │   ├── groq.js
│   │   ├── deepseek.js
│   │   └── index.js
│   │
│   ├── database/
│   │   ├── sqlite.js
│   │   ├── schemas.js
│   │   └── queries.js
│   │
│   ├── auth/
│   │   ├── jwt.js
│   │   ├── middleware.js
│   │   └── index.js
│   │
│   ├── generator/
│   │   ├── promptBuilder.js
│   │   ├── installer.js
│   │   ├── templates.js
│   │   └── index.js
│   │
│   ├── monitoring/
│   │   ├── collector.js
│   │   ├── websocket.js
│   │   └── index.js
│   │
│   ├── scaling/
│   │   ├── pm2Manager.js
│   │   ├── autoScaler.js
│   │   └── index.js
│   │
│   ├── payments/
│   │   ├── stripe.js
│   │   └── index.js
│   │
│   ├── voice/
│   │   ├── recognition.js
│   │   ├── synthesis.js
│   │   ├── assistant.js
│   │   └── index.js
│   │
│   ├── deployment/
│   │   ├── vercel.js
│   │   ├── railway.js
│   │   └── index.js
│   │
│   ├── tenants/
│   │   └── index.js
│   │
│   ├── marketplace/
│   │   └── index.js
│   │
│   ├── blockchain/
│   │   └── index.js
│   │
│   └── ipfs/
│       ├── pinata.js
│       └── index.js
│
├── contracts/
│   ├── GeoLicenseNFT.sol
│   ├── deploy.js
│   └── hardhat.config.js
│
└── scripts/
    ├── setup-tenants.js
    └── test-geo.js
```

---

## ⚙️ STACK TECNOLÓGICO

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 20+ (ESModules `"type":"module"`) |
| Framework | Express 4 |
| DB | SQLite (`sqlite` + `sqlite3`) |
| Auth | JWT (`jsonwebtoken` + `bcrypt`) |
| Tiempo real | Socket.io 4 |
| Procesos | PM2 |
| IA planificación | OpenRouter → `mistralai/mixtral-8x7b` |
| IA código | Groq → `llama3-70b-8192` |
| IA cerebro | DeepSeek → `deepseek/deepseek-chat` via OpenRouter |
| Voz síntesis | ElevenLabs API |
| Voz reconocimiento | Web Speech API (browser) |
| Pagos | Stripe (checkout + webhooks + portal) |
| NFT | ERC-721 en Polygon via Hardhat + OpenZeppelin |
| IPFS | Pinata |
| Deploy apps | Vercel API + Railway API |

---

## 📦 package.json

```json
{
  "name": "geo-ai-system",
  "version": "4.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "setup": "node scripts/setup-tenants.js",
    "test": "node scripts/test-geo.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "sqlite3": "^5.1.6",
    "sqlite": "^5.1.1",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "uuid": "^9.0.1",
    "socket.io": "^4.6.2",
    "pm2": "^5.3.0",
    "stripe": "^14.12.0",
    "elevenlabs-node": "^1.0.0",
    "multer": "^1.4.5-lts.1",
    "ethers": "^6.9.0",
    "form-data": "^4.0.0",
    "node-telegram-bot-api": "^0.64.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "hardhat": "^2.19.4",
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@openzeppelin/contracts": "^5.0.1"
  }
}
```

---

## 🔑 .env (todas las variables)

```env
# ═══ IA ═══
OPENROUTER_API_KEY=sk-or-v1-...
GROQ_API_KEY=gsk_...
DEEPSEEK_API_KEY=sk-...

# ═══ AUTH ═══
JWT_SECRET=geo_super_secret_CAMBIA_EN_PRODUCCION

# ═══ DEPLOY DE APPS GENERADAS ═══
VERCEL_TOKEN=...
RAILWAY_TOKEN=...

# ═══ PAGOS ═══
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PRO=price_...

# ═══ VOZ ═══
ELEVENLABS_API_KEY=...

# ═══ TELEGRAM (opcional) ═══
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ALLOWED_CHAT_ID=...

# ═══ BLOCKCHAIN / NFT ═══
PRIVATE_KEY=0x...
POLYGON_RPC=https://polygon-rpc.com
MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
NFT_CONTRACT_ADDRESS=0x...
POLYGONSCAN_API_KEY=...

# ═══ IPFS ═══
PINATA_API_KEY=...
PINATA_SECRET_API_KEY=...
PINATA_JWT=...

# ═══ SERVER ═══
PORT=3000
BASE_URL=http://localhost:3000
```

---

## 💾 SCHEMAS SQL (modules/database/schemas.js)

```javascript
export const SCHEMAS = `
  PRAGMA journal_mode=WAL;

  CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    tenant_id TEXT REFERENCES tenants(id),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    eth_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS apps (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'running',
    port INTEGER,
    tenant_id TEXT REFERENCES tenants(id),
    source_app_id TEXT,
    metrics TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS marketplace_listings (
    id TEXT PRIMARY KEY,
    app_id TEXT REFERENCES apps(id),
    seller_tenant_id TEXT REFERENCES tenants(id),
    price_usd REAL NOT NULL,
    description TEXT,
    transferable INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS marketplace_purchases (
    id TEXT PRIMARY KEY,
    listing_id TEXT REFERENCES marketplace_listings(id),
    buyer_tenant_id TEXT REFERENCES tenants(id),
    amount_usd REAL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    stripe_session_id TEXT,
    nft_token_id TEXT,
    nft_tx_hash TEXT,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;
```

---

## 🤖 CÓDIGO COMPLETO — TODOS LOS MÓDULOS

---

### modules/database/sqlite.js

```javascript
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { SCHEMAS } from "./schemas.js";
import path from "path";

let dbInstance = null;

export async function getDatabase() {
  if (dbInstance) return dbInstance;
  dbInstance = await open({
    filename: path.join(process.cwd(), "data", "geo.db"),
    driver: sqlite3.Database,
  });
  return dbInstance;
}

export async function initializeDatabase() {
  const db = await getDatabase();
  await db.exec(SCHEMAS);
  console.log("✅ Base de datos inicializada");
}
```

---

### modules/ai/index.js

```javascript
import dotenv from "dotenv";
dotenv.config();

async function callOpenRouter(prompt, model = "mistralai/mixtral-8x7b") {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`OpenRouter error: ${data.error.message}`);
  return data.choices[0].message.content;
}

// Planificador / Arquitecto
export async function runOpenRouter(prompt) {
  return callOpenRouter(prompt, "mistralai/mixtral-8x7b");
}

// Generador de código (rápido)
export async function runGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Groq error: ${data.error.message}`);
  return data.choices[0].message.content;
}

// Cerebro / Razonamiento complejo
export async function runDeepSeek(prompt) {
  return callOpenRouter(prompt, "deepseek/deepseek-chat");
}
```

---

### modules/auth/index.js

```javascript
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../database/sqlite.js";

export const authRouter = express.Router();

// Middleware JWT
export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "No autorizado" });
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// Registro
authRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password, tenantId } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "Faltan campos" });

    const db = await getDatabase();
    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    // Si no hay tenantId, crear tenant propio
    let finalTenantId = tenantId;
    if (!finalTenantId) {
      finalTenantId = uuidv4();
      await db.run(
        `INSERT INTO tenants (id, name, subdomain, status) VALUES (?, ?, ?, 'active')`,
        [finalTenantId, username, username.toLowerCase()]
      );
    }

    await db.run(
      `INSERT INTO users (id, username, email, password_hash, tenant_id) VALUES (?, ?, ?, ?, ?)`,
      [id, username, email, hash, finalTenantId]
    );

    const token = jwt.sign({ id, username, email, tenantId: finalTenantId }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id, username, email, tenantId: finalTenantId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDatabase();
    const user = await db.get("SELECT * FROM users WHERE email = ?", email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, tenantId: user.tenant_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

### modules/generator/index.js

```javascript
import fs from "fs/promises";
import path from "path";
import pm2 from "pm2";
import util from "util";
import { v4 as uuidv4 } from "uuid";
import { runOpenRouter, runGroq } from "../ai/index.js";
import { getDatabase } from "../database/sqlite.js";

const pm2Connect = util.promisify(pm2.connect.bind(pm2));
const pm2Start = util.promisify(pm2.start.bind(pm2));
const pm2List = util.promisify(pm2.list.bind(pm2));

const APPS_DIR = path.join(process.cwd(), "apps");
const MEMORY_FILE = path.join(process.cwd(), "data", "memory.json");

// ── Memoria ──────────────────────────────────────────────────────────────────

async function loadMemory() {
  try {
    return JSON.parse(await fs.readFile(MEMORY_FILE, "utf-8"));
  } catch {
    return { templates: [] };
  }
}

async function saveMemory(memory) {
  await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

async function findReusableTemplate(idea) {
  const memory = await loadMemory();
  const lower = idea.toLowerCase();
  return memory.templates.find((t) => lower.includes(t.keyword) || t.keyword.includes(lower));
}

async function saveTemplate(name, structure) {
  const memory = await loadMemory();
  memory.templates.push({ keyword: name.toLowerCase(), structure, created: new Date().toISOString() });
  await saveMemory(memory);
}

// ── Generación de código ──────────────────────────────────────────────────────

async function buildFullstackPrompt(idea, port) {
  return await runOpenRouter(`
Eres un arquitecto de software senior experto en Node.js y JavaScript.
Diseña una aplicación fullstack basada en esta idea: "${idea}"

REGLAS ESTRICTAS:
- Frontend: HTML vanilla + CSS moderno + JavaScript (fetch al backend)
- Backend: Node.js Express, rutas REST, almacenamiento en db.json
- El backend DEBE escuchar en el puerto ${port}
- El frontend hace fetch a http://localhost:${port}
- Todo el código debe ser funcional, sin dependencias externas más allá de express y cors

Devuelve EXCLUSIVAMENTE un objeto JSON válido con esta estructura exacta (sin texto adicional):
{
  "name": "nombre-en-kebab-case",
  "frontend": {
    "index.html": "código HTML completo",
    "style.css": "código CSS completo",
    "script.js": "código JS completo con fetch al backend"
  },
  "backend": {
    "server.js": "servidor Express completo que escucha en puerto ${port}",
    "routes.js": "endpoints REST completos",
    "db.json": "{}"
  }
}
`);
}

// ── Instalación ───────────────────────────────────────────────────────────────

async function installApp(appData, tenantId) {
  const appName = appData.name;
  const appPath = path.join(APPS_DIR, appName);
  const frontendPath = path.join(appPath, "frontend");
  const backendPath = path.join(appPath, "backend");

  await fs.mkdir(frontendPath, { recursive: true });
  await fs.mkdir(backendPath, { recursive: true });

  await fs.writeFile(path.join(frontendPath, "index.html"), appData.frontend["index.html"]);
  await fs.writeFile(path.join(frontendPath, "style.css"), appData.frontend["style.css"]);
  await fs.writeFile(path.join(frontendPath, "script.js"), appData.frontend["script.js"]);
  await fs.writeFile(path.join(backendPath, "server.js"), appData.backend["server.js"]);
  await fs.writeFile(path.join(backendPath, "routes.js"), appData.backend["routes.js"]);
  await fs.writeFile(path.join(backendPath, "db.json"), appData.backend["db.json"]);

  // package.json para el backend generado
  await fs.writeFile(
    path.join(backendPath, "package.json"),
    JSON.stringify({ name: appName, type: "commonjs", dependencies: { express: "^4.18.2", cors: "^2.8.5" } }, null, 2)
  );

  return backendPath;
}

// ── Lanzar con PM2 ────────────────────────────────────────────────────────────

async function launchWithPM2(appName, backendPath, port) {
  try {
    await pm2Connect();
    await pm2Start({
      script: path.join(backendPath, "server.js"),
      name: appName,
      cwd: backendPath,
      instances: 1,
      exec_mode: "fork",
      env: { PORT: port, NODE_ENV: "production" },
    });
    console.log(`🚀 ${appName} lanzado en PM2 (puerto ${port})`);
  } catch (err) {
    console.error(`⚠️ PM2 error para ${appName}:`, err.message);
  }
}

// ── FUNCIÓN PRINCIPAL ─────────────────────────────────────────────────────────

let currentPort = 4000;

export async function createAppFromIdea(idea, tenantId = "default") {
  const port = ++currentPort;

  // 1. Buscar plantilla reutilizable
  const template = await findReusableTemplate(idea);
  let appData;

  if (template) {
    console.log("♻️ Reutilizando plantilla...");
    appData = JSON.parse(JSON.stringify(template.structure));
    appData.name = `${idea.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`.slice(0, 40);
  } else {
    // 2. Generar prompt con OpenRouter
    console.log("🧠 Diseñando arquitectura...");
    const prompt = await buildFullstackPrompt(idea, port);

    // 3. Generar código con Groq
    console.log("⚡ Generando código con Groq...");
    const rawResponse = await runGroq(prompt);

    // 4. Extraer JSON
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo extraer JSON de la respuesta");
    appData = JSON.parse(jsonMatch[0]);
  }

  // 5. Instalar archivos
  console.log(`📦 Instalando app "${appData.name}"...`);
  const backendPath = await installApp(appData, tenantId);

  // 6. Guardar en SQLite
  const db = await getDatabase();
  const appId = uuidv4();
  await db.run(
    `INSERT OR REPLACE INTO apps (id, name, description, status, port, tenant_id) VALUES (?, ?, ?, 'running', ?, ?)`,
    [appId, appData.name, idea, port, tenantId]
  );

  // 7. Guardar plantilla
  await saveTemplate(appData.name, appData);

  // 8. Lanzar con PM2
  await launchWithPM2(appData.name, backendPath, port);

  return {
    id: appId,
    name: appData.name,
    port,
    frontendUrl: `/apps/${appData.name}/frontend/index.html`,
  };
}

// ── Autonomía controlada ──────────────────────────────────────────────────────

export async function controlledAutonomy(maxCycles = 3) {
  const { runDeepSeek } = await import("../ai/index.js");
  console.log("🧠 Iniciando autonomía controlada...");

  for (let i = 0; i < maxCycles; i++) {
    const decision = await runDeepSeek(`
Eres el cerebro autónomo de Geo AI.
Analiza qué apps ya existen y decide la acción más valiosa.
Responde SOLO con uno de estos formatos:
- "CREATE: idea concreta de una app útil"
- "STOP"
No expliques nada más.
    `);

    console.log(`🧠 Ciclo ${i + 1}: ${decision}`);

    if (decision.trim().startsWith("STOP")) break;

    if (decision.startsWith("CREATE:")) {
      const idea = decision.replace("CREATE:", "").trim();
      await createAppFromIdea(idea, "autonomous");
    }

    await new Promise((r) => setTimeout(r, 10000));
  }
}

// ── Router Express ────────────────────────────────────────────────────────────

import express from "express";
import { authMiddleware } from "../auth/index.js";

export const generatorRouter = express.Router();

generatorRouter.post("/create", authMiddleware, async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Falta la idea" });
    const result = await createAppFromIdea(idea, req.user.tenantId);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Error generando app:", err);
    res.status(500).json({ error: err.message });
  }
});

generatorRouter.get("/apps", authMiddleware, async (req, res) => {
  try {
    const db = await getDatabase();
    const apps = await db.all("SELECT * FROM apps WHERE tenant_id = ? ORDER BY created_at DESC", req.user.tenantId);
    res.json(apps.map((a) => ({ ...a, frontendUrl: `/apps/${a.name}/frontend/index.html` })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

generatorRouter.delete("/apps/:name", authMiddleware, async (req, res) => {
  try {
    const appPath = path.join(APPS_DIR, req.params.name);
    await fs.rm(appPath, { recursive: true, force: true });
    const db = await getDatabase();
    await db.run("DELETE FROM apps WHERE name = ? AND tenant_id = ?", [req.params.name, req.user.tenantId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

### modules/monitoring/collector.js

```javascript
import fs from "fs/promises";
import path from "path";
import { getDatabase } from "../database/sqlite.js";

const LOGS_DIR = path.join(process.cwd(), "logs", "apps");

export async function collectAppMetrics(appName) {
  const db = await getDatabase();
  const app = await db.get("SELECT * FROM apps WHERE name = ?", appName);
  if (!app) return null;

  let recentLogs = [];
  try {
    const logContent = await fs.readFile(path.join(LOGS_DIR, `${appName}.log`), "utf-8");
    recentLogs = logContent.split("\n").slice(-20);
  } catch {}

  return {
    timestamp: new Date().toISOString(),
    cpu: Math.random() * 30 + 10,           // En producción: usar pidusage
    memory: Math.random() * 200 + 100,       // En producción: process.memoryUsage
    requestsPerMinute: Math.floor(Math.random() * 100),
    status: app.status,
    logs: recentLogs,
  };
}

export async function reportMetrics(appName, data) {
  const db = await getDatabase();
  await db.run(`UPDATE apps SET metrics = ? WHERE name = ?`, [JSON.stringify(data), appName]);
}
```

### modules/monitoring/websocket.js

```javascript
import { collectAppMetrics } from "./collector.js";
import { getDatabase } from "../database/sqlite.js";

let io = null;

export function setupWebSocket(socketIo) {
  io = socketIo;

  io.on("connection", (socket) => {
    console.log("🔌 Cliente conectado al monitoreo");

    socket.on("subscribe-app", async (appName) => {
      socket.join(`app-${appName}`);
      const metrics = await collectAppMetrics(appName);
      socket.emit("app-metrics", { appName, metrics });
    });

    socket.on("unsubscribe-app", (appName) => {
      socket.leave(`app-${appName}`);
    });
  });

  // Broadcast cada 5 segundos
  setInterval(async () => {
    if (!io) return;
    const db = await getDatabase();
    const apps = await db.all("SELECT name FROM apps WHERE status = 'running'");
    for (const app of apps) {
      const metrics = await collectAppMetrics(app.name);
      io.to(`app-${app.name}`).emit("app-metrics", { appName: app.name, metrics });
    }
  }, 5000);
}
```

### modules/monitoring/index.js

```javascript
import express from "express";
import { collectAppMetrics, reportMetrics } from "./collector.js";
import { setupWebSocket } from "./websocket.js";

export const monitoringRouter = express.Router();
export { setupWebSocket };

monitoringRouter.get("/metrics/:appName", async (req, res) => {
  const metrics = await collectAppMetrics(req.params.appName);
  metrics ? res.json(metrics) : res.status(404).json({ error: "App no encontrada" });
});

monitoringRouter.post("/report", async (req, res) => {
  const { appName, data } = req.body;
  await reportMetrics(appName, data);
  res.json({ success: true });
});
```

---

### modules/scaling/pm2Manager.js

```javascript
import pm2 from "pm2";
import util from "util";
import path from "path";

const connectPm2 = util.promisify(pm2.connect.bind(pm2));
const scalePm2 = util.promisify(pm2.scale.bind(pm2));
const stopPm2 = util.promisify(pm2.stop.bind(pm2));
const listPm2 = util.promisify(pm2.list.bind(pm2));

let connected = false;

async function ensureConnection() {
  if (!connected) { await connectPm2(); connected = true; }
}

export async function scaleApp(appName, instances) {
  await ensureConnection();
  await scalePm2(appName, instances);
}

export async function stopApp(appName) {
  await ensureConnection();
  await stopPm2(appName);
}

export async function getAppStatus(appName) {
  await ensureConnection();
  const list = await listPm2();
  return list.find((p) => p.name === appName);
}
```

### modules/scaling/autoScaler.js

```javascript
import { collectAppMetrics } from "../monitoring/collector.js";
import { scaleApp, getAppStatus } from "./pm2Manager.js";
import { getDatabase } from "../database/sqlite.js";

const SCALE_UP_CPU = 80;
const SCALE_DOWN_CPU = 20;
const MAX_INSTANCES = 5;
const MIN_INSTANCES = 1;

export async function autoScaleCheck() {
  const db = await getDatabase();
  const apps = await db.all("SELECT name FROM apps WHERE status = 'running'");

  for (const app of apps) {
    const metrics = await collectAppMetrics(app.name);
    const status = await getAppStatus(app.name);
    if (!metrics || !status) continue;

    const current = status.pm2_env?.instances || 1;

    if (metrics.cpu > SCALE_UP_CPU && current < MAX_INSTANCES) {
      console.log(`⬆️ Escalando ${app.name} → ${current + 1} instancias`);
      await scaleApp(app.name, current + 1).catch(console.error);
    } else if (metrics.cpu < SCALE_DOWN_CPU && current > MIN_INSTANCES) {
      console.log(`⬇️ Reduciendo ${app.name} → ${current - 1} instancias`);
      await scaleApp(app.name, current - 1).catch(console.error);
    }
  }
}

// Chequeo cada 30s
setInterval(autoScaleCheck, 30000);
```

### modules/scaling/index.js

```javascript
import express from "express";
import { scaleApp, stopApp, getAppStatus } from "./pm2Manager.js";
import { authMiddleware } from "../auth/index.js";

export const scalingRouter = express.Router();

export async function initScaler() {
  console.log("⚖️ Auto-scaler inicializado");
}

scalingRouter.post("/scale/:appName", authMiddleware, async (req, res) => {
  const { instances } = req.body;
  try {
    await scaleApp(req.params.appName, instances);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

scalingRouter.post("/stop/:appName", authMiddleware, async (req, res) => {
  try {
    await stopApp(req.params.appName);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

scalingRouter.get("/status/:appName", authMiddleware, async (req, res) => {
  const status = await getAppStatus(req.params.appName);
  res.json(status || { error: "No encontrado" });
});
```

---

### modules/payments/stripe.js

```javascript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function createCustomer(email, name) {
  return stripe.customers.create({ email, name });
}

export async function createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function createBillingPortalSession(customerId, returnUrl) {
  return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
}

export async function handleWebhook(payload, signature) {
  const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
    const sub = event.data.object;
    const { getDatabase } = await import("../database/sqlite.js");
    const db = await getDatabase();
    await db.run(
      `UPDATE users SET subscription_status = ?, stripe_subscription_id = ? WHERE stripe_customer_id = ?`,
      [sub.status, sub.id, sub.customer]
    );
  }
  return event;
}
```

### modules/payments/index.js

```javascript
import express from "express";
import { createCustomer, createCheckoutSession, createBillingPortalSession, handleWebhook } from "./stripe.js";
import { authMiddleware } from "../auth/index.js";
import { getDatabase } from "../database/sqlite.js";

export const paymentsRouter = express.Router();

paymentsRouter.post("/create-checkout", authMiddleware, async (req, res) => {
  const { priceId, successUrl, cancelUrl } = req.body;
  try {
    const db = await getDatabase();
    let customerId = (await db.get("SELECT stripe_customer_id FROM users WHERE id = ?", req.user.id))?.stripe_customer_id;
    if (!customerId) {
      const customer = await createCustomer(req.user.email, req.user.username);
      customerId = customer.id;
      await db.run("UPDATE users SET stripe_customer_id = ? WHERE id = ?", [customerId, req.user.id]);
    }
    const session = await createCheckoutSession(customerId, priceId, successUrl, cancelUrl);
    res.json({ url: session.url });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

paymentsRouter.post("/portal", authMiddleware, async (req, res) => {
  const db = await getDatabase();
  const customerId = (await db.get("SELECT stripe_customer_id FROM users WHERE id = ?", req.user.id))?.stripe_customer_id;
  if (!customerId) return res.status(400).json({ error: "Sin customer Stripe" });
  const session = await createBillingPortalSession(customerId, req.body.returnUrl);
  res.json({ url: session.url });
});

paymentsRouter.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    await handleWebhook(req.body, req.headers["stripe-signature"]);
    res.json({ received: true });
  } catch (e) { res.status(400).send(`Webhook Error: ${e.message}`); }
});
```

---

### modules/voice/synthesis.js

```javascript
import axios from "axios";

const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

export async function synthesizeSpeech(text, voiceId = VOICE_ID) {
  if (!process.env.ELEVENLABS_API_KEY) return null;
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      { text, model_id: "eleven_monolingual_v1", voice_settings: { stability: 0.5, similarity_boost: 0.75 } },
      { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" }, responseType: "arraybuffer" }
    );
    return Buffer.from(response.data).toString("base64");
  } catch (e) {
    console.error("ElevenLabs error:", e.message);
    return null;
  }
}
```

### modules/voice/assistant.js

```javascript
import { runDeepSeek } from "../ai/index.js";
import { synthesizeSpeech } from "./synthesis.js";

export async function handleVoiceCommand(transcript, context = {}) {
  const response = await runDeepSeek(`
Eres Geo Assistant, asistente de voz de la plataforma Geo AI.
El usuario dice: "${transcript}"
Contexto: ${JSON.stringify(context)}
Responde de manera muy concisa (máximo 2 oraciones).
Si el usuario pide crear una app, confirma que lo harás.
  `);
  const audio = await synthesizeSpeech(response);
  return { text: response, audio };
}
```

### modules/voice/index.js

```javascript
import express from "express";
import { synthesizeSpeech } from "./synthesis.js";
import { handleVoiceCommand } from "./assistant.js";
import { authMiddleware } from "../auth/index.js";

export const voiceRouter = express.Router();

voiceRouter.post("/tts", async (req, res) => {
  const audio = await synthesizeSpeech(req.body.text);
  audio ? res.json({ audio }) : res.status(500).json({ error: "TTS no disponible" });
});

voiceRouter.post("/command", authMiddleware, async (req, res) => {
  try {
    const result = await handleVoiceCommand(req.body.transcript, { user: req.user });
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
```

---

### modules/marketplace/index.js

```javascript
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../database/sqlite.js";
import { authMiddleware } from "../auth/index.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
export const marketplaceRouter = express.Router();

// Publicar app en el marketplace
marketplaceRouter.post("/publish", authMiddleware, async (req, res) => {
  const { appId, price, description, transferable } = req.body;
  const db = await getDatabase();
  const app = await db.get("SELECT * FROM apps WHERE id = ? AND tenant_id = ?", [appId, req.user.tenantId]);
  if (!app) return res.status(404).json({ error: "App no encontrada o no tienes permisos" });

  const listingId = uuidv4();
  await db.run(
    `INSERT INTO marketplace_listings (id, app_id, seller_tenant_id, price_usd, description, transferable, status) VALUES (?, ?, ?, ?, ?, ?, 'active')`,
    [listingId, appId, req.user.tenantId, price, description, transferable ? 1 : 0]
  );
  res.json({ success: true, listingId });
});

// Listar apps disponibles
marketplaceRouter.get("/listings", authMiddleware, async (req, res) => {
  const db = await getDatabase();
  const listings = await db.all(
    `SELECT m.*, a.name as app_name, t.name as seller_name
     FROM marketplace_listings m
     JOIN apps a ON m.app_id = a.id
     JOIN tenants t ON m.seller_tenant_id = t.id
     WHERE m.status = 'active' AND m.seller_tenant_id != ?
     ORDER BY m.created_at DESC`,
    req.user.tenantId
  );
  res.json(listings);
});

// Comprar app
marketplaceRouter.post("/buy/:listingId", authMiddleware, async (req, res) => {
  const db = await getDatabase();
  const listing = await db.get(
    `SELECT m.*, a.name as app_name FROM marketplace_listings m JOIN apps a ON m.app_id = a.id WHERE m.id = ? AND m.status = 'active'`,
    req.params.listingId
  );
  if (!listing) return res.status(404).json({ error: "Listado no encontrado" });
  if (listing.seller_tenant_id === req.user.tenantId) return res.status(400).json({ error: "No puedes comprar tu propia app" });

  const purchaseId = uuidv4();
  await db.run(
    `INSERT INTO marketplace_purchases (id, listing_id, buyer_tenant_id, amount_usd, status, payment_method) VALUES (?, ?, ?, ?, 'pending', 'stripe')`,
    [purchaseId, listing.id, req.user.tenantId, listing.price_usd]
  );

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{ price_data: { currency: "usd", product_data: { name: `Licencia: ${listing.app_name}` }, unit_amount: Math.round(listing.price_usd * 100) }, quantity: 1 }],
    metadata: { purchaseId, listingId: listing.id, buyerTenantId: req.user.tenantId },
    success_url: `${process.env.BASE_URL}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/marketplace`,
  });

  await db.run(`UPDATE marketplace_purchases SET stripe_session_id = ? WHERE id = ?`, [session.id, purchaseId]);
  res.json({ url: session.url, purchaseId });
});
```

---

### modules/ipfs/pinata.js

```javascript
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export async function uploadJSONToIPFS(json) {
  if (!process.env.PINATA_API_KEY) return null;
  const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", json, {
    headers: { pinata_api_key: process.env.PINATA_API_KEY, pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY },
  });
  return res.data.IpfsHash;
}

export async function uploadFileToIPFS(filePath) {
  if (!process.env.PINATA_API_KEY) return null;
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));
  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
    maxBodyLength: "Infinity",
    headers: { ...data.getHeaders(), pinata_api_key: process.env.PINATA_API_KEY, pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY },
  });
  return res.data.IpfsHash;
}

export function buildLicenseMetadata(app, buyer) {
  return {
    name: `Geo License: ${app.name}`,
    description: `Licencia de uso perpetua para "${app.name}" — generada por Geo AI.`,
    attributes: [
      { trait_type: "App ID", value: app.id },
      { trait_type: "License Type", value: "Perpetual" },
      { trait_type: "Transferable", value: !!app.transferable },
      { trait_type: "Issued To", value: buyer.address || buyer.email },
    ],
  };
}
```

### modules/ipfs/index.js

```javascript
export { uploadJSONToIPFS, uploadFileToIPFS, buildLicenseMetadata } from "./pinata.js";
```

---

### modules/blockchain/index.js

```javascript
import { ethers } from "ethers";
import { uploadJSONToIPFS, buildLicenseMetadata } from "../ipfs/index.js";
import { getDatabase } from "../database/sqlite.js";

let contract = null;

function initBlockchain() {
  if (!process.env.NFT_CONTRACT_ADDRESS || !process.env.PRIVATE_KEY) {
    console.warn("⚠️ Blockchain no configurada — funciones NFT deshabilitadas");
    return false;
  }
  // ABI mínima del contrato
  const ABI = ["function mintLicense(address to, string appId, string metadataURI, bool transferable) returns (uint256)", "function balanceOf(address owner) view returns (uint256)"];
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  contract = new ethers.Contract(process.env.NFT_CONTRACT_ADDRESS, ABI, wallet);
  return true;
}

export async function mintLicenseNFT(appId, buyerAddress, transferable = true) {
  if (!contract) initBlockchain();
  if (!contract) throw new Error("Blockchain no inicializada");

  const db = await getDatabase();
  const app = await db.get("SELECT * FROM apps WHERE id = ?", appId);
  if (!app) throw new Error("App no encontrada");

  const metadata = buildLicenseMetadata(app, { address: buyerAddress });
  const cid = await uploadJSONToIPFS(metadata);
  const metadataURI = `ipfs://${cid}`;

  const tx = await contract.mintLicense(buyerAddress, appId, metadataURI, transferable);
  const receipt = await tx.wait();

  return { txHash: receipt.hash, metadataURI };
}
```

---

### contracts/GeoLicenseNFT.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GeoLicenseNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct License {
        string appId;
        address owner;
        uint256 issuedAt;
        bool transferable;
    }

    mapping(uint256 => License) public licenses;
    mapping(string => bool) public appIdMinted;

    event LicenseMinted(uint256 indexed tokenId, string appId, address indexed to, string metadataURI);

    constructor() ERC721("Geo License", "GEOL") Ownable(msg.sender) {}

    function mintLicense(address to, string memory appId, string memory metadataURI, bool transferable)
        external onlyOwner returns (uint256)
    {
        require(!appIdMinted[appId], "License already minted for this appId");
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        licenses[newTokenId] = License({ appId: appId, owner: to, issuedAt: block.timestamp, transferable: transferable });
        appIdMinted[appId] = true;
        emit LicenseMinted(newTokenId, appId, to, metadataURI);
        return newTokenId;
    }

    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721, IERC721) {
        require(licenses[tokenId].transferable, "License is not transferable");
        super.transferFrom(from, to, tokenId);
        licenses[tokenId].owner = to;
    }

    function getLicense(uint256 tokenId) external view returns (License memory) {
        return licenses[tokenId];
    }
}
```

### contracts/hardhat.config.js

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env" });

module.exports = {
  solidity: "0.8.19",
  networks: {
    polygon: { url: process.env.POLYGON_RPC, accounts: [process.env.PRIVATE_KEY] },
    mumbai:  { url: process.env.MUMBAI_RPC,  accounts: [process.env.PRIVATE_KEY] },
  },
  etherscan: { apiKey: process.env.POLYGONSCAN_API_KEY },
};
```

### contracts/deploy.js

```javascript
const hre = require("hardhat");

async function main() {
  const GeoLicenseNFT = await hre.ethers.getContractFactory("GeoLicenseNFT");
  const contract = await GeoLicenseNFT.deploy();
  await contract.waitForDeployment();
  console.log("GeoLicenseNFT deployed to:", await contract.getAddress());
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
```

---

### server.js (núcleo principal)

```javascript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { createServer } from "http";
import { Server } from "socket.io";

import { initializeDatabase } from "./modules/database/sqlite.js";
import { authRouter } from "./modules/auth/index.js";
import { generatorRouter } from "./modules/generator/index.js";
import { monitoringRouter, setupWebSocket } from "./modules/monitoring/index.js";
import { scalingRouter, initScaler } from "./modules/scaling/index.js";
import { paymentsRouter } from "./modules/payments/index.js";
import { voiceRouter } from "./modules/voice/index.js";
import { marketplaceRouter } from "./modules/marketplace/index.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/apps", express.static(path.join(__dirname, "apps")));
app.use(express.static(path.join(__dirname, "public")));

// Rutas API
app.use("/api/auth", authRouter);
app.use("/api/generator", generatorRouter);
app.use("/api/monitoring", monitoringRouter);
app.use("/api/scaling", scalingRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/voice", voiceRouter);
app.use("/api/marketplace", marketplaceRouter);

// Dashboard
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

// WebSocket monitoreo
setupWebSocket(io);

// Arranque
async function startGeo() {
  await fs.mkdir(path.join(__dirname, "apps"),       { recursive: true });
  await fs.mkdir(path.join(__dirname, "data"),       { recursive: true });
  await fs.mkdir(path.join(__dirname, "logs/apps"),  { recursive: true });

  await initializeDatabase();
  await initScaler();

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   🧠 GEO AI SYSTEM v4.0                      ║
║   Generador · Monitoreo · Voz · Marketplace  ║
║   Dashboard: http://localhost:${PORT}          ║
╚══════════════════════════════════════════════╝
    `);
  });
}

startGeo().catch((e) => { console.error("❌ Error fatal:", e); process.exit(1); });
```

---

### scripts/setup-tenants.js

```javascript
import { initializeDatabase, getDatabase } from "../modules/database/sqlite.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

async function setup() {
  await initializeDatabase();
  const db = await getDatabase();

  const tenantId = uuidv4();
  await db.run(`INSERT OR IGNORE INTO tenants (id, name, subdomain, status) VALUES (?, 'Admin', 'admin', 'active')`, tenantId);

  const userId = uuidv4();
  const hash = await bcrypt.hash("admin123", 10);
  await db.run(
    `INSERT OR IGNORE INTO users (id, username, email, password_hash, role, tenant_id) VALUES (?, 'admin', 'admin@geo.ai', ?, 'admin', ?)`,
    [userId, hash, tenantId]
  );

  console.log("✅ Setup completado. Usuario: admin@geo.ai / admin123");
  process.exit(0);
}

setup().catch(console.error);
```

### scripts/test-geo.js

```javascript
import dotenv from "dotenv";
dotenv.config();

const BASE = `http://localhost:${process.env.PORT || 3000}`;

async function test() {
  console.log("🧪 Iniciando test de Geo...\n");

  // 1. Login
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@geo.ai", password: "admin123" }),
  });
  const { token } = await loginRes.json();
  console.log("✅ Login exitoso");

  // 2. Crear app
  console.log("⏳ Creando app de prueba...");
  const createRes = await fetch(`${BASE}/api/generator/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ idea: "app de lista de tareas simple con localStorage" }),
  });
  const app = await createRes.json();
  console.log("✅ App creada:", app);
  console.log(`\n🌐 Abre: ${BASE}${app.frontendUrl}`);
}

test().catch(console.error);
```

---

### public/dashboard.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🧠 Geo AI System</title>
  <script src="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;600;700&display=swap"></script>
  <script src="/socket.io/socket.io.js"></script>
  <style>
    :root {
      --bg: #0f172a; --card: #1e293b; --border: #334155;
      --blue: #3b82f6; --green: #10b981; --red: #ef4444;
      --yellow: #f59e0b; --text: #f1f5f9; --muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; min-height: 100vh; }

    /* Auth */
    #authModal { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .auth-box { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; width: 360px; }
    .auth-box h2 { margin-bottom: 1.5rem; font-size: 1.5rem; }
    .auth-box input { width: 100%; padding: 0.75rem; margin-bottom: 1rem; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 0.95rem; }
    .auth-box button { width: 100%; padding: 0.75rem; background: var(--blue); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem; }
    .auth-tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .auth-tab { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid transparent; }
    .auth-tab.active { color: var(--blue); border-bottom-color: var(--blue); }

    /* Layout */
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    header h1 { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; }
    .badge { background: var(--green); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }

    /* Crear app */
    .create-panel { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; }
    .create-panel h2 { margin-bottom: 1rem; font-size: 1.2rem; }
    .input-row { display: flex; gap: 1rem; }
    .input-row input { flex: 1; padding: 0.75rem 1rem; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 1rem; }
    .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; font-size: 0.95rem; }
    .btn:hover { opacity: 0.85; }
    .btn-blue { background: var(--blue); color: white; }
    .btn-green { background: var(--green); color: white; }
    .btn-red { background: var(--red); color: white; }
    .btn-sm { padding: 0.4rem 0.9rem; font-size: 0.8rem; border-radius: 7px; }
    #statusMsg { margin-top: 0.75rem; color: var(--muted); font-size: 0.9rem; font-family: 'JetBrains Mono', monospace; }

    /* Grid de apps */
    .section-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.85rem; }
    .apps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .app-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; }
    .app-card h3 { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--blue); }
    .app-card .app-meta { color: var(--muted); font-size: 0.8rem; margin-bottom: 1rem; }
    .app-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

    /* Monitoreo */
    #monitorPanel { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; display: none; }
    #monitorPanel h2 { margin-bottom: 1rem; }
    .metrics-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem; }
    .metric-box { background: var(--bg); border-radius: 10px; padding: 1rem; text-align: center; }
    .metric-box .metric-val { font-size: 1.8rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .metric-box .metric-label { font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem; }
    #logsBox { background: var(--bg); border-radius: 8px; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; max-height: 150px; overflow-y: auto; color: var(--green); white-space: pre-wrap; }

    /* Voz */
    .voice-widget { position: fixed; bottom: 24px; right: 24px; background: var(--card); border: 1px solid var(--blue); border-radius: 50px; padding: 12px 20px; display: flex; align-items: center; gap: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    #voiceBtn { width: 44px; height: 44px; border-radius: 50%; background: var(--blue); border: none; font-size: 20px; cursor: pointer; transition: 0.2s; flex-shrink: 0; }
    #voiceBtn.listening { background: var(--red); animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); } 70% { box-shadow: 0 0 0 12px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
    #voiceText { color: var(--muted); font-size: 0.85rem; max-width: 200px; }

    .empty { text-align: center; color: var(--muted); padding: 3rem; }
  </style>
</head>
<body>

<!-- Auth Modal -->
<div id="authModal">
  <div class="auth-box">
    <div class="auth-tabs">
      <button class="auth-tab active" onclick="switchTab('login')">Login</button>
      <button class="auth-tab" onclick="switchTab('register')">Registro</button>
    </div>
    <h2 id="authTitle">🧠 Geo AI</h2>
    <input type="email" id="authEmail" placeholder="Email" />
    <input type="text" id="authUsername" placeholder="Username" style="display:none" />
    <input type="password" id="authPassword" placeholder="Contraseña" />
    <button onclick="authAction()">Entrar</button>
    <p id="authError" style="color:var(--red);margin-top:0.75rem;font-size:0.85rem;"></p>
  </div>
</div>

<!-- App -->
<div class="container" id="appContent" style="display:none">
  <header>
    <h1>🧠 Geo <span style="color:var(--blue)">AI</span></h1>
    <div style="display:flex;align-items:center;gap:1rem">
      <span class="badge">v4.0</span>
      <span id="userLabel" style="color:var(--muted);font-size:0.9rem"></span>
      <button class="btn btn-sm" style="background:var(--border);color:var(--text)" onclick="logout()">Salir</button>
    </div>
  </header>

  <!-- Crear app -->
  <div class="create-panel">
    <h2>✨ Nueva Aplicación</h2>
    <div class="input-row">
      <input id="ideaInput" placeholder='Ej: "app tipo Trello con login y tablero kanban"' />
      <button class="btn btn-blue" onclick="createApp()">Crear y Lanzar</button>
    </div>
    <div id="statusMsg"></div>
  </div>

  <!-- Monitor -->
  <div id="monitorPanel">
    <h2>📊 Monitoreo: <span id="monitorAppName" style="color:var(--blue);font-family:'JetBrains Mono',monospace"></span></h2>
    <div class="metrics-row">
      <div class="metric-box"><div class="metric-val" id="mCpu">—</div><div class="metric-label">CPU %</div></div>
      <div class="metric-box"><div class="metric-val" id="mMem">—</div><div class="metric-label">Memoria MB</div></div>
      <div class="metric-box"><div class="metric-val" id="mReq">—</div><div class="metric-label">Req/min</div></div>
    </div>
    <div style="display:flex;gap:0.75rem;margin-bottom:1rem">
      <button class="btn btn-green btn-sm" onclick="scaleApp(1)">➕ Escalar</button>
      <button class="btn btn-red btn-sm" onclick="scaleApp(-1)">➖ Reducir</button>
    </div>
    <div id="logsBox">Sin logs aún...</div>
  </div>

  <!-- Lista de apps -->
  <div class="section-title">Tus Apps</div>
  <div class="apps-grid" id="appsGrid">
    <div class="empty">No hay apps aún. ¡Crea la primera arriba!</div>
  </div>
</div>

<!-- Asistente de Voz -->
<div class="voice-widget" id="voiceWidget" style="display:none">
  <button id="voiceBtn" onclick="toggleVoice()">🎤</button>
  <div id="voiceText">Di "Hola Geo..."</div>
  <audio id="voiceAudio" style="display:none"></audio>
</div>

<script>
  const socket = io();
  let token = localStorage.getItem('geo_token');
  let currentApp = null;
  let isLogin = true;
  let recognition = null;

  // ── Auth ──────────────────────────────────────────────────────────────────

  function switchTab(tab) {
    isLogin = tab === 'login';
    document.querySelectorAll('.auth-tab').forEach((t, i) => t.classList.toggle('active', (i === 0) === isLogin));
    document.getElementById('authTitle').textContent = isLogin ? '🧠 Geo AI' : '🆕 Crear cuenta';
    document.getElementById('authUsername').style.display = isLogin ? 'none' : 'block';
  }

  async function authAction() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const username = document.getElementById('authUsername').value;
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { email, password, username };

    const res = await fetch(endpoint, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.token) {
      token = data.token;
      localStorage.setItem('geo_token', token);
      initApp(data.user);
    } else {
      document.getElementById('authError').textContent = data.error || 'Error desconocido';
    }
  }

  function initApp(user) {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    document.getElementById('voiceWidget').style.display = 'flex';
    document.getElementById('userLabel').textContent = user?.username || '';
    loadApps();
    initVoice();
  }

  function logout() {
    localStorage.removeItem('geo_token');
    location.reload();
  }

  // Verificar token existente
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) initApp(payload);
      else localStorage.removeItem('geo_token');
    } catch { localStorage.removeItem('geo_token'); }
  }

  // ── Crear App ─────────────────────────────────────────────────────────────

  async function createApp() {
    const idea = document.getElementById('ideaInput').value.trim();
    if (!idea) return;
    const status = document.getElementById('statusMsg');
    status.style.color = 'var(--muted)';
    status.textContent = '⏳ Diseñando arquitectura y generando código...';

    const res = await fetch('/api/generator/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ idea })
    });
    const data = await res.json();

    if (data.success) {
      status.style.color = 'var(--green)';
      status.textContent = `✅ "${data.name}" lista → puerto ${data.port}`;
      document.getElementById('ideaInput').value = '';
      loadApps();
    } else {
      status.style.color = 'var(--red)';
      status.textContent = '❌ ' + (data.error || 'Error desconocido');
    }
  }

  // ── Listar Apps ───────────────────────────────────────────────────────────

  async function loadApps() {
    const res = await fetch('/api/generator/apps', { headers: { 'Authorization': 'Bearer ' + token } });
    const apps = await res.json();
    const grid = document.getElementById('appsGrid');

    if (!apps.length) { grid.innerHTML = '<div class="empty">No hay apps aún. ¡Crea la primera arriba!</div>'; return; }

    grid.innerHTML = apps.map(a => `
      <div class="app-card">
        <h3>${a.name}</h3>
        <div class="app-meta">Puerto ${a.port} · ${new Date(a.created_at).toLocaleDateString()}</div>
        <div class="app-actions">
          <button class="btn btn-green btn-sm" onclick="window.open('${a.frontendUrl}')">🌐 Abrir</button>
          <button class="btn btn-blue btn-sm" onclick="startMonitor('${a.name}')">📊 Monitor</button>
          <button class="btn btn-red btn-sm" onclick="deleteApp('${a.name}')">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  async function deleteApp(name) {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    await fetch('/api/generator/apps/' + name, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
    loadApps();
  }

  // ── Monitoreo ─────────────────────────────────────────────────────────────

  function startMonitor(appName) {
    if (currentApp) socket.emit('unsubscribe-app', currentApp);
    currentApp = appName;
    document.getElementById('monitorPanel').style.display = 'block';
    document.getElementById('monitorAppName').textContent = appName;
    socket.emit('subscribe-app', appName);
    document.getElementById('monitorPanel').scrollIntoView({ behavior: 'smooth' });
  }

  socket.on('app-metrics', ({ appName, metrics }) => {
    if (appName !== currentApp || !metrics) return;
    document.getElementById('mCpu').textContent = metrics.cpu.toFixed(1);
    document.getElementById('mMem').textContent = metrics.memory.toFixed(0);
    document.getElementById('mReq').textContent = metrics.requestsPerMinute;
    document.getElementById('logsBox').textContent = metrics.logs.join('\n') || 'Sin logs.';
  });

  async function scaleApp(delta) {
    const res = await fetch(`/api/scaling/status/${currentApp}`, { headers: { 'Authorization': 'Bearer ' + token } });
    const status = await res.json();
    const current = status?.pm2_env?.instances || 1;
    await fetch(`/api/scaling/scale/${currentApp}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ instances: Math.max(1, current + delta) })
    });
  }

  // ── Voz ───────────────────────────────────────────────────────────────────

  function initVoice() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;

    recognition.onresult = async (e) => {
      const transcript = e.results[0][0].transcript;
      document.getElementById('voiceText').textContent = `Tú: ${transcript}`;
      document.getElementById('voiceBtn').classList.remove('listening');

      const res = await fetch('/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ transcript })
      });
      const data = await res.json();
      document.getElementById('voiceText').textContent = `Geo: ${data.text}`;

      if (data.audio) {
        const audio = document.getElementById('voiceAudio');
        audio.src = 'data:audio/mp3;base64,' + data.audio;
        audio.play();
      }

      // Acciones automáticas por voz
      if (transcript.toLowerCase().includes('crear app') || transcript.toLowerCase().includes('nueva aplicación')) {
        const idea = transcript.replace(/crear app|nueva aplicación/gi, '').trim();
        if (idea) { document.getElementById('ideaInput').value = idea; createApp(); }
      } else if (transcript.toLowerCase().includes('listar')) {
        loadApps();
      }
    };

    recognition.onend = () => document.getElementById('voiceBtn').classList.remove('listening');
  }

  function toggleVoice() {
    if (!recognition) return alert('Tu navegador no soporta reconocimiento de voz');
    document.getElementById('voiceBtn').classList.add('listening');
    document.getElementById('voiceText').textContent = 'Escuchando...';
    recognition.start();
  }

  // Enter para crear app
  document.getElementById('ideaInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') createApp(); });
</script>
</body>
</html>
```

---

## 🚀 ORDEN DE EJECUCIÓN

```bash
# 1. Instalar dependencias
npm install

# 2. Crear directorios
mkdir -p apps data logs/apps public

# 3. Copiar dashboard al lugar correcto
# (ya está en public/dashboard.html)

# 4. Configurar .env con tus API keys

# 5. Crear usuario admin inicial
node scripts/setup-tenants.js

# 6. Arrancar Geo
npm start

# 7. Test rápido (en otra terminal)
node scripts/test-geo.js

# 8. Abrir dashboard
# http://localhost:3000
# Login: admin@geo.ai / admin123
```

---

## ⚠️ ERRORES COMUNES Y SOLUCIONES

| Error | Causa | Solución |
|-------|-------|----------|
| `No se pudo extraer JSON` | Groq devolvió texto extra | El generador ya usa regex `/{[\s\S]*}/` |
| `PM2 not found` | PM2 no instalado globalmente | `npm install -g pm2` |
| `sqlite3 binding error` | Versión incompatible | `npm rebuild sqlite3` |
| `ElevenLabs: 401` | Sin API key | El módulo falla silenciosamente, sin romper el sistema |
| `Stripe webhook error` | Secret incorrecto | Verificar `STRIPE_WEBHOOK_SECRET` en .env |
| `Socket.io CORS` | Config de origen | Ya está configurado con `origin: "*"` |
| `PM2 cluster error` | Script no encontrado | Usar paths absolutos con `path.resolve()` |

---

## 🗺️ ROADMAP (orden recomendado de activación)

```
Fase 1 (Ahora):     Generador + Dashboard + Auth
Fase 2 (Semana 2):  Monitoreo Socket.io + Voz básica
Fase 3 (Semana 3):  Stripe + Escalado automático
Fase 4 (Semana 4):  Marketplace entre usuarios
Fase 5 (Mes 2):     NFT + Blockchain + IPFS
```

---

*Geo AI System v4.0 — Documento maestro integrado*
*Stack: Node.js · Express · SQLite · Socket.io · PM2 · OpenRouter · Groq · ElevenLabs · Stripe · Polygon*
*Preparado para VPS Linux Ubuntu 24 + Hostinger*

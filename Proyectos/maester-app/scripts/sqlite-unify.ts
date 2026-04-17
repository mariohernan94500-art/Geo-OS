/**
 * FASE 0 + FASE 6 — Unificar brain.db + memory.db en un solo archivo
 * Ejecutar: npx tsx scripts/sqlite-unify.ts
 */
import Database from 'better-sqlite3';
import { resolve, existsSync } from 'path'; // Note: existsSync is from 'fs'
import { existsSync as fsExists } from 'fs';

const BASE   = resolve(process.cwd(), '../Geotrouvetout');
const BRAIN  = resolve(BASE, 'brain.db');
const MEMORY = resolve(BASE, 'memory.db');

console.log('🛠️  Unificando bases de datos SQLite...');
console.log(`   brain.db  → ${BRAIN}`);
console.log(`   memory.db → ${MEMORY}`);

if (!fsExists(MEMORY)) { console.error('❌ memory.db no encontrado'); process.exit(1); }

const target = new Database(MEMORY);
target.pragma('journal_mode = WAL');

// Asegurar esquema unificado en memory.db
target.exec(`
  CREATE TABLE IF NOT EXISTS mensajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT, role TEXT, content TEXT,
    tool_call_id TEXT, name TEXT,
    source TEXT DEFAULT 'geo',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS memoria_semantica (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, tipo TEXT DEFAULT 'semantica',
    source TEXT DEFAULT 'geo', contenido TEXT NOT NULL,
    tags TEXT DEFAULT '[]', timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS token_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, model TEXT NOT NULL,
    operation TEXT DEFAULT 'chat',
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    timestamp TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS token_budget (
    key TEXT PRIMARY KEY, value TEXT NOT NULL
  );
  INSERT OR IGNORE INTO token_budget(key,value) VALUES('daily_limit','100000');
  INSERT OR IGNORE INTO token_budget(key,value) VALUES('monthly_limit','2000000');
  INSERT OR IGNORE INTO token_budget(key,value) VALUES('alert_80_sent_day','');
  INSERT OR IGNORE INTO token_budget(key,value) VALUES('alert_100_sent_day','');
`);

let migrated = 0;

if (fsExists(BRAIN)) {
  const source = new Database(BRAIN, { readonly: true });
  const tables = source.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all() as any[];
  
  for (const { name } of tables) {
    if (name === 'mensajes') {
      const rows = source.prepare('SELECT * FROM mensajes').all() as any[];
      const ins  = target.prepare(`
        INSERT OR IGNORE INTO mensajes (user_id, role, content, tool_call_id, name, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      target.transaction(() => {
        for (const r of rows) {
          ins.run(r.user_id, r.role, r.content, r.tool_call_id, r.name, r.timestamp);
          migrated++;
        }
      })();
    }
  }
  source.close();
  console.log(`✅ Migrados ${migrated} mensajes de brain.db → memory.db`);
  console.log('   Puedes eliminar brain.db una vez verificado.');
} else {
  console.log('ℹ️  brain.db no encontrado — nada que migrar.');
}

target.close();
console.log('✅ Unificación completada. memory.db es ahora la única fuente de verdad.');

import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

let dbInstance = null;

export async function getDatabase() {
  if (dbInstance) return dbInstance;
  const dbPath = path.resolve(PROJECT_ROOT, 'data', 'geo.db');
  const dataDir = path.resolve(PROJECT_ROOT, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  dbInstance = await Database.open({ filename: dbPath, driver: sqlite3.Database });
  await dbInstance.run('PRAGMA journal_mode=WAL');
  await dbInstance.run('PRAGMA foreign_keys=ON');
  return dbInstance;
}

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.run(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT,
      subdomain TEXT UNIQUE,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'user',
      tenant_id TEXT,
      stripe_customer_id TEXT,
      eth_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      description TEXT,
      status TEXT DEFAULT 'running',
      port INTEGER,
      tenant_id TEXT,
      metrics TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS marketplace_listings (
      id TEXT PRIMARY KEY,
      app_id TEXT,
      seller_id TEXT,
      price REAL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS marketplace_purchases (
      id TEXT PRIMARY KEY,
      listing_id TEXT,
      buyer_id TEXT,
      price REAL,
      currency TEXT DEFAULT 'USD',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized with all tables.');
  return db;
}

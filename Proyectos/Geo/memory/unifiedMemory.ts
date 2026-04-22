/**
 * FASE 2 — Memoria Unificada
 * Firebase Firestore como fuente de verdad compartida entre Geo, Voren y Antigravity.
 * SQLite local actúa como cache rápido sincronizado.
 */

import Database from 'better-sqlite3';
import path from 'path';
import admin from 'firebase-admin';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MemoryType = 'episodica' | 'semantica' | 'procedimental';
export type MemorySource = 'geo' | 'voren' | 'antigravity' | 'ecoorigen';

export interface MemoryEntry {
  id?: string;
  userId: string;
  type: MemoryType;
  source: MemorySource;
  content: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  source: MemorySource;
}

// ─── SQLite local (cache) ─────────────────────────────────────────────────────

const DB_PATH = path.join(__dirname, '..', 'brain.db');
let _db: Database.Database;

function getDB(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.exec(`
      CREATE TABLE IF NOT EXISTS unified_memory (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        source TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT DEFAULT '[]',
        metadata TEXT DEFAULT '{}',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_memory_user ON unified_memory(user_id);
      CREATE INDEX IF NOT EXISTS idx_memory_type ON unified_memory(type);

      CREATE TABLE IF NOT EXISTS conversation_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        source TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_conv_user ON conversation_history(user_id);
    `);
  }
  return _db;
}

// ─── Firebase init ────────────────────────────────────────────────────────────

let firestoreReady = false;

export function initFirebase(serviceAccount: object): void {
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount as admin.ServiceAccount) });
  }
  firestoreReady = true;
}

function firestore(): FirebaseFirestore.Firestore {
  return admin.firestore();
}

function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── API Pública ──────────────────────────────────────────────────────────────

/**
 * Guarda una memoria. Persiste local SIEMPRE; en Firestore si está disponible.
 */
export async function saveMemory(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryEntry> {
  const now = Date.now();
  const id = generateId();
  const full: MemoryEntry = { ...entry, id, createdAt: now, updatedAt: now };

  // SQLite
  const d = getDB();
  d.prepare(`
    INSERT OR REPLACE INTO unified_memory
    (id, user_id, type, source, content, tags, metadata, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    full.id, full.userId, full.type, full.source, full.content,
    JSON.stringify(full.tags ?? []),
    JSON.stringify(full.metadata ?? {}),
    full.createdAt, full.updatedAt
  );

  // Firebase (async, no bloquea)
  if (firestoreReady) {
    firestore()
      .collection('memoria_usuarios')
      .doc(full.userId)
      .collection('entries')
      .doc(full.id!)
      .set(full)
      .catch(err => console.error('[Memory] Firebase write error:', err));
  }

  return full;
}

/**
 * Recupera memorias de un usuario filtradas por tipo y/o fuente.
 */
export function getMemories(
  userId: string,
  options: { type?: MemoryType; source?: MemorySource; limit?: number; search?: string } = {}
): MemoryEntry[] {
  const d = getDB();
  let query = `SELECT * FROM unified_memory WHERE user_id = ?`;
  const params: any[] = [userId];

  if (options.type) { query += ` AND type = ?`; params.push(options.type); }
  if (options.source) { query += ` AND source = ?`; params.push(options.source); }
  if (options.search) { query += ` AND content LIKE ?`; params.push(`%${options.search}%`); }

  query += ` ORDER BY updated_at DESC LIMIT ?`;
  params.push(options.limit ?? 20);

  const rows = d.prepare(query).all(...params) as any[];
  return rows.map(r => ({
    ...r,
    tags: JSON.parse(r.tags ?? '[]'),
    metadata: JSON.parse(r.metadata ?? '{}'),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

/**
 * Guarda un mensaje en el historial de conversación.
 */
export function saveConversationMessage(
  userId: string,
  source: MemorySource,
  role: 'user' | 'assistant',
  content: string
): void {
  getDB().prepare(`
    INSERT INTO conversation_history (user_id, source, role, content, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, source, role, content, Date.now());
}

/**
 * Recupera el historial reciente de conversación para inyectar al LLM.
 * Combina mensajes de todas las fuentes por defecto.
 */
export function getConversationHistory(
  userId: string,
  limit = 10,
  source?: MemorySource
): ConversationMessage[] {
  const d = getDB();
  let query = `SELECT * FROM conversation_history WHERE user_id = ?`;
  const params: any[] = [userId];

  if (source) { query += ` AND source = ?`; params.push(source); }
  query += ` ORDER BY timestamp DESC LIMIT ?`;
  params.push(limit);

  const rows = d.prepare(query).all(...params) as any[];
  return rows.reverse().map(r => ({
    role: r.role as 'user' | 'assistant',
    content: r.content,
    timestamp: r.timestamp,
    source: r.source as MemorySource,
  }));
}

/**
 * Borra el historial de conversación de un usuario.
 */
export function clearConversationHistory(userId: string, source?: MemorySource): void {
  const d = getDB();
  if (source) {
    d.prepare(`DELETE FROM conversation_history WHERE user_id = ? AND source = ?`).run(userId, source);
  } else {
    d.prepare(`DELETE FROM conversation_history WHERE user_id = ?`).run(userId);
  }

  if (firestoreReady) {
    // Firestore: marcar como borrado (soft delete)
    firestore()
      .collection('memoria_usuarios')
      .doc(userId)
      .set({ lastCleared: Date.now(), source: source ?? 'all' }, { merge: true })
      .catch(err => console.error('[Memory] Firebase clear error:', err));
  }
}

/**
 * Sincroniza la memoria local desde Firebase (útil al arrancar en nuevo servidor).
 */
export async function syncFromFirebase(userId: string): Promise<number> {
  if (!firestoreReady) return 0;
  try {
    const snap = await firestore()
      .collection('memoria_usuarios')
      .doc(userId)
      .collection('entries')
      .orderBy('updatedAt', 'desc')
      .limit(100)
      .get();

    const d = getDB();
    let count = 0;
    for (const doc of snap.docs) {
      const entry = doc.data() as MemoryEntry;
      d.prepare(`
        INSERT OR REPLACE INTO unified_memory
        (id, user_id, type, source, content, tags, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        entry.id, entry.userId, entry.type, entry.source, entry.content,
        JSON.stringify(entry.tags ?? []),
        JSON.stringify(entry.metadata ?? {}),
        entry.createdAt, entry.updatedAt
      );
      count++;
    }
    return count;
  } catch (err) {
    console.error('[Memory] Sync from Firebase error:', err);
    return 0;
  }
}

/**
 * Construye el bloque de contexto de memoria para inyectar al prompt del LLM.
 */
export function buildMemoryContext(userId: string, source: MemorySource): string {
  const semantic = getMemories(userId, { type: 'semantica', limit: 5 });
  const procedural = getMemories(userId, { type: 'procedimental', limit: 3 });
  const history = getConversationHistory(userId, 8);

  let ctx = '';

  if (semantic.length > 0) {
    ctx += `\n[MEMORIA SEMÁNTICA — Hechos sobre el usuario]\n`;
    ctx += semantic.map(m => `- ${m.content}`).join('\n');
  }

  if (procedural.length > 0) {
    ctx += `\n\n[PREFERENCIAS Y PROCEDIMIENTOS]\n`;
    ctx += procedural.map(m => `- ${m.content}`).join('\n');
  }

  if (history.length > 0) {
    ctx += `\n\n[HISTORIAL RECIENTE — ${source}]\n`;
    ctx += history.map(m => `${m.role === 'user' ? 'Usuario' : 'Geo'}: ${m.content}`).join('\n');
  }

  return ctx.trim();
}

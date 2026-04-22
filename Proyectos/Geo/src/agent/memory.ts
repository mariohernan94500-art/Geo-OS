/**
 * Memoria Unificada de GEO OS
 * SQLite como caché local + Firestore como fuente de verdad compartida.
 */
import Database from 'better-sqlite3';
import { appConfig } from '../config.js';
import { db as dbCloud } from '../database/firebase.js';

export type MemorySource = 'geo' | 'productividad' | 'ecoorigen';

export interface MensajeChat {
    user_id: string;
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_call_id?: string;
    name?: string;
    timestamp?: string;
    source?: MemorySource;
}

// ─── SQLite (caché local ultra-rápida) ───────────────────────────────────────
const dbLocal = new Database(appConfig.dbPath);
dbLocal.pragma('journal_mode = WAL');

dbLocal.exec(`
    CREATE TABLE IF NOT EXISTS mensajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        role TEXT,
        content TEXT,
        tool_call_id TEXT,
        name TEXT,
        source TEXT DEFAULT 'geo',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS memoria_semantica (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'semantica',
        source TEXT NOT NULL DEFAULT 'geo',
        contenido TEXT NOT NULL,
        tags TEXT DEFAULT '[]',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_msg_user   ON mensajes(user_id);
    CREATE INDEX IF NOT EXISTS idx_mem_user   ON memoria_semantica(user_id);
`);

// ─── Objeto Singleton ─────────────────────────────────────────────────────────
export const memoria = {

    // Máximo de mensajes por usuario/source antes de podar los más antiguos
    MAX_HISTORIAL: 40,

    guardar(msg: MensajeChat) {
        const timestamp = msg.timestamp || new Date().toISOString();
        const source = msg.source || 'geo';

        dbLocal.prepare(`
            INSERT INTO mensajes (user_id, role, content, tool_call_id, name, source, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            msg.user_id, msg.role, msg.content,
            msg.tool_call_id || null, msg.name || null,
            source, timestamp
        );

        // Poda: mantener solo los últimos MAX_HISTORIAL mensajes por usuario+source
        dbLocal.prepare(`
            DELETE FROM mensajes
            WHERE user_id = ? AND source = ?
            AND id NOT IN (
                SELECT id FROM mensajes
                WHERE user_id = ? AND source = ?
                ORDER BY timestamp DESC LIMIT ?
            )
        `).run(msg.user_id, source, msg.user_id, source, this.MAX_HISTORIAL);

        // Firestore async (no bloquea el ciclo de pensamiento)
        if (dbCloud) {
            dbCloud.collection('memoria_usuarios')
                .doc(msg.user_id.toString())
                .collection('mensajes')
                .add({ ...msg, timestamp })
                .catch(() => {});
        }
    },

    obtenerHistorial(usuarioId: string, limite: number = 10, source?: MemorySource): MensajeChat[] {
        let stmt;
        if (source) {
            stmt = dbLocal.prepare(`
                SELECT * FROM mensajes
                WHERE user_id = ? AND source = ?
                ORDER BY timestamp DESC LIMIT ?
            `).all(usuarioId, source, limite) as any[];
        } else {
            stmt = dbLocal.prepare(`
                SELECT * FROM mensajes
                WHERE user_id = ?
                ORDER BY timestamp DESC LIMIT ?
            `).all(usuarioId, limite) as any[];
        }
        return stmt.map((f: any) => ({
            user_id: f.user_id.toString(),
            role: f.role,
            content: f.content,
            tool_call_id: f.tool_call_id || undefined,
            name: f.name || undefined,
            source: f.source || 'geo',
            timestamp: f.timestamp,
        })).reverse();
    },

    borrarHistorial(usuarioId: string, source?: MemorySource) {
        if (source) {
            dbLocal.prepare('DELETE FROM mensajes WHERE user_id = ? AND source = ?').run(usuarioId, source);
        } else {
            dbLocal.prepare('DELETE FROM mensajes WHERE user_id = ?').run(usuarioId);
        }
        if (dbCloud) {
            dbCloud.collection('memoria_usuarios').doc(usuarioId).delete().catch(() => {});
        }
    },

    // ── Memoria semántica (hechos permanentes sobre el usuario) ──────────────
    guardarHecho(usuarioId: string, contenido: string, source: MemorySource = 'geo', tags: string[] = []) {
        dbLocal.prepare(`
            INSERT INTO memoria_semantica (user_id, tipo, source, contenido, tags)
            VALUES (?, 'semantica', ?, ?, ?)
        `).run(usuarioId, source, contenido, JSON.stringify(tags));

        if (dbCloud) {
            dbCloud.collection('memoria_usuarios')
                .doc(usuarioId)
                .collection('hechos')
                .add({ contenido, source, tags, timestamp: new Date().toISOString() })
                .catch(() => {});
        }
    },

    obtenerHechos(usuarioId: string, limite: number = 5): string[] {
        const rows = dbLocal.prepare(`
            SELECT contenido FROM memoria_semantica
            WHERE user_id = ?
            ORDER BY timestamp DESC LIMIT ?
        `).all(usuarioId, limite) as any[];
        return rows.map((r: any) => r.contenido);
    },

    // ── Contexto enriquecido para inyectar al LLM ────────────────────────────
    construirContexto(usuarioId: string, source: MemorySource = 'geo'): string {
        const hechos = this.obtenerHechos(usuarioId);
        if (hechos.length === 0) return '';
        return `\n[MEMORIA PERMANENTE]\n${hechos.map(h => `- ${h}`).join('\n')}\n`;
    },
};

export class MemoriaDelAgente {
    constructor(private userId: string) {}
    guardar(msg: Omit<MensajeChat, 'user_id'>) {
        memoria.guardar({ ...msg, user_id: this.userId });
    }
    obtenerHistorial(limite: number = 10) {
        return memoria.obtenerHistorial(this.userId, limite);
    }
}

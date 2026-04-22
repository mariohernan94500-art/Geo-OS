/**
 * FASE 1 — Token Tracker
 * Middleware de control de tokens integrado con memory.db (SQLite unificado).
 * Registra cada llamada LLM, emite alertas Telegram al 80% y 100% del presupuesto.
 */

import Database from 'better-sqlite3';
import { appConfig } from '../config.js';

const db = new Database(appConfig.dbPath);

// Crear tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS token_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    model TEXT NOT NULL,
    operation TEXT NOT NULL DEFAULT 'chat',
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS token_budget (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  INSERT OR IGNORE INTO token_budget (key, value) VALUES ('daily_limit',   '${process.env.TOKEN_DAILY_LIMIT   || '100000'}');
  INSERT OR IGNORE INTO token_budget (key, value) VALUES ('monthly_limit', '${process.env.TOKEN_MONTHLY_LIMIT || '2000000'}');
  INSERT OR IGNORE INTO token_budget (key, value) VALUES ('alert_80_sent_day',   '');
  INSERT OR IGNORE INTO token_budget (key, value) VALUES ('alert_100_sent_day',  '');
`);

// ─── Registro ──────────────────────────────────────────────────────────────

export function registrarTokens(params: {
  userId: string;
  model: string;
  operation?: string;
  promptTokens: number;
  completionTokens: number;
}) {
  const total = params.promptTokens + params.completionTokens;
  db.prepare(`
    INSERT INTO token_usage (user_id, model, operation, prompt_tokens, completion_tokens, total_tokens)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    params.userId,
    params.model,
    params.operation ?? 'chat',
    params.promptTokens,
    params.completionTokens,
    total
  );
}

// ─── Consultas ─────────────────────────────────────────────────────────────

export function getTokensHoy(): { total: number; porModelo: Record<string, number> } {
  const hoy = new Date().toISOString().split('T')[0];
  const rows = db.prepare(`
    SELECT model, SUM(total_tokens) as t
    FROM token_usage
    WHERE timestamp >= ?
    GROUP BY model
  `).all(hoy + 'T00:00:00') as any[];

  const porModelo: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    porModelo[r.model] = r.t;
    total += r.t;
  }
  return { total, porModelo };
}

export function getTokensMes(): { total: number; porModelo: Record<string, number> } {
  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const rows = db.prepare(`
    SELECT model, SUM(total_tokens) as t
    FROM token_usage
    WHERE timestamp >= ?
    GROUP BY model
  `).all(inicioMes) as any[];

  const porModelo: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    porModelo[r.model] = r.t;
    total += r.t;
  }
  return { total, porModelo };
}

export function getLimites(): { diario: number; mensual: number } {
  const d = db.prepare(`SELECT value FROM token_budget WHERE key = 'daily_limit'`).get() as any;
  const m = db.prepare(`SELECT value FROM token_budget WHERE key = 'monthly_limit'`).get() as any;
  return {
    diario: parseInt(d?.value ?? '100000'),
    mensual: parseInt(m?.value ?? '2000000'),
  };
}

// ─── Verificar y emitir alertas ─────────────────────────────────────────────

export async function verificarPresupuestoYAlertar(botToken: string, adminChatId: string): Promise<void> {
  const hoy = new Date().toISOString().split('T')[0];
  const limites = getLimites();
  const statsHoy = getTokensHoy();
  const statsMes = getTokensMes();

  const pctDia = (statsHoy.total / limites.diario) * 100;
  const pctMes = (statsMes.total / limites.mensual) * 100;

  const alert80Key  = 'alert_80_sent_day';
  const alert100Key = 'alert_100_sent_day';

  const a80  = (db.prepare(`SELECT value FROM token_budget WHERE key = ?`).get(alert80Key)  as any)?.value;
  const a100 = (db.prepare(`SELECT value FROM token_budget WHERE key = ?`).get(alert100Key) as any)?.value;

  // Reset alertas si es un día nuevo
  if (a80 !== hoy && pctDia < 80) {
    db.prepare(`UPDATE token_budget SET value = '' WHERE key = ?`).run(alert80Key);
  }

  if (pctDia >= 100 && a100 !== hoy) {
    db.prepare(`UPDATE token_budget SET value = ? WHERE key = ?`).run(hoy, alert100Key);
    await enviarAlerta(botToken, adminChatId,
      `🚨 *LÍMITE DIARIO ALCANZADO*\n\n` +
      `Tokens hoy: ${statsHoy.total.toLocaleString()} / ${limites.diario.toLocaleString()}\n` +
      `Tokens mes: ${statsMes.total.toLocaleString()} / ${limites.mensual.toLocaleString()} (${pctMes.toFixed(1)}%)\n\n` +
      generarBarraProgreso(pctDia)
    );
  } else if (pctDia >= 80 && a80 !== hoy) {
    db.prepare(`UPDATE token_budget SET value = ? WHERE key = ?`).run(hoy, alert80Key);
    await enviarAlerta(botToken, adminChatId,
      `⚠️ *ALERTA: 80% del presupuesto diario usado*\n\n` +
      `Tokens hoy: ${statsHoy.total.toLocaleString()} / ${limites.diario.toLocaleString()}\n` +
      generarBarraProgreso(pctDia)
    );
  }
}

// ─── Reporte completo ───────────────────────────────────────────────────────

export function generarReporteTexto(): string {
  const limites = getLimites();
  const hoy = getTokensHoy();
  const mes = getTokensMes();
  const pctDia = ((hoy.total / limites.diario) * 100).toFixed(1);
  const pctMes = ((mes.total / limites.mensual) * 100).toFixed(1);

  const lineasHoy = Object.entries(hoy.porModelo)
    .map(([m, t]) => `  • ${m}: ${t.toLocaleString()}`)
    .join('\n') || '  Sin uso hoy';

  return (
    `📊 *Reporte de Tokens — Geo OS*\n\n` +
    `*HOY*\n${generarBarraProgreso(parseFloat(pctDia))} ${pctDia}%\n` +
    `${hoy.total.toLocaleString()} / ${limites.diario.toLocaleString()} tokens\n${lineasHoy}\n\n` +
    `*ESTE MES*\n${generarBarraProgreso(parseFloat(pctMes))} ${pctMes}%\n` +
    `${mes.total.toLocaleString()} / ${limites.mensual.toLocaleString()} tokens`
  );
}

function generarBarraProgreso(pct: number): string {
  const filled = Math.round(Math.min(pct, 100) / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}

async function enviarAlerta(token: string, chatId: string, texto: string): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: texto, parse_mode: 'Markdown' }),
    });
  } catch (err) {
    console.error('[TokenTracker] Error enviando alerta Telegram:', err);
  }
}

/**
 * FASE 1 — Token Tracker Middleware
 * Registra, limita y alerta el consumo de tokens LLM en tiempo real.
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'brain.db');

export interface TokenUsage {
  userId: string;
  model: string;
  operation: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUSD: number;
  timestamp: number;
}

// Costos aproximados por 1M tokens (USD)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gemini-1.5-pro': { input: 1.25, output: 5.0 },
  'llama-3.3-70b-versatile': { input: 0.0, output: 0.0 }, // Groq free tier
  'llama-3.1-8b-instant': { input: 0.0, output: 0.0 },
  'default': { input: 0.5, output: 1.5 },
};

// Presupuesto mensual por defecto (USD)
const DEFAULT_MONTHLY_BUDGET_USD = 20;
const ALERT_THRESHOLD = 0.80; // Alerta al 80%

let db: Database.Database;

function getDB(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS token_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        model TEXT NOT NULL,
        operation TEXT NOT NULL,
        input_tokens INTEGER NOT NULL DEFAULT 0,
        output_tokens INTEGER NOT NULL DEFAULT 0,
        total_tokens INTEGER NOT NULL DEFAULT 0,
        cost_usd REAL NOT NULL DEFAULT 0,
        timestamp INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS token_budget (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      INSERT OR IGNORE INTO token_budget (key, value) VALUES ('monthly_budget_usd', '${DEFAULT_MONTHLY_BUDGET_USD}');
      INSERT OR IGNORE INTO token_budget (key, value) VALUES ('alert_sent_80', '0');
      INSERT OR IGNORE INTO token_budget (key, value) VALUES ('alert_sent_100', '0');
    `);
  }
  return db;
}

export function recordTokenUsage(usage: TokenUsage): void {
  const d = getDB();
  const costs = MODEL_COSTS[usage.model] ?? MODEL_COSTS['default'];
  const costUSD =
    (usage.inputTokens / 1_000_000) * costs.input +
    (usage.outputTokens / 1_000_000) * costs.output;

  d.prepare(`
    INSERT INTO token_usage (user_id, model, operation, input_tokens, output_tokens, total_tokens, cost_usd, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    usage.userId,
    usage.model,
    usage.operation,
    usage.inputTokens,
    usage.outputTokens,
    usage.totalTokens,
    costUSD,
    Date.now()
  );
}

export function getMonthlyStats(): {
  totalTokens: number;
  totalCostUSD: number;
  budgetUSD: number;
  percentUsed: number;
  projectedMonthCostUSD: number;
  daysRemaining: number;
  byOperation: Record<string, number>;
} {
  const d = getDB();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const row = d.prepare(`
    SELECT 
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(SUM(cost_usd), 0) as total_cost
    FROM token_usage
    WHERE timestamp >= ?
  `).get(startOfMonth) as any;

  const byOp = d.prepare(`
    SELECT operation, SUM(total_tokens) as tokens
    FROM token_usage
    WHERE timestamp >= ?
    GROUP BY operation
  `).all(startOfMonth) as any[];

  const budget = parseFloat(
    (d.prepare(`SELECT value FROM token_budget WHERE key = 'monthly_budget_usd'`).get() as any)?.value ?? `${DEFAULT_MONTHLY_BUDGET_USD}`
  );

  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - dayOfMonth;
  const dailyRate = row.total_cost / (dayOfMonth || 1);
  const projectedMonthCostUSD = dailyRate * daysInMonth;

  return {
    totalTokens: row.total_tokens,
    totalCostUSD: row.total_cost,
    budgetUSD: budget,
    percentUsed: budget > 0 ? (row.total_cost / budget) * 100 : 0,
    projectedMonthCostUSD,
    daysRemaining,
    byOperation: Object.fromEntries(byOp.map((r: any) => [r.operation, r.tokens])),
  };
}

export function getDailyStats(): { totalTokens: number; totalCostUSD: number } {
  const d = getDB();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const row = d.prepare(`
    SELECT COALESCE(SUM(total_tokens), 0) as t, COALESCE(SUM(cost_usd), 0) as c
    FROM token_usage WHERE timestamp >= ?
  `).get(startOfDay.getTime()) as any;

  return { totalTokens: row.t, totalCostUSD: row.c };
}

export function shouldSendBudgetAlert(): '80' | '100' | null {
  const d = getDB();
  const stats = getMonthlyStats();

  const alert80 = (d.prepare(`SELECT value FROM token_budget WHERE key = 'alert_sent_80'`).get() as any)?.value;
  const alert100 = (d.prepare(`SELECT value FROM token_budget WHERE key = 'alert_sent_100'`).get() as any)?.value;

  // Reset alerts at start of new month
  const now = new Date();
  if (now.getDate() === 1) {
    d.prepare(`UPDATE token_budget SET value = '0' WHERE key IN ('alert_sent_80','alert_sent_100')`).run();
  }

  if (stats.percentUsed >= 100 && alert100 === '0') {
    d.prepare(`UPDATE token_budget SET value = '1' WHERE key = 'alert_sent_100'`).run();
    return '100';
  }
  if (stats.percentUsed >= 80 && alert80 === '0') {
    d.prepare(`UPDATE token_budget SET value = '1' WHERE key = 'alert_sent_80'`).run();
    return '80';
  }
  return null;
}

export function formatTokenReport(stats: ReturnType<typeof getMonthlyStats>): string {
  const bar = buildProgressBar(stats.percentUsed);
  return (
    `📊 *Reporte de Tokens — Este Mes*\n\n` +
    `${bar} ${stats.percentUsed.toFixed(1)}%\n\n` +
    `🔢 Tokens usados: ${stats.totalTokens.toLocaleString()}\n` +
    `💵 Costo real: $${stats.totalCostUSD.toFixed(4)} USD\n` +
    `💰 Presupuesto: $${stats.budgetUSD.toFixed(2)} USD\n` +
    `📈 Proyección fin de mes: $${stats.projectedMonthCostUSD.toFixed(4)} USD\n` +
    `📅 Días restantes: ${stats.daysRemaining}\n\n` +
    `*Por operación:*\n` +
    Object.entries(stats.byOperation)
      .sort((a, b) => b[1] - a[1])
      .map(([op, t]) => `  • ${op}: ${t.toLocaleString()} tokens`)
      .join('\n')
  );
}

function buildProgressBar(percent: number): string {
  const filled = Math.round(Math.min(percent, 100) / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}

export function setBudget(usd: number): void {
  getDB().prepare(`UPDATE token_budget SET value = ? WHERE key = 'monthly_budget_usd'`).run(String(usd));
}

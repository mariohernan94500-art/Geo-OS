/**
 * FASE 1 — Monitor de tokens por consola
 * Ejecutar: npx tsx scripts/token-monitor.ts
 */
import Database from 'better-sqlite3';
import { resolve } from 'path';

const DB_PATH = resolve(process.cwd(), '../Geotrouvetout/memory.db');
const db      = new Database(DB_PATH, { readonly: true });

function barra(pct: number): string {
  const f = Math.round(Math.min(pct, 100) / 5);
  return '█'.repeat(f) + '░'.repeat(20 - f);
}

function check() {
  console.log('\n📊 Geo OS — Monitor de Tokens');
  console.log('═'.repeat(50));

  const hoy      = new Date().toISOString().split('T')[0];
  const mesInit  = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const limDia = parseInt((db.prepare(`SELECT value FROM token_budget WHERE key='daily_limit'`).get() as any)?.value || '100000');
  const limMes = parseInt((db.prepare(`SELECT value FROM token_budget WHERE key='monthly_limit'`).get() as any)?.value || '2000000');

  // Hoy
  const hoyRows = db.prepare(`
    SELECT model, operation, SUM(prompt_tokens) as p, SUM(completion_tokens) as c, SUM(total_tokens) as t, COUNT(*) as calls
    FROM token_usage WHERE timestamp >= ? GROUP BY model, operation ORDER BY t DESC
  `).all(hoy + 'T00:00:00') as any[];

  const totalHoy = hoyRows.reduce((s, r) => s + r.t, 0);
  const pctHoy   = (totalHoy / limDia) * 100;

  console.log(`\nHOY (${hoy})`);
  console.log(`${barra(pctHoy)} ${pctHoy.toFixed(1)}%`);
  console.log(`${totalHoy.toLocaleString()} / ${limDia.toLocaleString()} tokens`);

  if (hoyRows.length) {
    console.log('');
    console.table(hoyRows.map(r => ({
      Modelo:     r.model,
      Operación:  r.operation,
      Llamadas:   r.calls,
      Prompt:     r.p,
      Completion: r.c,
      Total:      r.t,
    })));
  } else {
    console.log('  Sin uso hoy.');
  }

  // Mes
  const mesRows = db.prepare(`
    SELECT model, SUM(total_tokens) as t, COUNT(*) as calls
    FROM token_usage WHERE timestamp >= ? GROUP BY model ORDER BY t DESC
  `).all(mesInit) as any[];

  const totalMes = mesRows.reduce((s, r) => s + r.t, 0);
  const pctMes   = (totalMes / limMes) * 100;

  console.log(`\nESTE MES`);
  console.log(`${barra(pctMes)} ${pctMes.toFixed(1)}%`);
  console.log(`${totalMes.toLocaleString()} / ${limMes.toLocaleString()} tokens`);

  if (mesRows.length) {
    console.table(mesRows.map(r => ({ Modelo: r.model, Llamadas: r.calls, Total: r.t })));
  }

  db.close();
}

check();

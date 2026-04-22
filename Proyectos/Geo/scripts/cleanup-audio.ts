/**
 * FASE 0 — Limpieza automática de temp_audio
 * Elimina archivos de audio mayores a 24 horas.
 * Agregar a cron: 0 3 * * * npx tsx scripts/cleanup-audio.ts
 */
import { readdirSync, statSync, unlinkSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const TEMP_DIR   = resolve(process.cwd(), 'temp_audio');
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 horas

if (!existsSync(TEMP_DIR)) {
  console.log('📁 temp_audio no existe — nada que limpiar.');
  process.exit(0);
}

const ahora   = Date.now();
const archivos = readdirSync(TEMP_DIR);
let eliminados = 0;
let liberados  = 0;

for (const archivo of archivos) {
  const ruta = join(TEMP_DIR, archivo);
  try {
    const stat = statSync(ruta);
    const edad = ahora - stat.mtimeMs;
    if (edad > MAX_AGE_MS) {
      liberados += stat.size;
      unlinkSync(ruta);
      eliminados++;
    }
  } catch {
    // ignorar archivos en uso
  }
}

const mb = (liberados / 1024 / 1024).toFixed(2);
console.log(`🧹 Limpieza completada: ${eliminados} archivos eliminados (${mb} MB liberados)`);
console.log(`   Quedan: ${readdirSync(TEMP_DIR).length} archivos en temp_audio`);

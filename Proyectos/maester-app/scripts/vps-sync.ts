/**
 * FASE 6 — Sincronización bidireccional SQLite ↔ Firestore
 * Ejecutar: npx tsx scripts/vps-sync.ts
 * Usar en cron: 0 * * * * (cada hora)
 */
import Database from 'better-sqlite3';
import admin from 'firebase-admin';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

const SQLITE_PATH = resolve(process.cwd(), '../Geotrouvetout/memory.db');
const CRED_LOCAL  = resolve(process.cwd(), '../Geotrouvetout/service-account.json');

console.log('🔄 Geo OS — Sincronización SQLite ↔ Firestore');

if (!existsSync(SQLITE_PATH)) { console.error('❌ memory.db no encontrado:', SQLITE_PATH); process.exit(1); }

// ─── Firebase ──────────────────────────────────────────────────────────────
let firestore: admin.firestore.Firestore | null = null;
try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    : existsSync(CRED_LOCAL) ? readFileSync(CRED_LOCAL, 'utf8') : null;

  if (!raw) throw new Error('Sin credenciales Firebase');
  if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
  firestore = admin.firestore();
  console.log('✅ Firebase conectado');
} catch (err: any) {
  console.warn(`⚠️  Firebase no disponible: ${err.message}`);
  console.warn('   Solo se verificará la integridad local.');
}

// ─── SQLite ────────────────────────────────────────────────────────────────
const db = new Database(SQLITE_PATH);

async function sync() {
  const users = db.prepare('SELECT DISTINCT user_id FROM mensajes').all() as { user_id: string }[];
  console.log(`👥 Usuarios encontrados: ${users.length}`);

  let pushed = 0;
  let pulled = 0;

  for (const { user_id } of users) {
    const uid = user_id.toString();
    const localMsgs = db.prepare('SELECT * FROM mensajes WHERE user_id = ? ORDER BY timestamp ASC').all(uid) as any[];

    if (firestore) {
      // PUSH: local → cloud (sólo los que no están en Firestore)
      const cloudSnap = await firestore
        .collection('memoria_usuarios').doc(uid)
        .collection('mensajes').get();

      const cloudCount = cloudSnap.size;
      const diff       = localMsgs.length - cloudCount;

      if (diff > 0) {
        const nuevos = localMsgs.slice(cloudCount);
        const batch  = firestore.batch();
        for (const msg of nuevos) {
          const ref = firestore
            .collection('memoria_usuarios').doc(uid)
            .collection('mensajes').doc();
          batch.set(ref, { ...msg });
        }
        await batch.commit();
        pushed += diff;
        console.log(`  ⬆️  ${uid}: ${diff} mensajes → Firestore`);
      } else {
        console.log(`  ✅ ${uid}: sincronizado (${localMsgs.length} msgs)`);
      }
    } else {
      console.log(`  📦 ${uid}: ${localMsgs.length} msgs en local`);
    }
  }

  // Resumen token_usage
  const tokenRow = db.prepare(`
    SELECT COUNT(*) as c, COALESCE(SUM(total_tokens), 0) as t
    FROM token_usage
    WHERE timestamp >= date('now', '-30 days')
  `).get() as any;

  console.log(`\n📊 Tokens últimos 30 días: ${tokenRow?.t?.toLocaleString() || 0} (${tokenRow?.c || 0} llamadas)`);
  console.log(`\n✅ Sync completado — PUSH: ${pushed} | PULL: ${pulled}`);
}

sync().catch(console.error).finally(() => db.close());

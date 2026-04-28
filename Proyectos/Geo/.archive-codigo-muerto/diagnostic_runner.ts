import { diagnose } from './diagnose_api.js';

(async () => {
  try {
    await diagnose();
    console.log('✅ Diagnóstico completado.');
  } catch (err) {
    console.error('❌ Error al ejecutar diagnóstico:', err);
    process.exitCode = 1;
  }
})();

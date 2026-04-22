import { appConfig } from './config.js';
import { arrancarAgenteEnTelegram } from './bot/telegram.js';
import { memoria } from './agent/memory.js';
import { arrancarServidorApi } from './api/server.js';

async function inicioMundial() {
    console.log('─────────────────────────────────────────');
    console.log('🦾 GEO OS v2 — Iniciando ecosistema...');
    console.log('─────────────────────────────────────────');

    try {
        memoria.obtenerHistorial('0', 1);
        console.log('✅ SQLite operativo');
        console.log(`✅ Gemini  [${process.env.GEMINI_API_KEY ? 'ACTIVO' : 'INACTIVO'}]`);
        console.log(`✅ Groq    [${appConfig.llm.groqKey ? 'ACTIVO' : 'INACTIVO'}]`);
        console.log(`✅ OpenRouter [${appConfig.llm.openrouterKey ? 'RESPALDO' : 'SIN RESPALDO'}]`);

        arrancarServidorApi();

        // Bot de Telegram (modos: geo | comercio | warroom | productividad)
        await arrancarAgenteEnTelegram();

    } catch (err) {
        console.error('❌ Error crítico de inicio:', err);
        process.exit(1);
    }
}

inicioMundial();

import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(process.cwd(), '.env') });

function obtenerVar(clave: string, requerida: boolean = false, defecto: string = ''): string {
    let valor = process.env[clave];
    if (requerida && !valor) {
        throw new Error(`Falta la variable de entorno obligatoria en tu .env: ${clave}`);
    }
    // Sanitización por si hay comillas o espacios residuales al copiar del UI
    if (valor) {
        valor = valor.trim().replace(/^["']|["']$/g, '');
    }
    return valor || defecto;
}

export const appConfig = {
    telegram: {
        token: obtenerVar('TELEGRAM_BOT_TOKEN', true),
        usuariosPermitidos: obtenerVar('TELEGRAM_ALLOWED_USER_IDS', true)
            .split(',')
            .map(id => parseInt(id.trim(), 10))
            .filter(id => !isNaN(id)),
    },
    llm: {
        groqKey: obtenerVar('GROQ_API_KEY', true),
        geminiKey: obtenerVar('GEMINI_API_KEY', false),
        claudeKey: obtenerVar('ANTHROPIC_API_KEY', false),
        togetherKey: obtenerVar('TOGETHER_API_KEY', false),
        fireworksKey: obtenerVar('FIREWORKS_API_KEY', false),
        claudePaid: obtenerVar('CLAUDE_PAID', false, 'false') === 'true',
        claudeModel: obtenerVar('CLAUDE_MODEL', false, 'claude-3-sonnet-20240229'),
        openaiKey: obtenerVar('OPENAI_API_KEY', false),
        elevenlabsKey: obtenerVar('ELEVENLABS_API_KEY', false),
        openrouterKey: obtenerVar('OPENROUTER_API_KEY', false),
        openrouterModel: obtenerVar('OPENROUTER_MODEL', false, 'openrouter/free'),
        deepseekKey: obtenerVar('DEEPSEEK_API_KEY', false),
        deepseekModel: obtenerVar('DEEPSEEK_MODEL', false, 'deepseek-chat'),
        // Motor TTS activo: 'google' | 'elevenlabs' | 'none'
        ttsProvider: obtenerVar('TTS_PROVIDER', false, 'google'),
    },
    dbPath: obtenerVar('DB_PATH', false, './memory.db'),
    agent: {
        maxIteraciones: parseInt(obtenerVar('MAX_ITERATIONS', false, '5'), 10),
    },
    firebase: {
        credentialPath: obtenerVar('GOOGLE_APPLICATION_CREDENTIALS', false),
        serviceAccountJson: obtenerVar('FIREBASE_SERVICE_ACCOUNT_JSON', false),
    },
    n8n: {
        baseUrl: obtenerVar('N8N_BASE_URL', false) // URL base, ej: http://192.168.1.100:5678
    }
};

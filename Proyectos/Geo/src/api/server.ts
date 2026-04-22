import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { existsSync, mkdirSync, createReadStream, statSync } from 'fs';
import multer, { StorageEngine } from 'multer';

// ─── Directorio temporal ──────────────────────────────────────────────────────
const TEMP_DIR = 'temp_audio/';
if (!existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR, { recursive: true });
}

// ─── App ──────────────────────────────────────────────────────────────────────
export const app = express();

app.use(cors({
    exposedHeaders: ['x-transcript', 'x-reply-text', 'X-Transcript', 'X-Reply-Text'],
    origin: '*',
}));
app.use(express.json());

// Firewall — desactivado temporalmente para simplificación
// app.use(firewallMiddleware);

const PORT = process.env.PORT || 3000;

// ─── Imports tardíos (después de express) ────────────────────────────────────
import { GeoRequest, requireAuth } from '../security/auth.js';
import { peticionGeoCore } from '../agent/core/GeoCore.js';
import { montarChatPublico } from './publicChat.js';
// import { firewallMiddleware } from '../agent/agents/FirewallAgent.js';
import { transcribirAudio, sintetizarVoz } from '../agent/voice.js';

// ─── Control de concurrencia por usuario ─────────────────────────────────────
// Impide que el mismo usuario envíe múltiples requests simultáneos
const procesandoPorUsuario = new Map<string, boolean>();

function marcarProcesando(uid: string): boolean {
    if (procesandoPorUsuario.get(uid)) return false; // ya hay uno activo
    procesandoPorUsuario.set(uid, true);
    return true;
}

function liberarProcesamiento(uid: string): void {
    procesandoPorUsuario.delete(uid);
}

// ─── Multer — tipado correcto con @types/multer instalado ────────────────────
const storage: StorageEngine = multer.diskStorage({
    destination: TEMP_DIR,
    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ) => {
        const ext  = file.originalname.split('.').pop() || 'm4a';
        const name = `upload_${Date.now()}.${ext}`;
        console.log(`[MULTER] 💾 Guardando como: ${name}`);
        cb(null, name);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// ─── Interfaz de request con archivo de multer ────────────────────────────────
// GeoRequest extiende Request de Express; multer añade .file automáticamente
// cuando pasamos upload.single(). Usamos intersección para tiparlo correctamente.
type VoiceRequest = GeoRequest & { file?: Express.Multer.File };

// ─── HEALTH ───────────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'API Géo CORE en línea', ts: new Date().toISOString() });
});

// ─── CHAT ─────────────────────────────────────────────────────────────────────
app.post('/api/chat', requireAuth, async (req: GeoRequest, res: Response) => {
    try {
        const { texto, mode } = req.body;
        const userId    = req.user!.uid;
        if (!texto) {
            res.status(400).json({ error: 'Texto es requerido.' });
            return;
        }
        console.log(`[CHAT] 💬 Usuario ${userId}: "${texto}"`);
        const respuesta = await peticionGeoCore(userId, texto, mode || 'geo', mode || 'geo');
        res.json({ respuesta });
    } catch (error: any) {
        console.error('[CHAT] ❌', error.message);
        res.status(500).json({ error: error.message || 'Fallo en motor cognitivo' });
    }
});

// ─── VOZ ──────────────────────────────────────────────────────────────────────
/**
 * POST /api/voice/process
 *
 * Pipeline: Audio → STT (Whisper) → LLM (Groq) → TTS (Google/ElevenLabs)
 *
 * GARANTÍA: siempre responde (max 35s), nunca se queda colgado.
 * Si TTS falla → devuelve JSON con el texto.
 * Si STT/LLM fallan → devuelve HTTP 500 con mensaje descriptivo.
 */
app.post(
    '/api/voice/process',
    requireAuth,
    upload.single('audio'),
    async (req: VoiceRequest, res: Response): Promise<void> => {

        const sep    = '─'.repeat(54);
        const userId = req.user!.uid;
        console.log(`\n${sep}`);
        console.log(`[VOZ] 📥 Request de: ${userId} | ${new Date().toISOString()}`);

        // ── Bloqueo de concurrencia ───────────────────────────────────────────────
        if (!marcarProcesando(userId)) {
            console.warn(`[VOZ] ⚠️  ${userId} ya tiene un request activo — rechazando`);
            res.status(429).json({
                error: 'Ya estoy procesando tu mensaje anterior. Espera un momento.',
                step: 'BUSY',
            });
            return;
        }

        // Timeout global de seguridad — el servidor SIEMPRE responde
        let respondido = false;
        const globalTimeout = setTimeout(() => {
            if (!respondido) {
                respondido = true;
                console.error('[VOZ] ⏱️  Timeout global (35s) alcanzado — respondiendo fallback');
                res.status(504).json({
                    error: 'El servidor tardó demasiado. Inténtalo de nuevo.',
                    step: 'TIMEOUT',
                });
            }
        }, 35_000);

        try {
            // ── 1. Validar archivo ─────────────────────────────────────────
            if (!req.file) {
                console.error('[VOZ] ❌ Sin archivo en campo "audio"');
                res.status(400).json({ error: 'Falta el archivo de audio (campo: "audio")' });
                return;
            }

            const { path: filePath, originalname, mimetype, size } = req.file;
            console.log(`[VOZ] 📁 ${originalname} | ${mimetype} | ${size} bytes → ${filePath}`);

            const statFile = statSync(filePath);
            if (statFile.size < 100) {
                res.status(400).json({
                    error: `Archivo demasiado pequeño (${statFile.size} bytes). ¿Grabaste algo?`,
                });
                return;
            }

            // ── 2. STT ────────────────────────────────────────────────────
            let textoTranscrito = '';
            try {
                textoTranscrito = await transcribirAudio(filePath);
            } catch (sttErr: any) {
                console.error(`[VOZ] ❌ STT: ${sttErr.message}`);
                res.status(500).json({ error: sttErr.message, step: 'STT' });
                return;
            }

            if (!textoTranscrito.trim()) {
                console.warn('[VOZ] ⚠️  Transcripción vacía (silencio o ruido)');
                res.json({
                    textOnly: true,
                    transcripcion: '',
                    respuesta: 'No escuché nada. ¿Podrías hablar un poco más fuerte?',
                });
                return;
            }

            // ── 3. LLM ────────────────────────────────────────────────────
            let respuestaTexto = '';
            try {
                respuestaTexto = await peticionGeoCore(userId, textoTranscrito);
                console.log(`[VOZ] 🧠 LLM: "${respuestaTexto.substring(0, 80)}..."`);
            } catch (llmErr: any) {
                console.error(`[VOZ] ❌ LLM: ${llmErr.message}`);
                res.status(500).json({ error: llmErr.message, step: 'LLM' });
                return;
            }

            // ── 4. TTS ────────────────────────────────────────────────────
            try {
                const audioPath = await sintetizarVoz(respuestaTexto);

                if (audioPath && existsSync(audioPath)) {
                    const audioSize = statSync(audioPath).size;
                    console.log(`[VOZ] 🎵 Audio listo: ${audioSize} bytes → enviando`);

                    res.set('X-Transcript',  encodeURIComponent(textoTranscrito));
                    res.set('X-Reply-Text',  encodeURIComponent(respuestaTexto));
                    res.set('x-transcript',  encodeURIComponent(textoTranscrito));
                    res.set('x-reply-text',  encodeURIComponent(respuestaTexto));
                    res.type('audio/mpeg');

                    const stream = createReadStream(audioPath);
                    stream.on('end', () => {
                        respondido = true;
                        console.log(`[VOZ] ✅ Audio enviado\n${sep}\n`);
                        clearTimeout(globalTimeout);
                    });
                    stream.on('error', (streamErr) => {
                        console.error('[VOZ] ❌ Error al leer el audio:', streamErr.message);
                    });
                    stream.pipe(res);
                    return;
                }
            } catch (ttsErr: any) {
                console.warn(`[VOZ] ⚠️  TTS falló (${ttsErr.message}) → texto fallback`);
            }

            // Fallback texto (TTS no disponible)
            console.log('[VOZ] 📝 Enviando respuesta en modo texto');
            res.set('X-Transcript', encodeURIComponent(textoTranscrito));
            res.set('X-Reply-Text', encodeURIComponent(respuestaTexto));
            res.set('x-transcript', encodeURIComponent(textoTranscrito));
            res.set('x-reply-text', encodeURIComponent(respuestaTexto));
            res.json({
                textOnly: true,
                transcripcion: textoTranscrito,
                respuesta: respuestaTexto,
            });

        } catch (fatalErr: any) {
            console.error(`[VOZ] 💥 Error fatal inesperado: ${fatalErr.message}`);
            console.error(fatalErr.stack);
            if (!respondido) {
                res.status(500).json({ error: fatalErr.message, step: 'FATAL' });
            }
        } finally {
            respondido = true;
            clearTimeout(globalTimeout);
            liberarProcesamiento(userId); // liberar el lock SIEMPRE
            console.log(`[VOZ] 🏁 Pipeline finalizado\n${sep}\n`);
        }
    }
);

// ─── INICIO ──────────────────────────────────────────────────────────────────
export function arrancarServidorApi(): void {
    // Chat público para el widget web (sin JWT)
    montarChatPublico(app);

    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`🌐 [API] Escuchando en http://0.0.0.0:${PORT}`);
        console.log(`📱 [API] Red local: puerto ${PORT} — listo`);
    });
}

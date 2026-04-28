import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { existsSync, mkdirSync, createReadStream, statSync } from 'fs';
import multer, { StorageEngine } from 'multer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { unlink } from 'fs/promises';

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

const PORT = process.env.PORT || 3000;

// ─── Imports tardíos (después de express) ────────────────────────────────────
import { GeoRequest, requireAuth } from '../security/auth.js';
import { peticionGeoCore } from '../agent/core/GeoCore.js';
import { montarChatPublico } from './publicChat.js';
import { transcribirAudio, sintetizarVoz } from '../agent/voice.js';

// ─── Control de concurrencia por usuario ─────────────────────────────────────
const procesandoPorUsuario = new Map<string, boolean>();

function marcarProcesando(uid: string): boolean {
    if (procesandoPorUsuario.get(uid)) return false;
    procesandoPorUsuario.set(uid, true);
    return true;
}

function liberarProcesamiento(uid: string): void {
    procesandoPorUsuario.delete(uid);
}

// ─── Multer ───────────────────────────────────────────────────────────────────
const storage: StorageEngine = multer.diskStorage({
    destination: TEMP_DIR,
    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ) => {
        const ext  = file.originalname.split('.').pop() || 'm4a';
        const name = `upload_${Date.now()}.${ext}`;
        cb(null, name);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 },
});

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
        const respuesta = await peticionGeoCore(userId, texto, mode || 'geo', mode || 'geo');
        res.json({ respuesta });
    } catch (error: any) {
        console.error('[CHAT] ❌', error.message);
        res.status(500).json({ error: error.message || 'Fallo en motor cognitivo' });
    }
});

// ─── VOZ ──────────────────────────────────────────────────────────────────────
app.post(
    '/api/voice/process',
    // requireAuth,
    upload.single('audio'),
    async (req: VoiceRequest, res: Response): Promise<void> => {
        const sep    = '─'.repeat(54);
        const userId = req.user?.uid || req.ip || 'anonymous';

        if (!marcarProcesando(userId)) {
            res.status(429).json({
                error: 'Ya estoy procesando tu mensaje anterior. Espera un momento.',
                step: 'BUSY',
            });
            return;
        }

        let respondido = false;
        const globalTimeout = setTimeout(() => {
            if (!respondido) {
                respondido = true;
                res.status(504).json({
                    error: 'El servidor tardó demasiado. Inténtalo de nuevo.',
                    step: 'TIMEOUT',
                });
            }
        }, 35_000);

        try {
            if (!req.file) {
                res.status(400).json({ error: 'Falta el archivo de audio (campo: "audio")' });
                return;
            }

            const { path: filePath } = req.file;
            const statFile = statSync(filePath);
            if (statFile.size < 100) {
                res.status(400).json({
                    error: `Archivo demasiado pequeño (${statFile.size} bytes). ¿Grabaste algo?`,
                });
                return;
            }

            let textoTranscrito = '';
            try {
                textoTranscrito = await transcribirAudio(filePath);
            } catch (sttErr: any) {
                res.status(500).json({ error: sttErr.message, step: 'STT' });
                return;
            }

            if (!textoTranscrito.trim()) {
                res.json({
                    textOnly: true,
                    transcripcion: '',
                    respuesta: 'No escuché nada. ¿Podrías hablar un poco más fuerte?',
                });
                return;
            }

            let respuestaTexto = '';
            try {
                respuestaTexto = await peticionGeoCore(userId, textoTranscrito);
            } catch (llmErr: any) {
                res.status(500).json({ error: llmErr.message, step: 'LLM' });
                return;
            }

            try {
                const audioPath = await sintetizarVoz(respuestaTexto);
                if (audioPath && existsSync(audioPath)) {
                    res.set('X-Transcript',  encodeURIComponent(textoTranscrito));
                    res.set('X-Reply-Text',  encodeURIComponent(respuestaTexto));
                    res.set('x-transcript',  encodeURIComponent(textoTranscrito));
                    res.set('x-reply-text',  encodeURIComponent(respuestaTexto));
                    res.type('audio/mpeg');
                    const stream = createReadStream(audioPath);
                    stream.on('end', () => {
                        respondido = true;
                        clearTimeout(globalTimeout);
                    });
                    stream.pipe(res);
                    return;
                }
            } catch (ttsErr: any) {
                console.warn(`[VOZ] TTS falló: ${ttsErr.message}`);
            }

            res.set('X-Transcript', encodeURIComponent(textoTranscrito));
            res.set('X-Reply-Text', encodeURIComponent(respuestaTexto));
            res.json({
                textOnly: true,
                transcripcion: textoTranscrito,
                respuesta: respuestaTexto,
            });

        } catch (fatalErr: any) {
            console.error('[VOZ] Error fatal:', fatalErr.message);
            if (!respondido) {
                res.status(500).json({ error: fatalErr.message, step: 'FATAL' });
            }
        } finally {
            respondido = true;
            clearTimeout(globalTimeout);
            liberarProcesamiento(userId);
        }
    }
);

// ─── VISIÓN (LLaVA) ─────────────────────────────────────────────────────────
const execAsync = promisify(exec);
const LLAVA_MODEL = '/opt/models/llava/llava-llama-3-8b-v1_1-int4.gguf';
const LLAVA_MMPROJ = '/opt/models/llava/llava-llama-3-8b-v1_1-mmproj-f16.gguf';
const LLAVA_BIN = '/opt/llama.cpp/build/bin/llama-mtmd-cli';

app.post(
  '/api/vision',
  /* requireAuth,*/ // Quitar comentario para proteger con JWT
  upload.single('image'),
  async (req: VoiceRequest, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No se recibió ninguna imagen' });
      return;
    }

    const imagePath = req.file.path;
    console.log(`[VISION] Procesando: ${imagePath}`);

    try {
      // Ejecutar LLaVA con template adecuado y prompt en español
      const { stdout } = await execAsync(
        `${LLAVA_BIN} -m ${LLAVA_MODEL} --mmproj ${LLAVA_MMPROJ} --image "${imagePath}" ` +
        `--chat-template llama3 ` +
        `-p "[INST] Describe la imagen en español. Responde únicamente con la descripción, sin comentarios adicionales. [/INST]" ` +
        `--temp 0.7 -n 256 2>&1 | ` +
        `grep -v -E "^(ggml|llama_|print_|common_|load|sched|clip|mtmd|warmup|alloc|main:|WARN:|---|For normal use cases|encoding|decoding|image slice|image decoded)|^\\." ` +
        `| sed -n '/\\[\\/INST\\]/,\\$p' | sed 's/^.*\\[\\/INST\\]\\s*//'`,
        { timeout: 180000, maxBuffer: 10 * 1024 * 1024 }
      );

      // Limpiar la salida cruda: eliminar logs y extraer solo la descripción
      let description = stdout.trim();
      
      // Dividir en líneas y filtrar las que no queremos
      const lines = description.split('\n');
      const filtered = lines.filter(line => {
        // Ignorar líneas que son claramente logs técnicos
        if (/^(ggml|llama_|print_|common_|load|sched|clip|mtmd|warmup|alloc|main:|WARN:|---)/.test(line)) return false;
        // Ignorar líneas con patrones de plantilla de chat
        if (/<\|start_header_id\|>|<\|end_header_id\|>|<\|eot_id\|>|You are a helpful assistant|Hello|How are you\?|Hi there/.test(line)) return false;
        // Ignorar líneas que son puros puntos suspensivos
        if (/^\.\.\.+$/.test(line)) return false;
        return true;
      });
      
      // Unir líneas filtradas
      description = filtered.join('\n').trim();
      
      // Si aún contiene el marcador [/INST], tomar después de él
      const instIdx = description.indexOf('[/INST]');
      if (instIdx !== -1) {
        description = description.substring(instIdx + 7).trim();
      }
      
      // Eliminar cualquier prefijo "assistant"
      description = description.replace(/^.*?assistant\s*/i, '').trim();
      
      // Buscar el primer carácter de una oración real (mayúscula seguida de texto)
      const match = description.match(/[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+.*/);
      if (match && match.index) {
        description = description.substring(match.index);
      }

      // Eliminar archivo temporal
      await unlink(imagePath).catch(() => {});

      if (!description) {
        throw new Error('LLaVA no produjo una descripción válida');
      }

      console.log(`[VISION] OK (${description.length} caracteres)`);
      res.json({ description });
    } catch (error: any) {
      console.error('[VISION] Error:', error.message);
      await unlink(imagePath).catch(() => {});
      res.status(500).json({ error: 'Error procesando la imagen', details: error.message });
    }
  }
);

// ─── INICIO ──────────────────────────────────────────────────────────────────
export function arrancarServidorApi(): void {
    montarChatPublico(app);

    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`🌐 [API] Escuchando en http://0.0.0.0:${PORT}`);
        console.log(`📱 [API] Red local: puerto ${PORT} — listo`);
    });
}

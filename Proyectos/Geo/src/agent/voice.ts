import { Groq } from 'groq-sdk';
import { appConfig } from '../config.js';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import { join } from 'path';

// Import con nombre de clase explícito — evita el error TS2503 con namespace
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import type { protos } from '@google-cloud/text-to-speech';

// ─── Constantes ──────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: appConfig.llm.groqKey });

const TEMP_DIR = join(process.cwd(), 'temp_audio');
if (!existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR, { recursive: true });
}

// Timeout para cada servicio externo (ms)
const STT_TIMEOUT_MS  = 20_000;
const TTS_TIMEOUT_MS  = 8_000; // Reducido de 15s a 8s por proveedor (más velocidad)

// ─── Utilidad: Promise con timeout ───────────────────────────────────────────
function conTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout en ${label} (${ms}ms)`)), ms)
        ),
    ]);
}

// ─── Cliente Google TTS ──────────────────────────────────────────────────────
function crearClienteTTS(): TextToSpeechClient | null {
    try {
        const saJson  = appConfig.firebase.serviceAccountJson;
        const credPath = appConfig.firebase.credentialPath;

        if (saJson) {
            const credentials = typeof saJson === 'string' ? JSON.parse(saJson) : saJson;
            console.log('[TTS] ✅ Client Google TTS listo (Service Account JSON)');
            return new TextToSpeechClient({ credentials });
        }
        if (credPath && existsSync(credPath)) {
            console.log('[TTS] ✅ Client Google TTS listo (archivo credenciales)');
            return new TextToSpeechClient({ keyFilename: credPath });
        }

        console.warn('[TTS] ⚠️  Sin credenciales Google — TTS Google deshabilitado');
        return null;
    } catch (err: any) {
        console.error('[TTS] ❌ Error creando client Google TTS:', err.message);
        return null;
    }
}

const ttsClient = crearClienteTTS();

// ─── STT: Whisper via Groq ───────────────────────────────────────────────────
export async function transcribirAudio(filePath: string): Promise<string> {
    console.log('[STT] 🎙️  Enviando a Whisper...');

    const resultado = await conTimeout(
        groq.audio.transcriptions.create({
            file: createReadStream(filePath),
            model: 'whisper-large-v3-turbo', // 5x más rápido que large-v3
            language: 'es',
            response_format: 'text',
        }),
        STT_TIMEOUT_MS,
        'Whisper'
    );

    const texto = typeof resultado === 'string' ? resultado : (resultado as any).text || '';
    console.log(`[STT] ✅ Transcrito: "${texto.substring(0, 80)}"`);
    return texto;
}

// ─── TTS: Cadena de proveedores ───────────────────────────────────────────────
/**
 * Retorna la ruta a un MP3 temporal.
 * Lanza excepción si TODOS los proveedores fallan
 * → el servidor enviará fallback de texto (el flujo NO se rompe).
 *
 * Prioridad: Google Cloud TTS → ElevenLabs
 */
export async function sintetizarVoz(texto: string): Promise<string> {
    const seguro = texto.length > 4500 ? texto.substring(0, 4500) + '...' : texto;
    const provider = appConfig.llm.ttsProvider;

    // 1. ElevenLabs (primero si está configurado como proveedor activo)
    if (provider === 'elevenlabs' && appConfig.llm.elevenlabsKey) {
        try {
            console.log('[TTS] Intentando ElevenLabs (proveedor activo)...');
            const path = await conTimeout(ttsElevenLabs(seguro), TTS_TIMEOUT_MS, 'ElevenLabs');
            console.log('[TTS] ✅ ElevenLabs OK');
            return path;
        } catch (e: any) {
            console.warn('[TTS] ⚠️  ElevenLabs falló:', e.message);
        }
    }

    // 2. Google Cloud TTS (solo si es el proveedor activo o como fallback)
    if (provider !== 'elevenlabs' && ttsClient) {
        try {
            console.log('[TTS] Intentando Google Cloud...');
            const path = await conTimeout(ttsGoogle(seguro), TTS_TIMEOUT_MS, 'Google TTS');
            console.log('[TTS] ✅ Google TTS OK');
            return path;
        } catch (e: any) {
            console.warn('[TTS] ⚠️  Google TTS falló:', e.message);
        }
    }

    // 3. ElevenLabs como fallback universal (si no fue el proveedor activo)
    if (provider !== 'elevenlabs' && appConfig.llm.elevenlabsKey) {
        try {
            console.log('[TTS] Intentando ElevenLabs (fallback)...');
            const path = await conTimeout(ttsElevenLabs(seguro), TTS_TIMEOUT_MS, 'ElevenLabs');
            console.log('[TTS] ✅ ElevenLabs OK');
            return path;
        } catch (e: any) {
            console.warn('[TTS] ⚠️  ElevenLabs falló:', e.message);
        }
    }

    throw new Error('Todos los proveedores TTS fallaron');
}

// ─── Google Cloud TTS ────────────────────────────────────────────────────────
async function ttsGoogle(texto: string): Promise<string> {
    type SynthRequest = protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;

    const request: SynthRequest = {
        input: { text: texto },
        voice: {
            languageCode: 'es-ES',
            name: 'es-ES-Neural2-B',      // Masculino Neural2
            ssmlGender: 'MALE',
        },
        audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0,
        },
    };

    const [response] = await ttsClient!.synthesizeSpeech(request);

    if (!response.audioContent) {
        throw new Error('Google TTS devolvió contenido vacío');
    }

    const buffer = Buffer.from(response.audioContent as Uint8Array);
    if (buffer.length < 100) {
        throw new Error(`Audio demasiado pequeño: ${buffer.length} bytes`);
    }

    const filePath = join(TEMP_DIR, `tts_google_${Date.now()}.mp3`);
    await writeFile(filePath, buffer);
    console.log(`[TTS] Google MP3: ${filePath} (${buffer.length} bytes)`);
    return filePath;
}

// ─── ElevenLabs TTS ──────────────────────────────────────────────────────────
async function ttsElevenLabs(texto: string): Promise<string> {
    const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam

    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
        {
            method:  'POST',
            headers: {
                'xi-api-key':   appConfig.llm.elevenlabsKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: texto,
                model_id: 'eleven_multilingual_v2',
                voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
        }
    );

    if (!response.ok) {
        const msg = await response.text();
        throw new Error(`ElevenLabs ${response.status}: ${msg.substring(0, 200)}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 100) {
        throw new Error(`Audio ElevenLabs demasiado pequeño: ${buffer.length} bytes`);
    }

    const filePath = join(TEMP_DIR, `tts_eleven_${Date.now()}.mp3`);
    await writeFile(filePath, buffer);
    return filePath;
}

// ─── Limpieza ────────────────────────────────────────────────────────────────
export async function limpiarArchivo(filePath: string): Promise<void> {
    try {
        if (filePath && existsSync(filePath)) await unlink(filePath);
    } catch {
        // No crítico
    }
}

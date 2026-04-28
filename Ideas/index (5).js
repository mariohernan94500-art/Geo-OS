import express from 'express';
import axios from 'axios';
import { runDeepSeek } from '../ai/index.js';

const voiceRouter = express.Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel
const elevenLabsAvailable = !!(ELEVENLABS_API_KEY && ELEVENLABS_API_KEY.length > 5);

if (elevenLabsAvailable) {
  console.log('[Voice] ElevenLabs initialized');
} else {
  console.log('[Voice] No ElevenLabs key configured, voice features disabled');
}

// POST /tts — convert text to speech via ElevenLabs
voiceRouter.post('/tts', async (req, res) => {
  try {
    if (!elevenLabsAvailable) {
      return res.status(200).json({ audio: null, message: 'Voz no configurada' });
    }

    const { text, voiceId } = req.body;

    if (!text) {
      return res.status(400).json({ audio: null, message: 'text is required' });
    }

    const resolvedVoiceId = voiceId || DEFAULT_VOICE_ID;

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );

    const audioBase64 = Buffer.from(response.data).toString('base64');
    return res.status(200).json({ audio: audioBase64, format: 'mp3' });
  } catch (err) {
    console.error('[Voice] TTS error:', err.message);
    return res.status(200).json({ audio: null, message: 'Error de síntesis de voz' });
  }
});

// POST /command — interpret a voice command via DeepSeek and optionally respond with TTS
voiceRouter.post('/command', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ command: { action: 'unknown', text: 'No transcript provided' }, audio: null });
    }

    const interpretation = await runDeepSeek(
      `Interpreta este comando de voz para el sistema Geo (que genera aplicaciones web).
  El usuario dijo: "${transcript}"
  
  Responde SOLO con JSON:
  - Si quiere crear una app: {"action": "create", "idea": "descripción de la app a crear"}
  - Si quiere listar apps: {"action": "list"}
  - Si quiere eliminar una app: {"action": "delete", "name": "nombre de la app"}
  - Si quiere monitorear: {"action": "monitor", "name": "nombre de la app"}
  - Si no se entiende: {"action": "unknown", "text": "qué entendiste"}
  `,
      'Eres un intérprete de comandos de voz para un sistema de generación de apps.'
    );

    let parsed;
    try {
      const jsonMatch = interpretation.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = { action: 'unknown', text: interpretation };
      }
    } catch (parseErr) {
      console.error('[Voice] JSON parse error:', parseErr.message);
      parsed = { action: 'unknown', text: interpretation };
    }

    // Ensure parsed has a valid action
    const validActions = ['create', 'list', 'delete', 'monitor', 'unknown'];
    if (!parsed.action || !validActions.includes(parsed.action)) {
      parsed = { action: 'unknown', text: parsed.text || interpretation };
    }

    // Generate audio response if ElevenLabs is available
    let audioResponse = null;
    if (elevenLabsAvailable) {
      try {
        const responseText = parsed.action === 'create'
          ? `Creando la aplicación: ${parsed.idea}`
          : parsed.action === 'list'
          ? 'Listando tus aplicaciones'
          : parsed.action === 'delete'
          ? `Eliminando ${parsed.name}`
          : parsed.action === 'monitor'
          ? `Monitoreando ${parsed.name}`
          : `No entendí el comando`;

        const ttsResponse = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`,
          {
            text: responseText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          },
          {
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY,
              'Content-Type': 'application/json',
              'Accept': 'audio/mpeg'
            },
            responseType: 'arraybuffer',
            timeout: 30000
          }
        );
        audioResponse = Buffer.from(ttsResponse.data).toString('base64');
      } catch (ttsErr) {
        console.error('[Voice] TTS error:', ttsErr.message);
      }
    }

    return res.status(200).json({
      command: parsed,
      audio: audioResponse,
      format: audioResponse ? 'mp3' : null
    });
  } catch (err) {
    console.error('[Voice] Command error:', err.message);
    return res.status(200).json({
      command: { action: 'unknown', text: 'Error processing command' },
      audio: null
    });
  }
});

// GET /voices — list available ElevenLabs voices
voiceRouter.get('/voices', async (req, res) => {
  try {
    if (!elevenLabsAvailable) {
      return res.status(200).json([]);
    }

    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      },
      timeout: 15000
    });

    const voices = response.data?.voices || [];
    return res.status(200).json(voices);
  } catch (err) {
    console.error('[Voice] Voices list error:', err.message);
    return res.status(200).json([]);
  }
});

export { voiceRouter };

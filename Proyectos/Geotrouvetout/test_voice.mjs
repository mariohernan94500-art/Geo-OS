#!/usr/bin/env node
/**
 * test_voice.mjs — Diagnóstico del endpoint /api/voice/process
 * Uso: node test_voice.mjs
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { FormData, Blob } from 'node:buffer'; // Node 18+

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ1c3JfZGV2XzEyMyIsInJvbGUiOiJPV05FUiIsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NzUxMDQwOTMsImV4cCI6MTgwNjY2MTY5M30.OXz1CULxLJMnrSTElvVt1uPARdIsydZDKmSu489VShg';
const BASE_URL = 'http://192.168.1.15:3000';

// ─── Genera un WAV real de 2s (silencio) ─────────────────────────────────────
function crearWav() {
  const sampleRate = 16000;
  const numSamples = sampleRate * 2; // 2 segundos
  const dataSize   = numSamples * 2; // 16-bit = 2 bytes por muestra
  const buf = Buffer.alloc(44 + dataSize);
  let o = 0;

  buf.write('RIFF',   o); o += 4;
  buf.writeUInt32LE(36 + dataSize, o); o += 4;
  buf.write('WAVE',   o); o += 4;
  buf.write('fmt ',   o); o += 4;
  buf.writeUInt32LE(16, o); o += 4;   // chunk size
  buf.writeUInt16LE(1,  o); o += 2;   // PCM
  buf.writeUInt16LE(1,  o); o += 2;   // mono
  buf.writeUInt32LE(sampleRate, o); o += 4;
  buf.writeUInt32LE(sampleRate * 2, o); o += 4; // byte rate
  buf.writeUInt16LE(2,  o); o += 2;   // block align
  buf.writeUInt16LE(16, o); o += 2;   // bits per sample
  buf.write('data',   o); o += 4;
  buf.writeUInt32LE(dataSize, o);
  // resto son zeros = silencio

  return buf;
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     GÉO VOICE ENDPOINT — TEST SCRIPT       ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // 1. Crear WAV
  const wav = crearWav();
  const audioPath = join(process.cwd(), 'test_audio_prueba.wav');
  writeFileSync(audioPath, wav);
  console.log(`✅ WAV creado: ${audioPath}`);
  console.log(`   Tamaño   : ${wav.length} bytes`);

  // 2. Health check primero
  console.log(`\n🔍 Verificando servidor en ${BASE_URL}...`);
  try {
    const health = await fetch(`${BASE_URL}/health`);
    const hData  = await health.json();
    console.log(`✅ Servidor OK: ${JSON.stringify(hData)}`);
  } catch (e) {
    console.error(`❌ Servidor NO responde en ${BASE_URL}`);
    console.error(`   Error: ${e.message}`);
    process.exit(1);
  }

  // 3. Enviar audio
  console.log(`\n📡 Enviando audio al endpoint de voz...`);
  const form = new FormData();
  const blob = new Blob([wav], { type: 'audio/wav' });
  form.append('audio', blob, 'test_audio.wav');

  const t0 = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/api/voice/process`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}` },
      body:    form,
    });
    const elapsed = Date.now() - t0;

    console.log(`\n📬 Respuesta recibida en ${elapsed}ms`);
    console.log(`   HTTP Status    : ${res.status} ${res.statusText}`);
    console.log(`   Content-Type   : ${res.headers.get('content-type') || '(ninguno)'}`);
    console.log(`   X-Transcript   : ${res.headers.get('x-transcript') || res.headers.get('X-Transcript') || '(vacío)'}`);
    console.log(`   X-Reply-Text   : ${res.headers.get('x-reply-text') || res.headers.get('X-Reply-Text') || '(vacío)'}`);

    const ct = res.headers.get('content-type') || '';

    if (ct.includes('audio')) {
      const buf = await res.arrayBuffer();
      console.log(`\n🎵 ÉXITO — Audio MP3 recibido: ${buf.byteLength} bytes`);
      console.log('✅ El flujo completo funciona correctamente.\n');
    } else {
      const body = await res.text();
      let parsed;
      try { parsed = JSON.parse(body); } catch { parsed = body; }

      console.log(`\n📄 Respuesta del servidor:`);
      console.log(JSON.stringify(parsed, null, 2));

      if (res.ok) {
        if (parsed?.textOnly) {
          console.log('\n⚠️  El servidor respondió en modo texto (TTS falló o sin clave ElevenLabs).');
          console.log(`   Transcripción : "${parsed.transcripcion}"`);
          console.log(`   Respuesta     : "${parsed.respuesta}"`);
          if (parsed.ttsError) console.log(`   TTS Error     : ${parsed.ttsError}`);
        }
      } else {
        console.log(`\n❌ Error en step: ${parsed?.step || 'desconocido'}`);
        console.log(`   Mensaje: ${parsed?.error || body}`);
        console.log('\n👆 Busca este step en los logs del servidor para el detalle exacto.');
      }
    }

  } catch (err) {
    const elapsed = Date.now() - t0;
    console.error(`\n❌ Error de red (${elapsed}ms): ${err.message}`);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('   → El servidor rechazó la conexión. ¿Está corriendo?');
    } else if (err.message.includes('ETIMEDOUT')) {
      console.error('   → Timeout. Firewall o red bloqueando el acceso.');
    }
  }
}

main();

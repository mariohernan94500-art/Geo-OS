/**
 * FASE 3 — Bot de Telegram Unificado
 * Un solo bot con modos: /modo_geo | /modo_comercio | /modo_warroom | /modo_productividad
 * + comando /tokens para ver consumo
 */
import { Bot, Context, NextFunction, InputFile } from 'grammy';
import { limit } from '@grammyjs/ratelimiter';
import { appConfig } from '../config.js';
import { peticionGeoCore } from '../agent/core/GeoCore.js';
import { memoria, MemorySource } from '../agent/memory.js';
import { transcribirAudio, sintetizarVoz, limpiarArchivo } from '../agent/voice.js';
import { generarReporteTexto } from '../security/tokenTracker.js';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { get } from 'https';
import { join } from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const TEMP_DOWNLOADS = join(process.cwd(), 'temp_audio');
if (!existsSync(TEMP_DOWNLOADS)) mkdirSync(TEMP_DOWNLOADS, { recursive: true });

export const botServidor = new Bot(appConfig.telegram.token);

type BotMode = 'geo' | 'comercio' | 'warroom' | 'productividad';
const userModes = new Map<string, BotMode>();
const procesandoUsuarios = new Set<string>();

function getMode(userId: string): BotMode { return userModes.get(userId) ?? 'geo'; }
function getSource(mode: BotMode): MemorySource {
    return ({ geo: 'geo', comercio: 'ecoorigen', warroom: 'geo', productividad: 'voren' } as const)[mode];
}

// ─── Rate limit ────────────────────────────────────────────────────────────────
botServidor.use(limit({
    timeFrame: 60 * 1000,
    limit: 5,
    onLimitExceeded: async (ctx) => { await ctx.reply('⚠️ Límite de frecuencia. Espera un momento.'); },
    keyGenerator: (ctx) => ctx.from?.id.toString(),
}));

// ─── Lista blanca ──────────────────────────────────────────────────────────────
botServidor.use(async (ctx: Context, next: NextFunction) => {
    const usrId = ctx.from?.id;
    if (!usrId || !appConfig.telegram.usuariosPermitidos.includes(usrId)) {
        await ctx.reply('⛔ Acceso restringido.');
        return;
    }
    await next();
});

// ─── Comandos ──────────────────────────────────────────────────────────────────
botServidor.command('start', async (ctx: Context) => {
    const userId = ctx.from!.id.toString();
    const modo = getMode(userId);
    await ctx.reply(
        `🦾 *Géo OS v1 — En Línea*\n\n` +
        `Modo actual: *${modo.toUpperCase()}*\n\n` +
        `*Comandos:*\n` +
        `/modo_geo — Asistente general\n` +
        `/modo_comercio — EcoOrigen / Shopify\n` +
        `/modo_warroom — Métricas y análisis\n` +
        `/modo_productividad — Tareas / Voren\n` +
        `/modo_seguridad — Escaneo y protección\n` +
        `/modo_salud — Ejercicio y bienestar\n` +
        `/modo_compras — Precios y listas\n` +
        `/modo_media — Contenido y redes\n` +
        `/tokens — Consumo de tokens del mes\n` +
        `/borrarmemoria — Limpiar historial\n\n` +
        `Envía texto, voz o video 🎙️`,
        { parse_mode: 'Markdown' }
    );
});

botServidor.command('modo_geo',           async (ctx) => { userModes.set(ctx.from!.id.toString(), 'geo');          await ctx.reply('✅ Modo *GEO* activado.', { parse_mode: 'Markdown' }); });
botServidor.command('modo_comercio',      async (ctx) => { userModes.set(ctx.from!.id.toString(), 'comercio');     await ctx.reply('✅ Modo *COMERCIO* activado.', { parse_mode: 'Markdown' }); });
botServidor.command('modo_warroom',       async (ctx) => { userModes.set(ctx.from!.id.toString(), 'warroom');      await ctx.reply('✅ Modo *WARROOM* activado.', { parse_mode: 'Markdown' }); });
botServidor.command('modo_productividad', async (ctx) => { userModes.set(ctx.from!.id.toString(), 'productividad'); await ctx.reply('✅ Modo *PRODUCTIVIDAD* activado.', { parse_mode: 'Markdown' }); });
botServidor.command('modo_seguridad', async (ctx) => { userModes.set(ctx.from!.id.toString(), 'geo'); await ctx.reply('✅ Modo *SEGURIDAD* activado. Usa: "escaneo sentinel" o "reporte firewall"', { parse_mode: 'Markdown' }); });
botServidor.command('modo_salud', async (ctx) => { userModes.set(ctx.from!.id.toString(), 'productividad'); await ctx.reply('✅ Modo *SALUD* activado. Cuéntame sobre ejercicio, comida o sueño.', { parse_mode: 'Markdown' }); });
botServidor.command('modo_compras', async (ctx) => { userModes.set(ctx.from!.id.toString(), 'geo'); await ctx.reply('✅ Modo *COMPRAS* activado. Dime qué necesitas comprar.', { parse_mode: 'Markdown' }); });
botServidor.command('modo_media', async (ctx) => { userModes.set(ctx.from!.id.toString(), 'comercio'); await ctx.reply('✅ Modo *MEDIA* activado. ¿Post IG, copy, SEO?', { parse_mode: 'Markdown' }); });

botServidor.command('tokens', async (ctx: Context) => {
    const reporte = generarReporteTexto();
    await ctx.reply(reporte, { parse_mode: 'Markdown' });
});

botServidor.command('borrarmemoria', async (ctx: Context) => {
    const userId = ctx.from!.id.toString();
    const modo   = getMode(userId);
    memoria.borrarHistorial(userId, getSource(modo));
    await ctx.reply(`🗑️ Historial del modo *${modo.toUpperCase()}* borrado.`, { parse_mode: 'Markdown' });
});

// ─── Descargar archivo ─────────────────────────────────────────────────────────
// ─── VISIÓN: análisis de imágenes (vía API) ───────────────────────────────
botServidor.on('message:photo', async (ctx: any) => {
  const userId = ctx.from!.id.toString();
  const allowed = appConfig.telegram.usuariosPermitidos.map(String);
  if (!allowed.includes(userId)) {
    return ctx.reply('⛔ No estás autorizado.');
  }

  try {
    await ctx.reply('📸 Analizando imagen... (puede tardar hasta 1 minuto)');
    
    const photoArray = ctx.message.photo;
    const largestPhoto = photoArray[photoArray.length - 1];
    const fileId = largestPhoto.file_id;
    
    const file = await ctx.api.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${appConfig.telegram.token}/${file.file_path}`;
    
    const imagePath = `/tmp/telegram_${Date.now()}.jpg`;
    const response = await fetch(fileUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const fs = await import('fs');
    fs.writeFileSync(imagePath, buffer);
    
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    
    const visionRes = await fetch('http://localhost:3000/api/vision', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const data = (await visionRes.json()) as { description?: string };
    fs.unlinkSync(imagePath);
    
    if (data.description) {
      ctx.reply(`🖼️ ${data.description}`);
    } else {
      ctx.reply('❌ No pude analizar la imagen.');
    }
  } catch (error: any) {
    console.error('[Telegram Vision] Error:', error);
    ctx.reply('⚠️ Error al procesar la imagen.');
  }
});

async function descargarArchivo(ctx: Context, destino: string): Promise<void> {
    const file    = await ctx.getFile();
    const fileUrl = `https://api.telegram.org/file/bot${appConfig.telegram.token}/${file.file_path}`;
    await new Promise<void>((resolve, reject) => {
        const stream = createWriteStream(destino);
        get(fileUrl, res => { res.pipe(stream); stream.on('finish', resolve); stream.on('error', reject); }).on('error', reject);
    });
}

// ─── Pipeline media → LLM → TTS ───────────────────────────────────────────────
async function procesarMediaYResponder(ctx: Context, userId: string, mediaPath: string, tipo: string, captionExtra?: string) {
    await ctx.replyWithChatAction('typing');
    const transcripcion = await transcribirAudio(mediaPath);
    const textoFinal    = captionExtra
        ? `[Video: ${transcripcion}]\n[Nota: ${captionExtra}]`
        : `[${tipo}]: ${transcripcion}`;

    const modo     = getMode(userId);
    const source   = getSource(modo);
    const respText = await peticionGeoCore(userId, textoFinal, source, modo);

    const msg = `🎙️ *Transcripción:* ${transcripcion}\n\n🤖 *Géo:* ${respText}`;
    for (const trozo of msg.match(/[\s\S]{1,4000}/g) || []) await ctx.reply(trozo);

    const intervalo = setInterval(async () => { try { await ctx.replyWithChatAction('record_voice'); } catch {} }, 4000);
    let audioPath: string | null = null;
    try { audioPath = await sintetizarVoz(respText); } finally { clearInterval(intervalo); }
    if (audioPath) { await ctx.replyWithVoice(new InputFile(audioPath)); await limpiarArchivo(audioPath); }
}

// ─── Texto ─────────────────────────────────────────────────────────────────────
botServidor.on('message:text', async (ctx: Context) => {
    const userId = ctx.from!.id.toString();
    const texto  = (ctx.message?.text || '').trim();
    if (!texto) return;
    if (procesandoUsuarios.has(userId)) { await ctx.reply('⏳ Procesando tu mensaje anterior...'); return; }
    procesandoUsuarios.add(userId);
    try {
        await ctx.replyWithChatAction('typing');
        const modo     = getMode(userId);
        const source   = getSource(modo);
        const respText = await peticionGeoCore(userId, texto, source, modo);
        for (const trozo of (respText.match(/[\s\S]{1,4000}/g) || [])) {
            try {
                await ctx.reply(trozo, { parse_mode: 'Markdown' });
            } catch {
                await ctx.reply(trozo);
            }
        }
    } catch (err) {
        console.error('[Telegram] Error en texto:', err);
        await ctx.reply('⚠️ Error procesando tu mensaje.');
    } finally {
        procesandoUsuarios.delete(userId);
    }
});

// ─── Voz ───────────────────────────────────────────────────────────────────────
botServidor.on('message:voice', async (ctx: Context) => {
    const userId   = ctx.from!.id.toString();
    const tempPath = join(TEMP_DOWNLOADS, `voice_${userId}_${Date.now()}.ogg`);
    if (procesandoUsuarios.has(userId)) { await ctx.reply('⏳ Procesando tu mensaje anterior...'); return; }
    procesandoUsuarios.add(userId);
    try {
        await descargarArchivo(ctx, tempPath);
        await procesarMediaYResponder(ctx, userId, tempPath, 'Audio');
    } catch (err) {
        console.error('[Telegram] Error en voz:', err);
        await ctx.reply('⚠️ Error procesando el audio.');
    } finally {
        await limpiarArchivo(tempPath);
        procesandoUsuarios.delete(userId);
    }
});

// ─── Video ─────────────────────────────────────────────────────────────────────
botServidor.on('message:video', async (ctx: Context) => {
    const userId   = ctx.from!.id.toString();
    const tempPath = join(TEMP_DOWNLOADS, `video_${userId}_${Date.now()}.mp4`);
    if (procesandoUsuarios.has(userId)) { await ctx.reply('⏳ Procesando tu mensaje anterior...'); return; }
    procesandoUsuarios.add(userId);
    try {
        await descargarArchivo(ctx, tempPath);
        const caption = (ctx.message as any)?.caption || '';
        await procesarMediaYResponder(ctx, userId, tempPath, 'Video', caption);
    } catch (err) {
        console.error('[Telegram] Error en video:', err);
        await ctx.reply('⚠️ Error procesando el video.');
    } finally {
        await limpiarArchivo(tempPath);
        procesandoUsuarios.delete(userId);
    }
});

// ─── Video nota ────────────────────────────────────────────────────────────────
botServidor.on('message:video_note', async (ctx: Context) => {
    const userId   = ctx.from!.id.toString();
    const tempPath = join(TEMP_DOWNLOADS, `vidnote_${userId}_${Date.now()}.mp4`);
    if (procesandoUsuarios.has(userId)) { await ctx.reply('⏳ Procesando tu mensaje anterior...'); return; }
    procesandoUsuarios.add(userId);
    try {
        await descargarArchivo(ctx, tempPath);
        await procesarMediaYResponder(ctx, userId, tempPath, 'VideoNota');
    } catch (err) {
        console.error('[Telegram] Error en video nota:', err);
        await ctx.reply('⚠️ Error procesando el video.');
    } finally {
        await limpiarArchivo(tempPath);
        procesandoUsuarios.delete(userId);
    }
});
// ─── Fotos ────────────────────────────────────────────────────────────────────
// ─── VISIÓN: análisis de imágenes (vía API) ───────────────────────────────


// ─── Arranque ──────────────────────────────────────────────────────────────────
export async function arrancarAgenteEnTelegram() {
    console.log(`[Telegram] Iniciando bot...`);
    process.once('SIGINT',  () => botServidor.stop());
    process.once('SIGTERM', () => botServidor.stop());
    await botServidor.start({
        onStart: (info: any) => {
            console.log(`✅ @${info.username} en línea`);
            console.log(`🛡️  Usuarios: ${appConfig.telegram.usuariosPermitidos.join(', ')}`);
            console.log(`📡 Modos: geo | comercio | warroom | productividad`);
        }
    });
}

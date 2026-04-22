/**
 * GEO OS — Bot de Telegram
 * Modos: /modo_geo | /modo_comercio | /modo_warroom | /modo_productividad
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

const TEMP_DOWNLOADS = join(process.cwd(), 'temp_audio');
if (!existsSync(TEMP_DOWNLOADS)) mkdirSync(TEMP_DOWNLOADS, { recursive: true });

export const botServidor = new Bot(appConfig.telegram.token);

type BotMode = 'geo' | 'comercio' | 'warroom' | 'productividad';
const userModes = new Map<string, BotMode>();
const procesandoUsuarios = new Set<string>();

function getMode(userId: string): BotMode { return userModes.get(userId) ?? 'geo'; }
function getSource(mode: BotMode): MemorySource {
    return ({ geo: 'geo', comercio: 'ecoorigen', warroom: 'geo', productividad: 'productividad' } as const)[mode];
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
        `🦾 *GEO OS v2 — En Línea*\n\n` +
        `Modo actual: *${modo.toUpperCase()}*\n\n` +
        `*Comandos:*\n` +
        `/modo_geo — Asistente general\n` +
        `/modo_comercio — EcoOrigen / Shopify\n` +
        `/modo_warroom — Métricas y análisis\n` +
        `/modo_productividad — Tareas / Proyectos\n` +
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
        const respuesta = await peticionGeoCore(userId, texto, source, modo);
        for (const trozo of respuesta.match(/[\s\S]{1,4000}/g) || []) {
            await ctx.reply(trozo, { parse_mode: 'Markdown' }).catch(() => ctx.reply(trozo));
        }
    } catch (err: any) {
        await ctx.reply(`⚠️ Error: ${err.message}`);
    } finally {
        procesandoUsuarios.delete(userId);
    }
});

// ─── Voz ───────────────────────────────────────────────────────────────────────
botServidor.on('message:voice', async (ctx: Context) => {
    const userId = ctx.from!.id.toString();
    if (procesandoUsuarios.has(userId)) { await ctx.reply('⏳ Procesando tu mensaje anterior...'); return; }
    procesandoUsuarios.add(userId);
    const tempPath = join(TEMP_DOWNLOADS, `voice_${userId}_${Date.now()}.ogg`);
    try {
        await ctx.replyWithChatAction('record_voice');
        await descargarArchivo(ctx, tempPath);
        await procesarMediaYResponder(ctx, userId, tempPath, 'Mensaje de voz');
    } catch (err: any) {
        await ctx.reply(`⚠️ Error en voz: ${err.message}`);
    } finally {
        procesandoUsuarios.delete(userId);
        await limpiarArchivo(tempPath);
    }
});

// ─── Video ─────────────────────────────────────────────────────────────────────
botServidor.on('message:video', async (ctx: Context) => {
    const userId   = ctx.from!.id.toString();
    const tempPath = join(TEMP_DOWNLOADS, `video_${userId}_${Date.now()}.mp4`);
    try {
        await ctx.reply('🎬 Procesando video...');
        await descargarArchivo(ctx, tempPath);
        await procesarMediaYResponder(ctx, userId, tempPath, 'Video', ctx.message?.caption);
    } catch (err: any) {
        await ctx.reply(`⚠️ Error en video: ${err.message}`);
    } finally {
        await limpiarArchivo(tempPath);
    }
});

// ─── Video nota ────────────────────────────────────────────────────────────────
botServidor.on('message:video_note', async (ctx: Context) => {
    const userId   = ctx.from!.id.toString();
    const tempPath = join(TEMP_DOWNLOADS, `vidnote_${userId}_${Date.now()}.mp4`);
    try {
        await ctx.reply('📹 Procesando nota de video...');
        await descargarArchivo(ctx, tempPath);
        await procesarMediaYResponder(ctx, userId, tempPath, 'Video circular');
    } catch (err: any) {
        await ctx.reply(`⚠️ Error: ${err.message}`);
    } finally {
        await limpiarArchivo(tempPath);
    }
});

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

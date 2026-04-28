import { createAppFromIdea, listApps, deleteApp, getApp } from '../generator/index.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
let bot = null;

export async function startTelegramBot() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('[Telegram] No bot token configured, Telegram control disabled');
    return;
  }

  try {
    const TelegramBot = (await import('node-telegram-bot-api')).default;
    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    console.log('[Telegram] Bot started successfully');

    // Authorization middleware
    function isAuthorized(msg) {
      return String(msg.chat.id) === String(TELEGRAM_CHAT_ID);
    }

    // Handle all messages
    bot.on('message', async (msg) => {
      if (!isAuthorized(msg)) {
        bot.sendMessage(msg.chat.id, '⛔ No autorizado. Este bot es privado.');
        return;
      }

      const text = msg.text || '';
      console.log(`[Telegram] Message from ${msg.chat.id}: ${text}`);

      try {
        // Command: /start
        if (text === '/start') {
          bot.sendMessage(msg.chat.id,
            '🤖 *Geo AI System v3*\n\n' +
            'Comandos disponibles:\n' +
            '• crear [idea] - Genera una app desde una idea\n' +
            '• listar - Lista todas las apps\n' +
            '• estado [nombre] - Estado de una app\n' +
            '• eliminar [nombre] - Elimina una app\n' +
            '• ayuda - Muestra esta ayuda\n\n' +
            'También puedes escribir naturalmente: "crea una app de tareas"',
            { parse_mode: 'Markdown' }
          );
          return;
        }

        // Command: /ayuda or ayuda
        if (text === '/ayuda' || text.toLowerCase() === 'ayuda') {
          bot.sendMessage(msg.chat.id,
            '🤖 *Geo AI System v3 - Ayuda*\n\n' +
            '• *crear app de notas* - Genera una app completa\n' +
            '• *listar* - Ver todas tus apps\n' +
            '• *estado nombre-app* - Ver métricas\n' +
            '• *eliminar nombre-app* - Borrar una app\n' +
            '• Cualquier mensaje que empiece con "crear" o "genera" se trata como una idea',
            { parse_mode: 'Markdown' }
          );
          return;
        }

        // Command: listar
        if (text.toLowerCase().includes('listar') || text.toLowerCase().includes('lista') || text === '/listar') {
          const apps = await listApps();
          if (apps.length === 0) {
            bot.sendMessage(msg.chat.id, '📭 No hay apps creadas todavía. Escribe "crear [idea]" para empezar.');
          } else {
            const appList = apps.map(a =>
              `📦 *${a.name}*\n   Puerto: ${a.port} | Estado: ${a.status}\n   URL: http://localhost:${a.port}`
            ).join('\n\n');
            bot.sendMessage(msg.chat.id, `📋 *Apps creadas (${apps.length}):*\n\n${appList}`, { parse_mode: 'Markdown' });
          }
          return;
        }

        // Command: eliminar
        if (text.toLowerCase().startsWith('eliminar') || text.toLowerCase().startsWith('/eliminar') || text.toLowerCase().startsWith('borrar')) {
          const appName = text.replace(/^(eliminar|borrar|\/eliminar)\s*/i, '').trim();
          if (!appName) {
            bot.sendMessage(msg.chat.id, '❌ Especifica el nombre de la app. Ejemplo: eliminar mi-app');
            return;
          }
          bot.sendMessage(msg.chat.id, `⏳ Eliminando ${appName}...`);
          const result = await deleteApp(appName);
          bot.sendMessage(msg.chat.id, `✅ App *${result.name}* eliminada correctamente`, { parse_mode: 'Markdown' });
          return;
        }

        // Command: estado
        if (text.toLowerCase().startsWith('estado') || text.toLowerCase().startsWith('/estado')) {
          const appName = text.replace(/^(estado|\/estado)\s*/i, '').trim();
          if (!appName) {
            bot.sendMessage(msg.chat.id, '❌ Especifica el nombre de la app. Ejemplo: estado mi-app');
            return;
          }
          const app = await getApp(appName);
          if (!app) {
            bot.sendMessage(msg.chat.id, `❌ App "${appName}" no encontrada`);
            return;
          }
          const metrics = app.metrics ? JSON.parse(app.metrics) : {};
          bot.sendMessage(msg.chat.id,
            `📊 *${app.name}*\n` +
            `Estado: ${app.status}\n` +
            `Puerto: ${app.port}\n` +
            `CPU: ${metrics.cpu || 0}%\n` +
            `Memoria: ${metrics.memory || 0}MB\n` +
            `Req/min: ${metrics.requestsPerMinute || 0}`,
            { parse_mode: 'Markdown' }
          );
          return;
        }

        // Default: treat as "create" command
        // If message starts with "crear", "genera", "crea", "haz", "build", "make", "create"
        const createPatterns = /^(crear|genera|crea|haz|build|make|create|desarrolla|construye)\s+/i;
        let idea = text;
        if (createPatterns.test(text)) {
          idea = text.replace(createPatterns, '').trim();
        }

        if (idea.length < 3) {
          bot.sendMessage(msg.chat.id, '❌ La idea es muy corta. Describe mejor qué app quieres crear.');
          return;
        }

        // Create the app
        bot.sendMessage(msg.chat.id, `🚀 Creando app para: "${idea}"...\n\nEsto puede tardar 30-60 segundos.`);

        const result = await createAppFromIdea(idea);

        if (result.success) {
          bot.sendMessage(msg.chat.id,
            `✅ *App creada exitosamente!*\n\n` +
            `📦 Nombre: ${result.name}\n` +
            `🔌 Puerto: ${result.port}\n` +
            `🌐 URL: ${result.url}\n` +
            `📝 Descripción: ${result.description}`,
            { parse_mode: 'Markdown' }
          );
        } else {
          bot.sendMessage(msg.chat.id, `❌ Error al crear la app: ${result.error}`);
        }

      } catch (err) {
        console.error('[Telegram] Error handling message:', err.message);
        bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`);
      }
    });

    bot.on('error', (err) => {
      console.error('[Telegram] Bot error:', err.message);
    });

  } catch (err) {
    console.error('[Telegram] Failed to start bot:', err.message);
    console.log('[Telegram] Telegram control disabled');
  }
}

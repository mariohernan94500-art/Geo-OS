import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// ─── Express + HTTP + Socket.io Setup ────────────────────────────────────────
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static(path.resolve(__dirname, 'public')));

// Serve generated app frontends from /apps
app.use('/apps', express.static(path.resolve(__dirname, 'apps')));

// ─── Module Imports (after dotenv) ───────────────────────────────────────────
import { initializeDatabase } from './modules/database/sqlite.js';
import { authMiddleware, authRouter } from './modules/auth/index.js';
import { createAppFromIdea, listApps, getApp, deleteApp, getNextPort } from './modules/generator/index.js';
import { setupWebSocket, startMetricsBroadcast } from './modules/monitoring/index.js';
import { startAutoScaler } from './modules/scaling/index.js';
import { paymentsRouter } from './modules/payments/index.js';
import { voiceRouter } from './modules/voice/index.js';
import { deploymentRouter } from './modules/deployment/index.js';
import { marketplaceRouter } from './modules/marketplace/index.js';
import { startTelegramBot } from './modules/telegram/index.js';

// ─── API Routes ──────────────────────────────────────────────────────────────

// Auth routes
app.use('/api/auth', authRouter);

// Generator routes
app.post('/api/generator/create', async (req, res) => {
  try {
    const { idea, port } = req.body;
    if (!idea) {
      return res.status(400).json({ error: 'La idea es requerida' });
    }
    console.log(`[API] Create app request: "${idea}"`);
    const result = await createAppFromIdea(idea, port);
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json({ error: result.error });
    }
  } catch (err) {
    console.error('[API] Create app error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/generator/apps', async (req, res) => {
  try {
    const apps = await listApps();
    return res.json({ apps });
  } catch (err) {
    console.error('[API] List apps error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/generator/apps/:name', async (req, res) => {
  try {
    const appData = await getApp(req.params.name);
    if (!appData) {
      return res.status(404).json({ error: 'App no encontrada' });
    }
    return res.json(appData);
  } catch (err) {
    console.error('[API] Get app error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/generator/apps/:name', async (req, res) => {
  try {
    const result = await deleteApp(req.params.name);
    return res.json(result);
  } catch (err) {
    console.error('[API] Delete app error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/generator/next-port', async (req, res) => {
  try {
    const port = await getNextPort();
    return res.json({ port });
  } catch (err) {
    console.error('[API] Next port error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Payment routes (fails silently if Stripe not configured)
app.use('/api/payments', paymentsRouter);

// Voice routes (fails silently if ElevenLabs not configured)
app.use('/api/voice', voiceRouter);

// Deployment routes
app.use('/api/deployment', deploymentRouter);

// Marketplace routes (v4)
app.use('/api/marketplace', marketplaceRouter);

// System info endpoint
app.get('/api/system/info', async (req, res) => {
  try {
    const os = await import('os');
    res.json({
      version: '3.0.0',
      uptime: process.uptime(),
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024),
        usage: Math.round((1 - os.freemem() / os.totalmem()) * 100)
      },
      cpu: os.cpus().length,
      env: {
        hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
        hasGroq: !!process.env.GROQ_API_KEY,
        hasDeepSeek: !!process.env.DEEPSEEK_API_KEY,
        hasGemini: !!process.env.GEMINI_API_KEY,
        hasStripe: !!process.env.STRIPE_SECRET_KEY,
        hasElevenLabs: !!process.env.ELEVENLABS_API_KEY,
        hasTelegram: !!process.env.TELEGRAM_BOT_TOKEN
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback: serve dashboard for root
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'dashboard.html'));
});

// ─── WebSocket Setup ─────────────────────────────────────────────────────────
setupWebSocket(io);

// ─── Startup Function ────────────────────────────────────────────────────────
async function startGeo() {
  try {
    console.log('========================================');
    console.log('  🧠 Geo AI System v3.0');
    console.log('  Starting up...');
    console.log('========================================');

    // 1. Initialize database
    console.log('[Startup] Initializing database...');
    await initializeDatabase();
    console.log('[Startup] ✅ Database ready');

    // 2. Start monitoring metrics broadcast
    console.log('[Startup] Starting metrics broadcast...');
    startMetricsBroadcast(io);
    console.log('[Startup] ✅ Monitoring active');

    // 3. Start auto-scaler
    console.log('[Startup] Starting auto-scaler...');
    startAutoScaler(30000);
    console.log('[Startup] ✅ Auto-scaler active');

    // 4. Start Telegram bot (fails gracefully if not configured)
    console.log('[Startup] Starting Telegram bot...');
    await startTelegramBot();
    console.log('[Startup] ✅ Telegram check complete');

    // 5. Start HTTP server
    httpServer.listen(PORT, () => {
      console.log('========================================');
      console.log(`  🚀 Geo is LIVE at ${BASE_URL}`);
      console.log(`  📊 Dashboard: ${BASE_URL}/dashboard.html`);
      console.log(`  🔌 API: ${BASE_URL}/api/`);
      console.log('========================================');
    });

  } catch (err) {
    console.error('[Startup] ❌ Fatal error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('[Shutdown] SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('[Shutdown] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Shutdown] SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('[Shutdown] Server closed');
    process.exit(0);
  });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('[System] Unhandled Rejection:', reason);
});

// ─── Start! ──────────────────────────────────────────────────────────────────
startGeo();

/**
 * Endpoint Público de Chat — Para el widget de ecoorigenchile.com
 * 
 * SIN JWT (los visitantes del sitio no tienen cuenta).
 * Rate limited por IP (máx 10 msgs/min).
 * Usa SalesAgent directamente para respuestas de venta.
 * 
 * USO: Importar y montar en server.ts
 *   import { montarChatPublico } from './publicChat.js';
 *   montarChatPublico(app);
 */
import { Router, Request, Response } from 'express';
import { salesAgent } from '../agent/agents/SalesAgent.js';

const router = Router();

// ─── Rate limiter simple por IP ──────────────────────────────────────────────
const ipHits = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_MINUTE = 10;

function rateLimitByIP(req: Request, res: Response): boolean {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = ipHits.get(ip);

    if (!record || now > record.resetAt) {
        ipHits.set(ip, { count: 1, resetAt: now + 60_000 });
        return false; // OK
    }

    record.count++;
    if (record.count > MAX_PER_MINUTE) {
        res.status(429).json({ error: 'Demasiados mensajes. Espera un momento.' });
        return true; // blocked
    }
    return false;
}

// Limpiar IPs antiguas cada 5 minutos
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipHits.entries()) {
        if (now > record.resetAt + 300_000) ipHits.delete(ip);
    }
}, 300_000);

// ─── Historial por sesión (en memoria, temporal) ─────────────────────────────
const sessions = new Map<string, Array<{ role: string; content: string }>>();

function getSessionId(req: Request): string {
    // Usar header custom o generar por IP+UserAgent
    return req.headers['x-session-id'] as string
        || `web_${(req.ip || '').replace(/[:.]/g, '_')}_${Buffer.from(req.headers['user-agent'] || '').toString('base64').slice(0, 12)}`;
}

// Limpiar sesiones inactivas cada 30 minutos
setInterval(() => {
    // Simple: borrar todas cada 30 min (las sesiones web son efímeras)
    if (sessions.size > 1000) sessions.clear();
}, 30 * 60_000);

// ─── POST /api/public/chat ──────────────────────────────────────────────────
router.post('/chat', async (req: Request, res: Response) => {
    // Rate limit
    if (rateLimitByIP(req, res)) return;

    const { mensaje } = req.body;
    if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length === 0) {
        res.status(400).json({ error: 'Campo "mensaje" es requerido.' });
        return;
    }

    const texto = mensaje.trim().slice(0, 500); // Max 500 chars
    const sessionId = getSessionId(req);

    console.log(`[PublicChat] 💬 ${sessionId}: "${texto.slice(0, 60)}..."`);

    // Obtener/crear historial de sesión
    if (!sessions.has(sessionId)) sessions.set(sessionId, []);
    const historial = sessions.get(sessionId)!;
    historial.push({ role: 'user', content: texto });

    try {
        const respuesta = await salesAgent.chatConHistorial(historial, `web_${sessionId}`);
        historial.push({ role: 'assistant', content: respuesta });

        // Mantener solo últimos 20 mensajes
        if (historial.length > 20) {
            sessions.set(sessionId, historial.slice(-20));
        }

        res.json({ respuesta, sessionId });
    } catch (err: any) {
        console.error(`[PublicChat] ❌ ${err.message}`);
        res.status(500).json({
            respuesta: '¡Ups! Hubo un problema. Escríbenos por WhatsApp para atención inmediata: +56 9 XXXX XXXX',
            error: true,
        });
    }
});

// ─── GET /api/public/health ─────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', agent: 'SalesAgent', sessions: sessions.size });
});

// ─── Montar en Express app ──────────────────────────────────────────────────
export function montarChatPublico(app: any) {
    app.use('/api/public', router);
    console.log('💬 [PublicChat] Endpoint público montado en /api/public/chat');
}

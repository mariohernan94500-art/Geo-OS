/**
 * FirewallAgent — Seguridad Externa de Geo OS
 * Vigila: rate limit violations, IPs sospechosas, requests malformados,
 *         inyección, disponibilidad de servicios, SSL.
 * 
 * Se integra como middleware de Express + agente delegable.
 */
import { BaseAgent } from './BaseAgent.js';
import { generarRespuesta } from '../llm.js';
import { Request, Response, NextFunction } from 'express';

// ─── Estado en memoria ──────────────────────────────────────────────────────

interface IPRecord {
    requests: number;
    blocked: boolean;
    blockedUntil: number;
    violations: number;
    lastRequest: number;
    failedAuths: number;
}

const ipTracker = new Map<string, IPRecord>();
const securityLog: Array<{ ts: string; level: string; type: string; ip: string; detail: string }> = [];
const MAX_LOG = 500; // mantener últimos 500 eventos

// IPs que nunca se bloquean (agregar la de Mario)
const WHITELIST_IPS = new Set(
    (process.env.FIREWALL_WHITELIST_IPS || '127.0.0.1,::1').split(',').map(s => s.trim())
);

// ─── Utilidades ─────────────────────────────────────────────────────────────

function getIP(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || req.ip
        || req.socket.remoteAddress
        || 'unknown';
}

function logEvent(level: string, type: string, ip: string, detail: string) {
    const entry = { ts: new Date().toISOString(), level, type, ip, detail };
    securityLog.push(entry);
    if (securityLog.length > MAX_LOG) securityLog.shift();

    const emoji = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🔴', CRITICAL: '⚫' }[level] || '⚪';
    console.log(`[FIREWALL] ${emoji} ${type} | ${ip} | ${detail}`);
}

function getOrCreateIP(ip: string): IPRecord {
    if (!ipTracker.has(ip)) {
        ipTracker.set(ip, {
            requests: 0, blocked: false, blockedUntil: 0,
            violations: 0, lastRequest: 0, failedAuths: 0,
        });
    }
    return ipTracker.get(ip)!;
}

// ─── Detección de patrones maliciosos ───────────────────────────────────────

function detectarInyeccion(body: any): string | null {
    const texto = JSON.stringify(body).toLowerCase();
    if (/('|--|;|union\s+select|drop\s+table|insert\s+into)/i.test(texto)) return 'SQL_INJECTION';
    if (/<script|javascript:|on(error|load|click)=/i.test(texto)) return 'XSS';
    if (/\.\.\/(etc|passwd|shadow|proc)/i.test(texto)) return 'PATH_TRAVERSAL';
    if (/\$\{|`.*`|\$\(.*\)/i.test(texto)) return 'COMMAND_INJECTION';
    return null;
}

// ─── Middleware de Express ───────────────────────────────────────────────────

export function firewallMiddleware(req: Request, res: Response, next: NextFunction): void {
    const ip = getIP(req);

    // Whitelist
    if (WHITELIST_IPS.has(ip)) { next(); return; }

    const record = getOrCreateIP(ip);
    const now = Date.now();

    // ¿Está bloqueada?
    if (record.blocked && now < record.blockedUntil) {
        logEvent('HIGH', 'BLOCKED_IP', ip, `Request rechazado — bloqueada hasta ${new Date(record.blockedUntil).toISOString()}`);
        res.status(403).json({ error: 'Acceso temporalmente bloqueado.' });
        return;
    }
    if (record.blocked && now >= record.blockedUntil) {
        record.blocked = false; // desbloquear
        record.requests = 0;
    }

    // Rate limit por IP (60 requests/min global)
    if (now - record.lastRequest > 60_000) {
        record.requests = 0; // reset cada minuto
    }
    record.requests++;
    record.lastRequest = now;

    if (record.requests > 60) {
        record.violations++;
        if (record.violations >= 3) {
            record.blocked = true;
            record.blockedUntil = now + 3600_000; // bloquear 1 hora
            logEvent('HIGH', 'IP_BLOCKED', ip, `Bloqueada 1h — ${record.violations} violaciones de rate limit`);
        } else {
            logEvent('MEDIUM', 'RATE_LIMIT', ip, `${record.requests} req/min (límite: 60)`);
        }
        res.status(429).json({ error: 'Demasiados requests. Espera un momento.' });
        return;
    }

    // Payload size (rechazar >500KB)
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > 512_000) {
        logEvent('MEDIUM', 'OVERSIZED_PAYLOAD', ip, `${(contentLength / 1024).toFixed(0)}KB`);
        res.status(413).json({ error: 'Payload demasiado grande.' });
        return;
    }

    // Detección de inyección en body
    if (req.body) {
        const injection = detectarInyeccion(req.body);
        if (injection) {
            record.violations++;
            logEvent('HIGH', injection, ip, `Intento de inyección detectado en body`);
            res.status(400).json({ error: 'Request inválido.' });
            return;
        }
    }

    next();
}

// ─── Middleware para contar auth failures ────────────────────────────────────

export function trackAuthFailure(req: Request) {
    const ip = getIP(req);
    const record = getOrCreateIP(ip);
    record.failedAuths++;

    if (record.failedAuths > 10) {
        record.blocked = true;
        record.blockedUntil = Date.now() + 3600_000;
        logEvent('HIGH', 'BRUTE_FORCE', ip, `${record.failedAuths} auth failures — bloqueada 1h`);
    } else if (record.failedAuths > 5) {
        logEvent('MEDIUM', 'AUTH_FAILURES', ip, `${record.failedAuths} intentos fallidos`);
    }
}

// ─── Reporte para el agente ─────────────────────────────────────────────────

function generarReporte(): string {
    const totalIPs = ipTracker.size;
    const blocked = [...ipTracker.entries()].filter(([_, r]) => r.blocked);
    const recentEvents = securityLog.slice(-20);

    const highEvents = recentEvents.filter(e => e.level === 'HIGH' || e.level === 'CRITICAL');

    return [
        `🔥 FIREWALL REPORT`,
        `═`.repeat(40),
        `IPs trackeadas: ${totalIPs}`,
        `IPs bloqueadas: ${blocked.length}`,
        blocked.length > 0 ? `  ${blocked.map(([ip, r]) => `${ip} (hasta ${new Date(r.blockedUntil).toLocaleTimeString()})`).join(', ')}` : '',
        ``,
        `Últimos eventos de seguridad (${recentEvents.length}):`,
        ...recentEvents.slice(-10).map(e =>
            `  ${e.level === 'HIGH' ? '🔴' : e.level === 'MEDIUM' ? '🟡' : '🟢'} ${e.ts.split('T')[1]?.slice(0,8)} ${e.type} ${e.ip} — ${e.detail}`
        ),
        highEvents.length > 0
            ? `\n⚠️ ${highEvents.length} eventos de nivel ALTO en los últimos 20 registros.`
            : `\n✅ Sin eventos críticos recientes.`,
    ].join('\n');
}

// ─── Agente ─────────────────────────────────────────────────────────────────

export class FirewallAgent extends BaseAgent {
    public readonly name = 'Firewall';
    public readonly description = 'Seguridad externa: monitorea IPs, rate limits, ataques, disponibilidad de servicios. Bloquea amenazas automáticamente.';

    protected readonly systemPrompt = `Eres FirewallAgent — el guardián EXTERNO de Geo OS.
Proteges la API y el sitio web de amenazas externas.

Recibirás un reporte del estado del firewall. Tu trabajo:
1. Interpretar los eventos y determinar si hay amenaza activa
2. Recomendar si mantener o levantar bloqueos
3. Identificar patrones (¿es un bot? ¿un scanner? ¿un usuario legítimo frustrado?)

Formato:
🔥 FIREWALL — [NIVEL: LIMPIO/ALERTA/BAJO ATAQUE]
[Resumen 1 línea]
[IPs bloqueadas y razón]
[Recomendación]

Reglas:
- Nunca bloquees IPs de la whitelist
- Si hay >5 IPs bloqueadas simultáneamente, podría ser un ataque coordinado
- Un usuario con 1-2 rate limit violations probablemente es legítimo — no alarmar`;

    protected readonly tools = [];

    public async delegate(context: string, userId: string): Promise<string> {
        console.log('[FirewallAgent] 🔥 Generando reporte de seguridad externa...');
        const reporte = generarReporte();

        const mensajes = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: `${reporte}\n\n${context ? `CONSULTA: ${context}` : 'Dame el estado general.'}` }
        ];

        const res = await generarRespuesta(mensajes, 'llama-3.3-70b-versatile', null, userId, 'firewall');
        return res.content || reporte;
    }
}

export const firewallAgent = new FirewallAgent();

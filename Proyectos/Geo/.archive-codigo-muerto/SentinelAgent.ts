/**
 * SentinelAgent — Seguridad Interna de Geo OS
 * Vigila: tokens expuestos, integridad DB, archivos temp, consumo anómalo, prompt injection
 * Puede tomar acciones preventivas automáticas en amenazas altas.
 */
import { BaseAgent } from './BaseAgent.js';
import { generarRespuesta } from '../llm.js';
import { getTokensHoy, getLimites } from '../../security/tokenTracker.js';
import { existsSync, readdirSync, statSync, unlinkSync, truncateSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';
import { appConfig } from '../../config.js';

// ─── Escaneo automático del sistema ─────────────────────────────────────────

function escanearSistema(): string {
    const alertas: string[] = [];
    const info: string[] = [];

    // 1. Archivos temporales
    const tempDir = join(process.cwd(), 'temp_audio');
    if (existsSync(tempDir)) {
        try {
            const files = readdirSync(tempDir);
            if (files.length > 200) {
                alertas.push(`🔴 temp_audio/ tiene ${files.length} archivos (>200). Limpieza recomendada.`);
            } else if (files.length > 100) {
                alertas.push(`🟡 temp_audio/ tiene ${files.length} archivos. Considerar limpieza.`);
            } else {
                info.push(`🟢 temp_audio/: ${files.length} archivos — OK`);
            }
        } catch { info.push('⚠️ No se pudo leer temp_audio/'); }
    }

    // 2. Tamaño de logs
    const logPath = join(process.cwd(), 'server_logs.txt');
    if (existsSync(logPath)) {
        try {
            const size = statSync(logPath).size;
            const sizeMB = (size / 1024 / 1024).toFixed(1);
            if (size > 100 * 1024 * 1024) {
                alertas.push(`🔴 server_logs.txt: ${sizeMB}MB (>100MB). Truncando automáticamente.`);
                try { truncateSync(logPath, 1024 * 1024); } catch {} // truncar a 1MB
            } else if (size > 50 * 1024 * 1024) {
                alertas.push(`🟡 server_logs.txt: ${sizeMB}MB (>50MB). Considerar rotación.`);
            } else {
                info.push(`🟢 Logs: ${sizeMB}MB — OK`);
            }
        } catch { info.push('⚠️ No se pudo leer server_logs.txt'); }
    }

    // 3. Base de datos
    try {
        const db = new Database(appConfig.dbPath, { readonly: true });
        const count = (db.prepare('SELECT COUNT(*) as c FROM mensajes').get() as any)?.c || 0;
        const hechos = (db.prepare('SELECT COUNT(*) as c FROM memoria_semantica').get() as any)?.c || 0;
        info.push(`🟢 memory.db: ${count} mensajes, ${hechos} hechos — OK`);
        db.close();
    } catch (err: any) {
        alertas.push(`🔴 memory.db inaccesible: ${err.message}`);
    }

    // 4. Tokens consumidos
    const tokenHoy = getTokensHoy();
    const limites = getLimites();
    const pctDia = limites.diario > 0 ? (tokenHoy.total / limites.diario) * 100 : 0;
    if (pctDia > 100) {
        alertas.push(`🔴 Tokens HOY: ${tokenHoy.total.toLocaleString()} — LÍMITE DIARIO SUPERADO (${pctDia.toFixed(0)}%)`);
    } else if (pctDia > 80) {
        alertas.push(`🟡 Tokens HOY: ${tokenHoy.total.toLocaleString()} — al ${pctDia.toFixed(0)}% del límite`);
    } else {
        info.push(`🟢 Tokens: ${tokenHoy.total.toLocaleString()} (${pctDia.toFixed(0)}%) — OK`);
    }

    // 5. Variables de entorno inseguras
    if (process.env.JWT_SECRET === 'llave-secreta-temporal-cambiar-en-produccion' || !process.env.JWT_SECRET) {
        alertas.push('🔴 JWT_SECRET es el valor por defecto — CAMBIAR INMEDIATAMENTE');
    }
    if (!process.env.ENCRYPTION_KEY) {
        alertas.push('🟡 ENCRYPTION_KEY no definida — memory.db sin cifrado en reposo');
    }
    if (!process.env.SHOPIFY_ADMIN_API_TOKEN) {
        info.push('⚠️ SHOPIFY_ADMIN_API_TOKEN no configurado — CommerceAgent en modo demo');
    }

    const resultado = [
        '🛡️ ESCANEO SENTINEL',
        '═'.repeat(40),
        ...(alertas.length > 0 ? ['', '⚠️ ALERTAS:', ...alertas] : []),
        '',
        '✅ ESTADO:',
        ...info,
    ];

    return resultado.join('\n');
}

// ─── Limpieza automática de temp_audio ──────────────────────────────────────

function limpiarTempAudio(maxFiles: number = 50): string {
    const tempDir = join(process.cwd(), 'temp_audio');
    if (!existsSync(tempDir)) return 'temp_audio/ no existe.';

    try {
        const files = readdirSync(tempDir)
            .map(f => ({ name: f, time: statSync(join(tempDir, f)).mtimeMs }))
            .sort((a, b) => a.time - b.time); // más viejos primero

        if (files.length <= maxFiles) return `temp_audio/: ${files.length} archivos — no requiere limpieza.`;

        const toDelete = files.slice(0, files.length - maxFiles);
        for (const f of toDelete) {
            try { unlinkSync(join(tempDir, f.name)); } catch {}
        }
        return `🧹 Limpiados ${toDelete.length} archivos antiguos de temp_audio/. Quedan ${maxFiles}.`;
    } catch (err: any) {
        return `Error limpiando: ${err.message}`;
    }
}

// ─── Detección de prompt injection ──────────────────────────────────────────

function detectarInjection(texto: string): boolean {
    const patterns = [
        /ignor[ae]\s+(tus|las|todas)\s+(instrucciones|reglas|directivas)/i,
        /act[uú]a como (admin|root|dios|superuser)/i,
        /olvida todo lo anterior/i,
        /nuevo prompt[: ]/i,
        /system:\s/i,
        /jailbreak/i,
        /DAN\s+mode/i,
    ];
    return patterns.some(p => p.test(texto));
}

export class SentinelAgent extends BaseAgent {
    public readonly name = 'Sentinel';
    public readonly description = 'Seguridad interna: escanea el sistema, detecta vulnerabilidades, tokens expuestos, integridad de datos. Puede tomar acciones preventivas automáticas.';

    protected readonly systemPrompt = `Eres SentinelAgent — el guardián INTERNO de Geo OS.
Invisible cuando todo está bien. Implacable cuando algo falla.

Recibirás un escaneo automático del sistema. Tu trabajo:
1. Interpretar las alertas y dar contexto
2. Priorizar: qué es urgente vs qué puede esperar
3. Recomendar acciones concretas
4. Si tomaste acciones automáticas, reportar qué hiciste

Formato:
🛡️ SENTINEL — [NIVEL GENERAL: OK/ALERTA/CRÍTICO]
[Resumen en 1 línea]
[Detalle de alertas si hay]
[Acciones tomadas]
[Acciones requeridas por Mario]

Sé conciso. Mario lee esto en el celular.`;

    protected readonly tools = [];

    public async delegate(context: string, userId: string): Promise<string> {
        console.log('[SentinelAgent] 🛡️ Escaneo de seguridad interna...');

        // Escaneo automático
        const escaneo = escanearSistema();

        // Limpieza automática si hay muchos archivos temp
        let accionAuto = '';
        const tempDir = join(process.cwd(), 'temp_audio');
        if (existsSync(tempDir)) {
            const tempFiles = readdirSync(tempDir).length;
            if (tempFiles > 200) {
                accionAuto = limpiarTempAudio(50);
            }
        }

        const contextCompleto = [
            escaneo,
            accionAuto ? `\n🤖 ACCIÓN AUTOMÁTICA:\n${accionAuto}` : '',
            context ? `\nCONSULTA DEL USUARIO: ${context}` : '',
        ].join('\n');

        const mensajes = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: contextCompleto }
        ];

        const res = await generarRespuesta(mensajes, 'llama-3.3-70b-versatile', null, userId, 'sentinel');
        return res.content || escaneo;
    }

    /** Función estática para verificar injection en cualquier mensaje */
    public static checkInjection(texto: string): { detected: boolean; pattern: string } {
        const detected = detectarInjection(texto);
        return { detected, pattern: detected ? 'prompt_injection' : '' };
    }
}

export const sentinelAgent = new SentinelAgent();

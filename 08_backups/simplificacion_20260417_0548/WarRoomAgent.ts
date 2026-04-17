/**
 * WarRoomAgent v1.1 — Con KPIs target, semáforo, formato obligatorio
 * CAMBIO: prompt de 3 líneas → dashboard de 30 segundos con recomendaciones
 */
import { BaseAgent } from './BaseAgent.js';
import { generarRespuesta } from '../llm.js';
import { getTokensHoy, getLimites } from '../../security/tokenTracker.js';

const SHOPIFY_STORE = process.env.SHOPIFY_STORE_DOMAIN || 'ecoorigenchile.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || '';
const USD_CLP       = parseFloat(process.env.USD_TO_CLP || '950');

async function shopifyGet(endpoint: string): Promise<any> {
    if (!SHOPIFY_TOKEN) return null;
    const res = await fetch(
        `https://${SHOPIFY_STORE}/admin/api/2024-01/${endpoint}`,
        { headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN } }
    );
    if (!res.ok) throw new Error(`Shopify ${res.status}`);
    return res.json();
}

async function construirDashboard(): Promise<string> {
    const ahora    = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
    const tokenHoy = getTokensHoy();
    const limites  = getLimites();
    const pctDia   = limites.diario > 0 ? ((tokenHoy.total / limites.diario) * 100).toFixed(1) : '0';

    let ventasLinea = 'N/A (sin token Shopify)';
    let pendientes   = 0;
    let ventasCLP    = 0;
    let numPedidos   = 0;

    if (SHOPIFY_TOKEN) {
        try {
            const hoy = new Date().toISOString().split('T')[0];
            const data = await shopifyGet(
                `orders.json?status=any&financial_status=paid&created_at_min=${hoy}T00:00:00&limit=50`
            );
            const orders = data?.orders || [];
            const totalUSD = orders.reduce((s: number, o: any) => s + parseFloat(o.total_price || '0'), 0);
            ventasCLP  = Math.round(totalUSD * USD_CLP);
            numPedidos = orders.length;
            pendientes = orders.filter((o: any) => o.fulfillment_status === null).length;
            ventasLinea = `$${ventasCLP.toLocaleString('es-CL')} CLP (${numPedidos} pedidos)`;
        } catch (err: any) {
            ventasLinea = `Error — ${err.message}`;
        }
    }

    // Semáforos
    const ventaTarget = 50000;
    const semaforoVentas = ventasCLP >= ventaTarget ? '🟢' : ventasCLP >= ventaTarget * 0.5 ? '🟡' : '🔴';
    const semaforoTokens = parseFloat(pctDia) >= 80 ? '🔴' : parseFloat(pctDia) >= 50 ? '🟡' : '🟢';
    const semaforoPendientes = pendientes > 0 ? '🟡' : '🟢';

    return [
        `📊 WAR ROOM — ${ahora}`,
        ``,
        `${semaforoVentas} VENTAS HOY: ${ventasLinea}`,
        `${semaforoPendientes} PENDIENTES: ${pendientes} pedidos sin enviar`,
        `${semaforoTokens} TOKENS: ${tokenHoy.total.toLocaleString()} / ${limites.diario.toLocaleString()} (${pctDia}%)`,
        `   Modelos: ${Object.entries(tokenHoy.porModelo).map(([m, t]) => `${m}: ${t}`).join(' | ') || 'Sin uso aún'}`,
        ``,
        `TARGET DIARIO: $${ventaTarget.toLocaleString('es-CL')} CLP | Completado: ${ventaTarget > 0 ? ((ventasCLP / ventaTarget) * 100).toFixed(0) : 0}%`,
    ].join('\n');
}

export class WarRoomAgent extends BaseAgent {
    public readonly name        = 'WarRoom';
    public readonly description = 'Dashboard de métricas: ventas Shopify, tokens usados, estado del sistema, KPIs.';

    protected readonly systemPrompt = `Eres WarRoomAgent de Geo OS — centro de inteligencia operacional.
Tu misión: dar a Mario una foto clara de TODO el sistema en 30 segundos de lectura.

FORMATO OBLIGATORIO:
SIEMPRE empieza con [CARD:WARROOM] para activar la vista gráfica.

[CARD:WARROOM]
(datos del dashboard aquí)

KPIs TARGET:
- Ventas diarias: $50.000 CLP (meta inicial)
- Tokens diarios: no superar 80% del límite
- Pedidos pendientes: 0 al final del día
- Ticket promedio: >$15.000 CLP

SEMÁFORO: 🟢 sobre target | 🟡 entre 50-100% | 🔴 bajo 50%

REGLAS:
- Tokens >80% → alerta inmediata
- Pedidos pendientes >24hrs → alerta urgente
- SIEMPRE cierra con 1 recomendación accionable concreta
- Sé conciso — 30 segundos de lectura máximo`;

    protected readonly tools = [];

    public async delegate(context: string, userId: string): Promise<string> {
        console.log(`[WarRoomAgent] Construyendo dashboard...`);
        const dashboard = await construirDashboard();
        const mensajes  = [
            { role: 'system', content: `${this.systemPrompt}\n\n[DATOS EN TIEMPO REAL]\n${dashboard}` },
            { role: 'user',   content: context }
        ];
        const res = await generarRespuesta(mensajes, 'llama-3.3-70b-versatile', null, userId, 'warroom');
        return res.content || '[CARD:WARROOM]\n' + dashboard;
    }
}

export const warroomAgent = new WarRoomAgent();

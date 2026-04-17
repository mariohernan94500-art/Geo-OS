/**
 * CommerceAgent v1.1 — Con conocimiento de productos VITRA
 * CAMBIO: prompt de 2 líneas → prompt completo con productos, márgenes, formato
 */
import { BaseAgent } from './BaseAgent.js';
import { generarRespuesta } from '../llm.js';

const SHOPIFY_STORE = process.env.SHOPIFY_STORE_DOMAIN || 'ecoorigenchile.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || '';
const USD_CLP       = parseFloat(process.env.USD_TO_CLP || '950');

async function shopifyGet(endpoint: string): Promise<any> {
    if (!SHOPIFY_TOKEN) return null;
    const res = await fetch(
        `https://${SHOPIFY_STORE}/admin/api/2024-01/${endpoint}`,
        { headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN, 'Content-Type': 'application/json' } }
    );
    if (!res.ok) throw new Error(`Shopify ${res.status}: ${await res.text()}`);
    return res.json();
}

async function getMetricas(): Promise<string> {
    if (!SHOPIFY_TOKEN) {
        return '[SIN DATOS REALES — SHOPIFY_ADMIN_API_TOKEN no configurado]\nAcción requerida: configurar token en .env para obtener datos reales de ventas.';
    }
    try {
        const [ordersData, productsData] = await Promise.all([
            shopifyGet('orders.json?limit=50&status=any&financial_status=paid'),
            shopifyGet('products.json?limit=50&fields=id,title,variants'),
        ]);

        const orders   = ordersData?.orders || [];
        const products = productsData?.products || [];

        const totalUSD = orders.reduce((s: number, o: any) => s + parseFloat(o.total_price || '0'), 0);
        const pending  = orders.filter((o: any) => o.fulfillment_status === null).length;
        const lowStock = products.filter((p: any) =>
            p.variants?.some((v: any) => v.inventory_quantity <= 5 && v.inventory_quantity >= 0)
        ).map((p: any) => p.title);

        const totalCLP = Math.round(totalUSD * USD_CLP);
        const ticketPromedio = orders.length ? Math.round(totalCLP / orders.length) : 0;

        return [
            `DATOS SHOPIFY (últimos 50 pedidos pagados):`,
            `  Ingresos totales: $${totalCLP.toLocaleString('es-CL')} CLP`,
            `  Pedidos: ${orders.length} | Pendientes envío: ${pending}`,
            `  Ticket promedio: $${ticketPromedio.toLocaleString('es-CL')} CLP`,
            `  Productos activos: ${products.length}`,
            lowStock.length ? `  ⚠️ Stock bajo: ${lowStock.slice(0, 5).join(', ')}` : `  Stock: OK`,
        ].join('\n');
    } catch (err: any) {
        return `Error Shopify: ${err.message}`;
    }
}

export class CommerceAgent extends BaseAgent {
    public readonly name        = 'Commerce';
    public readonly description = 'Análisis de ventas, productos, Shopify, oportunidades de ingreso en EcoOrigen/VITRA.';

    protected readonly systemPrompt = `Eres CommerceAgent de Geo OS — el cerebro comercial de EcoOrigen Chile.

NEGOCIO:
EcoOrigen Chile (ecoorigenchile.com) vende vasos de vidrio reciclado marca VITRA.
7 líneas: Signature VR ($8.990-$29.990), Pura ($5.990-$32.990), Nombres/Frases ($12.990-$22.990), Retrato de Mascota ($18.990-$49.990), Diseños Artísticos ($11.990-$15.990), Corporativos (desde $5.990/u), Bodas (desde $6.490/u).
Ticket promedio target: $15.000-20.000 CLP. Margen bruto: 60-70%.

PRODUCTO ESTRELLA: Retrato de Mascota — mayor margen y factor emocional. Siempre sugiere potenciar esta línea.

FORMATO DE RESPUESTA (obligatorio):
📊 RESUMEN: (1-2 líneas del estado actual)
🔍 INSIGHTS: (qué llama la atención)
⚡ ACCIONES: (máx 3 concretas con número estimado de impacto en CLP)
📈 PROYECCIÓN: (estimación de ingreso si se ejecutan)

REGLAS:
- SIEMPRE en CLP
- SIEMPRE números concretos, no generalidades
- Si stock bajo → alerta
- Si pedidos pendientes > 0 → alerta urgente
- Sin datos reales → sugiere configurar token como prioridad #1`;

    protected readonly tools = [];

    public async delegate(context: string, userId: string): Promise<string> {
        console.log(`[CommerceAgent] Activando con datos reales...`);
        const metricas = await getMetricas();
        const mensajes = [
            { role: 'system', content: `${this.systemPrompt}\n\n[DATOS SHOPIFY EN TIEMPO REAL]\n${metricas}` },
            { role: 'user',   content: context }
        ];
        const res = await generarRespuesta(mensajes, 'llama-3.3-70b-versatile', null, userId, 'commerce');
        return res.content || 'Sin respuesta del agente de comercio.';
    }
}

export const comercioAgent = new CommerceAgent();

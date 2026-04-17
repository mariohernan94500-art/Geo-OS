/**
 * FASE 5 — CommerceAgent con datos reales de Shopify
 */

import { callLLM } from '../src/geoCore';

const SHOPIFY_STORE = process.env.SHOPIFY_STORE_DOMAIN!;         // ej: mitienda.myshopify.com
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN!; // En variable de entorno, NUNCA en código

const COMMERCE_PROMPT = `
Eres CommerceAgent, el agente de comercio de Geo OS.
Tu misión: maximizar ingresos de EcoOrigen Chile en Shopify.
Estilo: Agresivo, proactivo, estratégico. Siempre estima ganancias en CLP.
Tienes acceso a datos reales de la tienda: pedidos, productos, stock, métricas.
`.trim();

interface ShopifyOrder {
  id: number;
  name: string;
  total_price: string;
  financial_status: string;
  fulfillment_status: string | null;
  created_at: string;
  customer?: { first_name: string; last_name: string; email: string };
  line_items: Array<{ title: string; quantity: number; price: string }>;
}

interface ShopifyProduct {
  id: number;
  title: string;
  status: string;
  variants: Array<{ inventory_quantity: number; price: string }>;
}

// ─── Shopify Admin API calls ──────────────────────────────────────────────────

async function shopifyFetch(endpoint: string): Promise<any> {
  const url = `https://${SHOPIFY_STORE}/admin/api/2024-01/${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Shopify API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function getRecentOrders(limit = 10): Promise<ShopifyOrder[]> {
  const data = await shopifyFetch(`orders.json?limit=${limit}&status=any&order=created_at+desc`);
  return data.orders;
}

async function getProducts(): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch('products.json?limit=50&fields=id,title,status,variants');
  return data.products;
}

async function getOrdersMetrics(): Promise<{
  totalRevenueCLP: number;
  orderCount: number;
  pendingOrders: number;
  avgOrderCLP: number;
}> {
  const orders = await getRecentOrders(50);
  const USD_TO_CLP = 950; // Aproximado; idealmente dinámico

  const paid = orders.filter(o => o.financial_status === 'paid');
  const totalUSD = paid.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
  const pending = orders.filter(o => o.fulfillment_status === null && o.financial_status === 'paid').length;

  return {
    totalRevenueCLP: Math.round(totalUSD * USD_TO_CLP),
    orderCount: paid.length,
    pendingOrders: pending,
    avgOrderCLP: paid.length > 0 ? Math.round((totalUSD * USD_TO_CLP) / paid.length) : 0,
  };
}

async function getLowStockProducts(threshold = 5): Promise<ShopifyProduct[]> {
  const products = await getProducts();
  return products.filter(p =>
    p.variants.some(v => v.inventory_quantity <= threshold && v.inventory_quantity >= 0)
  );
}

// ─── Contexto para el LLM ─────────────────────────────────────────────────────

async function buildCommerceContext(): Promise<string> {
  try {
    const [metrics, lowStock, recentOrders] = await Promise.all([
      getOrdersMetrics(),
      getLowStockProducts(),
      getRecentOrders(5),
    ]);

    return `
[DATOS REALES DE ECOORIGEN — Shopify]
Ingresos recientes: $${metrics.totalRevenueCLP.toLocaleString('es-CL')} CLP
Pedidos pagados: ${metrics.orderCount}
Pedidos pendientes de envío: ${metrics.pendingOrders}
Ticket promedio: $${metrics.avgOrderCLP.toLocaleString('es-CL')} CLP

Stock bajo (≤5 unidades):
${lowStock.map(p => `  - ${p.title}`).join('\n') || '  Ninguno'}

Últimos 5 pedidos:
${recentOrders.map(o =>
  `  - ${o.name} | $${parseFloat(o.total_price).toLocaleString('es-CL')} | ${o.financial_status} | ${o.created_at.slice(0, 10)}`
).join('\n')}
`.trim();
  } catch (err) {
    return `[Error obteniendo datos de Shopify: ${err}]`;
  }
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const CommerceAgent = {
  async process(userId: string, userMessage: string): Promise<string> {
    const ctx = await buildCommerceContext();
    const systemMsg = `${COMMERCE_PROMPT}\n\n${ctx}`;

    return callLLM(
      [
        { role: 'system', content: systemMsg },
        { role: 'user', content: userMessage },
      ],
      userId,
      'commerce',
      'ecoorigen'
    );
  },

  async getMetrics() {
    return getOrdersMetrics();
  },

  async getLowStock() {
    return getLowStockProducts();
  },
};

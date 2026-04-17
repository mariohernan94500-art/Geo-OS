/**
 * SalesAgent — Agente de Ventas para Clientes
 * 
 * A diferencia de CommerceAgent (que es para el admin), SalesAgent está
 * diseñado para hablar CON CLIENTES que visitan ecoorigenchile.com.
 * 
 * Se usa desde:
 * - Widget de chat en el sitio web (endpoint público)
 * - Telegram en /modo_comercio cuando detecta pregunta de cliente
 * - API /api/public/chat (sin JWT, rate limited por IP)
 */
import { BaseAgent } from './BaseAgent.js';
import { generarRespuesta } from '../llm.js';

const CATALOG = `
=== CATÁLOGO DEL ECOSISTEMA GEO ===

[1] VITRA / VIDRIO RENACIDO (Productos Físicos - ecoorigenchile.com/vitra)
Vasos de vidrio 100% reciclado, color verde natural, grabado láser HD.
• LÍNEA Pura (sin grabado): Desde $5.990. Set 4 $19.990.
• LÍNEA Signature VR / Textos: Vasos con nombres desde $12.990.
• LÍNEA Retrato Mascota 🐾 (Producto Estrella): Individual $18.990. Memorial $19.990. Proceso vía foto.
• LÍNEA Corporativos / Bodas: Logos desde $7.990/u (mín 20). Bodas desde $6.990/u (mín 30).
(Envío RM gratis >$25k. Regiones desde $5.990).

[2] KABA WEB / SERVICIOS FREELANCE MARIO (Servicios Digitales)
Desarrollo web premium, tiendas online y landings.
• Landing Page Express: Diseño ultra-rápido, responsivo, SEO básico. (Cotizar según alcance, aprox $150.000 - $300.000 CLP).
• E-commerce Inicial (Shopify/WooCommerce): Tienda lista para vender. (Aprox $400.000 - $800.000 CLP).
• Sistemas / IA Automation (Voren tech): Agentes a medida para empresas. (Aprox $800.000+ CLP).
`;

const SALES_SYSTEM = `Eres "Geo Renacido", el Ejecutivo de Ventas del Ecosistema Geo (Vidrio Renacido, Kaba Web, Voren).
Hablas con CLIENTES. NO eres un bot genérico — eres un vendedor experto de alto nivel.

TU MISIÓN: Vender todos los productos físicos (vasos VITRA) y digitales (Páginas Web, integraciones IA) del portafolio de Mario.

PERSONALIDAD:
- Cálido, cercano, chileno natural ("bacán", "dale") pero súper profesional y resolutivo.
- Apasionado por los productos físicos y la tecnología digital. 

ESTRATEGIA:
1. DESCUBRIR: ¿Qué necesita el cliente? (Un regalo, souvenirs para empresa, o una PÁGINA WEB para su negocio).
2. RECOMENDAR: Si buscan diseño de vasos, recomiendas Vitra. Si buscan digitalizar su negocio, recomiendas Kaba Web / Freelance.
3. UPSELL: "Mandar a hacer vasos para tu empresa es genial. ¿Y sabías que también hacemos rediseño web?"
4. CIERRE: Next-step claro → WhatsApp para fotos (vasos) o agendar videollamada de cotización (web).

REGLAS:
- SIEMPRE menciona nombre exacto de la línea de producto.
- En servicios digitales (Webs), da un rango de precio estimado y di que requiere evaluación exacta.
- NUNCA inventes productos o precios fuera del catálogo.
- Máximo 3-4 párrafos por respuesta.

${CATALOG}`;

export class SalesAgent extends BaseAgent {
    public readonly name        = 'Sales';
    public readonly description = 'Agente Comercial Universal. Cotiza y vende productos de Vidrio Renacido y servicios digitales (Webs/Kaba).';
    protected readonly systemPrompt = SALES_SYSTEM;
    protected readonly tools = [];

    /**
     * Método principal — recibe la pregunta del cliente y responde
     */
    public async delegate(context: string, userId: string): Promise<string> {
        console.log(`[SalesAgent] 💬 Atendiendo cliente ${userId}...`);
        const mensajes = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user',   content: context }
        ];
        // Usa un modelo rápido para respuestas ágiles al cliente
        const res = await generarRespuesta(mensajes, 'llama-3.3-70b-versatile', null, userId, 'sales');
        return res.content || 'Disculpa, hubo un problema. ¿Puedes repetir tu consulta?';
    }

    /**
     * Chat con historial — para el widget web donde hay conversación continua
     */
    public async chatConHistorial(mensajes: Array<{role: string, content: string}>, userId: string): Promise<string> {
        console.log(`[SalesAgent] 💬 Chat con historial (${mensajes.length} msgs) for ${userId}`);
        const mensajesLLM = [
            { role: 'system', content: this.systemPrompt },
            ...mensajes.slice(-10) // últimos 10 mensajes para contexto
        ];
        const res = await generarRespuesta(mensajesLLM, 'llama-3.3-70b-versatile', null, userId, 'sales');
        return res.content || 'Disculpa, ¿puedes repetir?';
    }
}

export const salesAgent = new SalesAgent();

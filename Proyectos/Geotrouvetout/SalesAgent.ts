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
=== CATÁLOGO VITRA / VIDRIO RENACIDO ===
Web: ecoorigenchile.com/vitra | Santiago, Chile

PRODUCTO: Vasos de vidrio 100% reciclado (botellas de vino/cerveza). Color verde natural. Bordes pulidos a mano. Grabado láser HD. Cajas kraft eco-friendly.

LÍNEA 1 — SIGNATURE VR (con logo):
• VR Clásico 350ml — $8.990
• VR Ámbar 350ml — $9.990
• Set 2 VR — $15.990
• Set 4 VR Caja Premium — $29.990
• VR XL 500ml — $12.990

LÍNEA 2 — PURA (sin grabado):
• Puro Verde 350ml — $5.990
• Puro Ámbar 350ml — $6.490
• Set 4 Puros — $19.990
• Set 6 Mixtos — $32.990

LÍNEA 3 — NOMBRES Y FRASES:
• Con Nombre — $12.990 (script, ≤15 chars)
• Frase Personalizada — $14.990 (≤40 chars)
• "Mamá y Papá" — $12.990
• Set 2 Pareja — $22.990

LÍNEA 4 — RETRATO DE MASCOTA 🐾 (ESTRELLA):
Proceso: foto WhatsApp → retrato artístico → aprobación → grabado láser HD
• Individual — $18.990 (retrato + nombre + frase)
• Mascota + Dueño — $21.990
• Set Familiar 3 vasos — $49.990
• Memorial — $19.990 (homenaje mascota fallecida)
Plazo: 5-7 días hábiles

LÍNEA 5 — DISEÑOS ARTÍSTICOS:
• Montaña/Naturaleza — $13.990
• Huella Patita — $11.990
• Escudo Custom — $15.990

LÍNEA 6 — CORPORATIVOS:
• Con Logo — desde $7.990/u (mín 20)
• Premium 500ml — desde $10.990/u (mín 20)
• Welcome Pack — desde $15.990/u (mín 10)
• Set Ejecutivo 4u — $39.990/set (mín 5)

LÍNEA 7 — BODAS Y EVENTOS:
• Boda 250ml — desde $6.990/u (mín 30)
• Boda Premium 350ml — desde $9.990/u (mín 30)
• Brindis Novios — $24.990
• Baby Shower — desde $6.490/u (mín 20)

ENVÍO: RM gratis >$25.000, sino $3.990. Regiones desde $5.990. Corp/bodas RM gratis >$80.000.
PLAZOS: Stock 2-3 días. Personalizados 5-7 días. Corp/bodas 10-15 días.
PAGO: Transferencia, WebPay, MercadoPago, efectivo retiro. Corp: factura 30 días.
GARANTÍA: Dañado = reemplazo gratis (foto 24hrs). Sin personalización: cambio 7 días.
CONTACTO: WhatsApp +56 9 XXXX XXXX | IG @vidriorenacido | hola@vidriorenacido.cl
`;

const SALES_SYSTEM = `Eres "Renacido", agente de ventas de VITRA (Vidrio Renacido) dentro de EcoOrigen Chile.
Hablas con CLIENTES que visitan el sitio web. NO eres un bot genérico — eres un vendedor experto.

PERSONALIDAD:
- Cálido, cercano, chileno natural ("bacán", "dale", "súper") pero profesional
- Apasionado por los productos — describes los vasos como si los tuvieras en la mano
- El verde del vidrio, la textura artesanal, el peso satisfactorio
- Honesto: si algo no conviene al cliente, lo dices

ESTRATEGIA:
1. DESCUBRIR: ¿Para qué es? (regalo, evento, uso propio, empresa, mascota)
2. RECOMENDAR: Producto exacto con nombre + precio CLP
3. UPSELL: "El set de 4 te sale más conveniente"
4. CROSS-SELL: "Los de boda también llevan el brindis para los novios"
5. URGENCIA: "Para tenerlo el fin de semana, necesitamos confirmar hoy"
6. CIERRE: Next-step claro → WhatsApp para fotos/confirmar

PRODUCTO ESTRELLA — RETRATO DE MASCOTA:
Cuando mencionen mascotas/perros/gatos/regalos emotivos → SIEMPRE sugiere esta línea.
Proceso: foto por WhatsApp → retrato artístico → aprobación → grabado.
El memorial trátalo con sensibilidad.

REGLAS:
- SIEMPRE nombres exactos y precios CLP
- Para mascotas: guiar a WhatsApp para enviar foto
- Para corp/bodas: pedir cantidad, fecha del evento, personalización
- Si duda: "Déjame confirmar con el equipo"
- NUNCA inventar productos o precios
- Máximo 3-4 párrafos por respuesta
- NUNCA menciones que eres una IA — eres "del equipo de VITRA"

DATO CLAVE:
Son vidrio REAL reciclado. Color verde NATURAL. Cada vaso ÚNICO. Bordes pulidos A MANO.
Grabado LÁSER HD. Cajas KRAFT eco-friendly. No es un vaso cualquiera.

${CATALOG}`;

export class SalesAgent extends BaseAgent {
    public readonly name        = 'Sales';
    public readonly description = 'Atiende clientes del sitio web: recomienda productos, cotiza, cierra ventas. Para preguntas de CLIENTES sobre vasos VITRA.';
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
        console.log(`[SalesAgent] 💬 Chat con historial (${mensajes.length} msgs) para ${userId}`);
        const mensajesLLM = [
            { role: 'system', content: this.systemPrompt },
            ...mensajes.slice(-10) // últimos 10 mensajes para contexto
        ];
        const res = await generarRespuesta(mensajesLLM, 'llama-3.3-70b-versatile', null, userId, 'sales');
        return res.content || 'Disculpa, ¿puedes repetir?';
    }
}

export const salesAgent = new SalesAgent();

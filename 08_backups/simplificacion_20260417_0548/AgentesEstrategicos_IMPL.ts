// ═══════════════════════════════════════════════════════════════
// OpportunityAgent.ts
// Copiar a: src/agent/agents/OpportunityAgent.ts
// ═══════════════════════════════════════════════════════════════

import { BaseAgent } from './BaseAgent.js';
import { generarRespuesta } from '../llm.js';
import { memoria } from '../memory.js';

const SYSTEM = `Eres OpportunityAgent — el explorador de oportunidades de Geo OS.
No eres un generador de ideas sin freno. Eres un FILTRO ESTRATÉGICO.

SOBRE MARIO: Creativo, lleno de ideas, siempre pensando en el próximo proyecto.
Su fortaleza: visión. Su debilidad: empieza muchas cosas y se pierde.
Tu trabajo: ayudarlo a ELEGIR las correctas y TERMINARLAS.

NEGOCIO ACTUAL: VITRA / EcoOrigen Chile — vasos de vidrio reciclado. Grabado láser. Artesanal. Santiago, Chile.

FILTRO DE LAS 3 PREGUNTAS (obligatorio antes de sugerir algo):
□ ¿Mario puede ejecutarlo SIN abandonar VITRA?
□ ¿Genera ingresos en <30 días?
□ ¿Requiere menos de $100.000 CLP para empezar?

SI LAS VENTAS VAN BIEN → escalar lo que funciona (más volumen, nuevos canales, B2B)
SI VAN REGULAR → ajustar (precio, marketing, producto estrella)
SI VAN MAL → pivotar con lo que hay (mismo taller, mismo láser, otro producto)

CUANDO MARIO VIENE CON UNA IDEA:
1. Escúchala 2. Pásala por el filtro 3. Si pasa: mini-plan 3 pasos 4. Si no: guárdala con tag "idea_futura"
5. Recuérdale: "Primero terminemos VITRA"

FORMATO:
💡 OPORTUNIDAD: [nombre]
📊 Tendencia: [por qué crece]
💰 Inversión: $XX.XXX | ⏱️ Primer ingreso: X semanas
🔗 Usa lo que ya tenemos: [qué]
✅ Filtro: [pasa/no pasa]
📋 Plan: 1. [día 1-3] 2. [día 4-7] 3. [validación día 7-14]

REGLAS:
- Prioridad #1 SIEMPRE es VITRA
- Estima en CLP
- Si Mario se dispersa, dile con cariño
- Guarda cada idea con guardar_hecho tag:"idea"
- Mejor 1 proyecto terminado que 5 a medio hacer`;

export class OpportunityAgent extends BaseAgent {
    public readonly name = 'Opportunity';
    public readonly description = 'Explorador de oportunidades: tendencias, ideas de negocio, pivotes, filtro estratégico. Ayuda a elegir y terminar, no solo a empezar.';
    protected readonly systemPrompt = SYSTEM;
    protected readonly tools = [];

    public async delegate(context: string, userId: string): Promise<string> {
        console.log('[OpportunityAgent] 💡 Analizando oportunidad...');

        // Recuperar ideas guardadas para contexto
        const ideasPrevias = memoria.obtenerHechos(userId, 10)
            .filter(h => h.toLowerCase().includes('idea'));

        const ctx = ideasPrevias.length > 0
            ? `${context}\n\n[IDEAS PREVIAS GUARDADAS]\n${ideasPrevias.map(i => `- ${i}`).join('\n')}`
            : context;

        const msgs = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: ctx }
        ];
        const res = await generarRespuesta(msgs, 'llama-3.3-70b-versatile', null, userId, 'opportunity');
        return res.content || 'No pude analizar esa oportunidad.';
    }
}

export const opportunityAgent = new OpportunityAgent();


// ═══════════════════════════════════════════════════════════════
// LegalAgent.ts
// Copiar a: src/agent/agents/LegalAgent.ts
// ═══════════════════════════════════════════════════════════════

const LEGAL_SYSTEM = `Eres LegalAgent — asesor legal informativo de Geo OS, especializado en legislación chilena para emprendedores.

⚠️ No soy abogado. Orientación informativa y general. Para decisiones importantes, consultar profesional.

MARIO: Emprendedor individual, Santiago. Primer negocio: VITRA. Pre-formal (sin boletas aún).

TEMAS:
1. FORMALIZACIÓN: Inicio actividades SII, persona natural vs SpA, patente municipal
2. TRIBUTACIÓN: Pro-Pyme 14D3, IVA, F29, PPM, Operación Renta
3. E-COMMERCE: Ley 19.496 (consumidor), retracto 10 días, devoluciones, datos personales
4. LABORAL: Contratos, cotizaciones, mutual
5. PROPIEDAD INTELECTUAL: Marca INAPI (~$200K CLP), plazos 6-12 meses

CAMINO SUGERIDO:
Etapa 1 (ahora): Vender, guardar registros. No obligatorio formalizar bajo cierto umbral.
Etapa 2 (>$1M/mes): Inicio actividades SII persona natural.
Etapa 3 (>$3M/mes): SpA. Boletas obligatorias.
Etapa 4 (contratar): Asesoría laboral profesional.

FORMATO:
📋 TEMA: [nombre]
📄 Qué dice la ley: [resumen simple]
🔢 Pasos: [concretos]
💰 Costo: $X CLP
⏱️ Tiempo: X días
🔗 Dónde: [link/lugar]
⚠️ Ojo con: [error común]

REGLAS:
- Lenguaje SIMPLE
- Pasos concretos, no solo teoría
- Si es complejo → recomienda abogado ($150K-$300K CLP)
- Nunca recomiendes evadir impuestos
- Si pregunta "¿puedo no dar boleta?": explica riesgos reales sin juzgar`;

export class LegalAgent extends BaseAgent {
    public readonly name = 'Legal';
    public readonly description = 'Asesor legal informativo: legislación chilena, SII, formalización, patentes, impuestos, e-commerce, propiedad intelectual.';
    protected readonly systemPrompt = LEGAL_SYSTEM;
    protected readonly tools = [];

    public async delegate(context: string, userId: string): Promise<string> {
        console.log('[LegalAgent] 📋 Consultando legislación...');
        const msgs = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: context }
        ];
        const res = await generarRespuesta(msgs, 'llama-3.3-70b-versatile', null, userId, 'legal');
        return res.content || 'No pude procesar esa consulta legal.';
    }
}

export const legalAgent = new LegalAgent();


// ═══════════════════════════════════════════════════════════════
// AccountantAgent.ts
// Copiar a: src/agent/agents/AccountantAgent.ts
// ═══════════════════════════════════════════════════════════════

const ACCOUNTANT_SYSTEM = `Eres AccountantAgent — el contador de Geo OS. Llevas las cuentas al día.

⚠️ No soy contador certificado. Para declaraciones de impuestos, consultar profesional.

NEGOCIO: VITRA / EcoOrigen Chile. Moneda: CLP. Fuentes: Shopify, transferencias, MercadoPago, efectivo.

FUNCIONES:
1. REGISTRAR ventas: fecha, monto, producto, medio de pago → guardar_hecho tag:"venta"
2. REGISTRAR gastos: fecha, monto, categoría → guardar_hecho tag:"gasto"
3. REPORTES: diario/semanal/mensual con formato claro

CATEGORÍAS GASTO: 🔧Material | 📦Envíos | 🛠️Herramientas | 💻Servicios digitales | 📱Marketing | 🏠Infraestructura | 📋Otros

FORMATO REPORTE:
💰 FINANZAS — [período]
━━━━━━━━━━━━━━━━━━━
📈 Ingresos: $XX.XXX
📉 Gastos: $XX.XXX
💵 Resultado: +/- $XX.XXX
📊 Margen: XX%
🏦 Caja estimada: $XXX.XXX
━━━━━━━━━━━━━━━━━━━
💡 [1 observación o recomendación]

ALERTAS:
- Gastos >40% de ingresos → advertir
- IVA teórico: separar 19% de ventas como referencia
- Marzo: "Operación Renta en abril, prepara datos"

REGLAS:
- SIEMPRE CLP con punto de miles ($25.000)
- Guardar con guardar_hecho tags "venta" o "gasto"
- Si no tiene datos, preguntar "¿Cómo fueron las ventas hoy?"
- No inventar números
- Tener siempre un resumen listo para enviar a contador real`;

export class AccountantAgent extends BaseAgent {
    public readonly name = 'Accountant';
    public readonly description = 'Contabilidad: registra ventas y gastos, reportes financieros, flujo de caja, preparación tributaria. Todo en CLP.';
    protected readonly systemPrompt = ACCOUNTANT_SYSTEM;
    protected readonly tools = [];

    public async delegate(context: string, userId: string): Promise<string> {
        console.log('[AccountantAgent] 💰 Procesando finanzas...');

        // Recuperar transacciones recientes de memoria
        const ventas = memoria.obtenerHechos(userId, 20)
            .filter(h => h.toLowerCase().includes('venta') || h.includes('$'));
        const gastos = memoria.obtenerHechos(userId, 20)
            .filter(h => h.toLowerCase().includes('gasto') || h.toLowerCase().includes('gasté'));

        let ctx = context;
        if (ventas.length > 0 || gastos.length > 0) {
            ctx += '\n\n[TRANSACCIONES EN MEMORIA]';
            if (ventas.length > 0) ctx += '\nVentas: ' + ventas.slice(-5).join(' | ');
            if (gastos.length > 0) ctx += '\nGastos: ' + gastos.slice(-5).join(' | ');
        }

        const msgs = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: ctx }
        ];
        const res = await generarRespuesta(msgs, 'llama-3.3-70b-versatile', null, userId, 'accountant');
        return res.content || 'No pude procesar esa consulta financiera.';
    }
}

export const accountantAgent = new AccountantAgent();

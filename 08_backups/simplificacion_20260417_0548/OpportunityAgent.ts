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

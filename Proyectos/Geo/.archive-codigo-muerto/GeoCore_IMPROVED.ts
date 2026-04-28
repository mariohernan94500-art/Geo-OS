/**
 * GEO OS v1.1 — GeoCore Orquestador Principal
 * CAMBIOS vs v1.0:
 * - Prompts reescritos (de 2-6 líneas a prompts completos con contexto)
 * - SalesAgent registrado como agente delegable
 * - Delegación AUTOMÁTICA (antes bloqueada por Regla 1)
 * - Contexto de negocio VITRA inyectado
 */
import { memoria, MensajeChat, MemorySource } from '../memory.js';
import { generarRespuesta } from '../llm.js';
import { appConfig } from '../../config.js';
import { comercioAgent } from '../agents/CommerceAgent.js';
import { warroomAgent } from '../agents/WarRoomAgent.js';
import { salesAgent } from '../agents/SalesAgent.js';
import { obtenerDefinicionesHerramientas, ejecutarHerramienta } from '../tools/registry.js';

const agentesActivos = [ comercioAgent, warroomAgent, salesAgent ];

const SYSTEM_PROMPTS: Record<string, string> = {

    geo: `Eres Géo CORE, el orquestador central del sistema operativo personal de Mario Ovalle.
Tu trabajo es pensar, decidir y actuar — no solo responder preguntas.

CONTEXTO:
Mario tiene un ecosistema de negocios centrado en EcoOrigen Chile (ecoorigenchile.com).
El producto principal es VITRA: vasos de vidrio 100% reciclado con grabado láser.
La tienda abre el 20 de Abril 2026. Cada decisión debe acercarnos a esa meta.

AGENTES QUE PUEDES DELEGAR:
- agent_commerce → Análisis de ventas, productos, Shopify, oportunidades de ingreso
- agent_warroom → Dashboard de métricas, tokens, estado del sistema
- agent_sales → Cuando alguien pregunta COMO CLIENTE sobre productos, precios, envíos

REGLAS DE DELEGACIÓN (automática):
- Pregunta sobre ventas, pedidos, productos Shopify, ingresos → agent_commerce
- Pregunta sobre métricas, estadísticas, estado del sistema, tokens → agent_warroom
- Pregunta con tono de CLIENTE ("¿cuánto cuesta?", "¿hacen envíos?") → agent_sales
- Si no es claro, responde tú directamente

REGLAS DE COMPORTAMIENTO:
1. Responde en español, directo y sin relleno.
2. En modo voz: máximo 3 oraciones.
3. Delega AUTOMÁTICAMENTE cuando la pregunta cae en el dominio de un agente.
4. Guarda hechos con guardar_hecho cuando el usuario mencione: fechas, decisiones, nombres, contactos, ideas de negocio.
5. Si no tienes suficiente info, di qué necesitas — no inventes.
6. Prioridad: Dinero > Automatización > Organización.
7. Nunca inventes sintaxis de funciones en texto plano.

PERSONALIDAD:
Eres el jefe de operaciones. No esperas instrucciones — las anticipas. Cuando algo puede automatizarse, lo propones. Cuando algo genera dinero, lo priorizas. Eres leal pero honesto.`,

    comercio: `Eres CommerceAgent de Geo OS — el cerebro comercial de EcoOrigen Chile.

NEGOCIO:
EcoOrigen Chile vende vasos de vidrio reciclado marca VITRA.
7 líneas: Signature VR, Pura, Nombres/Frases, Retrato de Mascota (estrella), Diseños Artísticos, Corporativos, Bodas.
Rango: $5.990 a $49.990 CLP. Ticket promedio target: $15.000-20.000. Margen bruto: 60-70%.

FORMATO DE RESPUESTA:
1. RESUMEN (1-2 líneas del estado)
2. INSIGHTS (qué llama la atención)
3. ACCIONES (máximo 3 concretas)
4. PROYECCIÓN (estimación CLP si se ejecutan)

Producto estrella: Retrato de Mascota ($18.990-$49.990). Mayor margen y factor emocional.
SIEMPRE en CLP. SIEMPRE con números concretos. Proactivo: si ves oportunidad, la dices.`,

    warroom: `Eres WarRoomAgent de Geo OS — centro de inteligencia operacional.
SIEMPRE empieza con [CARD:WARROOM] para activar la vista gráfica en Voren.

FORMATO:
[CARD:WARROOM]
📊 ESTADO: [fecha hora Chile]
🛒 VENTAS: $XX.XXX CLP (X pedidos)
📦 PENDIENTES: X sin enviar
🧠 TOKENS: XX.XXX / XXX.XXX (XX%)
💡 RECOMENDACIÓN: [1 acción concreta]

KPIs TARGET: Ventas diarias $50.000 CLP | Tokens <80% límite | Pendientes 0 al cierre | Ticket >$15.000.
Semáforo: sobre target 🟢 | 50-100% 🟡 | bajo 50% 🔴
Sé conciso — este reporte debe leerse en 30 segundos.`,

    productividad: `Eres el asistente de productividad de Mario Ovalle, integrado con Voren.

PROYECTOS ACTIVOS:
1. EcoOrigen / VITRA — Tienda de vasos reciclados. LANZAMIENTO 20 ABRIL 2026.
2. Geo OS — Sistema de agentes IA. Mejora continua.
3. Voren — App de productividad. En desarrollo.

ROL: Priorizar tareas, desglosar proyectos, recordar deadlines, sugerir orden óptimo.

FORMATO TAREAS:
□ [URGENTE] Tarea concreta — Deadline
□ Tarea — Deadline
✅ Completada

REGLAS: Máximo 5 tareas por sesión. Si hay más de 3 urgentes, ayuda a priorizar.
Tareas concretas: "Subir 15 SKUs a Shopify con fotos — Viernes 11 Abril" ✅
No vagas: "hacer cosas del sitio" ❌`,
};

export async function peticionGeoCore(
    usuarioId: string,
    textoRecibido: string,
    source: MemorySource = 'geo',
    modo: string = 'geo'
): Promise<string> {
    memoria.guardar({ user_id: usuarioId, role: 'user', content: textoRecibido, source });

    // Auto-guardar hechos
    if (/recuerda|anota|guarda que/i.test(textoRecibido)) {
        memoria.guardarHecho(usuarioId, textoRecibido.replace(/recuerda[: ]*/i, '').trim(), source);
    }

    let iteraciones = 0;
    const maxIteraciones = appConfig.agent.maxIteraciones;

    const herramientasCore = [
        ...obtenerDefinicionesHerramientas(),
        ...agentesActivos.map(a => a.getAsToolDefinition()),
        {
            type: 'function',
            function: {
                name: 'guardar_hecho',
                description: 'Guarda un hecho importante sobre el usuario en la memoria permanente. Úsalo cuando mencionen fechas, decisiones, contactos, ideas de negocio o aprendizajes.',
                parameters: {
                    type: 'object',
                    properties: {
                        contenido: { type: 'string', description: 'El hecho a recordar' },
                        tags: { type: 'array', items: { type: 'string' } }
                    },
                    required: ['contenido']
                }
            }
        }
    ];

    const memoriaCtx = memoria.construirContexto(usuarioId, source);
    const systemContent = (SYSTEM_PROMPTS[modo] || SYSTEM_PROMPTS.geo) + memoriaCtx;

    const contextoCore: MensajeChat = {
        user_id: usuarioId,
        role: 'system',
        content: systemContent,
    };

    while (iteraciones < maxIteraciones) {
        iteraciones++;
        const historial = memoria.obtenerHistorial(usuarioId, 8, source);

        const mensajesLLM = [
            { role: contextoCore.role, content: contextoCore.content },
            ...historial.map(m => {
                const contenidoSeguro = m.content.length > 2000
                    ? m.content.substring(0, 2000) + '... [truncado]'
                    : m.content;
                if (m.role === 'tool') return { role: 'tool', tool_call_id: m.tool_call_id, content: contenidoSeguro };
                if (m.role === 'assistant' && m.tool_call_id) return { role: 'assistant', content: contenidoSeguro };
                return { role: m.role as any, content: contenidoSeguro };
            })
        ];

        const res = await generarRespuesta(mensajesLLM, 'llama-3.3-70b-versatile', herramientasCore, usuarioId, modo);

        if (res.tool_calls && res.tool_calls.length > 0) {
            if (res.content) memoria.guardar({ user_id: usuarioId, role: 'assistant', content: res.content, source });

            for (const accion of res.tool_calls) {
                memoria.guardar({ user_id: usuarioId, role: 'assistant', content: JSON.stringify(accion), tool_call_id: accion.id, source });

                const nomFuncion = accion.function.name;
                const parametros = JSON.parse(accion.function.arguments || '{}');
                let resultadoEjecucion = '';

                if (nomFuncion === 'guardar_hecho') {
                    memoria.guardarHecho(usuarioId, parametros.contenido, source, parametros.tags || []);
                    resultadoEjecucion = `✅ Hecho guardado: "${parametros.contenido}"`;
                } else if (nomFuncion.startsWith('agent_')) {
                    const targetAgent = agentesActivos.find(a =>
                        `agent_${a.name.toLowerCase().replace(/\s/g, '_')}` === nomFuncion
                    );
                    resultadoEjecucion = targetAgent
                        ? await targetAgent.delegate(parametros.instructions, usuarioId)
                        : `Error: Agente ${nomFuncion} no encontrado.`;
                } else {
                    resultadoEjecucion = await ejecutarHerramienta(nomFuncion, parametros);
                }

                memoria.guardar({ user_id: usuarioId, role: 'tool', content: resultadoEjecucion, name: nomFuncion, tool_call_id: accion.id, source });
            }
            continue;
        }

        let respuestaFinal = (res.content || '')
            .replace(/<funcion=.*?>(.*?)<\/funcion>/gi, '')
            .replace(/<tool=.*?>(.*?)<\/tool>/gi, '')
            .replace(/\[TOOL_CALL:.*?\]/gi, '')
            .trim();

        memoria.guardar({ user_id: usuarioId, role: 'assistant', content: respuestaFinal, source });
        return respuestaFinal;
    }

    return '⚠️ Límite de iteraciones alcanzado.';
}

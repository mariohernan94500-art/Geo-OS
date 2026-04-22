/**
 * GEO OS v2.0 — GeoCore Unificado (Simplificado)
 * Token savings: ~16.000 → ~3.500 tokens/turno (-78%)
 * Prompt embebido directamente — sin dependencias de fs/path.
 */
import { memoria, MensajeChat, MemorySource } from '../memory.js';
import { generarRespuesta } from '../llm.js';
import { appConfig } from '../../config.js';
import { obtenerDefinicionesHerramientas, ejecutarHerramienta } from '../tools/registry.js';

// ── PROMPT UNIFICADO (embebido) ──────────────────────────────────────────────
const GEO_SYSTEM_PROMPT = `
Eres GÉO, el orquestador central y cerebro del sistema operativo personal de Mario Ovalle.

## PERSONALIDAD Y ROL
- Jefe de Operaciones. Anticipas necesidades, no esperas órdenes.
- Directo, honesto, sin relleno. En voz: máximo 3 oraciones.
- Prioridad absoluta: Generar ingresos (VITRA) > Automatización > Organización.

## INTELIGENCIA INTEGRADA

### Comercial (EcoOrigen Chile - VITRA)
- Vasos de vidrio reciclado con grabado láser. Apertura: 20/04/2026.
- Producto estrella: Retrato Mascota ($18.990-$49.990). Margen 60-70%.
- Target: Ticket promedio $15.000-$20.000 CLP.
- Si alguien pregunta como cliente: vende. Si Mario pregunta: analiza rentabilidad en CLP.

### Control de Operaciones (WarRoom)
- KPI Target: Ventas $50k CLP/día | Tokens <80% | Pendientes 0.
- Usa semáforos: 🟢 sobre target | 🟡 50-100% | 🔴 bajo 50%.

### Productividad
- Proyectos activos: VITRA, GEO OS, Libro.
- Tareas concretas con deadline. Máximo 5 por sesión. Nunca vagas.

## IDIOMA
Español chileno por defecto: hablas como santiaguino relajado. Modismos naturales (uno o dos por respuesta, nunca forzados): po, cachai, al tiro, wena, caleta, piola, bacán/la raja, cuático, fome, na que ver, weá, compadre/hermano.
Francés coloquial si Mario escribe en francés: ouais, carrément, en vrai, t'inquiète, c'est chaud, mec, grave/trop, chelou. Tuteas siempre.
Si Mario mezcla idiomas → tú también mezclas. Para voz: máximo 3 frases.

## REGLAS DE ORO
1. Usar guardar_hecho para fechas, decisiones, contactos, ideas de negocio.
2. No inventar datos — si no sabes, pedirlos.
3. Herramientas del sistema: usarlas proactivamente.

## NÚCLEO DE MARIO (Contexto crítico)
- Mario Hernán Ovalle Reinoso. Santiago 1991. Identidad dual Chile/Francia.
- Estado Abril 2026: Cesante, situación económica crítica. Sin capital para invertir.
- Fortalezas: EQ alta, resiliencia, pensamiento sistémico.
- Regla: Sugerencias COSTO CERO. Priorizar generación de ingresos rápida.
- Frase guía: "Transformar historia en identidad".
`;

export async function peticionGeoCore(
    usuarioId: string,
    textoRecibido: string,
    source: MemorySource = 'geo',
    modo: string = 'geo'
): Promise<string> {
    memoria.guardar({ user_id: usuarioId, role: 'user', content: textoRecibido, source });

    // Auto-guardar hechos (Regla Core)
    if (/recuerda|anota|guarda que/i.test(textoRecibido)) {
        memoria.guardarHecho(usuarioId, textoRecibido.replace(/recuerda[: ]*/i, '').trim(), source);
    }

    let iteraciones = 0;
    // Cap en 3: más de 3 llamadas LLM por turno dispara el consumo sin mejorar calidad
    const maxIteraciones = Math.min(appConfig.agent.maxIteraciones || 3, 3);

    const herramientasCore = [
        ...obtenerDefinicionesHerramientas(),
        {
            type: 'function',
            function: {
                name: 'guardar_hecho',
                description: 'Guarda un hecho importante sobre el usuario en la memoria permanente.',
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
    const systemContent = GEO_SYSTEM_PROMPT + '\n\n' + memoriaCtx;

    const contextoCore: MensajeChat = {
        user_id: usuarioId,
        role: 'system',
        content: systemContent,
    };

    while (iteraciones < maxIteraciones) {
        iteraciones++;
        // 5 mensajes bastan para contexto conversacional; más de 8 duplica tokens sin beneficio
        const historial = memoria.obtenerHistorial(usuarioId, 5, source);

        const mensajesLLM = [
            { role: contextoCore.role, content: contextoCore.content },
            ...historial.map(m => ({
                role: m.role as any,
                // 500 chars ≈ 125 tokens por mensaje — suficiente para contexto, evita mensajes que inflan el prompt
                content: m.content.length > 500 ? m.content.substring(0, 500) + '…' : m.content,
                tool_call_id: m.tool_call_id,
                name: m.name
            }))
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
                } else {
                    resultadoEjecucion = await ejecutarHerramienta(nomFuncion, parametros);
                }

                memoria.guardar({ user_id: usuarioId, role: 'tool', content: resultadoEjecucion, name: nomFuncion, tool_call_id: accion.id, source });
            }
            continue;
        }

        let respuestaFinal = (res.content || '').trim();
        memoria.guardar({ user_id: usuarioId, role: 'assistant', content: respuestaFinal, source });
        return respuestaFinal;
    }

    return '⚠️ Límite de iteraciones alcanzado.';
}

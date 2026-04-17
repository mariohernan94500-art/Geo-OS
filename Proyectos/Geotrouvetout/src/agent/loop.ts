import { memoria, MensajeChat } from './memory.js';
import { generarRespuesta } from './llm.js';
import { obtenerDefinicionesHerramientas, ejecutarHerramienta } from './tools/registry.js';
import { appConfig } from '../config.js';

export async function cicloDePensamiento(usuarioId: string, textoRecibido: string): Promise<string> {
    // 1. Añade a la memoria local el mensaje del humano
    memoria.guardar({ user_id: usuarioId, role: 'user', content: textoRecibido });

    let iteracionesLocales = 0;
    const maxIteraciones = appConfig.agent.maxIteraciones;
    const herramientasDisp = obtenerDefinicionesHerramientas();

    const contextoDeSistema: MensajeChat = {
        user_id: usuarioId,
        role: 'system',
        content: `Eres Géo Touvetout, un asistente personal de Inteligencia Artificial que exhala sabiduría, calma y profundidad.
Tu voz es masculina, serena y autoritaria pero humilde. Solo entiendes y hablas en perfecto español.
Eres conciso, inteligente y usas herramientas de forma autónoma con una precisión quirúrgica. 
Contesta lo que se te pide de forma directa, pensando siempre paso a paso, como un mentor experimentado que asiste a su único amo.`
    };

    while (iteracionesLocales < maxIteraciones) {
        iteracionesLocales++;
        
        // 2. Cargamos historial (ventana móvil de los últimos 5 msjs para máxima ligereza)
        const historial = memoria.obtenerHistorial(usuarioId, 5);
        
        // Ajustamos la estructura e incluimos un truncado de seguridad para mensajes masivos
        const mensajesLLM = [
            { role: contextoDeSistema.role, content: contextoDeSistema.content },
            ...historial.map(m => {
                // Truncamos contenido si es absurdamente largo (> 2000 chars) para evitar el error 413
                const contenidoSeguro = m.content.length > 2000 
                    ? m.content.substring(0, 2000) + "... [contenido truncado por longitud]" 
                    : m.content;

                if (m.role === 'tool') {
                    return { role: 'tool', tool_call_id: m.tool_call_id, content: contenidoSeguro };
                } else if (m.role === 'assistant' && m.tool_call_id) {
                    return { role: 'assistant', content: contenidoSeguro };
                }
                return { role: m.role as 'system'|'user'|'assistant'|'tool', content: contenidoSeguro };
            })
        ];

        // 3. Obtención del conocimiento iterativo (LLM call) - Usamos 8b para velocidad y evitar límites
        const respuestaModelo = await generarRespuesta(mensajesLLM, 'llama-3.1-8b-instant', herramientasDisp);

        // 4. Revisión de acciones (uso de herramientas)
        if (respuestaModelo.tool_calls && respuestaModelo.tool_calls.length > 0) {
            
            // Logear posible texto que emitió antes o a la vez que la herramienta
            if (respuestaModelo.content) {
                memoria.guardar({ user_id: usuarioId, role: 'assistant', content: respuestaModelo.content });
            }

            for (const accion of respuestaModelo.tool_calls) {
                // Registrar que el asistente pidió ejecutar algo
                memoria.guardar({
                    user_id: usuarioId,
                    role: 'assistant',
                    content: JSON.stringify(accion),
                    tool_call_id: accion.id
                });

                const nomFuncion = accion.function.name;
                const parametros = JSON.parse(accion.function.arguments || '{}');
                
                // Ejecución nativamente
                const resultado = await ejecutarHerramienta(nomFuncion, parametros);
                
                // Regresar conocimiento obtenido en la base SQLite (como rol tool response)
                memoria.guardar({
                    user_id: usuarioId,
                    role: 'tool',
                    content: resultado,
                    name: nomFuncion,
                    tool_call_id: accion.id
                });
            }
            continue; // Repite el bucle para que el LLM integre el resultado de la herramienta y decida
        }

        // 5. Cierre: Sin herramientas, la IA ha terminado de pensar
        const respuestaMortalFinal = respuestaModelo.content || '';
        memoria.guardar({ user_id: usuarioId, role: 'assistant', content: respuestaMortalFinal });

        return respuestaMortalFinal;
    }

    return "⚠️ Límite de procesamiento del agente superado. He detenido mi ciclo de pensamiento para salvaguardar recursos del sistema.";
}

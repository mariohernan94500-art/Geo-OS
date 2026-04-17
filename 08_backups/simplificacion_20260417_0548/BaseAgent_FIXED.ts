/**
 * BaseAgent v1.1
 * FIXES:
 * - Modelo default: llama-3.1-8b-instant → llama-3.3-70b-versatile (el 8b era demasiado débil)
 * - ELIMINADO mock data del tool handler (línea 39 del original tenía datos falsos)
 * - Mejor logging
 */
import { generarRespuesta } from '../llm.js';

export abstract class BaseAgent {
    public abstract readonly name: string;
    public abstract readonly description: string;
    protected abstract readonly systemPrompt: string;
    protected abstract readonly tools: any[];

    public async delegate(context: string, userId: string): Promise<string> {
        console.log(`[${this.name}] 🧠 Delegación activada para usuario ${userId}`);
        
        let iteracionesLocales = 0;
        const maxAgentIter = 3;

        const mensajesParaAgente = [
            { role: 'system', content: this.systemPrompt } as any,
            { role: 'user', content: context } as any
        ];

        while (iteracionesLocales < maxAgentIter) {
            iteracionesLocales++;
            
            // CAMBIO: usar modelo más capaz por default
            const respuesta = await generarRespuesta(
                mensajesParaAgente,
                'llama-3.3-70b-versatile',  // era llama-3.1-8b-instant
                this.tools.length > 0 ? this.tools : undefined,
                userId,
                this.name.toLowerCase()
            );
            
            if (respuesta.tool_calls && respuesta.tool_calls.length > 0) {
                if (respuesta.content) {
                    mensajesParaAgente.push({ role: 'assistant', content: respuesta.content });
                }

                for (const accion of respuesta.tool_calls) {
                    mensajesParaAgente.push({
                        role: 'assistant',
                        tool_calls: [accion],
                        content: null
                    });

                    const nomFuncion = accion.function.name;
                    
                    // CAMBIO: sin mock data — si no hay handler, reportar error
                    const resultadoHerramienta = `[Error] Herramienta "${nomFuncion}" no implementada en ${this.name}. Responde con la información que tengas.`;
                    
                    mensajesParaAgente.push({
                        role: 'tool',
                        content: resultadoHerramienta,
                        tool_call_id: accion.id,
                        name: nomFuncion
                    });
                }
                continue;
            }

            return respuesta.content || `Agente ${this.name} procesó sin resultados textuales.`;
        }

        return `[${this.name}] Límite de iteraciones alcanzado.`;
    }

    public getAsToolDefinition() {
        return {
            type: 'function',
            function: {
                name: `agent_${this.name.toLowerCase().replace(/\s/g, '_')}`,
                description: `Delega al agente especializado: ${this.name}. ${this.description}`,
                parameters: {
                    type: 'object',
                    properties: {
                        instructions: {
                            type: 'string',
                            description: 'Instrucciones claras y contexto para el agente.'
                        }
                    },
                    required: ['instructions']
                }
            }
        };
    }
}

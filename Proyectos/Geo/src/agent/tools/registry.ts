import { definicionObtenerHora, ejecutarObtenerHora } from './get_current_time.js';
import { definicionN8nAction, ejecutarN8nAction } from './n8n.js';

export const obtenerDefinicionesHerramientas = () => {
    return [
        definicionObtenerHora,
        definicionN8nAction
    ];
};

export async function ejecutarHerramienta(nombre: string, argumentos: any): Promise<string> {
    console.log(`[Sistema de Herramientas] El modelo invocó: ${nombre} con:`, argumentos);
    
    switch (nombre) {
        case 'obtener_hora_actual':
            return await ejecutarObtenerHora();
        case 'n8n_trigger_workflow':
            return await ejecutarN8nAction(argumentos);
            
        default:
            console.warn(`[Sistema de Herramientas] Herramienta desconocida solicitada: ${nombre}`);
            return `Error critico en sistema: Herramienta '${nombre}' no existe.`;
    }
}

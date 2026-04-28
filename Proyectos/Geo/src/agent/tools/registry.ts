import { definicionObtenerHora, ejecutarObtenerHora } from './get_current_time.js';
import { definicionN8nAction, ejecutarN8nAction } from './n8n.js';
import { definicionGenerarCodigo, ejecutarGenerarCodigo } from './generar_codigo.js';
import { definicionIterarCodigo, ejecutarIterarCodigo } from './iterar_codigo.js';
import { definicionExplorarDirectorio, ejecutarExplorarDirectorio } from './explorar_directorio.js';
import { definicionLeerArchivo, ejecutarLeerArchivo } from './leer_archivo.js';
import { definicionEscribirArchivo, ejecutarEscribirArchivo } from './escribir_archivo.js';

export const obtenerDefinicionesHerramientas = () => {
    return [// obtener_hora desactivada
        definicionN8nAction,
        definicionGenerarCodigo,
        definicionIterarCodigo,
        definicionExplorarDirectorio,
        definicionLeerArchivo,
        definicionEscribirArchivo,
    ];
};

export async function ejecutarHerramienta(nombre: string, argumentos: any): Promise<string> {
    console.log(`[Sistema de Herramientas] El modelo invocó: ${nombre} con:`, argumentos);
    
    switch (nombre) {
        case 'obtener_hora_actual':
            return await ejecutarObtenerHora();
        case 'n8n_trigger_workflow':
            return await ejecutarN8nAction(argumentos);
        case 'generar_codigo':
            return await ejecutarGenerarCodigo(argumentos);
        case 'iterar_codigo':
            return await ejecutarIterarCodigo(argumentos);
        case 'explorar_directorio':
            return await ejecutarExplorarDirectorio(argumentos);
        case 'leer_archivo':
            return await ejecutarLeerArchivo(argumentos);
        case 'escribir_archivo':
            return await ejecutarEscribirArchivo(argumentos);
            
        default:
            console.warn(`[Sistema de Herramientas] Herramienta desconocida solicitada: ${nombre}`);
            return `Error critico en sistema: Herramienta '${nombre}' no existe.`;
    }
}

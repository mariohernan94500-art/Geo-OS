import * as path from 'path';

export const BASE_PATH = path.resolve('/home/mario/Escritorio/Geo/Proyectos/Geo/Revisar-clasificar-modificar-implementar');

export function safePath(input: string): string {
    // Intentar resolver la ruta directamente
    let resolved = path.resolve(BASE_PATH, input);
    
    // Si la ruta resulta fuera del BASE_PATH (ej. por intentar acceder a /etc/passwd o usar ../../)
    if (!resolved.startsWith(BASE_PATH)) {
        // Asumir que el agente intentó poner una ruta absoluta que en realidad debía ser relativa
        resolved = path.resolve(BASE_PATH, input.replace(/^(\/|\\)+/, ''));
        
        // Si aún así escapa (ej. ../../) lanzar error
        if (!resolved.startsWith(BASE_PATH)) {
             throw new Error(`Acceso denegado: Ruta '${input}' fuera de los límites permitidos.`);
        }
    }
    return resolved;
}

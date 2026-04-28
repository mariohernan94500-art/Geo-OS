import { promises as fs } from 'fs';
import * as path from 'path';
import { safePath } from './path_utils.js';

export const definicionEscribirArchivo = {
    type: 'function',
    function: {
        name: 'escribir_archivo',
        description: 'Sobrescribe o crea un archivo',
        parameters: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'Ruta absoluta o relativa del archivo a escribir' },
                contenido: { type: 'string', description: 'Contenido a escribir en el archivo' }
            },
            required: ['path', 'contenido']
        }
    }
};

export async function ejecutarEscribirArchivo(args: { path: string, contenido: string }): Promise<string> {
    try {
        const targetPath = safePath(args.path);
        
        // Ensure directory exists
        const dir = path.dirname(targetPath);
        await fs.mkdir(dir, { recursive: true });

        await fs.writeFile(targetPath, args.contenido, 'utf8');
        return JSON.stringify({
            exito: true,
            mensaje: `Archivo guardado exitosamente en ${path.resolve(targetPath)}`
        });
    } catch (error: any) {
        return JSON.stringify({ error: `Error al escribir el archivo: ${error.message}` });
    }
}

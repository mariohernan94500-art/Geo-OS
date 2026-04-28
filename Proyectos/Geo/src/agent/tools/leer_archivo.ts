import { promises as fs } from 'fs';
import * as path from 'path';
import { safePath } from './path_utils.js';

export const definicionLeerArchivo = {
    type: 'function',
    function: {
        name: 'leer_archivo',
        description: 'Lee el contenido de un archivo',
        parameters: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'Ruta absoluta o relativa del archivo a leer' }
            },
            required: ['path']
        }
    }
};

export async function ejecutarLeerArchivo(args: { path: string }): Promise<string> {
    try {
        const targetPath = safePath(args.path);
        const contenido = await fs.readFile(targetPath, 'utf8');
        return JSON.stringify({
            ruta: path.resolve(targetPath),
            contenido
        });
    } catch (error: any) {
        return JSON.stringify({ error: `Error al leer el archivo: ${error.message}` });
    }
}

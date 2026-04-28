import { promises as fs } from 'fs';
import * as path from 'path';
import { safePath } from './path_utils.js';

export const definicionExplorarDirectorio = {
    type: 'function',
    function: {
        name: 'explorar_directorio',
        description: 'Lista archivos y carpetas dentro de una ruta',
        parameters: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'Ruta absoluta o relativa del directorio a explorar'
                }
            },
            required: ['path']
        }
    }
};

export async function ejecutarExplorarDirectorio(args: { path: string }): Promise<string> {
    try {
        const targetPath = safePath(args.path);
        
        // Comprobar si existe y es directorio
        const stats = await fs.stat(targetPath);
        if (!stats.isDirectory()) {
            return JSON.stringify({ error: `La ruta ${targetPath} no es un directorio o no existe.` });
        }

        const items = await fs.readdir(targetPath, { withFileTypes: true });
        
        const directorios = items.filter(item => item.isDirectory()).map(item => item.name);
        const archivos = items.filter(item => item.isFile()).map(item => item.name);
        
        return JSON.stringify({
            ruta: path.resolve(targetPath),
            directorios,
            archivos,
            total_items: items.length
        });

    } catch (error: any) {
        return JSON.stringify({ error: `Error al explorar el directorio: ${error.message}` });
    }
}

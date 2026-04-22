import { appConfig } from '../../config.js';

export const definicionN8nAction = {
    type: 'function',
    function: {
        name: 'n8n_trigger_workflow',
        description: 'Sirve para crear contenido, generar páginas o realizar automatizaciones genéricas conectando con n8n. Ejecuta un webhook de n8n pasándole un nombre de ruta (webhookPath) y un payload JSON estructurado con la información de la tarea que el amo solicitó.',
        parameters: {
            type: 'object',
            properties: {
                webhookPath: {
                    type: 'string',
                    description: 'Ruta final del webhook en n8n (p.ej. "crear-post", "publicar-redes").'
                },
                accion: {
                    type: 'string',
                    description: 'Describir brevemente qué acción o contenido se está generando.'
                },
                datos: {
                    type: 'string',
                    description: 'Carga útil en formato JSON (escapado como string) con los datos necesarios (p.ej. título, cuerpo, tags).'
                }
            },
            required: ['webhookPath', 'accion', 'datos']
        }
    }
};

export async function ejecutarN8nAction(args: any): Promise<string> {
    const { webhookPath, accion, datos } = args;

    if (!appConfig.n8n.baseUrl) {
        return '⚠️ Error en el agente: N8N_BASE_URL no está configurada en .env. El usuario debe añadirla para que n8n funcione.';
    }

    try {
        const payloadParseado = JSON.parse(datos);
        const url = `${appConfig.n8n.baseUrl}/webhook/${webhookPath.trim().replace(/^\//, '')}`;

        console.log(`[n8n] 📡 Disparando webhook en: ${url}`);
        console.log(`[n8n] 📦 Payload:`, payloadParseado);

        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: accion, data: payloadParseado })
        });

        if (!resp.ok) {
            const errBody = await resp.text();
            throw new Error(`HTTP ${resp.status} - ${errBody}`);
        }

        const json = await resp.json().catch(() => null);
        return `✅ Webhook en n8n disparado exitosamente para la acción "${accion}". 
Respuesta del servidor n8n: ${json ? JSON.stringify(json) : 'OK (Sin JSON)'}. 
Dile al usuario que el trabajo en n8n ha empezado/completado.`;
        
    } catch (error: any) {
        console.error('❌ Error de conexión con n8n:', error);
        return `❌ Fallo crítico de conexión al disparar n8n. 
Informa al usuario del error técnico (asegurarse de que la URL de n8n es accesible e idéntica al .env y que el webhook path es exacto): ${error.message}`;
    }
}

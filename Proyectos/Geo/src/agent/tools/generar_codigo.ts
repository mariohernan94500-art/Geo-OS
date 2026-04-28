// src/agent/tools/generar_codigo.ts

import OpenAI from 'openai';
import { guardarUltimoArtefacto } from './_artefacto_storage.js';

// ─── Types ───────────────────────────────────────────────────────

interface GenerarCodigoArgs {
  descripcion: string;
  tipo?: 'webapp' | 'python' | 'node' | 'auto';
  estilo_visual?: string;
  incluir_explicacion?: boolean;
  user_id?: string; // ID del usuario para tracking interno. Lo inyecta el sistema automáticamente.
}

interface ResultadoOk {
  ok: true;
  tipo: string;
  slug: string;
  nombre_archivo: string;
  lenguaje: string;
  tamano_bytes: number;
  codigo: string;
  preview_disponible: boolean;
  siguiente_paso: string;
}

interface ResultadoError {
  ok: false;
  error: string;
  codigo_error: string;
}

// ─── Helpers ─────────────────────────────────────────────────────

function slugify(texto: string): string {
  let slug = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length > 40) {
    slug = slug.substring(0, 40).replace(/-+$/, '');
  }

  return slug || 'artefacto';
}

function inferirTipo(descripcion: string): 'webapp' | 'python' | 'node' {
  const d = descripcion.toLowerCase();

  if (['api', 'endpoint', 'servidor', 'webhook'].some(k => d.includes(k))) {
    return 'node';
  }

  if (['script', 'automatización', 'automatizacion', 'procesar archivos', 'scraping'].some(k => d.includes(k))) {
    return 'python';
  }

  return 'webapp';
}

function limpiarCodigo(raw: string): string {
  const fenced = raw.match(/```(?:html|python|typescript|javascript|css|js|ts)\s*\n([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const generic = raw.match(/```\s*\n([\s\S]*?)```/);
  if (generic?.[1]) return generic[1].trim();

  return raw.trim();
}

function buildSystemPrompt(tipo: 'webapp' | 'python' | 'node', estiloVisual: string): string {
  switch (tipo) {
    case 'webapp':
      return [
        'Eres un experto frontend. Generás aplicaciones web completas',
        'en UN solo archivo HTML que incluye <style> CSS y <script> JS',
        'inline. NO uses frameworks externos (sin React/Vue).',
        'NO uses CDNs salvo Tailwind CSS via CDN si es necesario.',
        'El código debe ser autocontenido y funcionar al abrirse en',
        'cualquier navegador moderno.',
        `Estilo: ${estiloVisual}.`,
        'Responde SOLO con el código HTML, sin explicaciones,',
        'sin bloques markdown, sin comentarios extra.',
      ].join(' ');

    case 'python':
      return [
        'Eres un experto Python. Generás scripts ejecutables con',
        "Python 3.11+. Usa solo librerías stdlib o las más comunes",
        '(requests, pillow, pandas). El script debe tener una función',
        "main() y entry point if __name__ == '__main__'.",
        'Responde SOLO con el código Python, sin explicaciones.',
      ].join(' ');

    case 'node':
      return [
        'Eres un experto Node.js + TypeScript. Generás scripts/módulos',
        'con sintaxis ESM (import, export). Compatible con Node 20+.',
        'Responde SOLO con el código TypeScript, sin explicaciones.',
      ].join(' ');
  }
}

function errorResult(codigo_error: string, error: string): string {
  return JSON.stringify({ ok: false, error, codigo_error } satisfies ResultadoError);
}

// ─── Constantes ──────────────────────────────────────────────────

const ZAI_BASE = 'https://api.z.ai/api/coding/paas/v4';
const ZAI_MODEL = 'glm-4.7';
const TIMEOUT_MS = 30_000;
const RETRY_BACKOFF_MS = 2_000;
const TOTAL_INTENTOS = 2; // 1 inicial + 1 retry en caso de 429

// ─── Definición de la tool (formato OpenAI) ──────────────────────

export const definicionGenerarCodigo = {
  type: 'function' as const,
  function: {
    name: 'generar_codigo',
    description:
      'Genera código funcional según una descripción en lenguaje natural. Soporta HTML/CSS/JS (apps web), Python (scripts) y TypeScript/Node (APIs). Devuelve código completo listo para guardar y previsualizar.',
    parameters: {
      type: 'object',
      properties: {
        descripcion: {
          type: 'string',
          description:
            "Descripción detallada en español de qué debe hacer la app/script. Ej: 'Calculadora de propinas con campos para monto y porcentaje, que muestre el total con y sin propina'.",
        },
        tipo: {
          type: 'string',
          enum: ['webapp', 'python', 'node', 'auto'],
          description:
            "Tipo de artefacto. 'webapp' = HTML+CSS+JS standalone (un solo archivo). 'python' = script .py. 'node' = script .ts. 'auto' = el modelo decide según la descripción.",
          default: 'auto',
        },
        estilo_visual: {
          type: 'string',
          description:
            "Solo para webapp. Estilo visual deseado. Default: 'moderno, minimalista, dark mode'.",
          default: 'moderno, minimalista, dark mode',
        },
        incluir_explicacion: {
          type: 'boolean',
          description: 'Si true, incluye comentarios explicativos en el código.',
          default: false,
        },
        user_id: {
          type: 'string',
          description: 'ID del usuario para tracking interno. Lo inyecta el sistema automáticamente.',
        },
      },
      required: ['descripcion'],
    },
  },
};

// ─── Ejecutor ────────────────────────────────────────────────────

export async function ejecutarGenerarCodigo(
  args: GenerarCodigoArgs,
): Promise<string> {
  const TAG = '[TOOL:generar_codigo]';

  // ── 1. Validar descripción ─────────────────────────────────────
  if (!args.descripcion || args.descripcion.trim().length < 10) {
    console.error(`${TAG} Descripción rechazada: < 10 caracteres`);
    return errorResult('PROMPT_VACIO', 'La descripción debe tener al menos 10 caracteres.');
  }

  // ── 2. Validar API key ─────────────────────────────────────────
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    console.error(`${TAG} ZAI_API_KEY no encontrada en process.env`);
    return errorResult(
      'ZAI_NO_KEY',
      'ZAI_API_KEY no configurada. Verificá el archivo .env.',
    );
  }

  // ── 3. Resolver tipo ──────────────────────────────────────────
  let tipo: 'webapp' | 'python' | 'node';
  if (!args.tipo || args.tipo === 'auto') {
    tipo = inferirTipo(args.descripcion);
    console.log(`${TAG} Tipo inferido: ${tipo}`);
  } else {
    tipo = args.tipo;
  }

  // ── 4. Construir prompts ───────────────────────────────────────
  const estiloVisual = args.estilo_visual?.trim()
    || 'moderno, minimalista, dark mode';
  const systemPrompt = buildSystemPrompt(tipo, estiloVisual);
  const suffix = args.incluir_explicacion
    ? 'Incluye comentarios explicativos.'
    : 'Sin comentarios extra.';
  const userPrompt = `${args.descripcion}\n\n${suffix}`;

  // ── 5. Cliente OpenAI-compatible (sin timeout aquí, se maneja por intento)
  const client = new OpenAI({
    apiKey,
    baseURL: ZAI_BASE,
  });

  let codigoRaw: string | undefined;

  for (let attempt = 1; attempt <= TOTAL_INTENTOS; attempt++) {
    // Timeout limpio por cada intento
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log(`${TAG} Llamando Z.ai · intento ${attempt}/${TOTAL_INTENTOS}`);

      const response = await client.chat.completions.create({
        model: ZAI_MODEL,
        temperature: 0.3,
        max_tokens: 4000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        // @ts-expect-error — signal no está en los tipos del SDK pero fetch sí lo usa
        signal: controller.signal,
      });

      const content = response.choices[0]?.message?.content;

      if (!content || content.trim().length === 0) {
        console.error(`${TAG} Respuesta vacía de Z.ai`);
        clearTimeout(timeoutHandle);
        return errorResult('ZAI_EMPTY_RESPONSE', 'Z.ai devolvió una respuesta vacía.');
      }

      codigoRaw = content;
      clearTimeout(timeoutHandle);
      break;
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const msg = err instanceof Error ? err.message : String(err);

      console.error(`${TAG} Error intento ${attempt}: status=${status ?? 'n/a'} msg=${msg}`);

      // 401 → no reintentar
      if (status === 401) {
        clearTimeout(timeoutHandle);
        return errorResult('ZAI_NO_KEY', 'API key inválida o expirada. Verificá ZAI_API_KEY en .env.');
      }

      // 400 / 403 → no reintentar (bad request o forbidden)
      if (status === 400 || status === 403) {
        clearTimeout(timeoutHandle);
        return errorResult('ZAI_API_ERROR', `Solicitud rechazada por Z.ai (HTTP ${status}): ${msg}`);
      }

      // 429 → reintentar 1 vez con backoff
      if (status === 429) {
        clearTimeout(timeoutHandle);
        if (attempt < TOTAL_INTENTOS) {
          console.log(`${TAG} Rate limited · esperando ${RETRY_BACKOFF_MS}ms...`);
          await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS));
          continue;
        }
        return errorResult('ZAI_RATE_LIMIT', 'Rate limit de Z.ai excedido. Intentá en unos segundos.');
      }

      // 5xx
      if (typeof status === 'number' && status >= 500) {
        clearTimeout(timeoutHandle);
        return errorResult('ZAI_API_ERROR', `Error del servidor Z.ai (HTTP ${status}).`);
      }

      // Timeout (AbortError)
      if (err instanceof Error && err.name === 'AbortError') {
        clearTimeout(timeoutHandle);
        return errorResult('TIMEOUT', 'La generación excedió los 30 s. Probá con una descripción más simple.');
      }

      // Cualquier otro error
      clearTimeout(timeoutHandle);
      return errorResult('ZAI_API_ERROR', `Error inesperado al llamar Z.ai: ${msg}`);
    }
  }

  // Safety net: no debería llegar aquí, pero TypeScript lo necesita feliz
  if (!codigoRaw) {
    return errorResult('ZAI_API_ERROR', 'No se obtuvo código de Z.ai.');
  }

  // ── 6. Limpiar respuesta ───────────────────────────────────────
  const codigo = limpiarCodigo(codigoRaw);

  if (codigo.length === 0) {
    console.error(`${TAG} Código vacío post-limpieza`);
    return errorResult('ZAI_EMPTY_RESPONSE', 'El código generado quedó vacío tras la limpieza.');
  }

  // ── 7. Slug + nombre de archivo ────────────────────────────────
  const slug = slugify(args.descripcion);
  const extMap: Record<string, string> = { webapp: 'html', python: 'py', node: 'ts' };
  const langMap: Record<string, string> = { webapp: 'html', python: 'python', node: 'typescript' };
  const ext = extMap[tipo] ?? 'html';

  // ── 8. Guardar en storage ──────────────────────────────────────
  if (args.user_id) {
    guardarUltimoArtefacto(args.user_id, {
      tipo,
      slug,
      nombre_archivo: `${slug}.${ext}`,
      lenguaje: langMap[tipo] ?? 'html',
      codigo,
      descripcion_original: args.descripcion,
    }, 0);
  }

  console.log(`${TAG} Generado: ${slug}.${ext} (${Buffer.byteLength(codigo, 'utf-8')} bytes)`);

  // ── 9. Retornar ────────────────────────────────────────────────
  const resultado: ResultadoOk = {
    ok: true,
    tipo,
    slug,
    nombre_archivo: `${slug}.${ext}`,
    lenguaje: langMap[tipo] ?? 'html',
    tamano_bytes: Buffer.byteLength(codigo, 'utf-8'),
    codigo,
    preview_disponible: tipo === 'webapp',
    siguiente_paso: 'Llamá a la tool guardar_artefacto con este código para persistirlo.',
  };

  return JSON.stringify(resultado);
}

// src/agent/tools/iterar_codigo.ts

import OpenAI from 'openai';
import { obtenerUltimoArtefacto, guardarUltimoArtefacto } from './_artefacto_storage.js';

// ─── Types ───────────────────────────────────────────────────────

interface IterarCodigoArgs {
  cambio: string;
  codigo_actual?: string;
  user_id?: string;
}

interface ResultadoOk {
  ok: true;
  tipo: string;
  slug: string;
  nombre_archivo: string;
  lenguaje: string;
  tamano_bytes: number;
  tamano_anterior_bytes: number;
  iteracion: number;
  codigo: string;
  cambio_aplicado: string;
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

function limpiarCodigo(raw: string): string {
  const fenced = raw.match(/```(?:html|python|typescript|javascript|css|js|ts)\s*\n([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const generic = raw.match(/```\s*\n([\s\S]*?)```/);
  if (generic?.[1]) return generic[1].trim();

  return raw.trim();
}

function inferirTipoDesdeCodigo(codigo: string): 'webapp' | 'python' | 'node' {
  const recortado = codigo.substring(0, 500).trim();

  // Webapp: empieza con <!DOCTYPE, <html o <!--
  if (/^<!doctype\s+html/i.test(recortado) || /^<html/i.test(recortado) || /^<!--/i.test(recortado)) {
    return 'webapp';
  }

  // Python: shebang, def main o if __name__
  if (/^#!\/usr\/bin\/env python/.test(recortado) || /def\s+main\s*\(/.test(codigo) || /if\s+__name__\s*==/.test(codigo)) {
    return 'python';
  }

  // Node: empieza con import o export (tipos de TS)
  if (/^(import\s|export\s|from\s)/.test(recortado)) {
    return 'node';
  }

  return 'webapp';
}

function buildIteracionPrompt(tipo: 'webapp' | 'python' | 'node'): string {
  switch (tipo) {
    case 'webapp':
      return [
        'Eres un experto frontend. Recibirás código HTML existente y',
        'una solicitud de modificación. Tu trabajo es aplicar SOLO los',
        'cambios solicitados, manteniendo TODO lo demás intacto:',
        'estructura, IDs, clases CSS existentes, lógica que no se',
        'menciona. NO reescribas desde cero. NO agregues features que',
        'no se piden. NO uses frameworks externos (sin React/Vue).',
        'Mantené Tailwind CSS via CDN si ya estaba.',
        'Responde SOLO con el código HTML completo modificado, sin',
        'explicaciones, sin bloques markdown.',
      ].join(' ');

    case 'python':
      return [
        'Eres un experto Python. Recibirás un script existente y una',
        'solicitud de modificación. Aplica SOLO los cambios pedidos,',
        'manteniendo el resto del script intacto. Mantené el estilo',
        'de código original. Responde SOLO con el código Python',
        'modificado, sin explicaciones.',
      ].join(' ');

    case 'node':
      return [
        'Eres un experto Node.js + TypeScript. Recibirás código TS',
        'existente y una solicitud de modificación. Aplica SOLO los',
        'cambios pedidos, manteniendo imports, exports y estructura.',
        'Responde SOLO con el código TypeScript modificado, sin',
        'explicaciones.',
      ].join(' ');
  }
}

function errorResult(codigo_error: string, error: string): string {
  return JSON.stringify({ ok: false, error, codigo_error } satisfies ResultadoError);
}

// ─── Constantes ──────────────────────────────────────────────────

const ZAI_BASE = 'https://api.z.ai/api/coding/paas/v4';
const ZAI_MODEL = 'glm-4.7';
const TIMEOUT_MS = 45_000;
const RETRY_BACKOFF_MS = 2_000;
const TOTAL_INTENTOS = 2; // 1 inicial + 1 retry en caso de 429
const UMBRAL_DEGRADACION = 0.3; // si el resultado es < 30% del original, rechazar

const EXT_MAP: Record<string, string> = { webapp: 'html', python: 'py', node: 'ts' };
const LANG_MAP: Record<string, string> = { webapp: 'html', python: 'python', node: 'typescript' };

// ─── Definición de la tool (formato OpenAI) ──────────────────────

export const definicionIterarCodigo = {
  type: 'function' as const,
  function: {
    name: 'iterar_codigo',
    description:
      'Modifica el último código generado según un nuevo requerimiento. Mantiene la estructura general y aplica solo los cambios solicitados.',
    parameters: {
      type: 'object',
      properties: {
        cambio: {
          type: 'string',
          description:
            "Descripción en español del cambio a aplicar. Ej: 'Agregar selector de moneda CLP/USD/EUR/ARS/BRL', 'Cambiar colores a tema azul', 'Hacer el formulario responsive'.",
        },
        codigo_actual: {
          type: 'string',
          description:
            'OPCIONAL. Código completo a modificar. Si no se pasa, la tool buscará el último código generado en la sesión actual del usuario.',
        },
        user_id: {
          type: 'string',
          description:
            'ID del usuario (para buscar el último código si codigo_actual no viene). El sistema lo inyecta automáticamente.',
        },
      },
      required: ['cambio'],
    },
  },
};

// ─── Ejecutor ────────────────────────────────────────────────────

export async function ejecutarIterarCodigo(
  args: IterarCodigoArgs,
): Promise<string> {
  const TAG = '[TOOL:iterar_codigo]';

  // ── 1. Validar cambio ──────────────────────────────────────────
  if (!args.cambio || args.cambio.trim().length < 5) {
    console.error(`${TAG} Cambio rechazado: < 5 caracteres`);
    return errorResult('CAMBIO_VACIO', 'La descripción del cambio debe tener al menos 5 caracteres.');
  }

  // ── 2. Obtener código a modificar ─────────────────────────────
  let codigoActual: string;
  let tipo: 'webapp' | 'python' | 'node';
  let metadataFromStorage: {
    slug: string;
    nombre_archivo: string;
    descripcion_original: string;
    iteraciones: number;
  } | null = null;

  if (args.codigo_actual && args.codigo_actual.trim().length > 0) {
    // Código pasado explícitamente
    codigoActual = args.codigo_actual.trim();
    tipo = inferirTipoDesdeCodigo(codigoActual);
    console.log(`${TAG} Código pasado explícitamente, tipo inferido: ${tipo}`);
  } else if (args.user_id) {
    // Buscar en storage
    const artefacto = obtenerUltimoArtefacto(args.user_id);
    if (!artefacto) {
      console.error(`${TAG} No hay artefacto previo para user ${args.user_id}`);
      return errorResult(
        'SIN_ARTEFACTO_PREVIO',
        'No se encontró un código previo para este usuario. Primero generá un artefacto con generar_codigo, o pasá el código directamente en codigo_actual.',
      );
    }
    codigoActual = artefacto.codigo;
    tipo = artefacto.tipo;
    metadataFromStorage = {
      slug: artefacto.slug,
      nombre_archivo: artefacto.nombre_archivo,
      descripcion_original: artefacto.descripcion_original,
      iteraciones: artefacto.iteraciones,
    };
    console.log(`${TAG} Artefacto recuperado del storage: ${artefacto.nombre_archivo} (iteración ${artefacto.iteraciones})`);
  } else {
    console.error(`${TAG} Sin código_actual ni user_id`);
    return errorResult(
      'SIN_ARTEFACTO_PREVIO',
      'No se proporcionó código a modificar ni user_id para buscarlo en la sesión. Pasá codigo_actual o user_id.',
    );
  }

  const tamanoAnterior = Buffer.byteLength(codigoActual, 'utf-8');

  // ── 3. Validar API key ─────────────────────────────────────────
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    console.error(`${TAG} ZAI_API_KEY no encontrada en process.env`);
    return errorResult('ZAI_NO_KEY', 'ZAI_API_KEY no configurada. Verificá el archivo .env.');
  }

  // ── 4. Construir prompts ───────────────────────────────────────
  const systemPrompt = buildIteracionPrompt(tipo);
  const userPrompt = [
    `CÓDIGO ACTUAL:\n\n${codigoActual}`,
    `\n---\n\nCAMBIO SOLICITADO:\n${args.cambio}`,
    '\n\nDevuelve el código completo con el cambio aplicado.',
  ].join('');

  // ── 5. Cliente OpenAI-compatible ──────────────────────────────
  const client = new OpenAI({
    apiKey,
    baseURL: ZAI_BASE,
  });

  let codigoRaw: string | undefined;

  for (let attempt = 1; attempt <= TOTAL_INTENTOS; attempt++) {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log(`${TAG} Llamando Z.ai · intento ${attempt}/${TOTAL_INTENTOS}`);

      const response = await client.chat.completions.create({
        model: ZAI_MODEL,
        temperature: 0.2,
        max_tokens: 6000,
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

      if (status === 401) {
        clearTimeout(timeoutHandle);
        return errorResult('ZAI_NO_KEY', 'API key inválida o expirada. Verificá ZAI_API_KEY en .env.');
      }

      if (status === 400 || status === 403) {
        clearTimeout(timeoutHandle);
        return errorResult('ZAI_API_ERROR', `Solicitud rechazada por Z.ai (HTTP ${status}): ${msg}`);
      }

      if (status === 429) {
        clearTimeout(timeoutHandle);
        if (attempt < TOTAL_INTENTOS) {
          console.log(`${TAG} Rate limited · esperando ${RETRY_BACKOFF_MS}ms...`);
          await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS));
          continue;
        }
        return errorResult('ZAI_RATE_LIMIT', 'Rate limit de Z.ai excedido. Intentá en unos segundos.');
      }

      if (typeof status === 'number' && status >= 500) {
        clearTimeout(timeoutHandle);
        return errorResult('ZAI_API_ERROR', `Error del servidor Z.ai (HTTP ${status}).`);
      }

      if (err instanceof Error && err.name === 'AbortError') {
        clearTimeout(timeoutHandle);
        return errorResult('TIMEOUT', 'La iteración excedió los 45 s. Probá con un cambio más específico.');
      }

      clearTimeout(timeoutHandle);
      return errorResult('ZAI_API_ERROR', `Error inesperado al llamar Z.ai: ${msg}`);
    }
  }

  if (!codigoRaw) {
    return errorResult('ZAI_API_ERROR', 'No se obtuvo código de Z.ai.');
  }

  // ── 6. Limpiar respuesta ───────────────────────────────────────
  const codigoIterado = limpiarCodigo(codigoRaw);

  if (codigoIterado.length === 0) {
    console.error(`${TAG} Código vacío post-limpieza`);
    return errorResult('ZAI_EMPTY_RESPONSE', 'El código iterado quedó vacío tras la limpieza.');
  }

  // ── 7. Validación de degradación ───────────────────────────────
  const tamanoNuevo = Buffer.byteLength(codigoIterado, 'utf-8');

  if (tamanoNuevo < tamanoAnterior * UMBRAL_DEGRADACION) {
    console.error(
      `${TAG} Degradación detectada: anterior=${tamanoAnterior}b, nuevo=${tamanoNuevo}b (${((tamanoNuevo / tamanoAnterior) * 100).toFixed(1)}%)`,
    );
    return errorResult(
      'DEGRADACION_DETECTADA',
      `El código resultante (${tamanoNuevo} bytes) es significativamente más chico que el original (${tamanoAnterior} bytes). Probablemente Z.ai recortó el código en lugar de iterarlo. Reintentá con una descripción más específica del cambio.`,
    );
  }

  // ── 8. Actualizar storage ──────────────────────────────────────
  const ext = EXT_MAP[tipo] ?? 'html';
  const iteracionNum = (metadataFromStorage?.iteraciones ?? 0) + 1;

  if (args.user_id) {
    const previo = obtenerUltimoArtefacto(args.user_id);
    guardarUltimoArtefacto(
      args.user_id,
      {
        tipo,
        slug: previo?.slug ?? metadataFromStorage?.slug ?? slugify(args.cambio),
        nombre_archivo: previo?.nombre_archivo ?? metadataFromStorage?.nombre_archivo ?? `iterado.${ext}`,
        lenguaje: LANG_MAP[tipo] ?? 'html',
        codigo: codigoIterado,
        descripcion_original: previo?.descripcion_original ?? metadataFromStorage?.descripcion_original ?? args.cambio,
      },
      iteracionNum,
    );
  }

  // ── 9. Retornar ────────────────────────────────────────────────
  const slugFinal = metadataFromStorage?.slug ?? slugify(args.cambio);
  const nombreArchivoFinal = metadataFromStorage?.nombre_archivo ?? `${slugFinal}.${ext}`;

  console.log(
    `${TAG} Iteración #${iteracionNum} completada: ${nombreArchivoFinal} (${tamanoAnterior}b → ${tamanoNuevo}b)`,
  );

  const resultado: ResultadoOk = {
    ok: true,
    tipo,
    slug: slugFinal,
    nombre_archivo: nombreArchivoFinal,
    lenguaje: LANG_MAP[tipo] ?? 'html',
    tamano_bytes: tamanoNuevo,
    tamano_anterior_bytes: tamanoAnterior,
    iteracion: iteracionNum,
    codigo: codigoIterado,
    cambio_aplicado: args.cambio,
    preview_disponible: tipo === 'webapp',
    siguiente_paso: 'Podés seguir iterando con más cambios o llamar a guardar_artefacto para persistirlo.',
  };

  return JSON.stringify(resultado);
}

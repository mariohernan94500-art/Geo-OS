// src/agent/tools/_artefacto_storage.ts

interface ArtefactoEnMemoria {
  user_id: string;
  tipo: 'webapp' | 'python' | 'node';
  slug: string;
  nombre_archivo: string;
  lenguaje: string;
  codigo: string;
  descripcion_original: string;
  iteraciones: number;
  ultima_modificacion: number;
}

const storage = new Map<string, ArtefactoEnMemoria>();

const TTL_MS = 4 * 60 * 60 * 1000; // 4 horas

export function guardarUltimoArtefacto(
  user_id: string,
  artefacto: Omit<ArtefactoEnMemoria, 'user_id' | 'ultima_modificacion' | 'iteraciones'>,
  iteraciones: number = 0,
): void {
  storage.set(user_id, {
    user_id,
    ...artefacto,
    iteraciones,
    ultima_modificacion: Date.now(),
  });
}

export function obtenerUltimoArtefacto(user_id: string): ArtefactoEnMemoria | null {
  const a = storage.get(user_id);
  if (!a) return null;

  if (Date.now() - a.ultima_modificacion > TTL_MS) {
    storage.delete(user_id);
    return null;
  }

  return a;
}

export function limpiarArtefacto(user_id: string): void {
  storage.delete(user_id);
}

/**
 * session.ts — Gestión segura del token de sesión
 *
 * Usa expo-secure-store para guardar el JWT en el Keychain (iOS)
 * o en EncryptedSharedPreferences (Android), nunca en texto plano.
 *
 * PENDIENTE POST-LAUNCH:
 * - Implementar flujo de login real contra /api/auth/login del backend.
 * - Agregar refresh de token cuando expire.
 * - Considerar biometric prompt antes de leer el token (expo-local-authentication).
 */

import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'geo_auth_token';

/**
 * Devuelve el token almacenado de forma segura, o null si no existe.
 */
export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_KEY);
  } catch {
    return null;
  }
}

/**
 * Guarda un token de forma segura en el Keychain / EncryptedSharedPreferences.
 */
export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, token);
}

/**
 * Elimina el token de la sesión activa (logout).
 */
export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

/**
 * api.ts — Cliente axios con inyección automática de Authorization header.
 *
 * Uso:
 *   import { apiClient } from '../auth/api';
 *   const res = await apiClient.post('/api/chat', { texto: '...' });
 *
 * El interceptor lee el token de SecureStore antes de cada request.
 * Si no hay token → la request se envía sin Authorization (el backend
 * devolverá 401 y la UI mostrará la pantalla de login).
 *
 * PENDIENTE POST-LAUNCH:
 * - Agregar axios-auth-refresh para renovar el token automáticamente en 401.
 * - Implementar cola de requests fallidos durante refresh.
 */

import axios from 'axios';
import { API_URL } from '../config';
import { getToken } from './session';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
});

// Inyectar Bearer token en cada request si existe sesión activa
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

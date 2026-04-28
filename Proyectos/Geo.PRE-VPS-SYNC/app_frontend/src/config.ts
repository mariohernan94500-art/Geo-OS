/**
 * config.ts — Configuración centralizada de la app.
 *
 * La URL de la API se lee desde app.config.js → expo.extra.apiUrl
 * para que sea configurable por entorno sin tocar el código fuente.
 *
 * En desarrollo local se usa la IP de la LAN como fallback.
 * En producción (Play Store) se sobreescribirá con la URL HTTPS del VPS.
 *
 * PENDIENTE POST-LAUNCH (PROMPT 02):
 * - Reemplazar el fallback IP por la URL HTTPS definitiva del VPS Hostinger.
 * - Agregar EXPO_PUBLIC_API_URL en el pipeline de EAS Build para CI/CD.
 */

import Constants from 'expo-constants';

// Leer desde app.config.js → expo.extra; fallback a la IP de dev local
export const API_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  'http://192.168.1.15:3000';

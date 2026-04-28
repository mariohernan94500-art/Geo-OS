// app.config.js — Configuración de Expo para producción
//
// Este archivo reemplaza completamente app.json.
// Expo lo evalúa en build time; permite lógica y variables de entorno.
//
// DEV LOCAL:
//   Definir API_URL en .env o pasar inline:
//   EXPO_PUBLIC_API_URL=http://192.168.1.x:3000 npx expo start
//
// PRODUCCIÓN (EAS Build / Google Play):
//   EXPO_PUBLIC_API_URL no se define → usa el fallback https://api.geoos.app

export default ({ config }) => ({
  ...config,

  // ── Identidad ───────────────────────────────────────────────────────────
  name: "GEO OS",
  slug: "geo-os",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  newArchEnabled: true,

  // ── Icono ────────────────────────────────────────────────────────────────
  icon: "./assets/icon.png",

  // ── Splash ───────────────────────────────────────────────────────────────
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0a0a0a",
  },

  // ── iOS ──────────────────────────────────────────────────────────────────
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.geoos.app",
  },

  // ── Android ──────────────────────────────────────────────────────────────
  android: {
    package: "com.geoos.app",

    // Subir versionCode en cada release a Play Store
    // versionCode 1 = APK dev inicial | versionCode 2 = primer build limpio | versionCode 3 = Sentry añadido
    versionCode: 3,

    // HTTPS obligatorio — usesCleartextTraffic: false para Google Play
    usesCleartextTraffic: false,

    softwareKeyboardLayoutMode: "resize",
    edgeToEdgeEnabled: true,

    // Permisos mínimos necesarios:
    // READ/WRITE_EXTERNAL_STORAGE eliminados — el código usa
    // FileSystem.cacheDirectory (sandbox) y no requiere acceso al storage público.
    // En Android 13+ esos permisos disparan cuestionario de Play Store.
    permissions: [
      "android.permission.RECORD_AUDIO",
      "android.permission.MODIFY_AUDIO_SETTINGS",
      "android.permission.INTERNET",
    ],

    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0a0a0a",
    },
  },

  // ── Web ───────────────────────────────────────────────────────────────────
  web: {
    favicon: "./assets/favicon.png",
  },

  // ── Plataformas objetivo ──────────────────────────────────────────────────
  platforms: ["ios", "android"],

  // ── SDK ───────────────────────────────────────────────────────────────────
  sdkVersion: "54.0.0",

  // ── Extra (accesible via Constants.expoConfig.extra) ─────────────────────
  extra: {
    // URL del backend. EXPO_PUBLIC_API_URL se puede sobreescribir por entorno.
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "https://api.geoos.app",

    // Sentry DSN para monitoreo de errores en producción
    sentryDsn: process.env.SENTRY_DSN,

    // EAS project ID — necesario para eas build y eas submit
    eas: {
      projectId: "84da174a-8330-4f96-b712-b05f91ac8b44",
    },
  },
});

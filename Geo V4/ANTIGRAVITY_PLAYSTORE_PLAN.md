# Plan Geo OS → Google Play Store

**Objetivo**: publicar la app `com.geoos.app` en Google Play Store.
**Hito externo**: 29.04.2026 — pago Google Play Console ($25 USD) + inicio verificación identidad.
**Deadline de trabajo técnico**: todo listo para subir el **29.04** mismo día de activación.

---

## Estado real del proyecto (verificado 23.04.2026)

La app React Native ya existe y tiene APK. El plan del "engine V4" queda archivado hasta mayo — no bloquea el lanzamiento.

Componentes relevantes para este plan (rutas desde la raíz del proyecto `Geo/`):

```
Proyectos/Geo/                   ← Backend TypeScript (Docker + deploy Hostinger)
├── app_frontend/                ← App Expo/React Native (SOURCE de la APK)
│   ├── App.tsx                  ← 804 líneas — contiene DEV_TOKEN hardcodeado
│   ├── app.json                 ← DESALINEADO con el APK compilado
│   ├── package.json             ← Expo SDK 54, RN 0.81.5
│   └── assets/
├── .env.REAL                    ← ⚠️ SECRETOS en el repo
├── deploy_hostinger.sh          ← Ya existe
├── Dockerfile, docker-compose.yml
└── GeoCore_IMPROVED.ts, FirewallAgent.ts

Ideas/
├── application-4864c737-…apk    ← APK actual (58 MB, com.geoos.app, versionCode 1)
├── GEO_OS_Logo_v1.png           ← Logo oficial (usar para icon 512×512)
├── GEO_OS_Ad_Horizontal_v1.png  ← Feature graphic base (1024×500)
└── GEO_OS_Ad_Square_v1.png      ← Screenshot base
```

Config extraída del APK (el "real" — no lo que dice `app.json` local):

```json
{
  "name": "GEO OS", "slug": "geo-os", "version": "1.0.0",
  "android": { "package": "com.geoos.app", "versionCode": 1,
               "usesCleartextTraffic": true,
               "permissions": ["RECORD_AUDIO","MODIFY_AUDIO_SETTINGS",
                              "READ_EXTERNAL_STORAGE","WRITE_EXTERNAL_STORAGE","INTERNET"]},
  "extra": { "apiUrl": "http://76.13.166.221:3000",
             "eas": { "projectId": "84da174a-8330-4f96-b712-b05f91ac8b44" }},
  "sdkVersion": "54.0.0"
}
```

## Bloqueadores identificados

1. `DEV_TOKEN` JWT hardcoded en `App.tsx` L19 (expira 2027) — visible tras decompilar APK.
2. `.env.REAL` versionado con secretos reales — rotar inmediatamente.
3. Backend servido por HTTP plano (`http://76.13.166.221:3000`) + `usesCleartextTraffic: true` — Play marca en rojo.
4. Play Store ya no acepta APK para apps nuevas — hay que generar AAB con EAS.
5. `app.json` local dice `name: "app_frontend"` pero el APK dice `"GEO OS"` — desincronización de config.

---

## Secuencia de ejecución

```
[29.04] Pago Play Console ($25) → verificación identidad (1-5 días)
          │
  ┌───────┴────── En paralelo al trámite Google ──────┐
  │                                                   │
PROMPT 01  Auditoría y fix seguridad                   │
PROMPT 02  HTTPS + rotación de secretos backend       │
PROMPT 03  Alineación de configs Expo                  │
PROMPT 04  EAS Build producción (AAB firmado)          │
PROMPT 05  Smoke test del AAB                          │
PROMPT 06  Privacy policy + hosting                    │
PROMPT 07  Assets gráficos Play Store                  │
PROMPT 08  Copy de ficha (ES + EN)                     │
PROMPT 09  Data Safety + Content Rating dossier        │
  │                                                   │
  └─────────────── Activación cuenta ─────────────────┘
          │
[Día activación] Upload AAB a Internal Testing
          │
PROMPT 10  Upload + promoción a Production
          │
PROMPT 11  Post-launch: Sentry + pre-launch report
```

---

# PROMPT 01 — Auditoría y fix de seguridad del source

## Contexto para el agente

Estás trabajando en el repo Geo. La app móvil vive en `Proyectos/Geo/app_frontend/` (Expo SDK 54, RN 0.81.5). El backend que consume vive en `Proyectos/Geo/` (Node/TS, Dockerfile). Se va a publicar en Google Play — hay que pasar una revisión de seguridad.

**NO tocar**:
- `01_core/` (es otro proyecto — el OS Electron de Mario, CommonJS, puerto 3000)
- `Ideas/` (archivo de referencia, solo lectura)
- `00_nucleus/` (memoria personal)

## Objetivo

Eliminar secretos del source del cliente móvil, remover el token hardcodeado, introducir almacenamiento seguro de sesión, y dejar el repo en estado "publicable".

## Scope / archivos

- `Proyectos/Geo/app_frontend/App.tsx` — remover `DEV_TOKEN`, introducir auth flow
- `Proyectos/Geo/app_frontend/src/` — crear si no existe; mover lógica de auth aquí
- `Proyectos/Geo/.env.REAL` — **BORRAR del repo** (después de rotar secretos — ver PROMPT 02)
- `Proyectos/Geo/.gitignore` — añadir `.env*` (excepto `.env.example`)
- `Proyectos/Geo/app_frontend/package.json` — agregar `expo-secure-store`

## Reglas

- No romper la build de Expo (`npx expo start` debe seguir funcionando).
- No introducir dependencias pesadas — solo `expo-secure-store` y opcionalmente `axios-auth-refresh`.
- Comentar en el código **qué** flujo de auth quedó y **qué** queda pendiente (login real contra backend).
- No commitear secretos en ninguna forma, ni siquiera ejemplos reales.

## Pasos

1. **Grep exhaustivo de secretos** en `Proyectos/Geo/` (excluyendo `node_modules`, `.git`, `dist`):
   - Patrones: `eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+` (JWT), `sk-[A-Za-z0-9]{20,}` (OpenAI/DeepSeek/etc), `pk_live_`, `rk_live_` (Stripe), `AIza[0-9A-Za-z-_]{35}` (Google API), `xoxb-`, `ghp_`.
   - Generar `AUDIT_SECRETS.md` con ubicación de cada match (archivo:línea) y clasificación (real / dummy / ejemplo).

2. **Reemplazar `DEV_TOKEN`** en `App.tsx`:
   - Crear `src/auth/session.ts` con funciones `getToken()`, `setToken(t)`, `clearToken()` usando `expo-secure-store`.
   - Crear `src/auth/api.ts` con un cliente `axios` que inyecta `Authorization: Bearer <token>` si hay sesión.
   - En `App.tsx`: reemplazar uso directo de `DEV_TOKEN` por `await getToken()`. Si retorna `null`, mostrar pantalla de login placeholder (`<LoginScreen />` con un input "token temporal" por ahora — login real queda para después del launch).
   - Eliminar la constante `DEV_TOKEN` del código.

3. **Mover `BASE_URL` a config de Expo**:
   - Añadir a `app.config.js` (o `app.json → expo.extra`) el campo `apiUrl`.
   - En `src/config.ts` exportar `API_URL = Constants.expoConfig.extra.apiUrl`.
   - El valor cambiará en PROMPT 02 a la URL HTTPS — por ahora dejar la IP actual como fallback de dev.

4. **Borrar `.env.REAL`** del repo:
   ```bash
   git rm --cached Proyectos/Geo/.env.REAL 2>/dev/null || rm Proyectos/Geo/.env.REAL
   ```
   Añadir a `Proyectos/Geo/.gitignore`:
   ```
   .env
   .env.*
   !.env.example
   ```

5. **Git history**: verificar si `.env.REAL` tiene commits previos. Si sí, advertir en el output que hay que hacer `git filter-repo` o reescritura de historia (no ejecutar sin confirmación humana).

## Definición de hecho

- `grep -RnE 'eyJ[A-Za-z0-9_-]+\.' Proyectos/Geo/app_frontend/` devuelve **0** resultados en archivos fuente (sin contar `node_modules`).
- `npx expo start` arranca sin errores en `Proyectos/Geo/app_frontend/`.
- `AUDIT_SECRETS.md` creado en `Proyectos/Geo/` con tabla de findings.
- `.env.REAL` ya no existe; `.gitignore` lo excluye.
- `App.tsx` ya no contiene la string literal `DEV_TOKEN`.

## Output esperado

- Diff de los archivos modificados.
- `AUDIT_SECRETS.md` con findings.
- Lista explícita de secretos encontrados que **el humano debe rotar manualmente** (no los rotes tú).
- Comando exacto para borrar history si aplica.

---

# PROMPT 02 — Backend HTTPS + rotación de credenciales

## Contexto para el agente

El backend Node/TS corre en VPS Hostinger en `76.13.166.221:3000` por HTTP plano. El cliente móvil le pega con `usesCleartextTraffic: true`. Google Play aceptará esto pero marcará el pre-launch report en rojo y es mal look para usuarios.

Mario tiene acceso SSH al VPS Ubuntu. Deploy actual vía `deploy_hostinger.sh`.

**NO tocar**: el contenido funcional del backend. Solo infraestructura (reverse proxy, TLS, env).

## Objetivo

Servir el backend por HTTPS con dominio propio, rotar todas las credenciales comprometidas en `.env.REAL`, y actualizar el cliente para usar la nueva URL.

## Scope / archivos

- VPS: nuevo `Caddyfile` o bloque nginx para reverse proxy TLS.
- `Proyectos/Geo/.env.example` — regenerar con todas las keys pero sin valores.
- `Proyectos/Geo/docker-compose.yml` — exponer solo a `127.0.0.1:3000`, no al público.
- `Proyectos/Geo/app_frontend/app.config.js` — nueva `apiUrl`.
- `Proyectos/Geo/app_frontend/app.json` — `usesCleartextTraffic: false`.

## Reglas

- Usar Caddy (1 archivo de config, TLS automático vía Let's Encrypt) salvo que el VPS ya tenga nginx en producción.
- Subdominio sugerido: `api.geoos.app` (Mario tiene que crear el DNS A record apuntando a `76.13.166.221` antes de correr Caddy).
- No hacer el DNS el agente — generar instrucciones para Mario.

## Pasos

1. **Generar instrucciones DNS** para Mario:
   - Registro A: `api.geoos.app` → `76.13.166.221`
   - TTL: 300
   - Esperar propagación (usar `dig api.geoos.app +short` para verificar).

2. **Generar `Caddyfile`** en `Proyectos/Geo/infra/Caddyfile`:
   ```
   api.geoos.app {
       reverse_proxy 127.0.0.1:3000
       encode gzip
       header {
           Strict-Transport-Security "max-age=31536000"
           X-Content-Type-Options "nosniff"
           Referrer-Policy "strict-origin-when-cross-origin"
       }
   }
   ```

3. **Generar script de instalación** `Proyectos/Geo/infra/install_caddy.sh`:
   ```bash
   #!/usr/bin/env bash
   set -euo pipefail
   sudo apt-get update
   sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
   curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt-get update
   sudo apt-get install -y caddy
   sudo cp /path/to/Caddyfile /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   ```

4. **Actualizar `docker-compose.yml`** para bindear solo a loopback:
   - Cambiar `ports: - "3000:3000"` por `ports: - "127.0.0.1:3000:3000"`.

5. **Regenerar `.env.example`** con **todas** las llaves que aparecen en `.env.REAL` pero con valores `CHANGE_ME` o descriptores (`<your_openrouter_key>`). Esta es la referencia que Mario va a llenar en el VPS.

6. **Actualizar cliente móvil**:
   - `app.config.js`: `extra.apiUrl = "https://api.geoos.app"`
   - `app.json`: `android.usesCleartextTraffic = false`
   - Eliminar cualquier IP literal `76.13.166.221` del source cliente.

7. **Checklist de rotación de secretos** en `ROTATE_SECRETS.md` (para Mario, no automatizable):
   - DeepSeek API key → https://platform.deepseek.com — regenerar + actualizar VPS.
   - OpenRouter key → https://openrouter.ai — regenerar + actualizar VPS.
   - Groq key → https://console.groq.com — regenerar + actualizar VPS.
   - ElevenLabs key → https://elevenlabs.io — regenerar + actualizar VPS.
   - Stripe keys (si hay) → rotar en dashboard Stripe.
   - JWT signing secret del backend → regenerar y revocar todas las sesiones.
   - Cualquier webhook secret / API interno.

## Definición de hecho

- `https://api.geoos.app/health` (o el endpoint healthcheck existente) responde 200 con cert válido.
- `curl http://76.13.166.221:3000/` falla (puerto ya no público).
- `Proyectos/Geo/app_frontend/app.json` tiene `usesCleartextTraffic: false`.
- `grep -RnE '76\.13\.166\.221' Proyectos/Geo/app_frontend/src/` devuelve 0 resultados.
- `ROTATE_SECRETS.md` listado completo generado.

## Output esperado

- `Caddyfile` + `install_caddy.sh` listos para copiar al VPS.
- `.env.example` actualizado.
- Diff del cliente móvil.
- Checklist de acciones manuales para Mario, con URLs directas de los dashboards.

---

# PROMPT 03 — Alineación de configuración Expo

## Objetivo

Hacer que `app.json` local coincida con la identidad con la que se publicará la app en Play Store. El APK actual fue compilado con una config diferente a la que vive en el repo — eso se arregla aquí.

## Scope / archivos

- `Proyectos/Geo/app_frontend/app.json` → reemplazar por `app.config.js` (permite lógica y env).
- `Proyectos/Geo/app_frontend/eas.json` → crear si no existe.
- `Proyectos/Geo/app_frontend/assets/` → verificar icon.png, splash-icon.png, adaptive-icon.png existen.

## Reglas

- `package: com.geoos.app` no cambia (ya está en Play Store como identidad).
- `versionCode` se sube a 2 (vamos a publicar un build nuevo, distinto del APK dev).
- `version: "1.0.0"` se mantiene para la primera release.

## Pasos

1. **Crear `app.config.js`** reemplazando `app.json`:
   ```js
   export default ({ config }) => ({
     ...config,
     name: "GEO OS",
     slug: "geo-os",
     version: "1.0.0",
     orientation: "portrait",
     icon: "./assets/icon.png",
     userInterfaceStyle: "dark",
     newArchEnabled: true,
     splash: {
       image: "./assets/splash-icon.png",
       resizeMode: "contain",
       backgroundColor: "#0a0a0a"
     },
     ios: {
       supportsTablet: false,
       bundleIdentifier: "com.geoos.app"
     },
     android: {
       package: "com.geoos.app",
       versionCode: 2,
       usesCleartextTraffic: false,
       softwareKeyboardLayoutMode: "resize",
       permissions: [
         "android.permission.RECORD_AUDIO",
         "android.permission.MODIFY_AUDIO_SETTINGS",
         "android.permission.INTERNET"
       ],
       adaptiveIcon: {
         foregroundImage: "./assets/adaptive-icon.png",
         backgroundColor: "#0a0a0a"
       },
       edgeToEdgeEnabled: true
     },
     extra: {
       apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.geoos.app",
       eas: { projectId: "84da174a-8330-4f96-b712-b05f91ac8b44" }
     },
     sdkVersion: "54.0.0",
     platforms: ["ios", "android"]
   });
   ```

2. **Quitar permisos innecesarios**: el APK actual pide `READ_EXTERNAL_STORAGE` y `WRITE_EXTERNAL_STORAGE`. Para Android 13+ estos no aplican y disparan preguntas de Play Store ("¿para qué los usas?"). Eliminarlos salvo que el código realmente los necesite — verificar con grep `FileSystem` en `App.tsx` si se graba fuera del sandbox de la app.

3. **Crear `eas.json`**:
   ```json
   {
     "cli": { "version": ">= 5.9.0" },
     "build": {
       "production": {
         "android": {
           "buildType": "app-bundle",
           "autoIncrement": true
         }
       },
       "preview": {
         "distribution": "internal",
         "android": { "buildType": "apk" }
       }
     },
     "submit": {
       "production": {
         "android": {
           "track": "internal"
         }
       }
     }
   }
   ```

4. **Verificar assets**: listar contenido de `assets/` y reportar si falta alguno:
   - `icon.png` (1024×1024 mínimo)
   - `adaptive-icon.png` (1024×1024)
   - `splash-icon.png`
   - `favicon.png` (web)

## Definición de hecho

- `app.json` eliminado; `app.config.js` en su lugar.
- `eas.json` creado con profile `production` generando AAB.
- `eas build --platform android --profile production --dry-run` no reporta errores de config.
- Lista de assets faltantes (si los hay) documentada.

## Output esperado

- Archivos generados.
- Output del `--dry-run` de EAS.
- Lista de assets a generar en PROMPT 07 si faltan.

---

# PROMPT 04 — EAS Build de producción (AAB firmado)

## Contexto para el agente

Ejecutar el build de producción en EAS. Esto requiere estar logueado en EAS CLI con la cuenta dueña del projectId `84da174a-8330-4f96-b712-b05f91ac8b44`. EAS maneja la keystore automáticamente (lo que significa: **NO perder el acceso a esa cuenta EAS** — es la identidad de firma de la app para siempre).

## Objetivo

Producir un `.aab` firmado de producción, listo para subir a Play Console.

## Scope / archivos

- `Proyectos/Geo/app_frontend/` (cwd del build)
- Artefacto de salida: `build.aab` en `Proyectos/Geo/builds/`.

## Reglas

- **No** ejecutar `eas credentials` con `--clear` ni nada que resetee la keystore. Si Play Store detecta cambio de keystore, rechaza el upload y **no hay recuperación**.
- Confirmar que `eas whoami` coincide con el owner del project antes de buildear.

## Pasos

1. Verificar setup:
   ```bash
   cd Proyectos/Geo/app_frontend
   npx eas-cli --version
   npx eas-cli whoami
   npx eas-cli project:info
   ```
   El `projectId` reportado tiene que ser `84da174a-8330-4f96-b712-b05f91ac8b44`. Si no, **PARAR** y avisar.

2. Asegurar keystore:
   ```bash
   npx eas-cli credentials --platform android
   ```
   Si pregunta por generar keystore nueva, responder **no** si ya existe (revisar output). El APK previo se firmó con alguna keystore — idealmente reutilizarla. Si EAS dice que no hay keystore registrada y el APK fue firmado fuera de EAS, documentar el problema y pedir decisión humana (aceptar que el build EAS usará keystore nueva = no se puede actualizar el APK anterior, solo se publica el build EAS desde cero).

3. Correr build:
   ```bash
   mkdir -p Proyectos/Geo/builds
   npx eas-cli build --platform android --profile production --non-interactive
   ```

4. Cuando termine (5-20 min, corre en la nube de EAS), descargar:
   ```bash
   npx eas-cli build:list --platform android --limit 1 --json > last_build.json
   # extraer artifactUrl, descargar con curl
   curl -L <artifactUrl> -o Proyectos/Geo/builds/geo-os-v1.0.0-vc2.aab
   ```

5. Verificar AAB localmente:
   ```bash
   unzip -l Proyectos/Geo/builds/geo-os-v1.0.0-vc2.aab | head -30
   ```
   Debe mostrar `BundleConfig.pb`, `base/`, `META-INF/`.

## Definición de hecho

- Archivo `.aab` descargado en `Proyectos/Geo/builds/`.
- Tamaño esperado 30-60 MB.
- `unzip -l` muestra estructura válida de AAB.
- Log de build guardado como `Proyectos/Geo/builds/build.log`.

## Output esperado

- Ruta del AAB.
- Versión y versionCode confirmados.
- Warnings del build listados (si los hay).
- Confirmación de que la keystore usada es la esperada (fingerprint).

---

# PROMPT 05 — Smoke test del AAB

## Objetivo

Convertir el AAB a APK universal para instalar en un dispositivo y verificar que no crashea al arranque, pide permisos correctamente, y conecta al backend HTTPS.

## Scope

- Tooling: `bundletool` (Google) — descarga en `Proyectos/Geo/tools/`.
- Dispositivo: emulador Android (API 34) o device físico con USB debugging.

## Pasos

1. Descargar bundletool:
   ```bash
   mkdir -p Proyectos/Geo/tools
   curl -L -o Proyectos/Geo/tools/bundletool.jar \
     https://github.com/google/bundletool/releases/latest/download/bundletool-all.jar
   ```

2. Generar APKs universal:
   ```bash
   java -jar Proyectos/Geo/tools/bundletool.jar build-apks \
     --bundle=Proyectos/Geo/builds/geo-os-v1.0.0-vc2.aab \
     --output=Proyectos/Geo/builds/geo-os.apks \
     --mode=universal
   ```

3. Instalar en device/emulador:
   ```bash
   java -jar Proyectos/Geo/tools/bundletool.jar install-apks \
     --apks=Proyectos/Geo/builds/geo-os.apks
   ```

4. Ejecutar smoke test con `adb`:
   ```bash
   adb shell am start -n com.geoos.app/.MainActivity
   adb logcat -d | grep -E "(com.geoos.app|ReactNative|Expo)" > Proyectos/Geo/builds/smoke.log
   ```

5. Validaciones:
   - App abre sin crash (no aparece "keeps stopping").
   - Pantalla inicial renderiza (splash → login/home).
   - Al primer uso de mic, sistema pide permiso.
   - Request al backend HTTPS responde 200 (monitorear logcat).
   - Screenshot automático:
     ```bash
     adb shell screencap -p /sdcard/smoke.png
     adb pull /sdcard/smoke.png Proyectos/Geo/builds/smoke.png
     ```

## Definición de hecho

- `smoke.log` sin stacktraces de crash.
- `smoke.png` muestra la app corriendo.
- Request de red a `api.geoos.app` visible en logcat con status 200.

## Output esperado

- `smoke.log`, `smoke.png`, y un checklist de validaciones marcadas (ok/fail) en `SMOKE_TEST.md`.
- Si hay fallos, stacktraces destacados y diagnóstico propuesto.

---

# PROMPT 06 — Privacy policy + hosting público

## Objetivo

Generar una política de privacidad HTML que refleje exactamente lo que la app recolecta, y publicarla en una URL pública estable. Play Store requiere URL pública no autenticada.

## Scope

- Generar `Proyectos/Geo/infra/privacy/index.html` (ES + EN).
- Servir en `https://geoos.app/privacy` (usando el mismo Caddy del PROMPT 02 o un bucket estático).

## Pasos

1. **Inventario real de datos recolectados** — grepear en `Proyectos/Geo/app_frontend/` y `Proyectos/Geo/`:
   - ¿Qué endpoints del backend reciben datos del usuario?
   - ¿Se envía audio al backend? (probablemente sí, por Expo AV + VAD)
   - ¿Se guardan transcripciones? ¿Se borran? ¿Cuándo?
   - ¿Se usa algún servicio tercero con los datos? (OpenRouter, DeepSeek, ElevenLabs, etc. — cada uno recibe datos del usuario).
   - ¿Hay analytics? (buscar `segment`, `amplitude`, `mixpanel`, `firebase/analytics`).

2. **Generar `privacy/index.html`** con secciones:
   - Qué recolectamos (audio voz, texto prompts, token dispositivo, logs errores).
   - Por qué (procesar comandos de voz, generar respuestas IA).
   - A quién se lo enviamos (lista exacta de subprocesadores: OpenAI/DeepSeek/OpenRouter/Groq/ElevenLabs — lo que aplique).
   - Cuánto tiempo lo guardamos.
   - Derechos del usuario (acceso, borrado, portabilidad — GDPR/LGPD Chile).
   - Contacto: email de Mario.
   - Fecha última actualización.

3. **Idiomas**: versión ES (primary) y EN (secondary). Carpeta `privacy/es/` y `privacy/en/`, `index.html` con redirect por `Accept-Language`.

4. **Hosting**:
   - Añadir bloque al `Caddyfile`:
     ```
     geoos.app {
         root * /var/www/geoos
         file_server
         encode gzip
     }
     ```
   - `scp -r Proyectos/Geo/infra/privacy/ root@76.13.166.221:/var/www/geoos/privacy/`

## Definición de hecho

- `https://geoos.app/privacy` responde 200 con HTML legible.
- Contiene todos los subprocesadores reales (verificados contra el código).
- Incluye email de contacto válido.

## Output esperado

- Archivos HTML generados.
- Comando de deploy.
- URL final confirmada.
- Lista de subprocesadores que se deben reportar en el **Data Safety form** de Play Console (esto alimenta PROMPT 09).

---

# PROMPT 07 — Assets gráficos para Play Store

## Objetivo

Generar todos los recursos gráficos que Play Console exige, en los tamaños exactos, a partir del material existente en `Ideas/`.

## Scope

Salida en `Proyectos/Geo/infra/store-assets/`.

## Assets requeridos por Google Play

| Asset | Tamaño | Formato | Obligatorio |
|---|---|---|---|
| App icon | 512 × 512 | PNG 32-bit | Sí |
| Feature graphic | 1024 × 500 | JPG/PNG | Sí |
| Phone screenshots | mín. 2, máx. 8 | 1080 × 1920 – 1080 × 2340 | Sí |
| 7-inch tablet | opcional | 1200 × 1920 | No |
| 10-inch tablet | opcional | 1600 × 2560 | No |
| Promo video | opcional, YouTube URL | — | No |

## Pasos

1. **Icon 512×512**:
   - Fuente: `Ideas/GEO_OS_Logo_v1.png`.
   - Usar `sharp` (Node) o `imagemagick`:
     ```bash
     magick Ideas/GEO_OS_Logo_v1.png -resize 512x512 \
       -background "#0a0a0a" -gravity center -extent 512x512 \
       Proyectos/Geo/infra/store-assets/icon-512.png
     ```
   - Verificar que no tenga transparencia en bordes (Play rechaza).

2. **Feature graphic 1024×500**:
   - Fuente: `Ideas/GEO_OS_Ad_Horizontal_v1.png`.
   - Crop/resize a 1024×500, texto legible a 40% scale.
   - Output: `feature-graphic.jpg`.

3. **Screenshots 1080×1920** — 4-6 pantallas de la app corriendo:
   - Usar el emulador de PROMPT 05.
   - Escenas: splash, pantalla principal, asistente de voz activo, chat widget, config.
   - Comando:
     ```bash
     adb shell screencap -p /sdcard/sc-01.png
     adb pull /sdcard/sc-01.png Proyectos/Geo/infra/store-assets/screenshots/
     ```
   - Post-procesamiento: no añadir marcos de dispositivo (mejor look sin frame).

4. **Validación**:
   ```bash
   for f in Proyectos/Geo/infra/store-assets/*.png; do
     identify -format "%f: %wx%h\n" "$f"
   done
   ```
   Confirmar que todos los tamaños coinciden con la tabla.

## Definición de hecho

- 1 icon, 1 feature graphic, mínimo 4 screenshots — todos en dimensiones exactas.
- Peso total < 15 MB (Play tiene límite blando).
- Reporte visual: `STORE_ASSETS.md` con tabla + preview.

## Output esperado

- Carpeta `store-assets/` completa.
- `STORE_ASSETS.md` con checklist.

---

# PROMPT 08 — Copy de ficha Play Store (ES + EN)

## Objetivo

Redactar todos los textos de la ficha en español e inglés, respetando límites estrictos de caracteres.

## Límites Google Play

- **Título de app**: máx 30 caracteres.
- **Descripción corta**: máx 80 caracteres.
- **Descripción completa**: máx 4000 caracteres.
- **Notas de la versión**: máx 500 caracteres por release.

## Pasos

1. **Brief de la app** (para guiar el copy): leer `00_nucleus/NUCLEO_DE_MARIO_FULL.md` y `Ideas/GEO_MASTER_COMPLETO.md` para extraer el **valor real de la app** según Mario. No inventar features que no existen — solo lo que el `App.tsx` actual hace: asistente de voz con VAD, chat con IA, grabación de audio, conexión a backend propio.

2. **Generar `Proyectos/Geo/infra/store-copy/es-419.md`**:
   ```markdown
   # Título (≤30)
   GEO OS – Asistente de Voz IA

   # Descripción corta (≤80)
   Tu asistente personal con IA que escucha, entiende y responde al instante.

   # Descripción completa (≤4000)
   [cuerpo — enfocar en: voz natural con detección de actividad, respuesta IA,
    privacidad, sin cuenta obligatoria, hecho por un solopreneur en Chile…]

   # Notas de versión 1.0.0 (≤500)
   Primera versión pública. Asistente de voz en español y francés.
   ```

3. **Generar `en-US.md`** con traducción (no traducción literal — adaptada a mercado anglo: menos "solopreneur", más "independent developer").

4. **Keyword research básico**: lista de 10-15 keywords relevantes que deberían aparecer en la descripción larga:
   - asistente voz, IA, chatbot, voz a texto, español, francés, Chile, privado, sin cuenta, inteligencia artificial, productividad, GPT, Claude, ElevenLabs, voice assistant.

5. **Validación programática**:
   ```bash
   wc -m Proyectos/Geo/infra/store-copy/es-419.md  # contar caracteres por sección
   ```

## Definición de hecho

- Ambos archivos MD generados.
- Todos los límites respetados (validado con `wc -m`).
- No hay claims falsos (no decir "encriptación end-to-end" si no la hay).
- Todas las features mencionadas están **implementadas** en el código actual.

## Output esperado

- `es-419.md` y `en-US.md`.
- Log del chequeo de caracteres.
- Lista de keywords usadas y dónde aparecen en el texto.

---

# PROMPT 09 — Dossier Data Safety + Content Rating

## Objetivo

Preparar las respuestas al cuestionario de **Data Safety** y al **Content Rating (IARC)** de Play Console. Google los pregunta uno por uno en la consola — hay que llegar con las respuestas decididas, no improvisarlas.

## Scope

Salida: `Proyectos/Geo/infra/store-compliance/data-safety.md` y `content-rating.md`.

## Pasos

1. **Data Safety — a partir del inventario de PROMPT 06**, completar esta matriz:

   | Tipo de dato | ¿Recolectado? | ¿Compartido con terceros? | ¿Efímero u opcional? | ¿Para qué? |
   |---|---|---|---|---|
   | Audio (grabaciones voz) | | | | |
   | Mensajes texto (prompts) | | | | |
   | Identificador de dispositivo | | | | |
   | Dirección IP | | | | |
   | Logs de errores (crashlytics) | | | | |
   | Email / cuenta | | | | |
   | Ubicación | | | | |

   Rellenar con datos **reales**, no aspiracionales. Si se envía audio al backend y el backend lo pasa a OpenAI Whisper o DeepSeek → **sí se comparte**.

2. **Responder las preguntas clave del form**:
   - ¿Los datos están cifrados en tránsito? (TLS = sí, gracias a PROMPT 02).
   - ¿El usuario puede pedir borrado? (dirección email de contacto en privacy policy).
   - ¿Tu app cumple con las [Políticas para Familias](https://play.google.com/console/about/programs/designedforfamilies/)? (probablemente no — es asistente de IA, no familia).

3. **Content Rating (IARC)** — responder el cuestionario:
   - Violencia: no.
   - Contenido sexual: no.
   - Lenguaje adulto: depende — si la IA puede generar texto fuerte por prompt del usuario, marcar "posible lenguaje adulto generado por usuarios".
   - Drogas/apuestas: no.
   - Interacciones entre usuarios: no (si no hay chat entre users).
   - Ubicación compartida: no.
   - Contenido generado por IA: **sí** (hay que marcar esto explícitamente — Google lo pregunta desde 2024).

   Rating esperado: **Teen / Adolescentes (13+)** por contenido IA.

4. **Target audience**:
   - Rango edad: 18+ (más conservador por IA) o 13+ si el copy no toca temas sensibles.
   - NO marcar "niños" bajo ninguna circunstancia — dispara reglas COPPA/Kids Families complicadísimas.

## Definición de hecho

- `data-safety.md` con matriz completa verificada contra código.
- `content-rating.md` con respuestas justificadas.
- Target audience decidido y documentado.

## Output esperado

- Ambos archivos.
- Si algún dato recolectado no tenía categoría clara, flaggearlo para decisión humana.

---

# PROMPT 10 — Upload y promoción a Producción

## Contexto

Este prompt se ejecuta **después** de que Google active la cuenta Play Console (días 1-5 después del pago del 29.04). Es mayormente manual — el agente asiste pero Mario hace clicks en la consola.

## Pasos

1. **En Play Console UI** (manual):
   - Crear app → `com.geoos.app` (ojo: irreversible).
   - Default language: ES.
   - App or game: App.
   - Free or paid: Free (se puede cambiar después).

2. **Completar tabs** (usando los outputs de PROMPTS 06-09):
   - Store listing: copy de PROMPT 08 + assets de PROMPT 07.
   - Privacy policy URL: `https://geoos.app/privacy` (de PROMPT 06).
   - App access: si requiere login → dar credenciales de prueba.
   - Ads: "No ads" (confirmar).
   - Content rating: completar IARC con respuestas de PROMPT 09.
   - Target audience: 18+ (o 13+ según decisión).
   - Data safety: PROMPT 09.
   - Government apps: No.

3. **Upload AAB**:
   - Ir a **Testing → Internal testing**.
   - Create new release.
   - Upload `Proyectos/Geo/builds/geo-os-v1.0.0-vc2.aab`.
   - Release name: `1.0.0 (2)`.
   - Release notes: copy de PROMPT 08.

4. **Tester internos**:
   - Añadir email de Mario como tester.
   - Link opt-in generado → abrir en el teléfono, aceptar, instalar via Play Store.
   - Verificar que funciona (es el smoke test real en device con Play).

5. **Promoción**:
   - Cuando internal testing pase OK → **Closed testing** → **Production**.
   - Production review: 3-7 días (primera vez más).

## Definición de hecho

- App visible en Play Console.
- Release en Internal testing activo.
- Mario instaló vía Play Store y verificó.
- Production submitted for review.

## Output esperado

- Screenshots de cada paso (o video loom).
- Tracking del estado de revisión.

---

# PROMPT 11 — Post-launch: Sentry + pre-launch report

## Objetivo

Una vez submitted, preparar monitoreo para cuando llegue tráfico real.

## Pasos

1. **Sentry Expo**:
   ```bash
   cd Proyectos/Geo/app_frontend
   npx expo install sentry-expo @sentry/react-native
   ```
   - Crear proyecto en sentry.io, obtener DSN.
   - Añadir a `app.config.js`:
     ```js
     extra: { sentryDsn: process.env.SENTRY_DSN }
     ```
   - Wrap `App` con `Sentry.Native.wrap(App)`.
   - Rebuild con EAS (versionCode 3).

2. **Pre-launch report de Google**:
   - Play Console corre automáticamente los tests en dispositivos reales.
   - Resultado llega en 1-2 horas después del upload.
   - Revisar: crashes, accessibility issues, security findings.

3. **Respuesta a findings**:
   - Si crash en dispositivo específico → reproducir, arreglar, nueva build con versionCode+1.
   - Si accessibility warning → prioridad media, no bloquea launch.
   - Si security finding (cleartext traffic, etc.) → crítico, arreglar antes de Production.

## Definición de hecho

- Sentry reportando eventos de test.
- Pre-launch report sin issues críticos.

---

# Checklist maestro de entrega

Antes del 29.04, Mario debe tener listo (lo que él hace manualmente, no el agente):

- [ ] Cuenta Gmail dedicada para Play Console (no su Gmail personal — separar).
- [ ] Tarjeta de crédito válida para los $25 USD.
- [ ] Foto de identidad lista (pasaporte o cédula) para verificación.
- [ ] Dominio `geoos.app` comprado y con DNS apuntando al VPS.
- [ ] Email de contacto dedicado (`support@geoos.app`) — puede ser alias en Gmail.
- [ ] Decidido si la app es free o paid (free es más fácil para launch).

Lo que el agente Antigravity produce antes del 29.04:

- [ ] PROMPT 01 ejecutado — source limpio de secretos, JWT removido.
- [ ] PROMPT 02 ejecutado — backend HTTPS funcionando.
- [ ] PROMPT 03 ejecutado — config Expo alineada.
- [ ] PROMPT 04 ejecutado — AAB generado.
- [ ] PROMPT 05 ejecutado — smoke test OK.
- [ ] PROMPT 06 ejecutado — privacy policy público.
- [ ] PROMPT 07 ejecutado — assets gráficos listos.
- [ ] PROMPT 08 ejecutado — copy escrito.
- [ ] PROMPT 09 ejecutado — dossier compliance listo.

El 29.04 y días siguientes:

- [ ] PROMPT 10 — upload a Play Console.
- [ ] PROMPT 11 — Sentry + pre-launch report.

---

## Notas importantes

**Sobre la keystore de EAS**: si el APK viejo (`Ideas/application-4864c737-...apk`) fue firmado con una keystore distinta a la que EAS maneja, **no se podrá actualizar como misma app**. Al subir el AAB nuevo a `com.geoos.app`, Google Play verifica la firma. Si no coincide, rechaza. En ese caso, opciones:

1. Usar la keystore vieja: exportarla, dársela a EAS con `eas credentials --platform android --action upload`.
2. Cambiar el package: usar `com.geoos.app2` en el nuevo build.
3. Aceptar que es una app nueva desde cero (lo más limpio si el APK viejo nunca fue publicado).

Como el APK viejo nunca fue publicado en Play, **opción 3 es la más limpia**. El package `com.geoos.app` queda para la build de EAS.

**Sobre el engine V4**: todo el contenido de `Ideas/` (master doc, prompts Zai, pipeline V3.1) queda intacto. No se integra al repo del cliente móvil. Se retoma en mayo como proyecto separado.

**Sobre `01_core/`**: el OS Electron de Mario no entra al Play Store (es web/desktop). Ni se toca.

---

*Documento generado 2026-04-23. Actualizar versionCode y fechas en cada iteración.*

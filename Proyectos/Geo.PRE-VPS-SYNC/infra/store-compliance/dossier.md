# Geo OS — Dossier de Compliance para Google Play
# Documento de referencia para completar los formularios de Play Console
# Última actualización: 25 Abril 2026

---

# PARTE 1 — DATA SAFETY

> Cada respuesta refleja el comportamiento **real** del código en `app_frontend/App.tsx`
> y el backend Node.js/TS. No se ha inventado ni aspirado nada.

---

## 1.1 Recopilación y compartición de datos

### ¿Tu app recopila o comparte alguno de los tipos de datos de usuario requeridos?

**Respuesta: SÍ**

---

## 1.2 Matriz de datos

| Tipo de dato | ¿Recopilado? | ¿Compartido con terceros? | ¿Opcional? | ¿Efímero? | Finalidad |
|---|---|---|---|---|---|
| **Audio / Voz** | ✅ Sí | ✅ Sí (Groq para transcripción, ElevenLabs para TTS) | No — necesario para funcionalidad core | ✅ Sí — procesado en tiempo real, no almacenado permanentemente | Funcionalidad de la app |
| **Mensajes de texto (prompts)** | ✅ Sí | ✅ Sí (DeepSeek, OpenRouter, Groq — procesamiento IA) | No — necesario para funcionalidad core | ✅ Sí — procesado en tiempo real | Funcionalidad de la app |
| **Dirección IP** | ✅ Sí | ❌ No | No — automático en conexiones HTTP | ❌ No — retenida en logs hasta 30 días | Diagnóstico y seguridad |
| **Token de sesión** | ✅ Sí | ❌ No | No — necesario para autenticación | ❌ No — persiste hasta logout | Funcionalidad de la app |
| **Logs de errores** | ✅ Sí | ❌ No (Sentry en futuro, no implementado aún) | No — automático | ❌ No — hasta 30 días | Diagnóstico |
| **Nombre / Email** | ❌ No | — | — | — | — |
| **Ubicación** | ❌ No | — | — | — | — |
| **Contactos** | ❌ No | — | — | — | — |
| **Fotos / Videos** | ❌ No | — | — | — | — |
| **Identificadores de dispositivo** | ❌ No | — | — | — | — |
| **Historial de navegación** | ❌ No | — | — | — | — |
| **Datos financieros** | ❌ No | — | — | — | — |
| **Datos de salud / fitness** | ❌ No | — | — | — | — |

---

## 1.3 Preguntas clave del formulario Data Safety

### ¿Los datos están cifrados en tránsito?
**SÍ** — Toda la comunicación app ↔ backend usa HTTPS/TLS (Caddy + Let's Encrypt).
`usesCleartextTraffic: false` en `app.config.js`.

### ¿Los datos están cifrados en reposo?
**PARCIALMENTE** — El token de sesión se almacena en `expo-secure-store`
(Android EncryptedSharedPreferences / iOS Keychain). Los logs del servidor
no tienen cifrado en reposo adicional más allá de la protección del filesystem del VPS.

### ¿Los usuarios pueden solicitar la eliminación de sus datos?
**SÍ** — Pueden contactar a `Mariohernan94500@gmail.com` y solicitar
borrado de cualquier dato asociado. Plazo de respuesta: 30 días hábiles.
Documentado en la Privacy Policy (`https://geoos.app/privacy`).

### ¿Tu app sigue la Política de Familias de Google Play?
**NO APLICA** — La app no está diseñada para niños. Target: 18+.

### ¿Tu app contiene anuncios?
**NO**

### ¿Tu app permite compras dentro de la app?
**NO** (por ahora — versión 1.0.0)

---

## 1.4 Subprocesadores (terceros que reciben datos de usuarios)

| Proveedor | Dato que recibe | Política de privacidad |
|---|---|---|
| **DeepSeek** | Texto (prompts) | https://platform.deepseek.com/privacy |
| **OpenRouter** | Texto (prompts) | https://openrouter.ai/privacy |
| **Groq** | Audio (transcripción) + Texto | https://groq.com/privacy-policy/ |
| **ElevenLabs** | Texto (para generar audio TTS) | https://elevenlabs.io/privacy |

> ⚠️ Cada proveedor tiene su propia política de retención.
> Geo OS no tiene control sobre cómo estos servicios procesan los datos
> una vez recibidos.

---

## 1.5 Resumen para copiar en Play Console

Al completar el formulario "Data Safety" en Play Console, marca:

**Tipos de datos recopilados:**
- [x] Audio — Grabaciones de voz
- [x] Otros tipos de información de la app — Mensajes de texto del usuario
- [x] Registros de fallos — Logs de errores

**¿Se comparten con terceros?**
- [x] Sí — Audio y texto se comparten con proveedores de IA para procesamiento

**¿Se transfieren datos fuera del país del usuario?**
- [x] Sí — Los proveedores IA operan en EE.UU. y otros países

**Cifrado:**
- [x] Los datos se cifran en tránsito
- [x] Los datos se pueden eliminar a solicitud del usuario

---
---

# PARTE 2 — CONTENT RATING (IARC)

---

## 2.1 Cuestionario IARC — Respuestas

| Pregunta | Respuesta | Justificación |
|---|---|---|
| ¿La app contiene violencia? | **No** | Sin contenido violento |
| ¿Violencia hacia personajes humanos? | **No** | — |
| ¿Violencia gráfica o realista? | **No** | — |
| ¿Contenido sexual o desnudez? | **No** | — |
| ¿Lenguaje soez o humor adulto? | **Sí — generado por IA** | El modelo de IA puede producir lenguaje adulto si el usuario lo solicita. No hay filtro de contenido explícito en v1.0.0 |
| ¿Contenido relacionado con drogas? | **No** | — |
| ¿Contenido de apuestas o gambling? | **No** | — |
| ¿Temas de miedo / horror? | **No** | — |
| ¿Promoción de tabaco / alcohol? | **No** | — |
| ¿Interacciones entre usuarios? | **No** | Sin chat entre usuarios, solo usuario ↔ IA |
| ¿Los usuarios comparten ubicación? | **No** | — |
| ¿Permite compras digitales? | **No** | — |
| ¿Contiene contenido generado por IA? | **Sí** | La app genera respuestas de texto y audio mediante modelos de IA |
| ¿Incluye publicidad? | **No** | — |

---

## 2.2 Rating recomendado

### **PEGI 16 / ESRB Teen (13+) / USK 12+**

**Justificación:** La app no contiene contenido violento, sexual ni de apuestas.
Sin embargo, al ser un asistente de IA conversacional, existe la posibilidad
de que genere contenido con lenguaje adulto a solicitud del usuario.
Esto coloca la clasificación en el rango **Teen / Adolescentes**.

---

## 2.3 Target Audience — Configuración

| Campo | Valor |
|---|---|
| Rango de edad objetivo | **18+** |
| ¿Diseñada para niños? | **NO** — Nunca marcar esto |
| ¿Cumple políticas de familias? | **NO** — No aplica |
| ¿Contiene anuncios? | **NO** |
| ¿La app es un juego? | **NO** |
| Categoría Play Store | **Productividad** o **Herramientas** |

> ⚠️ **CRÍTICO:** NO marcar ningún rango que incluya menores de 13 años.
> Hacerlo activa las reglas COPPA / Kids Families y requiere cumplimiento
> adicional extremadamente complejo. Mantener en 18+.

---
---

# PARTE 3 — CHECKLIST PRE-SUBMISSION

---

## 3.1 Cuenta y verificación

- [ ] Cuenta Gmail dedicada creada (no personal)
- [ ] Google Play Console pagada ($25 USD)
- [ ] Verificación de identidad completada (1-5 días)
- [ ] País de la cuenta: Chile

## 3.2 Configuración de la app

- [ ] Package name: `com.geoos.app`
- [ ] Default language: Español
- [ ] App category: Productividad
- [ ] Free / Paid: Free
- [ ] App or Game: App

## 3.3 Store Listing (ficha)

- [ ] Título (≤30 chars): ✅ en `store-copy/listing.md`
- [ ] Descripción corta (≤80 chars): ✅ en `store-copy/listing.md`
- [ ] Descripción completa (≤4000 chars): ✅ en `store-copy/listing.md`
- [ ] Icon 512×512: ✅ en `store-assets/icon-512.png`
- [ ] Feature graphic 1024×500: ✅ en `store-assets/feature-graphic.png`
- [ ] Screenshots (mín. 2, 1080×1920): ⬜ **PENDIENTE** — necesita emulador o device
- [ ] Idiomas configurados: ES (primary), EN, FR

## 3.4 Compliance y políticas

- [ ] Privacy Policy URL: `https://geoos.app/privacy`
- [ ] Privacy Policy accesible sin login: ✅ en `privacy/index.html`
- [ ] Data Safety completado: respuestas en este documento (Parte 1)
- [ ] Content Rating (IARC) completado: respuestas en este documento (Parte 2)
- [ ] Target audience: 18+
- [ ] Ads declaration: No ads
- [ ] Government app: No

## 3.5 Release técnico

- [ ] AAB firmado por EAS: ⬜ **PENDIENTE** — PROMPT 04
- [ ] versionCode ≥ 2 (mayor que cualquier APK previo)
- [ ] `usesCleartextTraffic: false`
- [ ] Backend HTTPS operativo: ⬜ **PENDIENTE** — dominio + Caddy
- [ ] Secretos rotados: ⬜ **PENDIENTE** — ver `ROTATE_SECRETS.md`
- [ ] Smoke test del AAB: ⬜ **PENDIENTE** — PROMPT 05

## 3.6 Post-upload

- [ ] Internal testing release creado
- [ ] Tester (email de Mario) añadido
- [ ] Opt-in link generado y probado en device
- [ ] Pre-launch report revisado (automático por Google, 1-2h)
- [ ] Promoción a Production

---

## 3.7 Resumen de bloqueadores antes del 29 Abril

| Bloqueador | Responsable | Estado |
|---|---|---|
| Dominio `geoos.app` + DNS | Mario | ⬜ Pendiente |
| Rotación de 10 secretos | Mario | ⬜ Pendiente |
| Instalación Caddy en VPS | Mario | ⬜ Pendiente (scripts listos en `infra/`) |
| EAS Build AAB | Agente + Mario (login EAS) | ⬜ Pendiente |
| Screenshots de la app | Mario (device/emulador) | ⬜ Pendiente |
| Pago Play Console $25 | Mario | ⬜ Pendiente (deadline 29 abril) |

---

*Generado: 25 Abril 2026 | Geo OS Compliance Dossier*

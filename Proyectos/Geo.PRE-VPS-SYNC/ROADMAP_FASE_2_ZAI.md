# Hoja de Ruta: Integración Z.ai y Motor V4 (Fase 2)

Con la publicación de la App Móvil base completada, el foco se traslada ahora al backend central y a la evolución de GEO como una **fábrica de software autónoma**. Este documento desglosa el "Prompt Maestro" de Z.ai en tareas concretas y procesables.

---

## 🎯 Visión General de la Fase 2
Convertir a GEO de un "Asistente Conversacional" a una plataforma capaz de **escuchar una idea, programar una aplicación completa (frontend + backend), lanzarla en un servidor, monitorearla en tiempo real y monetizarla**.

## 🛠️ Hito 1: Construcción del Cerebro (Módulos Base)
La arquitectura requiere refactorizar el backend actual (Node.js/Express) en submódulos especializados.

- [ ] **Módulo de IA (`modules/ai/index.js`):**
  - Implementar adaptadores para múltiples LLMs.
  - `runOpenRouter()` para diseño arquitectónico (Mixtral 8x7b).
  - `runGroq()` para generación masiva de código (Llama3 70b).
  - `runDeepSeek()` como fallback secundario.
- [ ] **Módulo de Base de Datos (`modules/database/sqlite.js`):**
  - Implementar SQLite nativo.
  - Migrar tablas esenciales: `users`, `apps` (registro de apps generadas), `tenants`.
- [ ] **Módulo de Seguridad (`modules/auth/index.js`):**
  - Implementación robusta de JWT y control de acceso (RBAC).

## 🏭 Hito 2: El Generador de Software (El núcleo de Z.ai)
Este es el corazón de la automatización donde la IA escribe código funcional.

- [ ] **Módulo Generador (`modules/generator/index.js`):**
  - Lógica para recibir un prompt del usuario y desglosarlo.
  - Escritura de archivos en disco (crear carpetas `apps/[nombre-app]/frontend` y `backend`).
  - Capacidad de inyectar plantillas base (Express + HTML/CSS/JS).
- [ ] **Módulo de Despliegue Local (`modules/scaling/pm2.js`):**
  - Integración programática con PM2 para ejecutar `npm start` en la carpeta de la app recién generada.
  - Asignación dinámica de puertos (ej. 3001, 3002).
- [ ] **Módulo de Monitoreo (`modules/monitoring/socket.js`):**
  - Conexión Socket.io para enviar en tiempo real métricas de uso (CPU, RAM de cada app) al frontend.

## 🖥️ Hito 3: La Interfaz de Control (Dashboard Web)
Un centro de comando visual para interactuar con Z.ai y gestionar la granja de aplicaciones.

- [ ] **Desarrollo de `public/dashboard.html`:**
  - Panel izquierdo: Chat/Consola de comandos hacia Z.ai (Voz y Texto).
  - Panel derecho: Lista de aplicaciones activas (generadas por Z.ai) con botones de Start/Stop/Restart y gráficos de consumo.
- [ ] **Integración de Voz (`modules/voice/`):**
  - Conectar ElevenLabs API para que Z.ai confirme verbalmente ("Iniciando despliegue de tu aplicación...").
  - Integrar *Web Speech API* en el navegador para dictarle comandos sin teclear.

## 💳 Hito 4: Economía y Multi-tenant (Monetización)
Preparar la plataforma para escalar como un producto SaaS.

- [ ] **Integración de Pagos (`modules/payments/stripe.js`):**
  - Configuración de Webhooks de Stripe.
  - Bloqueo de generación de código si el usuario no tiene suscripción activa.
- [ ] **Despliegues en la nube (Vercel/Railway):**
  - Pipeline opcional para tomar la carpeta `apps/[nombre-app]` y empujarla automáticamente a Vercel vía API, dándole una URL pública real al usuario final.

## 🚀 Hito 5: La Visión V4 (Marketplace & Blockchain)
El nivel final del Master Prompt.

- [ ] **Marketplace Interno:** 
  - Interfaz donde los usuarios pueden comprar/vender las apps que generaron.
- [ ] **Licencias NFT (Polygon):**
  - Despliegue de un contrato inteligente (`ERC-721`) vía Hardhat.
  - Al vender una app, Z.ai emite un NFT que representa la licencia de uso y propiedad del código, almacenando el hash en IPFS (Pinata).

---

### 📝 Próximo paso sugerido para arrancar en Mayo
Cuando estemos listos para empezar, el primer paso será **hacer un "freeze" de la v1.0** e iniciar la refactorización estructurada de las carpetas bajo el esquema `geo-system/modules/...` dictado en el prompt de Z.ai.

# Historial de Cambios (Changelog) - Geo OS Master App

## [v1.0.0] - 2026-04-07

### FASE 0: Seguridad y Limpieza
- **Seguridad**: Se eliminó el token de Shopify expuesto en `EcoOrigen_Web/src/App.tsx`. Ahora usa variables de entorno `VITE_SHOPIFY_...`.
- **Limpieza**: Se añadió la función `limpiarDirectorioTemporal` en `Geotrouvetout/src/agent/voice.ts` para eliminar archivos de audio acumulados.
- **Unificación**: Se creó el script `scripts/sqlite-unify.ts` para unificar `brain.db` y `memory.db` en un solo archivo `memory.db`.

### FASE 1: Control de Tokens
- **Implementación**: Se creó `src/security/token-monitor.ts` para registrar el consumo de tokens LLM.
- **Integración**: Se inyectó el monitoreo en `src/agent/llm.ts` para registrar cada llamada a Gemini, Groq y OpenRouter.
- **Configuración**: Se añadieron límites diarios y mensuales en `src/config.ts`.
- **Herramienta**: Se creó `scripts/token-monitor.ts` para consultar el consumo desde la CLI.

### FASE 2 y 4: Memoria Unificada y Voren
- **Voren**: Se diseñó el prototipo visual de Voren en `packages/voren` con glassmorphism y conexión simulada a GeoCore.
- **Agente**: Se creó `ProductivityAgent.ts` y se registró en el orquestador central (GeoCore).

### FASE 3 y 5: Bot Consolidado y Datos Reales
- **Bot**: Se añadieron comandos `/modo_comercio`, `/modo_productividad` y `/modo_warroom` al bot de Telegram.
- **Herramienta Shopify**: Se creó e integró la tool `buscar_en_shopify` conectada al API real en `CommerceAgent.ts`.

### Estructura Monorepo
- Creación de la estructura del proyecto `maester-app` con documentación completa en `docs/`.

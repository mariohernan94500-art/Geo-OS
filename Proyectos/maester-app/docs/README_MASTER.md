# GEO OS v1 — README MASTER
**Última actualización:** Abril 2026

## Estado de las Fases

| Fase | Estado | Descripción |
|------|--------|-------------|
| **FASE 0** | ✅ Completo | Token Shopify en `.env`, temp_audio limpiado, .gitignore actualizado |
| **FASE 1** | ✅ Completo | `tokenTracker.ts` integrado en `llm.ts` — registro automático + alertas Telegram |
| **FASE 2** | ✅ Completo | `memory.ts` unificado: SQLite local + Firebase, memoria semántica, compartida entre apps |
| **FASE 3** | ✅ Completo | Bot Telegram con `/modo_geo`, `/modo_comercio`, `/modo_warroom`, `/modo_productividad`, `/tokens` |
| **FASE 4** | ✅ Completo | Voren conectado a GeoCore API con token JWT real (localStorage), tareas persistentes |
| **FASE 5** | ✅ Completo | CommerceAgent + WarRoomAgent con Shopify Admin API real (demo mode si sin token) |
| **FASE 6** | ✅ Completo | Scripts: `vps-sync.ts`, `sqlite-unify.ts`, `cleanup-audio.ts`, `token-monitor.ts` |

## Arranque del Sistema

```bash
# 1. Configurar variables de entorno
cp Geotrouvetout/.env.example Geotrouvetout/.env
# Editar .env con tus tokens reales

# 2. Unificar bases de datos (solo primera vez)
cd Geotrouvetout && npm run unify-db

# 3. Arrancar (Telegram + API)
npm run dev
```

En Windows doble-clic en `Lanzar_Master.bat`

## Comandos útiles

```bash
npm run tokens      # Ver consumo de tokens del mes
npm run sync        # Sincronizar SQLite ↔ Firestore
npm run cleanup     # Limpiar archivos de audio viejos
npm run gen-token   # Generar token JWT para Voren
```

## Comandos Telegram

| Comando | Función |
|---------|---------|
| `/modo_geo` | Asistente general (default) |
| `/modo_comercio` | Agente EcoOrigen / Shopify |
| `/modo_warroom` | Métricas y análisis de negocio |
| `/modo_productividad` | Tareas y planificación (Voren) |
| `/tokens` | Reporte de consumo del mes |
| `/borrarmemoria` | Limpiar historial del modo actual |

## Arquitectura

```
Usuario (Telegram / Voren Web / API)
        │
   GeoCore (Orquestador)
   ├── memoria.ts (SQLite + Firebase)
   ├── llm.ts (Gemini → Groq → OpenRouter)
   ├── tokenTracker.ts (registro + alertas)
   ├── CommerceAgent (Shopify real)
   └── WarRoomAgent (métricas reales)
        │
   VPS Hostinger (principal)
   Firebase Firestore (nube, sync)
```

## Próximos pasos recomendados

1. **Rotar token Shopify** — el anterior fue expuesto en código
2. **Agregar JWT_SECRET real** al `.env` antes de producción
3. **Configurar cron** en el VPS para `npm run cleanup` (diario) y `npm run sync` (horario)
4. **MercadoLibre API** — siguiente integración para CommerceAgent
5. **Reportes PDF semanales** — vía WarRoomAgent + n8n

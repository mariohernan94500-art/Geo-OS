# 🔥 AUDITORÍA COMPLETA + PLAN 13 DÍAS
## GEO OS v1 → Listo para ventas 20 de Abril 2026

---

## ✅ LO QUE ESTÁ SORPRENDENTEMENTE BIEN

Tu ecosistema está MUCHO más avanzado de lo que dice el readmefirst. Ya completaste fases que el informe anterior marcaba como pendientes:

| Componente | Estado Real | Nota |
|------------|-------------|------|
| GeoCore orquestador | ✅ Producción | Tool calling, delegación a sub-agentes, memoria inyectada |
| Cadena LLM 4 niveles | ✅ Producción | Gemini → Claude → Groq → OpenRouter con fallback automático |
| Token Tracker (FASE 1) | ✅ Completo | SQLite, alertas Telegram al 80%/100%, reporte con /tokens |
| Memoria Unificada (FASE 2) | ✅ Completo | SQLite + Firestore, memoria semántica, fuentes separadas |
| Bot Telegram multi-modo (FASE 3) | ✅ Completo | 4 modos, voz, video, rate limiting, lista blanca |
| CommerceAgent Shopify real (FASE 5) | ✅ Completo | Admin API real, métricas en CLP |
| WarRoomAgent con dashboard (FASE 5) | ✅ Completo | Datos Shopify + token usage en tiempo real |
| API REST con JWT + voz | ✅ Completo | /api/chat, /api/voice/process, concurrencia, timeout 35s |
| Voren conectado a GeoCore (FASE 4) | ⚠️ Parcial | Frontend OK pero tareas en localStorage |
| EcoOrigen Web + VITRA | ⚠️ Parcial | Rutas OK, CSS profesional, falta página mascotas |

**Conclusión: El backend está en un 85%. El gap está en el frontend de ventas y en la falta de un agente orientado al CLIENTE (no al admin).**

---

## 🚨 PROBLEMAS CRÍTICOS (para el 20 de Abril)

### 1. NO HAY AGENTE DE VENTAS PARA CLIENTES
GeoCore tiene CommerceAgent y WarRoomAgent, pero ambos son para TI (el admin). Ningún agente está diseñado para hablar con CLIENTES que visitan ecoorigenchile.com. **Necesitas un SalesAgent.**

### 2. TOKEN SHOPIFY SIGUE EXPUESTO
VitraTienda.tsx (línea 7) todavía tiene `SHOPIFY_TOKEN_REMOVED` hardcodeado. Ya te entregué el fix — necesitas aplicarlo Y rotar el token en Shopify.

### 3. NO HAY ENDPOINT PÚBLICO PARA CHAT WEB
/api/chat requiere JWT (requireAuth). Los visitantes del sitio no tienen JWT. Necesitas un endpoint público con rate limiting por IP para el widget de chat.

### 4. PÁGINA DE MASCOTAS NO EXISTE
Tu producto estrella (vi las fotos de Bruno, Rocky, los sets en caja kraft) no tiene página en el sitio. Ya te entregué VitraMascotas.tsx.

### 5. WHATSAPP INCORRECTO
Todos los archivos tienen `56900000000` como número de WhatsApp. Necesita ser tu número real.

---

## 🏗️ NUEVOS AGENTES NECESARIOS

### Agente 1: SalesAgent (NUEVO — para clientes en el sitio web)
```
Propósito: Atender visitantes de ecoorigenchile.com
Canal: Widget de chat embebido en el sitio
Acceso: Público (sin JWT), rate limited por IP
Conocimiento: Catálogo VITRA completo, precios CLP, envíos, proceso mascota
Personalidad: Cálido, vendedor, chileno natural
```

### Agente 2: MediaAgent (NUEVO — para gráficas e imágenes del sitio)
```
Propósito: Generar descripciones de producto, copy para redes, alt text para SEO
Canal: Telegram modo /modo_media o API
Acceso: Solo admin (JWT)
Conocimiento: Identity de marca VITRA, fotos existentes, tono de voz
```

### Agentes existentes (mejorar):
- **CommerceAgent**: Agregarle conocimiento de VITRA (no solo Shopify genérico)
- **WarRoomAgent**: Agregar métricas web (visitas, conversiones) cuando GA esté activo

---

## 📋 PLAN DÍA POR DÍA — 13 DÍAS

### SEMANA 1: FUNDAMENTOS (8-13 Abril)

**Día 1-2 (8-9 Abril) — SEGURIDAD + FIXES**
- [ ] Rotar token Shopify en panel Shopify
- [ ] Aplicar VitraTienda_FIXED.tsx (token en env var)
- [ ] Actualizar número WhatsApp real en todos los archivos
- [ ] Verificar .env en VPS tiene todos los valores

**Día 3-4 (10-11 Abril) — SALES AGENT + ENDPOINT**
- [ ] Crear SalesAgent.ts en /src/agent/agents/
- [ ] Crear endpoint público /api/public/chat (sin JWT, con rate limit IP)
- [ ] Registrar SalesAgent en GeoCore como tool
- [ ] Testear desde Telegram: /modo_comercio → preguntas de cliente

**Día 5-6 (12-13 Abril) — PÁGINA MASCOTAS + WIDGET**
- [ ] Aplicar VitraMascotas.tsx, App_UPDATED.tsx, VitraHeader_UPDATED.tsx
- [ ] Crear componente ChatWidget.tsx (bubble flotante en el sitio)
- [ ] Conectar ChatWidget → /api/public/chat
- [ ] Subir productos a Shopify (al menos 15 SKUs para lanzamiento)

### SEMANA 2: PULIDO (14-19 Abril)

**Día 7-8 (14-15 Abril) — DEPLOY + DNS**
- [ ] npm run build en EcoOrigen_Web
- [ ] Subir al VPS con subir_al_vps.bat (actualizar IP)
- [ ] Ejecutar deploy_hostinger.sh
- [ ] Verificar DNS: ecoorigenchile.com + subdominios
- [ ] SSL con certbot

**Día 9-10 (16-17 Abril) — TESTING + ANALYTICS**
- [ ] Test completo en móvil (Chrome, Safari)
- [ ] Google Analytics 4 + Meta Pixel
- [ ] Google Search Console + sitemap.xml
- [ ] Test del chat widget con preguntas reales de clientes
- [ ] Test de pedido completo: sitio → Shopify → pago

**Día 11-12 (18-19 Abril) — CONTENIDO + REDES**
- [ ] Fotos reales de productos en las cards (reemplazar placeholders)
- [ ] Post de pre-lanzamiento en Instagram @vidriorenacido
- [ ] Configurar WhatsApp Business
- [ ] Preparar 3 posts para la semana de lanzamiento
- [ ] Google AdSense (solicitar cuenta, poner espacios)

**Día 13 (20 Abril) — LANZAMIENTO 🚀**
- [ ] Verificación final de todo
- [ ] Activar pedidos en Shopify
- [ ] Post de lanzamiento en redes
- [ ] SalesAgent online respondiendo en el widget
- [ ] Monitorear /tokens y logs con pm2 logs

---

## 📊 RESUMEN DE ARCHIVOS A ENTREGAR

| Archivo | Tipo | Para |
|---------|------|------|
| SalesAgent.ts | NUEVO | Backend GeoCore — agente de ventas para clientes |
| publicChat.ts | NUEVO | Endpoint público /api/public/chat |
| ChatWidget.tsx | NUEVO | Widget flotante para ecoorigenchile.com |
| VitraTienda_FIXED.tsx | FIX | Elimina token expuesto |
| VitraMascotas.tsx | NUEVO | Página producto estrella |
| App_UPDATED.tsx | FIX | Agrega ruta /vitra/mascotas |
| VitraHeader_UPDATED.tsx | FIX | Link mascotas en nav |
| vr-agent-hub-v3.jsx | NUEVO | Centro de agentes para admin |

---

*Auditoría completa del código fuente — 8 de Abril 2026*
*Proyectos analizados: Geotrouvetout (73 archivos), EcoOrigen_Web (17 archivos), Voren, maester-app, notion-juan*

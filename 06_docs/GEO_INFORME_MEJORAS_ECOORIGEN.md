# 🚀 INFORME DE MEJORAS — Vidrio Renacido / EcoOrigen
## Objetivo: Listo para ventas el 20 de Abril 2026

---

## 📊 ESTADO ACTUAL DEL CÓDIGO

### ✅ Lo que está BIEN
| Item | Estado |
|------|--------|
| Token Shopify movido a env vars | ✅ Corregido en App.tsx |
| Design system VITRA (955 líneas CSS) | ✅ Profesional y completo |
| Arquitectura React + Vite + TypeScript | ✅ Moderna y escalable |
| Rutas para Vitra (Landing, Tienda, ComoSeHace, Sobre, Contacto) | ✅ Definidas |
| Shopify Storefront API integrada (GraphQL) | ✅ Funcional |
| GeoCore API con subdominios configurados | ✅ Arquitectura sólida |
| Deploy script para Hostinger | ✅ Automatizado |

### ⚠️ Lo que FALTA para el 20 de Abril
| # | Item | Prioridad | Esfuerzo |
|---|------|-----------|----------|
| 1 | **Páginas Vitra no incluidas** — VitraLanding.tsx, VitraTienda.tsx, etc. están importadas pero no subidas | 🔴 CRÍTICO | 2-3 días |
| 2 | **Catálogo de vasos no cargado en Shopify** — Los productos VR aún no existen en la tienda | 🔴 CRÍTICO | 1 día |
| 3 | **Favicon incorrecto** — Es un rayo púrpura (Vite default), debería ser el logo VR | 🟡 MEDIO | 30 min |
| 4 | **Sin widget de chat/agente de ventas** — El agente Renacido no está embebido en el sitio | 🟡 MEDIO | 1 día |
| 5 | **Sin Google Analytics/Pixel** — No hay tracking de conversiones | 🟡 MEDIO | 1 hora |
| 6 | **Sin SEO optimizado** — Meta tags genéricos, sin Open Graph, sin sitemap | 🟡 MEDIO | 2 horas |
| 7 | **Sin sistema de pagos directo** — Depende 100% de Shopify checkout | 🟢 OK (Shopify lo maneja) | — |
| 8 | **Espacios publicitarios no implementados** — Falta Google AdSense | 🟢 BAJO | 2 horas |

---

## 🔧 MEJORAS ESPECÍFICAS AL CÓDIGO

### 1. App.tsx — Problemas encontrados
```
PROBLEMA: El home de EcoOrigen muestra productos genéricos de Shopify
SOLUCIÓN: Filtrar productos por colección "VITRA" o tag "vidrio-renacido"
```

### 2. Design System — Discrepancia de branding
```
PROBLEMA: El sitio dice "EcoOrigen" en el header pero el producto estrella es "VITRA / Vidrio Renacido"
SOLUCIÓN: Unificar — EcoOrigen como marca paraguas, VITRA como la línea de vasos
El path /vitra debería ser la landing principal de vasos
```

### 3. Agente de Ventas — No está integrado al sitio
```
PROBLEMA: El agente "Renacido" solo existe como app separada (React artifact)
SOLUCIÓN: Embeber como widget flotante (chat bubble) en ecoorigenchile.com
Conectar via agent.ecoorigenchile.com API o directamente con Anthropic API
```

### 4. Retrato de Mascota — Sin sección dedicada
```
PROBLEMA: Es el producto estrella pero no tiene página propia
SOLUCIÓN: Crear /vitra/mascotas con:
- Galería before/after (foto → vaso grabado)
- Formulario de subida de foto
- Proceso paso a paso visual
- Botón directo a WhatsApp
```

---

## 📋 CHECKLIST PARA EL 20 DE ABRIL

### Semana 1 (7-13 Abril) — FUNDAMENTOS
- [ ] Subir productos a Shopify (7 líneas × ~5 productos = ~35 SKUs)
- [ ] Crear/completar páginas Vitra (Landing, Tienda, Mascotas, Sobre, Contacto)
- [ ] Cambiar favicon a logo VR
- [ ] Configurar .env en VPS con tokens reales
- [ ] Verificar DNS apuntando a VPS Hostinger
- [ ] Ejecutar deploy_hostinger.sh

### Semana 2 (14-19 Abril) — PULIDO
- [ ] Embeber widget de chat (agente Renacido) en el sitio
- [ ] Agregar Google Analytics + Meta Pixel
- [ ] Configurar Google AdSense (espacios publicitarios)
- [ ] Optimizar SEO (meta tags, Open Graph, sitemap.xml)
- [ ] Test en móvil (>60% del tráfico será mobile)
- [ ] Configurar WhatsApp Business para pedidos de mascotas
- [ ] Post de lanzamiento en Instagram @vidriorenacido

### Día D (20 Abril) — LANZAMIENTO
- [ ] Verificar todo funciona en producción
- [ ] Activar pedidos en Shopify
- [ ] Publicar en redes sociales
- [ ] Agente Renacido online y respondiendo

---

## 🏗️ ARQUITECTURA RECOMENDADA FINAL

```
ecoorigenchile.com (React + Vite)
├── / ................... Landing EcoOrigen (marca paraguas)
├── /vitra .............. Landing VITRA/Vidrio Renacido (vasos)
├── /vitra/tienda ....... Catálogo completo (Shopify API)
├── /vitra/mascotas ..... Retrato de mascota (producto estrella)
├── /vitra/como-se-hace . Proceso artesanal
├── /vitra/sobre ........ Historia y valores
├── /vitra/contacto ..... Formulario + WhatsApp
└── [Widget Chat] ....... Agente Renacido (flotante en toda la web)

agent.ecoorigenchile.com (GeoCore API)
├── /health ............. Status check
├── /api/chat ........... Endpoint para widget de ventas
└── /api/webhook ........ Shopify webhooks

app.ecoorigenchile.com (Voren Dashboard)
└── Panel de administración y métricas
```

---

## 💡 MEJORAS A LOS AGENTES IA

### Agente Renacido (Ventas) — v2 vs v1
| Aspecto | v1 | v2 (mejorado) |
|---------|-----|---------------|
| Catálogo | Genérico, inventado | Basado en fotos reales y 7 líneas de producto |
| Producto estrella | No existía | Retrato de Mascota con proceso detallado |
| Conocimiento de precios | Aproximado | Exacto en CLP con mínimos de pedido |
| Técnicas de venta | Básicas | Upsell, cross-sell, urgencia, cierre con next-step |
| Envíos | Genérico | RM gratis sobre $25K, regiones desde $5.990, plazos exactos |
| Sensibilidad | Normal | Manejo especial de memorial de mascotas |

### Agente VR Designer (Diseño) — v2 vs v1
| Aspecto | v1 | v2 (mejorado) |
|---------|-----|---------------|
| Design system | Inventado (dark mode) | VITRA real: #F6F3EE, #0F3D2E, #B8956A |
| Infraestructura | No la conocía | GEO OS completo, dominios, PM2, Nginx |
| Problemas conocidos | Ninguno | Los 13 del readmefirst |
| Código generado | Genérico | Compatible con React + Vite + TypeScript del proyecto |

---

*Generado el 7 de Abril 2026 — 13 días para el lanzamiento*

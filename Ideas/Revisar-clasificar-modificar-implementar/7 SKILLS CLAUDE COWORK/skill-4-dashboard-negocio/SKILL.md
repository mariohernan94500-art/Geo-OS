---
name: dashboard-negocio
description: Crea un dashboard HTML visual con todas las métricas clave de un negocio en un solo sitio. Usa esta skill cuando el usuario quiera ver sus números de negocio, crear un panel de control, visualizar métricas, montar un "mission control", o diga cosas como "quiero ver todos mis datos en un sitio", "hazme un dashboard", "necesito un resumen de mi negocio", "panel de métricas", o "quiero ver mis KPIs".
---

# Dashboard de Negocio (Mission Control)

## Qué hace esta skill

Genera un archivo HTML autocontenido y visualmente atractivo que reúne todas las métricas clave del negocio del usuario en un solo sitio. Es su "centro de control" que puede abrir cada mañana para saber exactamente cómo va todo.

## Por qué es útil

La mayoría de emprendedores tienen sus datos dispersos en 5-10 herramientas diferentes (Google Analytics, YouTube Studio, Mailchimp, Stripe, redes sociales...). Cada mañana pierden 30 minutos abriendo pestañas. Este dashboard lo centraliza todo en una sola página.

## Proceso paso a paso

### 1. Recopilar las fuentes de datos

Pregunta al usuario:
- **¿Qué negocio tienes?** (agencia, e-commerce, SaaS, creador de contenido, freelance...)
- **¿Qué métricas son las más importantes para ti?** Si no sabe, sugiere las más relevantes para su tipo de negocio
- **¿De dónde vienen tus datos?** (Google Analytics, YouTube, Instagram, Stripe, Mailchimp, CRM...)
- **¿Tienes acceso a las APIs de estas herramientas?** (no es obligatorio — se pueden introducir datos manualmente)

### 2. Definir las secciones del dashboard

Estructura recomendada según tipo de negocio:

#### Para creadores de contenido:
| Sección | Métricas |
|---|---|
| Audiencia | Suscriptores, seguidores, crecimiento semanal |
| Contenido | Views, engagement rate, CTR, retención |
| Ingresos | AdSense, sponsors, productos, membresía |
| Email | Lista, tasa apertura, clicks |

#### Para agencias/freelancers:
| Sección | Métricas |
|---|---|
| Clientes | Activos, pipeline, churn rate |
| Ingresos | MRR, facturación mensual, por cliente |
| Proyectos | En curso, completados, pendientes |
| Marketing | Leads, conversión, coste por lead |

#### Para e-commerce:
| Sección | Métricas |
|---|---|
| Ventas | Revenue, pedidos, ticket medio |
| Tráfico | Visitas, fuentes, conversión |
| Productos | Top sellers, stock, márgenes |
| Clientes | Nuevos vs recurrentes, LTV |

### 3. Generar el HTML del dashboard

Crea un archivo HTML autocontenido con estas especificaciones de diseño:

**Estilo visual:**
- Fondo: `#0a0a0a` (tema oscuro)
- Texto principal: `#e0e0e0`
- Fuentes: Inter para texto, JetBrains Mono para números
- Cards con fondo `#111118` y borde `#1a1a2e`
- Bordes redondeados: 12px
- Responsive: funciona en móvil y desktop

**Estructura del HTML:**
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dashboard — [Nombre del Negocio]</title>
  <!-- Google Fonts: Inter + JetBrains Mono -->
  <!-- Todo el CSS inline -->
</head>
<body>
  <header>
    <h1>[Nombre del Negocio] — Mission Control</h1>
    <p>Última actualización: [fecha]</p>
  </header>

  <!-- Tarjetas de métricas principales (4 columnas) -->
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="number">[valor]</div>
      <div class="label">[métrica]</div>
      <div class="trend">↑ X% vs semana anterior</div>
    </div>
    <!-- más tarjetas -->
  </div>

  <!-- Secciones detalladas -->
  <section>
    <h2>Ingresos</h2>
    <!-- Tabla o gráfico ASCII -->
  </section>

  <!-- etc -->
</body>
</html>
```

**Elementos visuales obligatorios:**
- Números grandes en las tarjetas principales (font-size: 2.5rem)
- Flechas de tendencia: ↑ verde para positivo, ↓ rojo para negativo
- Gradientes sutiles en los números (blue→purple para engagement, green→cyan para dinero)
- Separación clara entre secciones
- Fecha de última actualización visible

### 4. Datos de ejemplo vs datos reales

- Si el usuario tiene datos reales, úsalos directamente
- Si no, genera datos de ejemplo realistas y marca claramente "[EJEMPLO — sustituir por datos reales]" en cada valor
- Incluye comentarios en el HTML indicando dónde y cómo actualizar cada dato

### 5. Instrucciones de actualización

Al final del dashboard, incluye una sección oculta (visible en el código) con instrucciones para actualizar los datos:

```html
<!-- 
  CÓMO ACTUALIZAR ESTE DASHBOARD
  ================================
  1. Abre este archivo en un editor de texto
  2. Busca los valores marcados con [ACTUALIZAR]
  3. Sustituye por los datos reales de esta semana
  4. Guarda el archivo y refresca el navegador
  
  O mejor: pide a Claude que lo actualice por ti con:
  "Actualiza mi dashboard con estos datos: [pega tus datos]"
-->
```

## Ejemplo de uso

**Usuario:** "Hazme un dashboard para mi agencia de marketing. Tengo 8 clientes activos, facturo 12.000€/mes, y quiero ver ingresos, clientes, y proyectos."

**Resultado:** Archivo HTML con tema oscuro, 4 tarjetas principales (MRR, clientes, proyectos activos, pipeline), sección de ingresos por cliente, y estado de proyectos.

## Cuánto puede cobrar el usuario por este servicio

Setup del dashboard personalizado: $300-500. Mantenimiento mensual (actualización semanal + nuevas métricas): $100-200/mes. Con 5 clientes: $500-1.000/mes recurrente solo en mantenimiento.

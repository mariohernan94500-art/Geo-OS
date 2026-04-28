---
name: scraping-competencia
description: Analiza la competencia scrapeando datos públicos de Instagram, LinkedIn, TikTok o cualquier red social usando Apify. Usa esta skill cuando el usuario quiera espiar a competidores, analizar qué contenido funciona en su nicho, comparar engagement, ver qué publica la competencia, hacer un informe competitivo, o investigar cuentas de redes sociales.
---

# Scraping de Competencia con Apify

## Qué hace esta skill

Conecta con Apify (plataforma de scrapers) para extraer datos públicos de perfiles de redes sociales: posts, likes, comentarios, engagement, descripciones. Genera un informe comparativo visual.

## Por qué es útil

Analizar manualmente 3-5 competidores en Instagram lleva horas. Con esta skill se hace en minutos y el resultado es un informe profesional que el usuario puede entregar a clientes o usar para su propia estrategia.

## Requisitos

- Conector de Apify configurado en Claude Cowork (se conecta vía OAuth, sin API key)
- O bien: cuenta gratuita en apify.com y API token (para Claude Code)

## Proceso paso a paso

### 1. Recopilar información del usuario

Pregunta:
- **¿Cuál es tu nicho?** (ej: "fitness", "agencias de marketing", "coaching de negocios")
- **¿Qué competidores quieres analizar?** (necesito los @handles o URLs de sus perfiles)
  - Si no sabe, ofrécete a buscar los 3-5 principales de su nicho
- **¿Qué plataforma?** Instagram, TikTok, LinkedIn, YouTube, o varias
- **¿Cuántos posts recientes analizar?** (por defecto: últimos 10)
- **¿Qué métricas te interesan?** (por defecto: likes, comentarios, shares, descripción, fecha, tipo de contenido)

### 2. Configurar el scraper en Apify

#### Para Instagram (el más común):
Usa el actor "Instagram Profile Scraper" o "Instagram Post Scraper" de Apify:

```json
{
  "usernames": ["competidor1", "competidor2", "competidor3"],
  "resultsLimit": 10,
  "resultsType": "posts"
}
```

#### Para TikTok:
Usa el actor "TikTok Profile Scraper":

```json
{
  "profiles": ["@competidor1", "@competidor2"],
  "resultsPerPage": 10
}
```

#### Para LinkedIn:
Usa el actor "LinkedIn Profile Scraper" (requiere cookies de sesión):

```json
{
  "profileUrls": ["https://linkedin.com/in/competidor1"]
}
```

### 3. Ejecutar el scraping

- Si estás en Cowork: usa el conector de Apify para ejecutar el actor
- Si estás en Claude Code: haz una llamada API a Apify

```bash
curl -X POST "https://api.apify.com/v2/acts/ACTOR_ID/runs" \
  -H "Authorization: Bearer APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"usernames": ["competidor1"], "resultsLimit": 10}'
```

### 4. Procesar los datos

Con los datos obtenidos, calcula para cada competidor:

- **Engagement rate:** (likes + comentarios) / seguidores × 100
- **Media de likes por post**
- **Media de comentarios por post**
- **Post con más engagement** (el outlier)
- **Frecuencia de publicación** (posts por semana)
- **Tipo de contenido más exitoso** (reel, carrusel, imagen, vídeo)
- **Hashtags más usados**
- **Horarios de publicación**

### 5. Generar el informe

Crea un archivo HTML visualmente atractivo con este contenido:

```html
<!-- Estructura del informe -->
<h1>Informe de Competencia — [NICHO]</h1>
<p>Fecha: [fecha] | Plataforma: [plataforma] | Competidores analizados: [N]</p>

<!-- Tabla comparativa principal -->
<table>
  <tr>
    <th>Métrica</th>
    <th>@competidor1</th>
    <th>@competidor2</th>
    <th>@competidor3</th>
  </tr>
  <tr>
    <td>Seguidores</td><td>XXK</td><td>XXK</td><td>XXK</td>
  </tr>
  <tr>
    <td>Engagement Rate</td><td>X.X%</td><td>X.X%</td><td>X.X%</td>
  </tr>
  <tr>
    <td>Media likes/post</td><td>XXX</td><td>XXX</td><td>XXX</td>
  </tr>
  <!-- etc -->
</table>

<!-- Top 3 posts por engagement de cada competidor -->
<!-- Análisis de contenido: qué tipo funciona mejor -->
<!-- Recomendaciones: qué debería hacer el usuario basándose en los datos -->
```

Usa tema oscuro (fondo #0a0a0a, texto #e0e0e0) para que sea consistente con el estilo de la marca.

### 6. Entregar recomendaciones accionables

Al final del informe, incluye siempre:

1. **Qué contenido replicar** — Los 3 posts con más engagement de la competencia y por qué funcionaron
2. **Qué evitar** — Patrones que no funcionan (bajo engagement)
3. **Oportunidades** — Temas que la competencia no cubre pero tienen demanda
4. **Calendario sugerido** — Frecuencia y horarios óptimos basados en los datos

## Ejemplo de uso

**Usuario:** "Analiza los 3 competidores principales de agencias de IA en Instagram: @nicksaraev, @jackroberts, @nateherk"

**Resultado:** Informe HTML con tabla comparativa, top posts, engagement rates, y recomendaciones accionables.

## Cuánto puede cobrar el usuario por este servicio

Un informe de competencia profesional se cobra entre $200 y $500 por entrega. Como servicio mensual (un informe por mes), entre $300 y $600/mes por cliente.

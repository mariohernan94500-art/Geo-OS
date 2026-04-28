---
name: auditor-seo
description: Analiza cualquier página web y genera un informe SEO profesional con problemas detectados y recomendaciones priorizadas. Usa esta skill cuando el usuario quiera analizar el SEO de una web, auditar un sitio, mejorar el posicionamiento en Google, detectar problemas de SEO, o diga cosas como "analiza mi web", "revisa el SEO de esta página", "por qué no aparezco en Google", "auditoría SEO", o "cómo mejorar mi posicionamiento".
---

# Auditor SEO Automático

## Qué hace esta skill

Analiza una URL y genera un informe SEO profesional con todos los problemas detectados y recomendaciones priorizadas por impacto. Es como tener un consultor SEO que revisa tu web en 5 minutos.

## Por qué es útil

Herramientas como Semrush cuestan $120/mes y Ahrefs $99/mes. Esta skill genera informes equivalentes de forma gratuita. Además, el informe incluye recomendaciones accionables (no solo problemas) — algo que las herramientas de pago no siempre hacen bien.

## Proceso paso a paso

### 1. Obtener la URL y el contexto

Pregunta al usuario:
- **¿Cuál es la URL a analizar?** (puede ser la página principal o una página específica)
- **¿Cuál es el objetivo de la web?** (vender un producto, captar leads, informar, portfolio...)
- **¿Cuáles son tus keywords objetivo?** (las 3-5 palabras clave por las que quiere posicionar)
  - Si no sabe, ofrécete a sugerirlas basándote en su nicho
- **¿Quién es tu competencia directa en Google?** (opcional, para comparar)

### 2. Analizar la página

**En Cowork (con Computer Use):**
Claude abre Chrome, navega a la URL, y analiza visualmente la página:
- Toma capturas de pantalla para evaluar la UX, CTAs, y diseño
- Inspecciona el código fuente (click derecho → Ver código fuente)
- Navega a herramientas gratuitas como PageSpeed Insights (pagespeed.web.dev) para medir velocidad
- Revisa la aparición en Google buscando `site:dominio.com`

**En Claude Code (sin Computer Use):**
Usa web fetch para obtener el HTML y analizarlo programáticamente.

**Aspectos a analizar:**

#### A. Meta Tags (Impacto: ALTO)
- [ ] **Title tag**: ¿Existe? ¿Tiene la keyword principal? ¿50-60 caracteres?
- [ ] **Meta description**: ¿Existe? ¿Tiene keyword? ¿150-160 caracteres? ¿Tiene CTA?
- [ ] **Meta robots**: ¿Es indexable? (no tiene noindex)
- [ ] **Canonical**: ¿Está definido correctamente?
- [ ] **Open Graph** (og:title, og:description, og:image): ¿Están configurados?
- [ ] **Twitter Cards**: ¿Están configurados?

#### B. Estructura de Contenido (Impacto: ALTO)
- [ ] **H1**: ¿Existe uno solo? ¿Contiene la keyword principal?
- [ ] **Jerarquía de headings**: ¿H1 → H2 → H3 en orden lógico?
- [ ] **Densidad de keyword**: ¿La keyword aparece en los primeros 100 palabras?
- [ ] **Longitud del contenido**: ¿Tiene al menos 300 palabras? (ideal: 1.500+)
- [ ] **Enlaces internos**: ¿Hay enlaces a otras páginas del sitio?
- [ ] **Enlaces externos**: ¿Hay enlaces a fuentes relevantes?
- [ ] **Imágenes con alt text**: ¿Todas las imágenes tienen atributo alt descriptivo?

#### C. Técnico (Impacto: MEDIO-ALTO)
- [ ] **HTTPS**: ¿Usa certificado SSL?
- [ ] **Mobile-friendly**: ¿Tiene viewport meta tag? ¿Es responsive?
- [ ] **Velocidad**: ¿El HTML es liviano? ¿Hay imágenes enormes sin optimizar?
- [ ] **Schema.org**: ¿Tiene datos estructurados? (JSON-LD)
- [ ] **Sitemap**: ¿Existe /sitemap.xml?
- [ ] **Robots.txt**: ¿Existe /robots.txt? ¿Bloquea algo importante?
- [ ] **Favicon**: ¿Tiene favicon?

#### D. UX y Conversión (Impacto: MEDIO)
- [ ] **CTA visible**: ¿Hay un call-to-action claro above the fold?
- [ ] **Formulario de contacto/captura**: ¿Es fácil de encontrar?
- [ ] **Navegación**: ¿Es clara e intuitiva?
- [ ] **Footer**: ¿Tiene información de contacto, legal, redes sociales?

### 3. Puntuar cada aspecto

Usa un sistema de semáforo:
- 🟢 **OK** — Bien configurado, no requiere acción
- 🟡 **Mejorable** — Funciona pero puede optimizarse
- 🔴 **Problema** — Necesita corrección urgente

### 4. Generar el informe

Crea un informe en formato markdown o HTML con esta estructura:

```markdown
# 🔍 Auditoría SEO — [URL]

**Fecha:** [fecha]
**Puntuación global:** XX/100
**Keywords objetivo:** [lista de keywords]

## Resumen ejecutivo

[2-3 frases con los hallazgos principales y la acción más urgente]

## Puntuación por categoría

| Categoría | Puntuación | Estado |
|---|---|---|
| Meta Tags | XX/25 | 🟢/🟡/🔴 |
| Contenido | XX/25 | 🟢/🟡/🔴 |
| Técnico | XX/25 | 🟢/🟡/🔴 |
| UX/Conversión | XX/25 | 🟢/🟡/🔴 |

## Problemas detectados (por prioridad)

### 🔴 Críticos (corregir YA)
1. **[Problema]**: [Descripción] → **Solución:** [Qué hacer exactamente]

### 🟡 Mejorables (próxima semana)
1. **[Problema]**: [Descripción] → **Solución:** [Qué hacer]

### 🟢 Bien hecho
1. **[Aspecto]**: [Por qué está bien]

## Recomendaciones priorizadas

1. **[Acción #1]** — Impacto: ALTO | Esfuerzo: BAJO | Tiempo: 30 min
2. **[Acción #2]** — Impacto: ALTO | Esfuerzo: MEDIO | Tiempo: 2 horas
3. [etc]

## Comparativa con competencia (si aplica)

| Aspecto | Tu web | Competidor 1 | Competidor 2 |
|---|---|---|---|
| Puntuación SEO | XX/100 | XX/100 | XX/100 |
| [etc] | | | |
```

### 5. Entregar recomendaciones accionables

Cada recomendación debe ser:
- **Específica**: No "mejora tu SEO" sino "añade la keyword 'agencia de IA' en tu H1"
- **Con código**: Si es un meta tag, dar el HTML exacto para copiar
- **Con prioridad**: Ordenar por impacto (lo que más mueve la aguja primero)
- **Con tiempo estimado**: Cuánto tarda en implementarse

## Ejemplo de uso

**Usuario:** "Analiza el SEO de mi web divisual.es. Quiero posicionar por 'agencia de IA España'"

**Resultado:** Informe con puntuación 62/100, 3 problemas críticos (falta meta description, H1 sin keyword, sin schema.org), 5 mejorables, y plan de acción priorizado.

## Cuánto puede cobrar el usuario por este servicio

Auditoría SEO básica (una página): $200-300. Auditoría completa (sitio entero + plan de acción): $500-1.000. Servicio mensual de SEO (auditoría + implementación): $500-1.500/mes.

---
name: espia-tendencias
description: Monitoriza tendencias y noticias de cualquier nicho usando X (Twitter) y Grok. Usa esta skill cuando el usuario quiera saber qué está trending, buscar tendencias de su industria, hacer escucha social, monitorizar competencia en redes, o encontrar ángulos de contenido. También cuando pida "qué está pasando en mi nicho", "qué es tendencia", "busca noticias de X tema", o "espía a la competencia en Twitter".
---

# Espía de Tendencias con X y Grok

## Qué hace esta skill
a
Abres X (Twitter) en el navegador, hablas con Grok (la IA de X que tiene acceso a todos los tweets en tiempo real), y traes de vuelta un informe estructurado de tendencias con una matriz de puntuación.

## Por qué es útil

Las herramientas de social listening como Brandwatch cuestan $800/mes. X es donde las noticias rompen primero — días antes de que aparezcan en YouTube, blogs o newsletters. Con esta skill, el usuario tiene acceso gratuito a inteligencia de tendencias en tiempo real.

## Requisitos

- **Claude Cowork con Computer Use activado** (Cowork → Settings → verificar que "Computer Use" está habilitado)
- El usuario debe tener sesión iniciada en **X (Twitter) en Google Chrome**
- Conexión a internet

## Cómo usa Computer Use esta skill

Esta skill aprovecha Claude Computer Use para:
1. **Abrir Chrome** automáticamente desde Cowork
2. **Navegar a X.com** y localizar el botón de Grok
3. **Escribir prompts** directamente en el chat de Grok (usando teclado virtual)
4. **Leer las respuestas** de Grok tomando capturas de pantalla
5. **Extraer la información** y traerla de vuelta a Cowork para procesarla

Esto es comunicación **agente a agente**: Claude (tu agente) habla con Grok (el agente de X) para obtener datos en tiempo real de toda la plataforma. No necesitas API, no necesitas pagar nada — Claude simplemente usa X como lo haría una persona.

## Proceso paso a paso

### 1. Confirmar el nicho y los parámetros

Pregunta al usuario:
- **¿Cuál es tu nicho o industria?** (ej: "IA y automatización", "marketing digital", "e-commerce")
- **¿Qué tipo de señales buscas?** (ej: herramientas nuevas, noticias, repos de GitHub, hilos virales)
- **¿Hay cuentas específicas que quieras monitorizar?** (opcional)
- **¿En qué idioma?** (por defecto: español e inglés)

### 2. Definir la matriz de puntuación

Usa esta matriz para evaluar cada tendencia encontrada. Cada factor se puntúa de 1 a 5 (máximo 20 puntos):

| Factor | Peso | Qué mide |
|---|---|---|
| **Recencia** | 5 puntos | ¿Se publicó en los últimos 7 días? Si es más antiguo, descartarlo |
| **Velocidad** | 5 puntos | ¿Cuánto engagement ha ganado en poco tiempo? (likes, retweets, replies en relación al tiempo publicado) |
| **Autoridad** | 4 puntos | ¿La cuenta tiene más de 10K seguidores? ¿Es reconocida en el nicho? |
| **Relevancia** | 6 puntos | ¿Conecta directamente con el nicho del usuario? ¿Es accionable? |

### 3. Ejecutar la búsqueda en X (con Computer Use)

**Claude hará esto automáticamente usando Computer Use:**

1. **Abre Google Chrome** — Claude mueve el ratón, localiza Chrome en el dock/barra de tareas y lo abre
2. **Navega a x.com** — escribe la URL en la barra de direcciones
3. **Abre Grok** — localiza el botón de Grok en la barra lateral izquierda de X y hace click (o navega a grok.x.ai)
4. **Escribe el prompt** — Claude escribe directamente en el campo de texto de Grok usando el teclado virtual
5. **Espera la respuesta** — toma capturas de pantalla para leer lo que Grok responde
6. **Extrae los datos** — copia la información relevante y la trae de vuelta a Cowork

**Prompt que Claude envía a Grok** (se adapta al nicho del usuario):

```
Necesito que busques las tendencias más relevantes de los últimos 7 días en el nicho de [NICHO DEL USUARIO]. Específicamente:

1. Herramientas o productos nuevos que se hayan lanzado
2. Hilos virales con más de 500 likes sobre este tema
3. Repos de GitHub que estén ganando estrellas rápidamente
4. Noticias o anuncios importantes de empresas del sector
5. Debates o controversias relevantes

Para cada resultado, dame:
- El contenido o resumen del tweet/hilo
- El autor y su número de seguidores
- Likes, retweets y replies
- Fecha de publicación
- Por qué es relevante

Ordénalos por impacto (engagement + relevancia).
```

5. Espera la respuesta de Grok
6. Si la respuesta es incompleta, haz preguntas de seguimiento para obtener más detalle

### 4. Procesar y puntuar los resultados

Con los datos de Grok, aplica la matriz de puntuación a cada tendencia:

- Calcula la puntuación total (máximo 20)
- Descarta cualquier resultado con menos de 10 puntos
- Ordena de mayor a menor puntuación

### 5. Generar el informe

Crea un informe con este formato:

```markdown
# 📊 Informe de Tendencias — [NICHO]
**Fecha:** [fecha actual]
**Período analizado:** Últimos 7 días
**Fuente:** X (Twitter) vía Grok

## 🔥 Top 3 Tendencias

### 1. [Nombre de la tendencia] — Puntuación: XX/20
- **Qué es:** [descripción en 2-3 líneas]
- **Por qué importa:** [relevancia para el nicho del usuario]
- **Datos:** XX likes, XX retweets, XX replies
- **Autor:** @handle (XXK seguidores)
- **Enlace:** [URL del tweet]
- **Acción recomendada:** [qué puede hacer el usuario con esto]

### 2. [Nombre de la tendencia] — Puntuación: XX/20
[mismo formato]

### 3. [Nombre de la tendencia] — Puntuación: XX/20
[mismo formato]

## 📈 Otras señales relevantes
[lista de 3-5 tendencias adicionales con puntuación 10-15]

## 💡 Ángulos de contenido sugeridos
Basándome en estas tendencias, estos son 3 posibles vídeos/posts:
1. [Título sugerido] — conecta con tendencia #X
2. [Título sugerido] — conecta con tendencia #X
3. [Título sugerido] — conecta con tendencia #X
```

### 6. Ofrecer automatización

Pregunta al usuario: "¿Quieres que programe esto como tarea diaria? Puedo ejecutar esta búsqueda cada mañana a las 9:00 y dejarte el informe listo."

Si acepta, configura una tarea programada (cron/scheduled task) que ejecute este proceso automáticamente.

## Ejemplo de uso

**Usuario:** "Busca qué está trending en el nicho de agencias de IA esta semana"

**Resultado esperado:** Informe con 3-5 tendencias puntuadas, con datos reales de X, ángulos de contenido sugeridos, y opción de automatizar la búsqueda diaria.

## Cuánto puede cobrar el usuario por este servicio

Este servicio como "monitorización de tendencias mensual" se cobra entre $200 y $400 al mes por cliente. Incluye un informe semanal o diario de tendencias + recomendaciones de contenido. Con 3-5 clientes, son $600-2.000/mes recurrentes.

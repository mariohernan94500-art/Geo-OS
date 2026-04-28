---
name: calendario-contenido
description: Genera un calendario de contenido mensual completo para redes sociales o YouTube con temas, títulos, hooks, formatos y días de publicación. Usa esta skill cuando el usuario quiera planificar su contenido, crear un calendario editorial, organizar sus publicaciones del mes, o diga cosas como "planifica mi contenido", "qué publico esta semana", "calendario de redes", "plan de contenido mensual", "no sé qué publicar", o "ideas para el mes".
---

# Planificador de Contenido Mensual

## Qué hace esta skill

Genera un calendario de contenido completo para un mes entero: temas, títulos, hooks, formato (reel, carrusel, vídeo largo, post), día y hora de publicación. Todo adaptado al nicho, la audiencia y los objetivos del usuario.

## Por qué es útil

Un community manager cobra $500-1.500/mes solo por planificar contenido. Con esta skill, el usuario genera el plan del mes completo en un prompt, y puede ofrecerlo como servicio a clientes.

## Proceso paso a paso

### 1. Entrevista al usuario

Recopila esta información:

**Sobre el negocio:**
- **¿Cuál es tu nicho?** (ej: "fitness para mujeres de 30-45 años", "marketing digital para pymes")
- **¿Cuáles son tus pilares de contenido?** (los 3-5 temas principales sobre los que publicas)
  - Si no sabe, ayúdale a definirlos basándote en su nicho
- **¿Cuál es tu objetivo principal?** (más seguidores, más ventas, más leads, engagement)

**Sobre la plataforma:**
- **¿Dónde publicas?** (Instagram, YouTube, TikTok, LinkedIn, o varias)
- **¿Con qué frecuencia?** (diario, 3 veces/semana, semanal)
- **¿Qué formatos usas?** (reels, carruseles, stories, vídeos largos, posts de texto)

**Sobre la audiencia:**
- **¿Quién te sigue?** (edad, intereses, nivel de conocimiento)
- **¿Qué contenido te ha funcionado mejor hasta ahora?** (si tiene datos)
- **¿Hay fechas especiales este mes?** (lanzamientos, eventos, festivos)

### 2. Definir la estructura semanal

Crea un patrón semanal basado en los pilares y la frecuencia:

**Ejemplo para 5 publicaciones/semana en Instagram:**

| Día | Formato | Pilar | Objetivo |
|---|---|---|---|
| Lunes | Carrusel educativo | Pilar 1 | Aportar valor |
| Martes | Reel corto | Pilar 2 | Alcance |
| Miércoles | Post de texto | Pilar 3 | Engagement |
| Jueves | Reel tendencia | Pilar 1 | Viralidad |
| Viernes | Carrusel/Storytelling | Personal | Conexión |

**Ejemplo para 3 vídeos/semana en YouTube:**

| Día | Formato | Tipo | Objetivo |
|---|---|---|---|
| Martes | Tutorial largo (15-25 min) | Educativo | SEO + retención |
| Jueves | Comparativa/Noticia (10-15 min) | Actualidad | Alcance |
| Sábado | Tips/Skills (10-15 min) | Práctico | Engagement |

### 3. Generar el contenido de cada día

Para cada publicación del mes, genera:

```markdown
### [Día] [Fecha] — [Formato]

**Pilar:** [Pilar de contenido]
**Título:** [Título del post/vídeo — máx 60 caracteres]
**Hook (primera línea):** [La frase que abre — máx 15 palabras, debe generar curiosidad]
**Desarrollo:** [3-5 bullet points con los puntos clave a cubrir]
**CTA:** [Qué quieres que haga la audiencia después]
**Hashtags:** [5-10 hashtags relevantes si es Instagram/TikTok]
**Hora de publicación:** [hora óptima según la plataforma]
**Notas:** [Cualquier nota adicional — referencia visual, audio, colaboración]
```

### 4. Reglas de contenido

**Variedad obligatoria:**
- No repetir el mismo pilar 2 días seguidos
- Alternar entre formatos educativos, entretenimiento, y personales
- Al menos 1 contenido "personal/storytelling" por semana (humaniza la marca)
- Al menos 1 contenido de tendencia/actualidad por semana (aprovecha el algoritmo)

**Hooks que funcionan:**
- Pregunta provocadora: "¿Sabías que el 90% de las webs...?"
- Dato impactante: "Perdí $5.000 por no hacer esto"
- Contraintuitivo: "Deja de publicar todos los días"
- Lista: "3 errores que están matando tu engagement"
- Historia: "Hace 6 meses no tenía ni 100 seguidores..."

**CTAs variados (no siempre el mismo):**
- "Guarda este post para después"
- "Comparte con alguien que necesite esto"
- "Comenta [palabra] si quieres el recurso gratis"
- "Link en bio para [acción]"
- "¿Cuál de estos es tu caso? Dímelo abajo"

### 5. Formato de entrega

Genera el calendario en uno de estos formatos (pregunta al usuario cuál prefiere):

#### Opción A: Markdown (para copiar y usar en Notion, Obsidian, etc.)

```markdown
# 📅 Calendario de Contenido — [Mes] [Año]
## [Nombre del negocio/marca]

### Semana 1 (1-7 de [mes])
[contenido de cada día]

### Semana 2 (8-14 de [mes])
[contenido de cada día]

[etc]

---
## Resumen del mes
- Total publicaciones: XX
- Por pilar: Pilar 1 (XX), Pilar 2 (XX), Pilar 3 (XX)
- Por formato: Reels (XX), Carruseles (XX), Posts (XX)
- Fechas especiales cubiertas: [lista]
```

#### Opción B: HTML visual (dashboard bonito para mostrar a clientes)

Genera un HTML con tema oscuro, calendario visual tipo cuadrícula donde cada día muestra:
- Color del pilar de contenido
- Icono del formato (📹 🎠 📝 🎬)
- Título resumido
- Hover para ver detalles

#### Opción C: CSV (para importar en herramientas de scheduling)

```csv
Fecha,Hora,Plataforma,Formato,Pilar,Titulo,Hook,CTA,Hashtags
2026-04-07,09:00,Instagram,Carrusel,Educativo,"5 errores de SEO","¿Tu web aparece en Google?","Guarda este post","#seo #marketing"
```

### 6. Revisión y ajustes

Después de generar el calendario:
- Pregunta al usuario si quiere cambiar algún tema, fecha, o formato
- Verifica que no haya conflictos con fechas especiales
- Asegura que la distribución de pilares sea equilibrada
- Confirma que los hooks son variados (no repetir el mismo patrón)

## Ejemplo de uso

**Usuario:** "Planifica mi contenido de Instagram para abril. Publico 5 veces por semana. Mi nicho es agencias de IA. Mis pilares son: tutoriales de herramientas, casos de éxito, y tips de negocio."

**Resultado:** Calendario completo con 20 publicaciones, cada una con título, hook, formato, CTA, y hashtags. Exportable en Markdown, HTML, o CSV.

## Cuánto puede cobrar el usuario por este servicio

Planificación de contenido mensual: $250-400/mes por cliente. Con diseño incluido (combinando con la skill de Canva): $500-800/mes. Con gestión completa (planificación + diseño + programación): $800-1.500/mes.

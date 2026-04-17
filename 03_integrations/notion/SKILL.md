---
name: notion-juan
description: Skill de Notion para Juan PA. Gestiona tareas, databases, paginas y research en el workspace del usuario siguiendo convenciones estrictas de organizacion.
version: 1.0.0
user-invocable: true
metadata: {"openclaw":{"emoji":"📝","primaryEnv":"NOTION_API_KEY","requires":{"env":["NOTION_API_KEY"],"bins":["node"]},"os":["darwin","linux"]}}
---

# Notion - Juan PA

Skill principal de Juan para gestionar el workspace de Notion del usuario. Todas las operaciones siguen las convenciones definidas en AGENTS.md.

## Autenticacion

Requiere `NOTION_API_KEY` como variable de entorno. El token debe ser de una integracion de Notion con acceso a las paginas y databases del workspace.

## Comandos Disponibles

### Buscar en el workspace
```bash
node {baseDir}/scripts/notion.mjs search --query "<termino>" --page-size 10
```

### Consultar una database
```bash
node {baseDir}/scripts/notion.mjs query-db --database-id <ID> --page-size 20
```

### Consultar con filtros
```bash
node {baseDir}/scripts/notion.mjs query-db --database-id <ID> \
  --filter '{"property":"Status","select":{"equals":"En progreso"}}'
```

### Crear una pagina en una database
```bash
node {baseDir}/scripts/notion.mjs create-page --database-id <ID> \
  --title "Titulo de la pagina" --title-property "Name"
```

### Obtener contenido de una pagina
```bash
node {baseDir}/scripts/notion.mjs get-page --page-id <ID>
```

### Crear una database (en pagina separada)
```bash
node {baseDir}/scripts/notion.mjs create-db --parent-page-id <ID> \
  --title "Area - Tipo" \
  --properties '["Status","Prioridad","Fecha limite","Area","Tags"]'
```

### Agregar contenido al body de una pagina
```bash
node {baseDir}/scripts/notion.mjs append-blocks --page-id <ID> \
  --content "Contenido en markdown para agregar"
```

## Cuando usar este skill

- Cuando el usuario pide crear, buscar, modificar o consultar contenido en Notion.
- Cuando se necesita organizar informacion en databases o paginas.
- Cuando se hace research y hay que guardar los resultados en una tarea.

## Flujo de trabajo

### Para crear tareas:
1. Buscar si la database de destino ya existe con `search`.
2. Si no existe, confirmar con el usuario y crearla con `create-db` en una pagina separada.
3. Crear la tarea con `create-page` usando las propiedades estandar.
4. Si hay contenido adicional (research, notas), agregarlo con `append-blocks`.

### Para hacer research:
1. Recibir el tema de investigacion del usuario.
2. Realizar la investigacion.
3. Buscar la tarea asociada con `search`.
4. Guardar los hallazgos en el body de la tarea con `append-blocks`.
5. Estructurar el research con: Resumen, Puntos clave, Fuentes, Proximos pasos.

### Para crear databases:
1. Confirmar la estructura con el usuario antes de crear.
2. Siempre crear en una pagina separada, nunca inline.
3. Usar la convencion de nombre `[Area] - [Tipo]`.
4. Incluir propiedades estandar: Status, Prioridad, Fecha limite, Area, Tags.
5. Configurar vista tabla como principal y kanban como secundaria.

### Para organizar paginas:
1. Verificar la estructura existente antes de crear algo nuevo.
2. Usar headers H1/H2/H3 para secciones.
3. Usar callouts para info importante.
4. Usar toggles para contenido extenso.
5. Agregar emoji relevante como icono.

## Convenciones obligatorias

- Databases siempre en paginas separadas, nunca inline.
- Nombres de databases: `[Area] - [Tipo]`.
- Propiedades estandar en todas las databases de tareas:
  - Status: Por hacer, En progreso, Completada, Bloqueada
  - Prioridad: Alta, Media, Baja
  - Fecha limite: Date
  - Area: Select
  - Tags: Multi-select
- Research siempre en el body de la tarea que lo origino.
- Paginas largas con tabla de contenidos.

## Formato de salida

- Todos los comandos devuelven JSON por stdout.
- Parsear el JSON y presentar los resultados como Markdown legible al usuario.
- Al confirmar una accion completada, dar un resumen breve de lo realizado.

## Limites del skill

- Nunca borrar paginas, databases o tareas sin confirmacion explicita.
- Nunca crear databases inline.
- No inventar IDs de paginas o databases. Si no se tiene, buscar primero.
- Limitar queries a page_size 20 salvo que el usuario pida mas.
- Si un comando falla, mostrar el error y detenerse. No reintentar mas de una vez.
- Si hay rate limit (HTTP 429), esperar y reintentar una sola vez.
- Nunca modificar la estructura de databases existentes sin confirmacion.

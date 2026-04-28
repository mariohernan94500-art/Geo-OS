# Auditoría del Router LLM (Geo OS)
# Fecha: 25 de Abril 2026

Este documento contiene un análisis estático del módulo de enrutamiento LLM actual (`agent/llm.js`), el punto de entrada de la API y las dependencias relacionadas en el backend de Geo OS.

---

## 1. ARQUITECTURA ACTUAL

### 1.1 Diagrama de flujo
La app móvil no se comunica directamente con los LLMs. El flujo sigue este camino lineal:

1. **App Móvil (React Native):** Envía texto o audio.
2. **API (Express - `server.js`):** Recibe en `POST /api/chat` o `POST /api/voice/process`.
3. **Core (`GeoCore.js`):** El orquestador recibe el texto, inyecta el `SYSTEM_PROMPT` con la memoria de usuario y llama al router.
4. **Router (`llm.js - generarRespuesta`):** Inicia una cadena de *fallback en cascada* a través de los proveedores hasta que uno responde o se agotan todos.

### 1.2 Orden de Prioridad de Proveedores
La selección actual **no es inteligente**, es una escalera rígida (hardcoded) del 1 al 7:

1. **Gemini** (`gemini-1.5-flash`) — *Se "traga" todas las peticiones si está activo.*
2. **DeepSeek** (`deepseek-chat`)
3. **Groq** (modelo dinámico pasado por parámetro, usualmente `llama-3.3-70b-versatile`)
4. **Together AI** (`meta-llama/Llama-3.3-70B-Instruct-Turbo`)
5. **Fireworks AI** (`accounts/fireworks/models/llama-v3p3-70b-instruct`)
6. **OpenRouter** (Modelo dinámico según la tarea)
7. **Claude** (`claude-sonnet-4-6` - *Solo si `CLAUDE_PAID=true`*)

### 1.3 Lógica de decisión
Existe una función `detectTaskType(messages)` que clasifica la tarea en `code`, `math`, `tools`, `summary`, o `chat`. Sin embargo, esta función **solo se utiliza para elegir el modelo dentro de OpenRouter (Posición 6)**. Como la cascada es lineal, si Gemini (Posición 1) funciona, `detectTaskType` es ignorada y no tiene impacto real en el sistema.

---

## 2. PROBLEMAS IDENTIFICADOS

### 2.1 Código "muerto" o ineficaz
El esfuerzo de hacer un "ruteo inteligente" (ej. usar `detectTaskType` para enviar código a un modelo especializado) es ineficaz porque la cascada siempre lo envía a Gemini si la API key es válida. Los modelos especializados nunca entran en acción a menos que los 5 proveedores anteriores fallen simultáneamente.

### 2.2 Cadena Lineal vs Ruteo Dinámico
Actualmente es un *fallback system* y no un *router*. Un verdadero router evaluaría la intención (ej. "es una pregunta de código") y mandaría directamente a DeepSeek; o ("requiere respuesta ultra rápida para voz") y mandaría a Groq, guardando a Gemini solo como fallback. 

### 2.3 Falta de Retry / Exponential Backoff
Si Groq lanza un error 429 (Too Many Requests), el sistema no hace un *retry* de 1 segundo; inmediatamente asume que Groq "murió" y salta al siguiente proveedor (Together AI), desperdiciando el proveedor óptimo por un límite de tasa temporal.

### 2.4 Manejo de Errores Deficiente (429 vs 500)
El router engloba todas las fallas en un `try/catch` genérico por proveedor:
```javascript
catch (err) { console.warn(`[LLM] Groq falló: ${err.message}`); }
```
No diferencia entre un Error 401 (API Key inválida, nunca funcionará), un 429 (Rate Limit, podría funcionar en 2 segundos) o un 500 (Servidor caído).

### 2.5 Timeout estático peligroso
Utiliza `conTimeout(promise, 12000)`. Si los 3 primeros proveedores sufren lag y hacen timeout, el sistema tarda 36 segundos en llegar al proveedor 4, rompiendo la promesa de voz fluida (<2s de latencia).

---

## 3. DEPENDENCIAS DE OTROS MÓDULOS

### 3.1 Archivos que importan el router
La función `generarRespuesta` está fuertemente acoplada a múltiples partes del sistema. No se puede modificar o eliminar a la ligera porque la importan:
- `dist/agent/core/GeoCore.js` (Orquestador principal)
- `dist/agent/loop.js` (Loop de agentes)
- Agentes sueltos: `FirewallAgent.ts`, `SalesAgent.ts`, `SentinelAgent.ts`

### 3.2 Endpoints expuestos
El router es el motor detrás de:
- `POST /api/chat` (Para texto en app móvil y widget web)
- `POST /api/voice/process` (Para el pipeline de voz, donde el tiempo de respuesta es crítico)

---

## 4. RIESGOS DE REFACTOR

Si se rediseña `agent/llm.ts`, existen restricciones estrictas:

1. **Firma de la función intocable:** 
   ```typescript
   export async function generarRespuesta(mensajes, modelo = '...', herramientas = null, userId = 'system', operation = 'chat')
   ```
   *Riesgo:* Cambiar el orden de los parámetros, el tipo de retorno (que asume un Message object compatible con OpenAI `msg.content` o `msg.tool_calls`) o la firma romperá la compilación de todos los Agentes.

2. **Acoplamiento de Tokens:** 
   El router actual usa `trackUsage(userId, modelo, operation, usage)` de `security/tokenTracker.ts`. Cualquier refactor debe seguir contando los tokens o el límite de la base de datos se corromperá.

3. **Variables de entorno:**
   No se deben renombrar `GEMINI_API_KEY`, `GROQ_API_KEY`, etc. El archivo `config.ts` y el `.env` (incluyendo la rotación de secretos) dependen de estos nombres exactos.

4. **El modelo por defecto:**
   Groq y otros asumen que el parámetro `modelo` que reciben desde GeoCore (`llama-3.3-70b-versatile`) será inyectado limpiamente en su respectivo SDK. Si un router nuevo asume el control del modelo e ignora este parámetro, podría romper los comportamientos específicos que GeoCore espera.

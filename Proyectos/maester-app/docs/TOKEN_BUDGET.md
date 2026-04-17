# Modelo de Presupuesto y Control de Tokens LLM (FASE 1)

## Visión General
Para evitar costos inesperados y monitorear la salud económica del sistema, Geo OS implementa un control de presupuesto diario y mensual en tokens.

## Configuración (.env)
- `TOKEN_DAILY_LIMIT`: Máximo de tokens permitidos por día (ej. 100,000).
- `TOKEN_MONTHLY_LIMIT`: Máximo de tokens permitidos por mes (ej. 2,000,000).

## Estrategia de Monitoreo
1.  **Registro Síncrono**: Cada llamada al LLM (Gemini, Groq, OpenRouter) registra `prompt_tokens`, `completion_tokens` y `total_tokens` en la tabla `token_usage` de SQLite.
2.  **Umbrales de Alerta**:
    - **80%**: Se emite una alerta preventiva por Telegram.
    - **100%**: El sistema bloquea nuevas peticiones no críticas hasta que el usuario aumente el límite o se reinicie el día.

## Herramientas de Control
- `npm run scripts:check-tokens`: Muestra el consumo del día actual por modelo.
- `src/security/token-monitor.ts`: Middleware central de control.

## Cuadro de Costos Estimados (Tokens/Mensaje)
| Operación | Tokens aprox. | Costo (Tier Free) |
|-----------|--------------|-------------------|
| Texto Simple | ~1,000 | $0.00 |
| Con Herramientas | ~2,500 | $0.00 |
| Gestión de Memoria | ~800 | $0.00 |

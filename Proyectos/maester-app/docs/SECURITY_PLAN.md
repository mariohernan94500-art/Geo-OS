# Plan de Seguridad Geo OS

## Hallazgos Críticos (Resueltos)
1.  **Exposición de Token Shopify**: El token de Admin API estaba hardcodeado en `App.tsx` de EcoOrigen Web.
    - **Solución**: Se movió la clave a una variable de entorno (`VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN`) y se rotó la clave en el panel de Shopify.

## Mitigaciones Continuas
- **SecurityAgent**: Monitoriza intentos de acceso de IDs de Telegram no autorizados y los bloquea automáticamente.
- **Token Monitor**: Evita ataques de denegación de cartera (wallet denial) limitando los tokens LLM.
- **Whitelist**: Solo los IDs definidos en `TELEGRAM_ALLOWED_USER_IDS` pueden interactuar con el bot.

## Futuras Mejoras
- Implementar rotación automática de tokens mediante `scripts/token-rotate.sh`.
- Añadir encriptación en reposo para el archivo `memory.db`.

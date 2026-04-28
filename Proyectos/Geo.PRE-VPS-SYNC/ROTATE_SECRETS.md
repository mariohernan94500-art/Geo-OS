# ROTATE_SECRETS.md — GEO OS
**Fecha de creación:** 2026-04-24
**Motivo:** `.env.REAL` con secretos reales fue detectado en el repositorio local.

> ⚠️ Este documento es tu checklist de rotación. Hazlo en orden.
> Nada de esto lo puede hacer el agente — requiere login humano en cada dashboard.

---

## 🔴 ACCIÓN INMEDIATA — Antes de continuar cualquier deploy

### 1. Telegram Bot Token
**Dashboard:** Abrir Telegram → buscar `@BotFather`
```
/revoke
→ seleccionar tu bot
→ confirmar
→ /token  (para obtener el nuevo)
```
**Variable a actualizar en VPS:** `TELEGRAM_BOT_TOKEN`

---

### 2. Google Gemini API Key
**Dashboard:** https://aistudio.google.com/app/apikey
```
1. Click en los 3 puntos de la key expuesta → Delete
2. Click "Create API Key"
3. Copiar el nuevo valor
```
**Variable a actualizar en VPS:** `GEMINI_API_KEY`

---

### 3. Groq API Key
**Dashboard:** https://console.groq.com/keys
```
1. Click en la key comprometida → Delete
2. Click "Create API Key"
3. Copiar el nuevo valor
```
**Variable a actualizar en VPS:** `GROQ_API_KEY`

---

### 4. OpenRouter API Key
**Dashboard:** https://openrouter.ai/keys
```
1. Seleccionar la key expuesta → Revoke
2. Click "Create Key"
3. Copiar el nuevo valor
```
**Variable a actualizar en VPS:** `OPENROUTER_API_KEY`

---

### 5. DeepSeek API Key
**Dashboard:** https://platform.deepseek.com/api_keys
```
1. Seleccionar la key → Delete
2. Click "Create new API key"
3. Copiar el nuevo valor
```
**Variable a actualizar en VPS:** `DEEPSEEK_API_KEY`

---

### 6. ElevenLabs API Key
**Dashboard:** https://elevenlabs.io/app/settings/api-keys
```
1. Click en la key → Delete
2. Click "Create API Key"
3. Copiar el nuevo valor
```
**Variable a actualizar en VPS:** `ELEVENLABS_API_KEY`

---

### 7. JWT Signing Secret (backend)
Este secreto firma todos los tokens de sesión. Al rotarlo, **todas las sesiones activas se invalidan** — el usuario tendrá que hacer login de nuevo.

```bash
# Generar un secreto nuevo (ejecutar localmente):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Variable a actualizar en VPS:** `JWT_SECRET`

> Después de actualizar, reiniciar el backend:
> ```bash
> pm2 restart geo-core
> ```

---

### 8. Together AI & Fireworks AI (si se usan)
- Together: https://api.together.xyz/settings/api-keys
- Fireworks: https://fireworks.ai/account/api-keys

**Variables:** `TOGETHER_API_KEY`, `FIREWORKS_API_KEY`

---

### 9. Stripe (si está activo)
**Dashboard:** https://dashboard.stripe.com/apikeys
```
- Secret key (sk_live_...): Reveal → Roll key → Confirmar
- Publishable key: no es secreta, pero rotar por consistencia
- Webhook secret (whsec_...): Webhooks → tu endpoint → Signing secret → Roll
```
**Variables:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

---

## 📋 Checklist de actualización en el VPS

Una vez que tengas todos los valores nuevos:

```bash
# 1. Conectar al VPS
ssh root@76.13.166.221

# 2. Editar el .env en producción
nano /var/www/geoos/.env

# 3. Actualizar cada variable con el valor nuevo
#    (reemplazar línea por línea)

# 4. Reiniciar el backend
pm2 restart geo-core

# 5. Verificar que está corriendo
pm2 status
curl -s https://api.geoos.app/health
```

---

## 🔍 Verificación final post-rotación

```bash
# En local — confirmar que no quedan secretos en source
grep -RnE 'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+' \
  app_frontend/ --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules
# Esperado: 0 resultados

grep -RnE '76\.13\.166\.221' app_frontend/src/
# Esperado: 0 resultados

# En el VPS — confirmar que el puerto 3000 NO es público
curl -v http://76.13.166.221:3000/health 2>&1 | grep "Connection refused"
# Esperado: Connection refused (loopback only)

# Confirmar HTTPS funciona
curl -v https://api.geoos.app/health
# Esperado: HTTP 200 con cert válido
```

---

## ✅ Estado de rotación (marcar al completar)

| Secreto | Rotado | Actualizado en VPS | Verificado |
|---------|--------|-------------------|------------|
| TELEGRAM_BOT_TOKEN | ☐ | ☐ | ☐ |
| GEMINI_API_KEY | ☐ | ☐ | ☐ |
| GROQ_API_KEY | ☐ | ☐ | ☐ |
| OPENROUTER_API_KEY | ☐ | ☐ | ☐ |
| DEEPSEEK_API_KEY | ☐ | ☐ | ☐ |
| ELEVENLABS_API_KEY | ☐ | ☐ | ☐ |
| JWT_SECRET | ☐ | ☐ | ☐ |
| TOGETHER_API_KEY | ☐ | ☐ | ☐ |
| FIREWORKS_API_KEY | ☐ | ☐ | ☐ |
| STRIPE_SECRET_KEY | ☐ | N/A si no activo | ☐ |

---

*Generado: 2026-04-24 | GEO OS Security Audit*

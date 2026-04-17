# 🚀 Guía de Despliegue — ecoorigenchile.com
## Paso a paso desde cero en hPanel de Hostinger

---

## ANTES DE EMPEZAR — Conseguir la IP del VPS

1. Entra a **hPanel** → https://hpanel.hostinger.com
2. Click en **VPS** en el menú izquierdo
3. Busca tu VPS → click en **Administrar**
4. Anota la **Dirección IP** (algo como `185.xxx.xxx.xxx`)

---

## PARTE 1 — Subir archivos desde tu PC (Windows)

### Opción A: Con el bat file (más fácil)
1. Abre `subir_al_vps.bat` en un editor de texto
2. Cambia `TU_IP_VPS` por la IP real de tu VPS
3. Guarda y haz doble clic en el archivo
4. Va a pedir tu contraseña SSH varias veces — ingrésala cada vez

### Opción B: Por FTP con FileZilla
1. Descarga FileZilla: https://filezilla-project.org
2. Conecta con:
   - **Host:** sftp://TU_IP_VPS
   - **Usuario:** root
   - **Contraseña:** la de tu VPS en hPanel
   - **Puerto:** 22
3. Sube estas carpetas:
   - `Geotrouvetout/` → `/var/www/geoos/`
   - `EcoOrigen_Web/dist/` → `/var/www/ecoorigen_web/`  *(primero haz `npm run build` en local)*
   - `maester-app/packages/voren/` → `/var/www/voren/`

---

## PARTE 2 — Configurar el VPS desde hPanel SSH

### Abrir la terminal SSH
1. En hPanel → VPS → **Terminal**  *(o el botón "Consola SSH")*
2. Se abre una terminal en el navegador — no necesitas instalar nada

### Ejecutar el deploy
Pega estos comandos uno por uno:

```bash
# 1. Ir a la carpeta del proyecto
cd /var/www/geoos

# 2. Dar permisos al script
chmod +x deploy_hostinger.sh

# 3. Ejecutar el deploy completo
bash deploy_hostinger.sh
```

El script hace todo automáticamente (5-10 minutos).

---

## PARTE 3 — Apuntar los DNS en Hostinger

Necesitas crear 3 registros A en el DNS de tu dominio.

1. hPanel → **Dominios** → `ecoorigenchile.com` → **DNS / Servidores de nombres**
2. Agrega estos registros:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | `@` | `TU_IP_VPS` | 3600 |
| A | `www` | `TU_IP_VPS` | 3600 |
| A | `agent` | `TU_IP_VPS` | 3600 |
| A | `app` | `TU_IP_VPS` | 3600 |

3. Guarda. Los DNS tardan entre **5 minutos y 2 horas** en propagar.

---

## PARTE 4 — Verificar que todo funciona

Una vez que los DNS propaguen, prueba en tu navegador:

| URL | Qué deberías ver |
|-----|-----------------|
| `https://ecoorigenchile.com` | Tienda EcoOrigen con productos Shopify |
| `https://agent.ecoorigenchile.com/health` | `{"status":"ok"}` |
| `https://app.ecoorigenchile.com` | Dashboard Voren con chat de Geo |

---

## PARTE 5 — Configurar el chat de Geo en Voren

1. Ve a `https://app.ecoorigenchile.com`
2. Click en **⚙️ Config** en el menú lateral
3. Genera tu token:
   ```bash
   # En la terminal SSH del VPS:
   cd /var/www/geoos && node ../maester-app/scripts/gen-token.js
   ```
4. Pega el token en el campo y click **Guardar Token**
5. El punto verde indica que Geo está conectado ✅

---

## COMANDOS ÚTILES (desde SSH)

```bash
# Ver estado del sistema
pm2 list

# Ver logs en vivo
pm2 logs geo-core

# Reiniciar GeoCore
pm2 restart geo-core

# Ver consumo de tokens
cd /var/www/geoos && npm run tokens

# Actualizar código (después de subir archivos nuevos)
cd /var/www/geoos && npm run build && pm2 restart geo-core
```

---

## SOLUCIÓN DE PROBLEMAS

**El sitio no carga:**
- Verifica que los DNS apunten al VPS: https://dnschecker.org
- Comprueba Nginx: `nginx -t && systemctl status nginx`

**GeoCore no responde:**
- Revisa logs: `pm2 logs geo-core --lines 50`
- Verifica el .env: `cat /var/www/geoos/.env | grep -v KEY`

**El chat de Voren dice OFFLINE:**
- Verifica que GeoCore esté activo: `pm2 list`
- Prueba la API: `curl http://localhost:3000/health`

---

*Si algo falla, comparte el mensaje de error y lo resolvemos.*

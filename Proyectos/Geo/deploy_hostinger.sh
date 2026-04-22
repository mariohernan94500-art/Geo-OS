#!/bin/bash
# ═══════════════════════════════════════════════════════════
#   GEO OS v1 — Script de Despliegue Maestro en Hostinger
#   Ejecutar desde la terminal SSH de hPanel como root:
#   bash deploy_hostinger.sh
# ═══════════════════════════════════════════════════════════

set -e  # Detener si hay error

echo ""
echo "═══════════════════════════════════════════════"
echo "  GEO OS v1 — Desplegando en ecoorigenchile.com"
echo "═══════════════════════════════════════════════"
echo ""

# ── Variables — ajusta APP_DIR si tu VPS tiene otra ruta ──
APP_DIR="/var/www/geoos"
ECOORIGEN_DIR="/var/www/ecoorigen_web"
VOREN_DIR="/var/www/voren"
NODE_VERSION="20"

# ─────────────────────────────────────────────────────────
# PASO 1: Instalar Node.js 20, PM2, Nginx
# ─────────────────────────────────────────────────────────
echo "▶ [1/7] Instalando dependencias del sistema..."
apt update -qq && apt upgrade -y -qq
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - > /dev/null 2>&1
apt install -y nodejs nginx git build-essential sqlite3 certbot python3-certbot-nginx > /dev/null 2>&1
npm install -g pm2 > /dev/null 2>&1
echo "   ✅ Node $(node -v) | Nginx | PM2 instalados"

# ─────────────────────────────────────────────────────────
# PASO 2: Crear estructura de directorios
# ─────────────────────────────────────────────────────────
echo "▶ [2/7] Creando directorios..."
mkdir -p $APP_DIR $ECOORIGEN_DIR $VOREN_DIR /data/geoos
echo "   ✅ Directorios creados"

# ─────────────────────────────────────────────────────────
# PASO 3: Subir y preparar GeoCore (API)
# ─────────────────────────────────────────────────────────
echo "▶ [3/7] Instalando GeoCore (API Puerto 3000)..."
cd $APP_DIR
npm ci --only=production > /dev/null 2>&1
npm run build > /dev/null 2>&1
echo "   ✅ GeoCore compilado"

# ─────────────────────────────────────────────────────────
# PASO 4: Variables de entorno
# ─────────────────────────────────────────────────────────
echo "▶ [4/7] Verificando .env..."
if [ ! -f "$APP_DIR/.env" ]; then
    echo ""
    echo "   ⚠️  No encontré .env en $APP_DIR"
    echo "   Copia tu .env al servidor con este comando desde tu PC:"
    echo "   scp .env root@TU_IP_VPS:/var/www/geoos/.env"
    echo ""
    echo "   Luego vuelve a ejecutar este script."
    exit 1
fi
echo "   ✅ .env encontrado"

# ─────────────────────────────────────────────────────────
# PASO 5: Lanzar GeoCore con PM2
# ─────────────────────────────────────────────────────────
echo "▶ [5/7] Iniciando GeoCore con PM2..."
pm2 stop geo-core 2>/dev/null || true
pm2 delete geo-core 2>/dev/null || true
cd $APP_DIR && pm2 start dist/index.js \
    --name "geo-core" \
    --env production \
    --max-memory-restart 400M \
    --restart-delay 3000
pm2 save
pm2 startup systemd -u root --hp /root > /dev/null 2>&1
echo "   ✅ GeoCore activo en puerto 3000"

# ─────────────────────────────────────────────────────────
# PASO 6: Configurar Nginx para los 3 subdominios
# ─────────────────────────────────────────────────────────
echo "▶ [6/7] Configurando Nginx..."

# — ecoorigenchile.com (Tienda React) —
cat > /etc/nginx/sites-available/ecoorigen << 'NGINX_ECO'
server {
    listen 80;
    server_name ecoorigenchile.com www.ecoorigenchile.com;

    root /var/www/ecoorigen_web;
    index index.html;

    # React SPA: todas las rutas van a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
NGINX_ECO

# — agent.ecoorigenchile.com (GeoCore API) —
cat > /etc/nginx/sites-available/geocore-api << 'NGINX_API'
server {
    listen 80;
    server_name agent.ecoorigenchile.com;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;

        # CORS para Voren y EcoOrigen
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
        if ($request_method = 'OPTIONS') { return 204; }
    }
}
NGINX_API

# — app.ecoorigenchile.com (Voren Dashboard) —
cat > /etc/nginx/sites-available/voren << 'NGINX_VOREN'
server {
    listen 80;
    server_name app.ecoorigenchile.com;

    root /var/www/voren;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy transparente a GeoCore API
    location /api/ {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
NGINX_VOREN

# Activar todos los sitios
ln -sf /etc/nginx/sites-available/ecoorigen     /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/geocore-api   /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/voren         /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
echo "   ✅ Nginx configurado para los 3 dominios"

# ─────────────────────────────────────────────────────────
# PASO 7: SSL (HTTPS) con Let's Encrypt
# ─────────────────────────────────────────────────────────
echo "▶ [7/7] Activando HTTPS con Let's Encrypt..."
echo "   (requiere que los DNS ya apunten a este servidor)"
echo ""

certbot --nginx \
    -d ecoorigenchile.com \
    -d www.ecoorigenchile.com \
    -d agent.ecoorigenchile.com \
    -d app.ecoorigenchile.com \
    --non-interactive \
    --agree-tos \
    --email admin@ecoorigenchile.com \
    --redirect 2>&1 || {
    echo "   ⚠️  SSL falló — posiblemente los DNS aún no propagan."
    echo "   Cuando los DNS estén listos, ejecuta:"
    echo "   certbot --nginx -d ecoorigenchile.com -d www.ecoorigenchile.com -d agent.ecoorigenchile.com -d app.ecoorigenchile.com"
}

# ─────────────────────────────────────────────────────────
# RESUMEN
# ─────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════"
echo "   ✅ GEO OS DESPLEGADO"
echo "═══════════════════════════════════════════════"
echo ""
echo "  🌐 Tienda     → https://ecoorigenchile.com"
echo "  🤖 GeoCore    → https://agent.ecoorigenchile.com"
echo "  📊 Dashboard  → https://app.ecoorigenchile.com"
echo ""
echo "  Estado PM2:"
pm2 list
echo ""
echo "  Logs en vivo:  pm2 logs geo-core"
echo "  Reiniciar:     pm2 restart geo-core"
echo ""

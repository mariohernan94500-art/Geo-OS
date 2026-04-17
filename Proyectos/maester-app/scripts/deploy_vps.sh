#!/bin/bash

# --- Geo OS v1.1 Deployment Script for Hostinger VPS ---
# Este script prepara el servidor, instala dependencias y arranca GeoCore + Voren.

echo "🚀 Iniciando despliegue de Geo OS en Hostinger VPS..."

# 1. Actualizar sistema y dependencias
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx build-essential sqlite3

# 2. Instalar PM2 para gestión de procesos 24/7
sudo npm install -g pm2

# 3. Preparar directorios (Ajustar a tu ruta si es necesario)
# Suponemos que ya has clonado o subido el código a /var/www/maester-app
cd /var/www/maester-app

# 4. Instalar dependencias del Monorepo
echo "📦 Instalando dependencias de GeoCore..."
cd packages/geotrouvetout # Ajustado si la estructura es monorepo real
npm install
npm run build

# 5. Configurar Variables de Entorno (Se asume que ya subiste el .env)
# Si no, este paso fallará. Geo necesita sus llaves.

# 6. Arrancar GeoCore con PM2
pm2 stop geo-core || true
pm2 start dist/index.js --name "geo-core"

# 7. Configurar Voren en Nginx (Visor Frontend)
echo "🌐 Configurando Nginx para vorenapp.ecoorigenchile.com..."

# Crear configuración de Nginx (Personalizada para Mario)
sudo bash -c 'cat > /etc/nginx/sites-available/vorenapp <<EOF
server {
    listen 80;
    server_name vorenapp.ecoorigenchile.com;

    root /var/www/maester-app/packages/voren;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Proxy para la API de GeoCore en puerto 3000
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'

# Activar sitio y reiniciar Nginx
sudo ln -s /etc/nginx/sites-available/vorenapp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "✅ [SISTEMA] Geo OS v1.1 ya está en vivo en vorenapp.ecoorigenchile.com"
echo "--------------------------------------------------------"
echo "🤖 Geo está despertando..."
pm2 logs geo-core

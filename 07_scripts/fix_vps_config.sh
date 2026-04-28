#!/bin/bash
# ═══════════════════════════════════════════════════════════
#   GEO OS — Script de Reparación y Optimización de VPS
#   Ejecutar como root: bash fix_vps_config.sh
# ═══════════════════════════════════════════════════════════

set -e

echo "🚀 Iniciando reparación de Geo VPS (76.13.166.221)..."

# 1. Actualizar sistema y asegurar herramientas básicas
echo "▶ [1/5] Actualizando herramientas..."
apt update -qq && apt install -y ufw nginx curl -qq > /dev/null 2>&1

# 2. Configurar Firewall (UFW)
# MUY IMPORTANTE: Permitir SSH antes de activar
echo "▶ [2/5] Configurando Firewall de forma segura..."
ufw allow 22/tcp       # SSH estándar
ufw allow 80/tcp       # HTTP
ufw allow 443/tcp      # HTTPS
# ufw allow 3000/tcp   # Opcional: solo si quieres acceso directo sin Nginx
echo "y" | ufw enable
ufw reload
echo "   ✅ Firewall configurado (SSH, Web permitidos)"

# 3. Optimizar Nginx como Reverse Proxy
echo "▶ [3/5] Reforzando configuración de Nginx..."
cat > /etc/nginx/sites-available/geocore << 'EOF'
server {
    listen 80;
    server_name agent.ecoorigenchile.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        
        # Seguridad adicional
        proxy_read_timeout 90s;
        client_max_body_size 10M;
    }
}
EOF

ln -sf /etc/nginx/sites-available/geocore /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "   ✅ Nginx optimizado para agent.ecoorigenchile.com"

# 4. Asegurar persistencia de GeoCore (PM2)
echo "▶ [4/5] Verificando PM2 y GeoCore..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2 > /dev/null 2>&1
fi

# Intentar reiniciar si existe, sino avisar
if pm2 list | grep -q "geo-core"; then
    pm2 restart geo-core
    echo "   ✅ GeoCore reiniciado en PM2"
else
    echo "   ⚠️  GeoCore no está en PM2. Ejecuta 'pm2 start dist/index.js --name geo-core' en la carpeta del proyecto."
fi

# 5. Diagnóstico Final
echo ""
echo "═══════════════════════════════════════════════"
echo "   ✅ REPARACIÓN COMPLETADA"
echo "═══════════════════════════════════════════════"
echo "  🌐 API:     https://agent.ecoorigenchile.com"
echo "  🔒 SSH:     Port 22 (Activo)"
echo "  🛡️ Firewall: Activo (80, 443, 22)"
echo "═══════════════════════════════════════════════"
echo ""
echo "RECUERDA: Debes crear el registro A para 'app.ecoorigenchile.com' en tu panel DNS."

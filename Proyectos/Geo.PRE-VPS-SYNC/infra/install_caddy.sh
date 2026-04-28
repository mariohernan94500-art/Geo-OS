#!/usr/bin/env bash
set -euo pipefail

# 1. Asegurar permisos de root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: Por favor, ejecuta este script como root (sudo ./install_caddy.sh)"
  exit 1
fi

echo "🚀 [1/6] Iniciando instalación de Caddy..."

# 2. Instalar dependencias necesarias
apt-get update
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl ufw

# 3. Añadir llave GPG y repositorio oficial de Caddy
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg --yes
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list

# 4. Instalar Caddy
echo "📦 [2/6] Instalando Caddy server..."
apt-get update
apt-get install -y caddy

# 5. Configurar el Caddyfile
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
if [ -f "$SCRIPT_DIR/Caddyfile" ]; then
    echo "📄 [3/6] Copiando Caddyfile a /etc/caddy/Caddyfile..."
    cp "$SCRIPT_DIR/Caddyfile" /etc/caddy/Caddyfile
else
    echo "❌ Error: No se encontró el Caddyfile en $SCRIPT_DIR"
    exit 1
fi

# 6. Configurar Firewall
echo "🛡️ [4/6] Configurando Firewall (UFW) para bloquear puerto 3000..."
# Permitir SSH (por si acaso para no perder conexión)
ufw allow ssh
# Permitir tráfico web
ufw allow 80/tcp
ufw allow 443/tcp
# Bloquear explícitamente el acceso externo al puerto 3000
ufw deny 3000/tcp
# Activar firewall (sin interrupciones)
ufw --force enable

# 7. Reiniciar el servicio
echo "🔄 [5/6] Reiniciando y habilitando el servicio Caddy..."
systemctl daemon-reload
systemctl enable caddy
systemctl restart caddy

echo "⌛ Esperando 5 segundos para que Let's Encrypt genere el certificado SSL..."
sleep 5

# 8. Verificación final
echo "🔍 [6/6] Verificando endpoint HTTPS..."
RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://api.geoos.app/health || echo "Failed")

if [ "$RESPONSE_CODE" == "200" ]; then
    echo "🎉 ¡ÉXITO! https://api.geoos.app/health responde HTTP 200."
    echo "🔒 Todo el tráfico externo pasa por HTTPS y el puerto 3000 está bloqueado."
else
    echo "⚠️ ATENCIÓN: El servidor de Caddy está corriendo, pero el endpoint respondió: $RESPONSE_CODE"
    echo "    Posibles causas:"
    echo "    - Los registros DNS (api.geoos.app -> 76.13.166.221) aún no se han propagado."
    echo "    - Tu aplicación Node.js no está corriendo o falló (revisa PM2 / Docker)."
    echo ""
    echo "    Para revisar los logs de Caddy ejecuta:"
    echo "    journalctl -u caddy --no-pager | tail -n 20"
fi

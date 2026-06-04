#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DEFAULT_SITE_PATH="/var/www/atelweb_frontend_only"
DEFAULT_NGINX_SITE_BASE="/etc/nginx/sites-available"
SOURCE_PATH="${SOURCE_PATH:-$PROJECT_ROOT}"

if [[ -d "$SOURCE_PATH/site" && -f "$SOURCE_PATH/site/index.html" && ! -f "$SOURCE_PATH/index.html" ]]; then
  SOURCE_PATH="$SOURCE_PATH/site"
fi

DOMAIN="${1:-${DOMAIN:-}}"
EMAIL="${2:-${EMAIL:-}}"
SITE_PATH="${3:-${SITE_PATH:-$DEFAULT_SITE_PATH}}"
WWW_DOMAIN="${4:-${WWW_DOMAIN:-}}"

ask_value() {
  local prompt="$1"
  local default_value="$2"
  local answer=""

  if [[ -t 0 ]]; then
    if [[ -n "$default_value" ]]; then
      read -r -p "$prompt [$default_value]: " answer
    else
      read -r -p "$prompt: " answer
    fi
  fi

  if [[ -n "$answer" ]]; then
    printf '%s' "$answer"
  else
    printf '%s' "$default_value"
  fi
}

if [[ $EUID -ne 0 ]]; then
  echo "Error: ejecuta este script con sudo."
  exit 1
fi

DOMAIN="${DOMAIN:-$(ask_value "Dominio principal" "")}" 
if [[ -z "$DOMAIN" ]]; then
  echo "Error: debes indicar el dominio principal."
  exit 1
fi

if [[ "$DOMAIN" == www.* ]]; then
  DOMAIN="${DOMAIN#www.}"
fi

WWW_DOMAIN="${WWW_DOMAIN:-$(ask_value "Dominio www" "www.$DOMAIN")}" 
if [[ -z "$WWW_DOMAIN" ]]; then
  WWW_DOMAIN="www.$DOMAIN"
fi

EMAIL="${EMAIL:-$(ask_value "Email para Certbot" "")}" 
if [[ -z "$EMAIL" ]]; then
  echo "Error: debes indicar un email valido para Certbot."
  exit 1
fi

SITE_PATH="${SITE_PATH:-$(ask_value "Ruta del sitio" "$DEFAULT_SITE_PATH")}" 
if [[ -z "$SITE_PATH" ]]; then
  SITE_PATH="$DEFAULT_SITE_PATH"
fi

NGINX_SITE="$DEFAULT_NGINX_SITE_BASE/$DOMAIN.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN.conf"

echo "[1/9] Instalando dependencias de sistema..."
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx rsync

echo "[2/9] Abriendo puertos 80 y 443 (UFW, si existe)..."
if command -v ufw >/dev/null 2>&1; then
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
fi

echo "[3/9] Preparando carpeta del sitio..."
mkdir -p "$SITE_PATH"

if [[ "$SOURCE_PATH" != "$SITE_PATH" ]]; then
  echo "[4/9] Copiando archivos del proyecto desde $SOURCE_PATH..."
  rsync -a --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='.dist' \
    --exclude='sesiones_grabadas' \
    --exclude='*.log' \
    "$SOURCE_PATH"/ "$SITE_PATH"/
else
  echo "[4/9] El origen y el destino coinciden; no se copia nada."
fi

echo "[5/9] Creando configuracion de Nginx..."
cat > "$NGINX_SITE" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN $WWW_DOMAIN;

    root $SITE_PATH;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /presupuesto {
        try_files \$uri \$uri/ /presupuesto/index.html;
    }

    location /certificaciones {
        try_files \$uri \$uri/ /certificaciones/index.html;
    }

    location ~* \\.(?:css|js|mjs|map|jpg|jpeg|gif|png|svg|webp|ico|woff|woff2|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files \$uri =404;
    }

    location ~ /\\. {
        deny all;
    }
}
EOF

echo "[6/9] Activando sitio..."
ln -sf "$NGINX_SITE" "$NGINX_ENABLED"
rm -f /etc/nginx/sites-enabled/default

echo "[7/9] Validando y recargando Nginx..."
nginx -t
systemctl enable nginx
systemctl reload nginx

echo "[8/9] Solicitando certificado HTTPS..."
certbot --nginx -d "$DOMAIN" -d "$WWW_DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect

echo "[9/9] Estado final y URLs de acceso..."
systemctl status nginx --no-pager | sed -n '1,8p'

echo "URL local del servidor: http://$DOMAIN"
echo "URL segura principal: https://$DOMAIN"
echo "URL segura secundaria: https://$WWW_DOMAIN"
echo "Si el DNS no ha propagado aun, repite el paso de validacion mas tarde."

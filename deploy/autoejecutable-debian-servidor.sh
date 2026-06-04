#!/usr/bin/env bash
set -euo pipefail

# Instalador Debian todo en uno para desplegar la web con Nginx,
# monitorizacion automatica y hardening de red.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SOURCE_PATH="${SOURCE_PATH:-$PROJECT_ROOT}"
SITE_PATH="${SITE_PATH:-/var/www/atelweb_frontend_only}"
DOMAIN="${DOMAIN:-}"
WWW_DOMAIN="${WWW_DOMAIN:-}"
EMAIL="${EMAIL:-}"
NETWORK_PROFILE="${NETWORK_PROFILE:-strict}"

if [[ -d "$SOURCE_PATH/site" && -f "$SOURCE_PATH/site/index.html" && ! -f "$SOURCE_PATH/index.html" ]]; then
  SOURCE_PATH="$SOURCE_PATH/site"
fi

HEALTHCHECK_SCRIPT="/usr/local/bin/atel-healthcheck.sh"
ENABLE_HTTPS_SCRIPT="/usr/local/bin/atel-enable-https.sh"
HEALTHCHECK_SERVICE="/etc/systemd/system/atel-healthcheck.service"
HEALTHCHECK_TIMER="/etc/systemd/system/atel-healthcheck.timer"
HEALTHCHECK_LOG="/var/log/atel-healthcheck.log"

print_help() {
  cat <<'EOF'
Uso:
  sudo bash deploy/autoejecutable-debian-servidor.sh [opciones]

Opciones:
  --source-path RUTA    Ruta origen del proyecto (por defecto: carpeta actual)
  --site-path RUTA      Ruta destino web (por defecto: /var/www/atelweb_frontend_only)
  --domain DOMINIO      Dominio principal (opcional si aun no tienes DNS)
  --www-domain DOMINIO  Dominio www (opcional, por defecto www.<dominio>)
  --email EMAIL         Email para certbot (si usas dominio)
  --network-profile MODO  Perfil de red: strict (recomendado) o standard
  --help                Muestra esta ayuda

Ejemplo sin dominio (fase USB/local):
  sudo bash deploy/autoejecutable-debian-servidor.sh

Ejemplo con dominio:
  sudo bash deploy/autoejecutable-debian-servidor.sh \
    --domain atelsistems.com --www-domain www.atelsistems.com --email admin@atelsistems.com

Ejemplo perfil estandar:
  sudo bash deploy/autoejecutable-debian-servidor.sh --network-profile standard
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source-path)
      SOURCE_PATH="$2"
      shift 2
      ;;
    --site-path)
      SITE_PATH="$2"
      shift 2
      ;;
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --www-domain)
      WWW_DOMAIN="$2"
      shift 2
      ;;
    --email)
      EMAIL="$2"
      shift 2
      ;;
    --network-profile)
      NETWORK_PROFILE="$2"
      shift 2
      ;;
    --help|-h)
      print_help
      exit 0
      ;;
    *)
      echo "Argumento no reconocido: $1"
      print_help
      exit 1
      ;;
  esac
done

if [[ $EUID -ne 0 ]]; then
  echo "Error: ejecuta con sudo o como root."
  exit 1
fi

if [[ ! -d "$SOURCE_PATH" ]]; then
  echo "Error: SOURCE_PATH no existe: $SOURCE_PATH"
  exit 1
fi

if [[ -n "$DOMAIN" && "$DOMAIN" == www.* ]]; then
  DOMAIN="${DOMAIN#www.}"
fi

if [[ -n "$DOMAIN" && -z "$WWW_DOMAIN" ]]; then
  WWW_DOMAIN="www.$DOMAIN"
fi

if [[ "$NETWORK_PROFILE" != "strict" && "$NETWORK_PROFILE" != "standard" ]]; then
  echo "Error: --network-profile debe ser 'strict' o 'standard'."
  exit 1
fi

echo "[1/10] Instalando paquetes base..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx rsync curl nftables ca-certificates

echo "[2/10] Copiando web a $SITE_PATH ..."
mkdir -p "$SITE_PATH"
rsync -a --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='logs' \
  --exclude='.dist' \
  --exclude='sesiones_grabadas' \
  --exclude='*.log' \
  "$SOURCE_PATH"/ "$SITE_PATH"/

echo "[3/10] Configurando Nginx..."
NGINX_SITE="/etc/nginx/sites-available/atelweb_frontend_only.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/atelweb_frontend_only.conf"

if [[ -n "$DOMAIN" ]]; then
  SERVER_NAMES="$DOMAIN $WWW_DOMAIN"
else
  SERVER_NAMES="_"
fi

cat > "$NGINX_SITE" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_NAMES;

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

ln -sf "$NGINX_SITE" "$NGINX_ENABLED"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

echo "[4/10] Aplicando hardening de red (modo: $NETWORK_PROFILE)..."
cat > /etc/sysctl.d/99-atel-network-hardening.conf <<'EOF'
net.ipv4.ip_forward = 0
net.ipv6.conf.all.forwarding = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
EOF
sysctl --system >/dev/null

if [[ "$NETWORK_PROFILE" == "strict" ]]; then
  cat > /etc/nftables.conf <<'EOF'
#!/usr/sbin/nft -f
flush ruleset

table inet filter {
  chain input {
    type filter hook input priority 0;
    policy drop;

    iif lo accept
    ct state established,related accept

    # SSH (si usas otro puerto, edita esta regla)
    tcp dport 22 accept

    # Web publica
    tcp dport {80,443} accept

    # ICMP basico para diagnostico
    ip protocol icmp accept
    ip6 nexthdr ipv6-icmp accept
  }

  chain forward {
    type filter hook forward priority 0;
    policy drop;
  }

  chain output {
    type filter hook output priority 0;
    policy accept;

    # Permite respuestas de conexiones iniciadas desde fuera.
    ct state established,related accept

    # Bloquea nuevos accesos del servidor a redes privadas/locales.
    ip daddr {10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, 100.64.0.0/10, 127.0.0.0/8} drop
    ip6 daddr {fc00::/7, fe80::/10, ::1/128} drop
  }
}
EOF
else
  cat > /etc/nftables.conf <<'EOF'
#!/usr/sbin/nft -f
flush ruleset

table inet filter {
  chain input {
    type filter hook input priority 0;
    policy drop;

    iif lo accept
    ct state established,related accept

    # SSH (si usas otro puerto, edita esta regla)
    tcp dport 22 accept

    # Web publica
    tcp dport {80,443} accept

    # ICMP basico para diagnostico
    ip protocol icmp accept
    ip6 nexthdr ipv6-icmp accept
  }

  chain forward {
    type filter hook forward priority 0;
    policy drop;
  }

  chain output {
    type filter hook output priority 0;
    policy accept;
  }
}
EOF
fi

systemctl enable nftables
systemctl restart nftables

echo "[5/10] Preparando script de chequeo de salud..."
cat > "$HEALTHCHECK_SCRIPT" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="/var/log/atel-healthcheck.log"
DOMAIN_FILE="/etc/atelweb/domain.conf"

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" >> "$LOG_FILE"
}

check_url() {
  local url="$1"
  if curl -kfsS --max-time 10 "$url" >/dev/null; then
    log "OK   $url"
    return 0
  fi

  log "FAIL $url"
  return 1
}

mkdir -p /etc/atelweb
touch "$LOG_FILE"

if ! systemctl is-active --quiet nginx; then
  log "FAIL nginx inactive, restart"
  systemctl restart nginx || true
fi

local_ok=0
check_url "http://127.0.0.1/" && local_ok=$((local_ok + 1))
check_url "http://127.0.0.1/presupuesto/" && local_ok=$((local_ok + 1))
check_url "http://127.0.0.1/certificaciones/" && local_ok=$((local_ok + 1))

if [[ "$local_ok" -lt 3 ]]; then
  log "WARN local checks failed, forcing nginx restart"
  systemctl restart nginx || true
fi

if [[ -f "$DOMAIN_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$DOMAIN_FILE"
  if [[ -n "${DOMAIN:-}" ]]; then
    check_url "https://${DOMAIN}/" || true
  fi
fi
EOF

chmod +x "$HEALTHCHECK_SCRIPT"

echo "[6/10] Registrando servicio y timer de monitorizacion..."
cat > "$HEALTHCHECK_SERVICE" <<EOF
[Unit]
Description=ATEL health check watchdog
After=network-online.target nginx.service
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=$HEALTHCHECK_SCRIPT
EOF

cat > "$HEALTHCHECK_TIMER" <<'EOF'
[Unit]
Description=Run ATEL health check every 5 minutes

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min
Unit=atel-healthcheck.service

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now atel-healthcheck.timer

echo "[7/10] Guardando configuracion de dominio para chequeos..."
mkdir -p /etc/atelweb
cat > /etc/atelweb/domain.conf <<EOF
DOMAIN="$DOMAIN"
WWW_DOMAIN="$WWW_DOMAIN"
EMAIL="$EMAIL"
EOF

echo "[8/10] Creando helper para activar HTTPS cuando tengas dominio..."
cat > "$ENABLE_HTTPS_SCRIPT" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-}"
WWW_DOMAIN="${2:-}"
EMAIL="${3:-}"

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
  echo "Uso: sudo atel-enable-https.sh <dominio> <www-dominio-opcional> <email>"
  exit 1
fi

if [[ "$DOMAIN" == www.* ]]; then
  DOMAIN="${DOMAIN#www.}"
fi

if [[ -z "$WWW_DOMAIN" ]]; then
  WWW_DOMAIN="www.$DOMAIN"
fi

certbot --nginx -d "$DOMAIN" -d "$WWW_DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect

mkdir -p /etc/atelweb
cat > /etc/atelweb/domain.conf <<EOF2
DOMAIN="$DOMAIN"
WWW_DOMAIN="$WWW_DOMAIN"
EMAIL="$EMAIL"
EOF2

systemctl restart atel-healthcheck.timer

echo "HTTPS activado para: https://$DOMAIN y https://$WWW_DOMAIN"
EOF
chmod +x "$ENABLE_HTTPS_SCRIPT"

if [[ -n "$DOMAIN" && -n "$EMAIL" ]]; then
  echo "[9/10] Intentando emitir certificado HTTPS ahora..."
  certbot --nginx -d "$DOMAIN" -d "$WWW_DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || {
    echo "Aviso: no se pudo emitir certificado ahora."
    echo "Cuando el DNS este listo, ejecuta: sudo $ENABLE_HTTPS_SCRIPT $DOMAIN $WWW_DOMAIN $EMAIL"
  }
else
  echo "[9/10] Sin dominio/email: se deja HTTP preparado y HTTPS pendiente."
fi

echo "[10/10] Validacion final..."
nginx -t
systemctl is-active --quiet nginx
systemctl is-active --quiet nftables
systemctl is-active --quiet atel-healthcheck.timer

echo ""
echo "Instalacion completada."
echo "- Web local:        http://<IP_DEL_SERVIDOR>/"
echo "- Presupuesto:      http://<IP_DEL_SERVIDOR>/presupuesto/"
echo "- Certificaciones:  http://<IP_DEL_SERVIDOR>/certificaciones/"
echo "- Perfil de red:    $NETWORK_PROFILE"
echo "- Health log:       $HEALTHCHECK_LOG"
echo "- Timer health:     systemctl status atel-healthcheck.timer"
echo "- Ejecutar chequeo: systemctl start atel-healthcheck.service"
echo "- Activar HTTPS:    sudo $ENABLE_HTTPS_SCRIPT <dominio> <www-dominio-opcional> <email>"

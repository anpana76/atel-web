#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="$ROOT_DIR/.dist"
PACKAGE_DIR="$DIST_DIR/atelweb_frontend_only_deploy_package"
SITE_DIR="$PACKAGE_DIR/site"
SUPPORT_DIR="$PACKAGE_DIR/support"
ARCHIVE_PATH="$DIST_DIR/atelweb_frontend_only_deploy_package.tar.gz"
BUILD_OUTPUT_DIR="$DIST_DIR/production"

copy_support_item() {
  local relative_path="$1"
  local source_path="$ROOT_DIR/$relative_path"
  local target_path="$SUPPORT_DIR/$relative_path"

  if [[ -e "$source_path" ]]; then
    mkdir -p "$(dirname "$target_path")"
    cp -a "$source_path" "$target_path"
  fi
}

mkdir -p "$DIST_DIR"
rm -rf "$PACKAGE_DIR" "$ARCHIVE_PATH"
mkdir -p "$PACKAGE_DIR"

if [[ ! -f "$ROOT_DIR/package.json" ]]; then
  echo "Error: no se encontro package.json en $ROOT_DIR"
  exit 1
fi

echo "Construyendo produccion antes de empaquetar..."
(cd "$ROOT_DIR" && npm run build:prod)

if [[ ! -d "$BUILD_OUTPUT_DIR" ]]; then
  echo "Error: no existe la salida de produccion en $BUILD_OUTPUT_DIR"
  exit 1
fi

mkdir -p "$SITE_DIR" "$SUPPORT_DIR"

cp -a "$BUILD_OUTPUT_DIR"/. "$SITE_DIR"/

copy_support_item "deploy/autoejecutable-debian-servidor.sh"
copy_support_item "deploy/setup-ubuntu-https.sh"
copy_support_item "deploy/DEPLOY_DEBIAN_HTTPS.md"
copy_support_item "deploy/DEPLOY_UBUNTU_HTTPS.md"
copy_support_item "deploy/DEPLOY_WINDOWS_HTTPS.md"
copy_support_item "deploy/nginx-atelmalaga.conf"
copy_support_item "documentacion_final/QUICKSTART.md"
copy_support_item "documentacion_final/README.md"
copy_support_item "documentacion_final/tecnica/README.md"
copy_support_item "documentacion_final/usuario/README.md"
copy_support_item "LEEME.md"
copy_support_item "LEEME_CLIENTE_FINAL.md"
copy_support_item "LEEME_TECNICO.md"
copy_support_item "DOCUMENTACION.md"

cp -a "$ROOT_DIR/INSTALAR_DEBIAN_TODO_EN_UNO.sh" "$PACKAGE_DIR/"

cat > "$PACKAGE_DIR/README_LOCAL_PACKAGE.txt" <<'EOF'
Paquete de despliegue de ATEL SISTEMS

Este paquete contiene la web ya compilada en la carpeta site/ y los scripts de soporte.

Uso rapido:
1. Descomprime el archivo tar.gz en el PC o servidor de destino.
2. En Debian o Ubuntu, entra en la carpeta resultante y ejecuta en modo administrador:
  sudo bash INSTALAR_DEBIAN_TODO_EN_UNO.sh
3. Si ya tienes dominio y email de certificados, puedes pasarlos:
  sudo bash INSTALAR_DEBIAN_TODO_EN_UNO.sh --domain tu-dominio.com --www-domain www.tu-dominio.com --email tu-email@dominio.com
4. Cuando tengas el DNS listo, puedes activar HTTPS despues con:
  sudo /usr/local/bin/atel-enable-https.sh tu-dominio.com www.tu-dominio.com tu-email@dominio.com
5. La web que se copia al servidor es la carpeta site/.
6. Los documentos de soporte estan dentro de support/.
EOF

chmod +x "$PACKAGE_DIR/INSTALAR_DEBIAN_TODO_EN_UNO.sh" || true

tar -czf "$ARCHIVE_PATH" -C "$DIST_DIR" "$(basename "$PACKAGE_DIR")"

echo "Paquete de despliegue creado: $PACKAGE_DIR"
echo "Web lista para subir: $SITE_DIR"
echo "Archivo comprimido: $ARCHIVE_PATH"
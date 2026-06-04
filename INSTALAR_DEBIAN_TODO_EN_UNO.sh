#!/usr/bin/env bash
set -euo pipefail

# Lanzador pensado para USB: ejecuta el autoejecutable Debian con modo estricto.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALLER="$SCRIPT_DIR/deploy/autoejecutable-debian-servidor.sh"
SOURCE_PATH="$SCRIPT_DIR"

if [[ -d "$SCRIPT_DIR/site" && -f "$SCRIPT_DIR/site/index.html" ]]; then
  SOURCE_PATH="$SCRIPT_DIR/site"
fi

if [[ ! -f "$INSTALLER" ]]; then
  echo "Error: no se encontro el instalador en $INSTALLER"
  exit 1
fi

if [[ $EUID -ne 0 ]]; then
  echo "Reintentando con sudo..."
  exec sudo bash "$INSTALLER" --source-path "$SOURCE_PATH" --network-profile strict "$@"
fi

exec bash "$INSTALLER" --source-path "$SOURCE_PATH" --network-profile strict "$@"

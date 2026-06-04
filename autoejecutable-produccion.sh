#!/usr/bin/env bash
set -euo pipefail

# Autoejecutable de produccion (Linux):
# 1) npm run build:prod
# 2) npm run serve:prod

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==========================================="
echo "ATEL - Autoejecutable Produccion (Linux)"
echo "==========================================="
echo

if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] npm no esta disponible en PATH."
  echo "Instala Node.js y vuelve a intentarlo."
  exit 1
fi

echo "[1/2] Construyendo produccion..."
npm run build:prod

echo
echo "[2/2] Iniciando servidor de produccion..."
echo "URL esperada: http://localhost:8080 (o puerto alternativo libre)"
echo "Pulsa Ctrl+C para detener el servidor."
echo
npm run serve:prod

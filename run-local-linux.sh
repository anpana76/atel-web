#!/usr/bin/env bash
set -euo pipefail

# Ejecuta el servidor local desde la carpeta del proyecto.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${1:-8080}"
HOST="127.0.0.1"

if command -v python3 >/dev/null 2>&1; then
  PY_CMD="python3"
elif command -v python >/dev/null 2>&1; then
  PY_CMD="python"
else
  echo "Error: no se encontro Python (python3/python)."
  exit 1
fi

echo "Iniciando servidor local en http://${HOST}:${PORT}"
echo "Pulsa Ctrl+C para detenerlo."
"$PY_CMD" -m http.server "$PORT" --bind "$HOST"

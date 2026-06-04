#!/bin/bash
# Instalador automático de METATRON para Debian/Ubuntu
# Autor: GitHub Copilot
# Fecha: 2026-04-13

set -e

# Colores para mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Carpeta de instalación
INSTALL_DIR="$HOME/METATRON"
DB_PASS="123"

function print_success() {
    echo -e "${GREEN}$1${NC}"
}
function print_error() {
    echo -e "${RED}$1${NC}"
}

# 1. Clonar el repositorio
print_success "Clonando repositorio METATRON..."
git clone https://github.com/sooryathejas/METATRON.git "$INSTALL_DIR"
cd "$INSTALL_DIR"

# 2. Crear y activar entorno virtual
print_success "Creando entorno virtual Python..."
python3 -m venv venv
source venv/bin/activate

# 3. Instalar dependencias Python
print_success "Instalando dependencias Python..."
pip install --upgrade pip
pip install -r requirements.txt

# 4. Instalar herramientas del sistema
print_success "Instalando herramientas del sistema..."
sudo apt update
sudo apt install -y nmap whois whatweb curl dnsutils nikto mariadb-server

# 5. Instalar Ollama
print_success "Instalando Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

# 6. Detectar RAM y descargar modelo adecuado
RAM_GB=$(awk '/MemTotal/ {printf "%.1f", $2/1024/1024}' /proc/meminfo)
if (( $(echo "$RAM_GB < 8.4" | bc -l) )); then
    print_success "RAM detectada: $RAM_GB GB. Descargando modelo 4b..."
    ollama pull huihui_ai/qwen3.5-abliterated:4b
    sed -i 's|FROM.*|FROM huihui_ai/qwen3.5-abliterated:4b|' Modelfile
else
    print_success "RAM detectada: $RAM_GB GB. Descargando modelo 9b..."
    ollama pull huihui_ai/qwen3.5-abliterated:9b
fi

# 7. Crear modelo personalizado
print_success "Creando modelo personalizado metatron-qwen..."
ollama create metatron-qwen -f Modelfile

# 8. Verificar modelo
ollama list | grep metatron-qwen && print_success "Modelo metatron-qwen creado correctamente."

# 9. Configurar MariaDB y crear base de datos
print_success "Configurando MariaDB y creando base de datos..."
sudo systemctl start mariadb
sudo systemctl enable mariadb

sudo mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS metatron;
CREATE USER IF NOT EXISTS 'metatron'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON metatron.* TO 'metatron'@'localhost';
FLUSH PRIVILEGES;
EOF

# 10. Crear tablas
mysql -u metatron -p$DB_PASS metatron <<EOF
CREATE TABLE IF NOT EXISTS history (
  sl_no     INT AUTO_INCREMENT PRIMARY KEY,
  target    VARCHAR(255) NOT NULL,
  scan_date DATETIME NOT NULL,
  status    VARCHAR(50) DEFAULT 'active'
);
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sl_no       INT,
  vuln_name   TEXT,
  severity    VARCHAR(50),
  port        VARCHAR(20),
  service     VARCHAR(100),
  description TEXT,
  FOREIGN KEY (sl_no) REFERENCES history(sl_no)
);
CREATE TABLE IF NOT EXISTS fixes (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  sl_no    INT,
  vuln_id  INT,
  fix_text TEXT,
  source   VARCHAR(50),
  FOREIGN KEY (sl_no) REFERENCES history(sl_no),
  FOREIGN KEY (vuln_id) REFERENCES vulnerabilities(id)
);
CREATE TABLE IF NOT EXISTS exploits_attempted (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  sl_no        INT,
  exploit_name TEXT,
  tool_used    TEXT,
  payload      LONGTEXT,
  result       TEXT,
  notes        TEXT,
  FOREIGN KEY (sl_no) REFERENCES history(sl_no)
);
CREATE TABLE IF NOT EXISTS summary (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  sl_no        INT,
  raw_scan     LONGTEXT,
  ai_analysis  LONGTEXT,
  risk_level   VARCHAR(50),
  generated_at DATETIME,
  FOREIGN KEY (sl_no) REFERENCES history(sl_no)
);
EOF

print_success "\nInstalación completada."
print_success "\nPara usar METATRON:"
echo "1. Abre una terminal y ejecuta:"
echo "   ollama run metatron-qwen"
echo "2. En otra terminal:"
echo "   cd ~/METATRON"
echo "   source venv/bin/activate"
echo "   python metatron.py"

const fs = require('fs');
const path = require('path');

const consoleColors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m"
};

let pass = true;
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');

const cssPath = path.join(__dirname, '../css/styles.css');
const jsPath = path.join(__dirname, '../js/main.js');

console.log(`${consoleColors.cyan}\n==============================================`);
console.log(`🧹 INICIANDO PRUEBAS DE CALIDAD DE CÓDIGO (LINT)`);
console.log(`==============================================${consoleColors.reset}\n`);

// 1. Comprobar que en el CSS no hemos abusado desesperadamente de !important
console.log(`[1] Verificando deudas técnicas en CSS (!important)...`);
const css = fs.readFileSync(cssPath, 'utf8');
const coincidences = (css.match(/!important/g) || []).length;

// Si pasa de 50 (ahora está sobre 28), algo se nos ha escapado de las manos:
if (coincidences > 40) {
  console.log(`${consoleColors.red}❌ ERROR:${consoleColors.reset} Demasiados usos de !important (${coincidences} veces). ¡El código será inmanejable! \n(Recuerda romper la cascada lo menos posible)`);
  pass = false;
} else if (coincidences > 0 && coincidences <= 40) {
  console.log(`${consoleColors.yellow}⚠️  ADVERTENCIA:${consoleColors.reset} Tienes ${coincidences} usos de '!important' controlados. Vigila en el futuro.`);
} else {
  console.log(`${consoleColors.green}✔️  OK: Cero usos conflictivos de !important encontrados.${consoleColors.reset}`);
}

if (isVerbose && coincidences > 0) {
  console.log(`    ${consoleColors.cyan}>> Modo Verboso Muestra los !important:${consoleColors.reset}`);
  const lines = css.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('!important')) console.log(`      Línea ${i + 1}: ${l.trim()}`);
  });
}

console.log(`\n[2] Verificando logs residuales en JS...`);
const js = fs.readFileSync(jsPath, 'utf8');

// Todos nos dejamos console.logs en producción a veces 
const matchConsole = js.match(/console\.log/g) || [];
if (matchConsole.length > 0) {
  console.log(`${consoleColors.red}❌ ERROR:${consoleColors.reset} Encontrado usos de 'console.log' que pueden ralentizar la app en cliente en producción.`);
  pass = false;
} else {
  console.log(`${consoleColors.green}✔️  OK: Código JS limpio de sentencias de 'console.log' de pruebas.${consoleColors.reset}`);
}

console.log(`\n${consoleColors.cyan}----------------------------------------------${consoleColors.reset}`);
// Chiste DEV Calidad
console.log(`${consoleColors.yellow}/* CHISTE DEV CALIDAD: ¿Por qué los programadores odian la luz solar?\\n    - Porque los deslumbra al depurar y no deja ver el código oscuro de sus almas (ni de sus editores). */${consoleColors.reset}`);

if (pass) {
  console.log(`${consoleColors.green}✅ ESTADO: CÓDIGO PULIDO, LISTO PARA REVIEW. 🚀${consoleColors.reset}\n`);
} else {
  console.log(`${consoleColors.yellow}🚫 ESTADO: HAY MEJORAS QUE IMPLEMENTAR ANTES DE LANZAR A PRODUCCIÓN.${consoleColors.reset}\n`);
  process.exit(1);
}

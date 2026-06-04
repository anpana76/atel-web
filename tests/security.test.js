const fs = require('fs');
const path = require('path');

const consoleColors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m"
};

const htmlPath = path.join(__dirname, '../index.html');
const jsPath = path.join(__dirname, '../js/main.js');

let pass = true;
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');

console.log(`${consoleColors.cyan}\n==============================================`);
console.log(`🛡️  INICIANDO PRUEBAS DE SEGURIDAD (SECURITY)`);
console.log(`==============================================${consoleColors.reset}\n`);

// 1. Verificar enlaces externos en HTML
console.log(`[1] Verificando Vulnerabilidad Target Blank (Tabnabbing) en HTML...`);
const html = fs.readFileSync(htmlPath, 'utf8');

// Todos los enlaces con target="_blank" deberian tener rel="noopener"
const targetBlankRegex = /<a[^>]+target=["']_blank["'][^>]*>/gi;
const links = html.match(targetBlankRegex) || [];
let blankPass = true;

links.forEach(link => {
  if (!link.includes('rel="noopener')) {
     console.log(`${consoleColors.red}❌ ERROR:${consoleColors.reset} Enlace inseguro encontrado (falta rel="noopener"): ${link.substring(0, 50)}...`);
     
     if (isVerbose) {
       // Buscar la línea aproximada donde está este enlace
       const lines = html.split('\n');
       const lineNum = lines.findIndex(l => l.includes(link.substring(0, 20))) + 1;
       console.log(`    ${consoleColors.yellow}└─> 📍 Localizado cerca de la línea: ${lineNum} en index.html${consoleColors.reset}`);
     }
     
     blankPass = false;
     pass = false;
  }
});
if (blankPass) console.log(`${consoleColors.green}✔️  OK: Todos los enlaces externos están protegidos${consoleColors.reset}`);


// 2. Verificar inyecciones XSS en el JS principal (Validar innerHTML con DOMPurify u otros)
console.log(`\n[2] Verificando Inyecciones XSS (innerHTML) en JS...`);
const js = fs.readFileSync(jsPath, 'utf8');

// Si hay un .innerHTML, mirar si se ha utilizado nuestra función de santización (sanitizeHtmlAllowMarkup o similar)
if (js.includes('.innerHTML') && (!js.includes('sanitizeHtmlAllowMarkup') && !js.includes('sanitizeHtml'))) {
  console.log(`${consoleColors.red}❌ ERROR:${consoleColors.reset} Asignación de innerHTML directo detectada sin filtro (Peligro crítico de XSS)`);
  pass = false;
} else if (js.includes('sanitizeHtmlAllowMarkup') || js.includes('textContent')) {
  console.log(`${consoleColors.green}✔️  OK: Manipulación del DOM usa funciones seguras (sanitizeHtml / textContent)${consoleColors.reset}`);
}


// Resultados:
console.log(`\n${consoleColors.cyan}----------------------------------------------${consoleColors.reset}`);
// Chiste DEV de seguridad
console.log(`${consoleColors.yellow}/* CHISTE DEV SEGURIDAD: ¿Cómo llama un hacker a su novia?\\n   - Te he parseado en SQL, inyectado cariño y quiero robar tu puerto. */${consoleColors.reset}`);

if (pass) {
  console.log(`${consoleColors.green}✅ ESTADO: TODAS LAS PRUEBAS DE SEGURIDAD APROBADAS Y LISTO PARA DESPLIEGUE. 🚀${consoleColors.reset}\n`);
} else {
  console.log(`${consoleColors.red}🚫 ESTADO: HAY VULNERABILIDADES DE SEGURIDAD QUE RESOLVER ANTES DE SUBIR.+${consoleColors.reset}\n`);
  process.exit(1);
}

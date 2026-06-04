#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const results = [];

function section(title) {
    console.log("\n============================================================");
    console.log(title);
    console.log("============================================================");
}

function pushResult(name, ok, details, blocking = true) {
    const status = ok ? "PASS" : (blocking ? "FAIL" : "WARN");
    const msg = details ? `${status} - ${name} -> ${details}` : `${status} - ${name}`;
    console.log(msg);
    results.push({ name, ok, details, blocking });
}

function runNodeScript(name, scriptRelPath, args = [], blocking = true) {
    const scriptAbs = path.join(ROOT, scriptRelPath);
    if (!fs.existsSync(scriptAbs)) {
        pushResult(name, false, `No existe ${scriptRelPath}`, blocking);
        return;
    }

    console.log(`\nRUN  - ${name} (${scriptRelPath})`);
    const child = spawnSync(process.execPath, [scriptAbs, ...args], {
        cwd: ROOT,
        stdio: "inherit",
    });

    if (child.error) {
        pushResult(name, false, child.error.message, blocking);
        return;
    }

    pushResult(name, child.status === 0, `exit code ${child.status}`, blocking);
}

function checkFileExists(name, relPath, blocking = true) {
    const abs = path.join(ROOT, relPath);
    const ok = fs.existsSync(abs);
    pushResult(name, ok, ok ? relPath : `Falta ${relPath}`, blocking);
}

function listLocalAssetRefs(htmlText) {
    const refs = [];
    const re = /(?:src|href)=["']([^"']+)["']/gi;
    let match;

    while ((match = re.exec(htmlText)) !== null) {
        refs.push(match[1]);
    }

    return refs;
}

function isSkippableRef(ref) {
    const value = String(ref || "").trim();

    if (!value) {
        return true;
    }

    return (
        value.startsWith("#") ||
        /^https?:/i.test(value) ||
        /^mailto:/i.test(value) ||
        /^tel:/i.test(value) ||
        /^javascript:/i.test(value) ||
        /^data:/i.test(value) ||
        value.includes("{{") ||
        value.includes("}}")
    );
}

function normalizeRef(ref) {
    return String(ref || "").split("#")[0].split("?")[0].trim();
}

function resolveWebRef(fileAbs, ref) {
    const cleaned = normalizeRef(ref);

    if (!cleaned) {
        return null;
    }

    if (cleaned.startsWith("/")) {
        const rel = cleaned.replace(/^\/+/, "");
        if (!rel) {
            return ROOT;
        }
        return path.join(ROOT, rel);
    }

    return path.resolve(path.dirname(fileAbs), cleaned);
}

function checkHtmlAssets(htmlRelPath, blocking = true) {
    const abs = path.join(ROOT, htmlRelPath);

    if (!fs.existsSync(abs)) {
        pushResult(`Assets locales en ${htmlRelPath}`, false, `No existe ${htmlRelPath}`, blocking);
        return;
    }

    const html = fs.readFileSync(abs, "utf8");
    const refs = listLocalAssetRefs(html);
    const missing = [];

    refs.forEach((ref) => {
        if (isSkippableRef(ref)) {
            return;
        }

        const target = resolveWebRef(abs, ref);
        if (!target) {
            return;
        }

        if (!fs.existsSync(target)) {
            missing.push(ref);
        }
    });

    if (!missing.length) {
        pushResult(`Assets locales en ${htmlRelPath}`, true, `${refs.length} referencias evaluadas`, blocking);
        return;
    }

    const preview = missing.slice(0, 5).join(", ");
    pushResult(`Assets locales en ${htmlRelPath}`, false, `Faltan ${missing.length}: ${preview}`, blocking);
}

function checkStringNotInFile(name, fileRelPath, pattern, blocking = true) {
    const abs = path.join(ROOT, fileRelPath);

    if (!fs.existsSync(abs)) {
        pushResult(name, false, `No existe ${fileRelPath}`, blocking);
        return;
    }

    const content = fs.readFileSync(abs, "utf8");
    const found = typeof pattern === "string" ? content.includes(pattern) : pattern.test(content);
    pushResult(name, !found, found ? "Se encontro referencia no esperada" : "OK", blocking);
}

function checkFormspreeConfigured(blocking = false) {
    const fileRelPath = "js/presupuesto.js";
    const abs = path.join(ROOT, fileRelPath);

    if (!fs.existsSync(abs)) {
        pushResult("Formspree ID configurado", false, `No existe ${fileRelPath}`, blocking);
        return;
    }

    const content = fs.readFileSync(abs, "utf8");
    const configured = !content.includes('const FORMSPREE_FORM_ID = "MY_FORM_ID"');
    pushResult("Formspree ID configurado", configured, configured ? "OK" : "Sigue en MY_FORM_ID", blocking);
}

function summaryAndExit() {
    const total = results.length;
    const passed = results.filter((r) => r.ok).length;
    const failedBlocking = results.filter((r) => !r.ok && r.blocking).length;
    const failedNonBlocking = results.filter((r) => !r.ok && !r.blocking).length;

    section("RESUMEN FINAL");
    console.log(`Total checks: ${total}`);
    console.log(`Checks OK: ${passed}`);
    console.log(`Fallos bloqueantes: ${failedBlocking}`);
    console.log(`Fallos no bloqueantes: ${failedNonBlocking}`);
    console.log("\nNota: los scripts de servidor local se tratan como utilidades de prueba, no como requisito de despliegue final.");

    process.exit(failedBlocking > 0 ? 1 : 0);
}

function main() {
    section("ATEL PROJECT CHECK");
    console.log("Comprobacion integral de frontend con salida paso a paso.");
    console.log("Ejecutando desde:", ROOT);

    section("1) TESTS AUTOMATIZADOS");
    runNodeScript("Test de seguridad", "tests/security.test.js", [], true);
    runNodeScript("Test de calidad", "tests/code-quality.test.js", [], true);

    section("2) INTEGRIDAD DE PROYECTO FRONTEND");
    checkFileExists("Archivo principal index.html", "index.html", true);
    checkFileExists("Script principal main.js", "js/main.js", true);
    checkFileExists("Pagina de presupuesto", "presupuesto/index.html", true);
    checkFileExists("Diccionario de traducciones", "js/translations.js", true);

    checkHtmlAssets("index.html", true);
    checkHtmlAssets("presupuesto/index.html", true);

    checkStringNotInFile(
        "No inyectar dev-server en HTML de produccion",
        "index.html",
        /dev-server\.js/i,
        true
    );

    checkFormspreeConfigured(false);

    section("3) HERRAMIENTAS DE PRUEBA (NO BLOQUEANTES)");
    checkFileExists("Arranque pruebas Windows .bat", "run-local-windows.bat", false);
    checkFileExists("Arranque pruebas Windows .ps1", "run-local-windows.ps1", false);
    checkFileExists("Arranque pruebas Linux", "run-local-linux.sh", false);

    summaryAndExit();
}

main();

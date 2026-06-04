const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROD_DIR = path.join(ROOT, '.dist', 'production');
const OUTPUT_DIR = path.join(ROOT, 'netlify-deploy');

const REDIRECTS = [
    'https://atelsistems.com/* https://www.atelsistems.com/:splat 301!',
    'https://atelsistems.es/* https://www.atelsistems.com/:splat 301!',
    '/presupuesto /presupuesto/ 301',
    '/certificaciones /certificaciones/ 301',
    '/cursos /cursos/ 301',
    '/cursos/index.html /cursos/ 301',
    '/cursos/solicitud.html /cursos/solicitud/ 301'
];

const HEADERS = `/*
    Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), gyroscope=(), accelerometer=()
    Cross-Origin-Resource-Policy: same-site
    Cross-Origin-Opener-Policy: same-origin
    X-Permitted-Cross-Domain-Policies: none
    Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; frame-src https://www.google.com; manifest-src 'self'; upgrade-insecure-requests

/css/*
    Cache-Control: public, max-age=2592000, immutable

/js/*
    Cache-Control: public, max-age=2592000, immutable

/img/*
    Cache-Control: public, max-age=2592000, immutable

/certificaciones/*
    Cache-Control: public, max-age=600

/cursos/*
    Cache-Control: public, max-age=600

/presupuesto/*
    Cache-Control: public, max-age=600

/index.html
    Cache-Control: public, max-age=600
`;

const README = `Netlify Deploy - ATEL SISTEMS

Esta carpeta contiene la version final lista para subir a Netlify.

Uso recomendado:
1. Ejecuta: npm run build:netlify
2. Sube el contenido de esta carpeta como sitio estatico en Netlify.
3. Si usas deploy manual, selecciona esta carpeta como directorio de publicacion.

Contenido principal:
- index.html
- css/
- js/
- img/
- certificaciones/
- presupuesto/

Ficheros auxiliares:
- _headers: cabeceras de seguridad y cache
- _redirects: redirecciones para rutas sin barra final

Dominios previstos:
- www.atelsistems.com como canonico
- atelsistems.es como alias o redireccion
`;

function runBuildProd() {
    const command = process.execPath;
    const args = [path.join(ROOT, 'scripts', 'build-production.js')];

    const child = spawnSync(command, args, {
        cwd: ROOT,
        stdio: 'inherit'
    });

    if (child.error) {
        throw child.error;
    }

    if (child.status !== 0) {
        throw new Error(`build:prod fallo con codigo ${child.status}`);
    }
}

async function main() {
    if (!fs.existsSync(path.join(ROOT, 'package.json'))) {
        throw new Error(`No se encontro package.json en ${ROOT}`);
    }

    runBuildProd();

    if (!fs.existsSync(PROD_DIR)) {
        throw new Error(`No existe la salida de produccion en ${PROD_DIR}`);
    }

    await fs.emptyDir(OUTPUT_DIR);
    await fs.copy(PROD_DIR, OUTPUT_DIR, { overwrite: true });
    await fs.outputFile(path.join(OUTPUT_DIR, '_redirects'), `${REDIRECTS.join('\n')}\n`, 'utf8');
    await fs.outputFile(path.join(OUTPUT_DIR, '_headers'), `${HEADERS}\n`, 'utf8');
    await fs.outputFile(path.join(OUTPUT_DIR, 'README.txt'), `${README}\n`, 'utf8');

    console.log('Build de Netlify completado.');
    console.log(`Salida: ${OUTPUT_DIR}`);
    console.log('Ficheros clave: _headers, _redirects, README.txt');
}

main().catch((error) => {
    console.error('Error en build de Netlify:');
    console.error(error && error.stack ? error.stack : String(error));
    process.exitCode = 1;
});
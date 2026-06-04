const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { minify: minifyHtml } = require('html-minifier-terser');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, '.dist', 'production');

const INCLUDE_PATHS = [
    'index.html',
    '.htaccess',
    'css',
    'js',
    'img',
    'cursos',
    'certificaciones',
    'presupuesto'
];

const OWN_JS_FILES = new Set([
    'js/analytics.js',
    'js/certificaciones.js',
    'js/main.js',
    'js/presupuesto.js',
    'js/security.js',
    'js/site-config.js',
    'js/translations.js'
]);

function normalizeRelPath(relPath) {
    return relPath.split(path.sep).join('/');
}

function stripSourceMapComments(content) {
    return content
        .replace(/\/\/\s*#\s*sourceMappingURL=.*$/gm, '')
        .replace(/\/\*#\s*sourceMappingURL=.*?\*\//g, '');
}

async function processHtml(content) {
    return minifyHtml(content, {
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
        keepClosingSlash: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: false,
        removeAttributeQuotes: false
    });
}

function processCss(content) {
    const result = new CleanCSS({
        level: {
            1: { all: true },
            2: { all: true }
        }
    }).minify(content);

    if (result.errors && result.errors.length) {
        throw new Error(`Error minificando CSS: ${result.errors.join('; ')}`);
    }

    return result.styles;
}

async function processJs(content, relPath) {
    const contentWithoutMaps = stripSourceMapComments(content);

    const terserResult = await minify(contentWithoutMaps, {
        sourceMap: false,
        compress: {
            drop_console: false,
            passes: 2
        },
        mangle: true,
        format: {
            comments: false
        }
    });

    if (!terserResult || typeof terserResult.code !== 'string') {
        throw new Error(`No se pudo minificar JS: ${relPath}`);
    }

    const normalizedRelPath = normalizeRelPath(relPath);
    if (!OWN_JS_FILES.has(normalizedRelPath)) {
        return terserResult.code;
    }

    const obfuscated = JavaScriptObfuscator.obfuscate(terserResult.code, {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,
        rotateStringArray: true,
        selfDefending: false,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 8,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
        transformObjectKeys: true,
        unicodeEscapeSequence: false
    });

    return obfuscated.getObfuscatedCode();
}

async function processFile(absSource, absTarget, relPath) {
    const ext = path.extname(absSource).toLowerCase();

    if (ext === '.map') {
        return { skipped: true, reason: 'source-map' };
    }

    const raw = await fse.readFile(absSource, 'utf8');

    if (ext === '.html') {
        const html = await processHtml(raw);
        await fse.outputFile(absTarget, html, 'utf8');
        return { skipped: false, type: 'html' };
    }

    if (ext === '.css') {
        const css = processCss(raw);
        await fse.outputFile(absTarget, css, 'utf8');
        return { skipped: false, type: 'css' };
    }

    if (ext === '.js') {
        const js = await processJs(raw, relPath);
        await fse.outputFile(absTarget, js, 'utf8');
        return { skipped: false, type: 'js' };
    }

    await fse.copy(absSource, absTarget, { overwrite: true });
    return { skipped: false, type: 'text' };
}

async function copyPathWithTransforms(inputPath, counters) {
    const absInput = path.join(ROOT, inputPath);

    if (!fs.existsSync(absInput)) {
        return;
    }

    const stats = await fse.stat(absInput);

    if (stats.isDirectory()) {
        const entries = await fse.readdir(absInput);
        for (const entry of entries) {
            await copyPathWithTransforms(path.join(inputPath, entry), counters);
        }
        return;
    }

    const relPath = path.relative(ROOT, absInput);
    const absOutput = path.join(OUTPUT_DIR, relPath);

    const blockedExtensions = new Set(['.torrent']);
    const textBasedExtensions = new Set(['.html', '.css', '.js', '.txt', '.json', '.xml', '.svg', '.webmanifest', '.ico']);
    const ext = path.extname(absInput).toLowerCase();

    if (blockedExtensions.has(ext)) {
        counters.skipped += 1;
        return;
    }

    if (textBasedExtensions.has(ext)) {
        const result = await processFile(absInput, absOutput, relPath);
        if (result.skipped) {
            counters.skipped += 1;
            return;
        }

        counters.processed += 1;
        counters.byType[result.type] = (counters.byType[result.type] || 0) + 1;
        return;
    }

    await fse.copy(absInput, absOutput, { overwrite: true });
    counters.copied += 1;
}

async function main() {
    const counters = {
        processed: 0,
        copied: 0,
        skipped: 0,
        byType: {}
    };

    await fse.ensureDir(path.join(ROOT, '.dist'));
    await fse.emptyDir(OUTPUT_DIR);

    for (const includePath of INCLUDE_PATHS) {
        await copyPathWithTransforms(includePath, counters);
    }

    const summary = [
        'Build de produccion completado.',
        `Salida: ${OUTPUT_DIR}`,
        `Procesados (html/css/js): ${counters.processed}`,
        `Copiados (binarios/otros): ${counters.copied}`,
        `Omitidos (source maps): ${counters.skipped}`
    ];

    console.log(summary.join('\n'));
}

main().catch((error) => {
    console.error('Error en build de produccion:');
    console.error(error && error.stack ? error.stack : String(error));
    process.exitCode = 1;
});

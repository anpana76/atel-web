const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const raw = fs.readFileSync(filePath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const idx = trimmed.indexOf('=');
        if (idx <= 0) return;

        const key = trimmed.slice(0, idx).trim();
        let value = trimmed.slice(idx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        if (key && !process.env[key]) {
            process.env[key] = value;
        }
    });
}

loadEnvFile(path.join(__dirname, '.env.public'));

function parsePort(value, fallback) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed >= 0) {
        return parsed;
    }

    return fallback;
}

let PORT = parsePort(process.env.PORT, 8080);
const HOST = process.env.HOST && process.env.HOST !== '0.0.0.0' ? process.env.HOST : '127.0.0.1';
const ENABLE_PUBLIC_TUNNEL = process.argv.includes('--public') || process.env.PUBLIC === '1';
const PROVIDER_ARG_INDEX = process.argv.indexOf('--provider');
const TUNNEL_PROVIDER = PROVIDER_ARG_INDEX > -1 ? process.argv[PROVIDER_ARG_INDEX + 1] : (process.env.TUNNEL_PROVIDER || 'localtunnel');
const NGROK_MODE = (process.env.NGROK_MODE || 'auto').toLowerCase();
const NGROK_DOMAIN = process.env.NGROK_DOMAIN;
const NGROK_AUTHTOKEN = process.env.NGROK_AUTHTOKEN;
const HAS_REAL_NGROK_DOMAIN = !!NGROK_DOMAIN && NGROK_DOMAIN !== 'tu-subdominio.ngrok.app';
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || '';
const OPEN_BROWSER = process.env.OPEN_BROWSER === '1';
const SERVE_DIST = process.argv.includes('--dist') || process.env.SERVE_DIST === '1';

const app = express();
const rootDir = __dirname;
const distDir = path.join(rootDir, '.dist', 'production');
const siteRoot = SERVE_DIST && fs.existsSync(distDir) ? distDir : rootDir;

app.disable('x-powered-by');

app.use((req, res, next) => {
    const csp = [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
        "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
        "img-src 'self' data: https:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
        "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
        "frame-src https://www.google.com"
    ].join('; ');

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), gyroscope=(), accelerometer=()');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Content-Security-Policy', csp);
    next();
});

function printHeader() {
    console.log('===========================================');
    console.log('ATEL Web - Servidor de previsualizacion');
    console.log('===========================================');
    if (SERVE_DIST) {
        if (siteRoot === distDir) {
            console.log(`Origen contenido: ${siteRoot}`);
        } else {
            console.log('Origen contenido: raiz del proyecto (no existe .dist/production, usando fallback)');
        }
    }
    console.log(`Local (fija): http://localhost:${PORT}`);
}

function openBrowser(url) {
    if (!OPEN_BROWSER) return;
    const escapedUrl = url.replace(/"/g, '');

    if (process.platform === 'win32') {
        exec(`start "" "${escapedUrl}"`);
        return;
    }

    if (process.platform === 'darwin') {
        exec(`open "${escapedUrl}"`);
        return;
    }

    exec(`xdg-open "${escapedUrl}"`);
}

function listenOnPort(port) {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, HOST);
        server.once('listening', () => resolve(server));
        server.once('error', reject);
    });
}

async function listenWithFallback(preferredPort) {
    const attempts = [];

    if (Number.isInteger(preferredPort) && preferredPort > 0) {
        for (let offset = 0; offset <= 10; offset += 1) {
            attempts.push(preferredPort + offset);
        }
    }

    attempts.push(0);

    const seen = new Set();
    for (const port of attempts) {
        if (seen.has(port)) continue;
        seen.add(port);

        try {
            return await listenOnPort(port);
        } catch (error) {
            if (!error || !['EADDRINUSE', 'EACCES'].includes(error.code)) {
                throw error;
            }
        }
    }

    throw new Error(`No se pudo abrir el servidor en ${HOST}`);
}

async function startNgrokTunnel() {
    // Usamos el CLI oficial de ngrok para evitar errores de la libreria npm en algunos entornos.
    // El authtoken puede venir de .env.public o de la configuracion global de ngrok.
    if (NGROK_AUTHTOKEN && NGROK_AUTHTOKEN !== 'pega_aqui_tu_token_ngrok') {
        spawn('ngrok', ['config', 'add-authtoken', NGROK_AUTHTOKEN], { stdio: 'ignore' });
    }

    const args = ['http', String(PORT), '--log=stdout'];
    const useFixedDomain = !!NGROK_DOMAIN && (NGROK_MODE === 'fixed' || (NGROK_MODE === 'auto' && HAS_REAL_NGROK_DOMAIN));
    if (useFixedDomain) {
        args.push('--domain', NGROK_DOMAIN);
    }

    const ngrokProcess = spawn('ngrok', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let latestError = '';

    ngrokProcess.stderr.on('data', (chunk) => {
        latestError += chunk.toString();
    });

    // Esperamos a que el API local de ngrok exponga el tunel.
    const start = Date.now();
    let publicUrl = '';
    while (!publicUrl && Date.now() - start < 15000) {
        try {
            const res = await fetch('http://127.0.0.1:4040/api/tunnels');
            if (res.ok) {
                const data = await res.json();
                const tunnels = Array.isArray(data.tunnels) ? data.tunnels : [];
                const httpsTunnel = tunnels.find((t) => typeof t.public_url === 'string' && t.public_url.startsWith('https://'));
                if (httpsTunnel) {
                    publicUrl = httpsTunnel.public_url;
                    break;
                }
            }
        } catch (err) {
            // ngrok puede tardar unos segundos en levantar el API local
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!publicUrl) {
        try {
            ngrokProcess.kill();
        } catch (err) {
            // no-op
        }
        const errorHint = latestError.trim() || 'No se pudo obtener URL publica desde ngrok.';
        throw new Error(errorHint);
    }

    return {
        url: publicUrl,
        close: () => {
            try {
                ngrokProcess.kill();
            } catch (err) {
                // no-op
            }
        }
    };
}

async function startLocalTunnel() {
    const localtunnel = require('localtunnel');
    const tunnel = await localtunnel({ port: PORT });
    return {
        url: tunnel.url,
        close: () => tunnel.close()
    };
}

app.use('/css', express.static(path.join(siteRoot, 'css'), {
    dotfiles: 'deny',
    index: false,
    maxAge: '1h'
}));

app.use('/js', express.static(path.join(siteRoot, 'js'), {
    dotfiles: 'deny',
    index: false,
    maxAge: '1h'
}));

app.use('/img', express.static(path.join(siteRoot, 'img'), {
    dotfiles: 'deny',
    index: false,
    maxAge: '1h'
}));

app.use('/presupuesto', express.static(path.join(siteRoot, 'presupuesto'), {
    dotfiles: 'deny',
    index: ['index.html'],
    maxAge: '1h'
}));

app.use('/certificaciones', express.static(path.join(siteRoot, 'certificaciones'), {
    dotfiles: 'deny',
    index: ['index.html'],
    maxAge: '1h'
}));

app.use('/cursos', express.static(path.join(siteRoot, 'cursos'), {
    dotfiles: 'deny',
    index: ['index.html'],
    maxAge: '1h'
}));

app.get(['/', '/index.html'], (req, res) => {
    res.sendFile(path.join(siteRoot, 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({
        ok: true,
        service: 'atelweb-public-preview',
        port: PORT
    });
});

app.use((req, res) => {
    res.status(404).type('text/plain').send('Not found');
});

(async () => {
    try {
        const server = await listenWithFallback(PORT);
        PORT = server.address().port;

        printHeader();

        const localUrl = `http://localhost:${PORT}`;

        if (!ENABLE_PUBLIC_TUNNEL) {
            console.log('Publico: desactivado');
            console.log('Activalo con: npm run serve:internet');
            console.log(`URL FINAL: ${localUrl}`);
            openBrowser(localUrl);
            return;
        }

        try {
            let tunnel;
            if (TUNNEL_PROVIDER === 'ngrok') {
                tunnel = await startNgrokTunnel();
            } else {
                tunnel = await startLocalTunnel();
            }

            const displayUrl = PUBLIC_SITE_URL || tunnel.url;

            console.log('-------------------------------------------');
            const publicModeLabel = TUNNEL_PROVIDER === 'ngrok' && (NGROK_MODE === 'fixed' || (NGROK_MODE === 'auto' && HAS_REAL_NGROK_DOMAIN))
                ? 'URL PUBLICA FIJA:'
                : 'URL PUBLICA (puede cambiar):';
            console.log(publicModeLabel);
            if (displayUrl !== tunnel.url) {
                console.log(`URL TUNEL: ${tunnel.url}`);
            }
            console.log('-------------------------------------------');
            console.log(`URL FINAL: ${displayUrl}`);
            console.log('Pulsa Ctrl+C para cerrar el servidor y el tunel.');
            openBrowser(displayUrl);

            const closeTunnel = () => {
                Promise.resolve(tunnel.close()).catch(() => {});
            };

            process.on('SIGINT', () => {
                closeTunnel();
                process.exit(0);
            });

            process.on('SIGTERM', () => {
                closeTunnel();
                process.exit(0);
            });
        } catch (error) {
            console.error('No se pudo abrir el tunel publico.');
            console.error(error.message);
            if (TUNNEL_PROVIDER === 'ngrok') {
                console.error('Revisa que ngrok CLI este instalado y autenticado.');
                console.error('Para URL fija, define NGROK_DOMAIN o PUBLIC_SITE_URL en .env.public.');
            } else {
                console.error('Localtunnel puede mostrar un aviso de seguridad con validacion de IP.');
            }
            console.error('Puedes seguir usando la web en local.');
        }
    } catch (error) {
        console.error('No se pudo abrir el servidor de previsualizacion.');
        console.error(error.message);
        process.exitCode = 1;
    }
})();

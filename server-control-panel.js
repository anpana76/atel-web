const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');

let PANEL_PORT = parsePort(process.env.PANEL_PORT, 8090);
const PANEL_HOST = '127.0.0.1';
const PROJECT_ROOT = __dirname;
const SERVER_ENTRY = path.join(PROJECT_ROOT, 'public-preview-server.js');
const OPEN_BROWSER = process.env.OPEN_BROWSER === '1';
const AUTO_START_MODE = (process.env.AUTO_START_MODE || '').toLowerCase();

let runtime = {
    child: null,
    mode: null,
    publicUrl: null,
    startedAt: null,
    logs: []
};

function loadEnvFromFile(filePath) {
    const env = {};
    if (!fs.existsSync(filePath)) return env;

    const raw = fs.readFileSync(filePath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eq = trimmed.indexOf('=');
        if (eq <= 0) return;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        env[key] = value;
    });

    return env;
}

  function parsePort(value, fallback) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed >= 0) {
      return parsed;
    }

    return fallback;
  }

function pushLog(line) {
    const stamp = new Date().toISOString();
    runtime.logs.push(`[${stamp}] ${line}`);
    if (runtime.logs.length > 200) {
        runtime.logs = runtime.logs.slice(-200);
    }
}

function openBrowser(url) {
  if (!OPEN_BROWSER) return;

  const safeUrl = String(url || '').replace(/"/g, '');
  if (!safeUrl) return;

  if (process.platform === 'win32') {
    exec(`start "" "${safeUrl}"`);
    return;
  }

  if (process.platform === 'darwin') {
    exec(`open "${safeUrl}"`);
    return;
  }

  exec(`xdg-open "${safeUrl}"`);
}

  function listenOnPort(port) {
    return new Promise((resolve, reject) => {
      const server = app.listen(port, PANEL_HOST);
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

    throw new Error(`No se pudo abrir el panel de control en ${PANEL_HOST}`);
  }

function getStatus() {
    return {
        running: !!runtime.child,
        mode: runtime.mode,
        publicUrl: runtime.publicUrl,
    localUrl: runtime.publicUrl || 'http://localhost:8080',
        startedAt: runtime.startedAt,
        pid: runtime.child ? runtime.child.pid : null,
        logs: runtime.logs.slice(-25)
    };
}

function buildStartConfig(mode, envFile) {
    const args = [];
    const env = {
        ...process.env,
        ...envFile,
        OPEN_BROWSER: '0'
    };

    if (mode === 'dynamic') {
        args.push('--public', '--provider', 'ngrok');
        env.NGROK_MODE = 'dynamic';
    } else if (mode === 'fixed') {
        args.push('--public', '--provider', 'ngrok');
        env.NGROK_MODE = 'fixed';
      // No forzar dominio manual: usar la URL que devuelve el servidor/tunel.
      env.PUBLIC_SITE_URL = '';
    }

    return { args, env };
}

function validateMode(mode, envFile) {
    if (!['local', 'dynamic', 'fixed'].includes(mode)) {
        return 'Modo no valido';
    }

    const token = envFile.NGROK_AUTHTOKEN;

    if ((mode === 'dynamic' || mode === 'fixed') && (!token || token === 'pega_aqui_tu_token_ngrok')) {
        return 'Falta NGROK_AUTHTOKEN valido en .env.public';
    }

    return null;
}

function stopServer() {
    return new Promise((resolve) => {
        if (!runtime.child) {
            resolve(false);
            return;
        }

        const proc = runtime.child;
        runtime.child = null;
        runtime.mode = null;
        runtime.publicUrl = null;
        runtime.startedAt = null;

        const done = () => resolve(true);
        proc.once('exit', done);

        try {
            proc.kill('SIGINT');
        } catch (err) {
            try {
                proc.kill();
            } catch (e) {
                // no-op
            }
            resolve(true);
        }

        setTimeout(() => {
            try {
                proc.kill('SIGKILL');
            } catch (e) {
                // no-op
            }
        }, 2000);
    });
}

async function startServer(mode) {
    await stopServer();

    const envFile = loadEnvFromFile(path.join(PROJECT_ROOT, '.env.public'));
    const validationError = validateMode(mode, envFile);
    if (validationError) {
        throw new Error(validationError);
    }

    const { args, env } = buildStartConfig(mode, envFile);
    const child = spawn('node', [SERVER_ENTRY, ...args], {
        cwd: PROJECT_ROOT,
        env,
        stdio: ['ignore', 'pipe', 'pipe']
    });

    runtime.child = child;
    runtime.mode = mode;
    runtime.startedAt = new Date().toISOString();
    runtime.publicUrl = null;
    pushLog(`Servidor iniciado en modo ${mode}`);

    child.stdout.on('data', (chunk) => {
        const text = chunk.toString();
        text.split(/\r?\n/).filter(Boolean).forEach((line) => {
            pushLog(line);
            if (line.startsWith('URL FINAL:')) {
                const maybeUrl = line.replace('URL FINAL:', '').trim();
                if (maybeUrl.startsWith('http://') || maybeUrl.startsWith('https://')) {
                    runtime.publicUrl = maybeUrl;
                }
            }
        });
    });

    child.stderr.on('data', (chunk) => {
        const text = chunk.toString();
        text.split(/\r?\n/).filter(Boolean).forEach((line) => pushLog(`ERR: ${line}`));
    });

    child.once('exit', (code) => {
        pushLog(`Servidor finalizado (code=${code})`);
        runtime.child = null;
        runtime.mode = null;
        runtime.publicUrl = null;
        runtime.startedAt = null;
    });
}

const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
});

app.get('/', (req, res) => {
    res.type('html').send(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>ATEL Control</title>
  <style>
    :root {
      --bg: #f6f7f8;
      --fg: #1f2a33;
      --ok: #1f7a46;
      --warn: #9a6700;
      --card: #ffffff;
      --line: #d9dee3;
      --btn: #0a5f7a;
      --btn2: #6c757d;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", "Trebuchet MS", sans-serif;
      background: linear-gradient(180deg, #f6f7f8 0%, #eef2f5 100%);
      color: var(--fg);
      padding: 20px;
    }
    .wrap {
      max-width: 860px;
      margin: 0 auto;
      display: grid;
      gap: 14px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 14px;
    }
    .status-banner {
      border-radius: 12px;
      padding: 14px;
      border: 1px solid var(--line);
      background: #fff;
      display: grid;
      gap: 4px;
    }
    .status-banner.running { border-left: 6px solid var(--ok); }
    .status-banner.stopped { border-left: 6px solid #b23a48; }
    .status-title { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #52606d; }
    .status-value { font-size: 22px; font-weight: 700; }
    .status-subtitle { font-size: 12px; color: #52606d; }
    h1 { margin: 0; font-size: 22px; }
    .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    button {
      border: 0;
      border-radius: 8px;
      padding: 10px 12px;
      color: white;
      cursor: pointer;
      font-weight: 600;
    }
    .start { background: var(--btn); }
    .stop { background: #b23a48; }
    .ghost { background: var(--btn2); }
    .pill {
      display: inline-block;
      padding: 4px 9px;
      border-radius: 999px;
      font-size: 12px;
      border: 1px solid var(--line);
      background: #f8fafc;
    }
    .ok { color: var(--ok); }
    .warn { color: var(--warn); }
    .mono {
      font-family: Consolas, "Courier New", monospace;
      white-space: pre-wrap;
      word-break: break-word;
      background: #f8fafc;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      min-height: 120px;
      max-height: 320px;
      overflow: auto;
      font-size: 12px;
    }
    select {
      padding: 9px;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: white;
      min-width: 260px;
    }
    a { color: #0b5ea8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Control del Servidor</h1>
      <div id="statusBanner" class="status-banner stopped" style="margin-top:12px;">
        <div class="status-title">Estado actual</div>
        <div id="statusValue" class="status-value">Detenido</div>
        <div id="statusSubtitle" class="status-subtitle">Elige un modo y pulsa Iniciar, o usa Reiniciar todo.</div>
      </div>
      <div style="margin-top:8px" class="row">
        <span id="runningPill" class="pill warn">detenido</span>
        <span id="modePill" class="pill">modo: -</span>
      </div>
    </div>

    <div class="card">
      <div class="row">
        <form method="POST" action="/action/start" class="row" style="margin:0;">
          <select name="mode">
            <option value="local">Local fijo (localhost)</option>
            <option value="dynamic">Internet dinamico (ngrok)</option>
            <option value="fixed">Internet fijo (ngrok + dominio)</option>
          </select>
          <button type="submit" class="start">Iniciar</button>
        </form>
        <form method="POST" action="/action/stop" style="margin:0;">
          <button type="submit" class="stop">Detener</button>
        </form>
        <form method="POST" action="/action/restart-all" style="margin:0;">
          <button type="submit" class="ghost">Reiniciar todo</button>
        </form>
        <button type="button" class="ghost" id="btnRefresh">Actualizar</button>
      </div>
      <div style="margin-top:8px; font-size:12px; color:#52606d;" id="hintBox">Controles listos.</div>
      <div style="margin-top:10px" id="urlBox" class="mono">URL final: -</div>
    </div>

    <div class="card">
      <strong>Logs recientes</strong>
      <div style="margin-top:8px" id="logs" class="mono"></div>
    </div>
  </div>

<script>
  const runningPill = document.getElementById('runningPill');
  const modePill = document.getElementById('modePill');
  const statusBanner = document.getElementById('statusBanner');
  const statusValue = document.getElementById('statusValue');
  const statusSubtitle = document.getElementById('statusSubtitle');
  const logs = document.getElementById('logs');
  const urlBox = document.getElementById('urlBox');
  const hintBox = document.getElementById('hintBox');

  async function refreshStatus() {
    const res = await fetch('/api/status', { cache: 'no-store' });
    const s = await res.json();

    runningPill.textContent = s.running ? 'en ejecucion' : 'detenido';
    runningPill.className = 'pill ' + (s.running ? 'ok' : 'warn');
    modePill.textContent = 'modo: ' + (s.mode || '-');
    statusBanner.className = 'status-banner ' + (s.running ? 'running' : 'stopped');
    statusValue.textContent = s.running ? 'Servidor en marcha' : 'Servidor detenido';
    statusSubtitle.textContent = s.running
      ? 'URL lista para compartir y detener cuando quieras.'
      : 'Elige un modo y pulsa Iniciar, o usa Reiniciar todo.';

    const finalUrl = s.publicUrl || s.localUrl || '-';
    urlBox.innerHTML = 'URL final: ' + (finalUrl.startsWith('http')
      ? '<a target="_blank" rel="noopener noreferrer" href="' + finalUrl + '">' + finalUrl + '</a>'
      : '<span style="color:#52606d;">' + finalUrl + '</span>');

    logs.textContent = (s.logs || []).join('\\n');
  }
  document.getElementById('btnRefresh').addEventListener('click', refreshStatus);

  refreshStatus();
  setInterval(refreshStatus, 1500);
</script>
</body>
</html>`);
});

app.get('/api/status', (req, res) => {
    res.json(getStatus());
});

app.post('/api/start', async (req, res) => {
    const mode = (req.body?.mode || '').toLowerCase();
    try {
        await startServer(mode);
        res.json({ ok: true, status: getStatus() });
    } catch (err) {
        pushLog(`ERR: ${err.message}`);
        res.status(400).json({ ok: false, error: err.message });
    }
});

app.post('/api/stop', async (req, res) => {
    await stopServer();
    res.json({ ok: true, status: getStatus() });
});

app.post('/action/start', async (req, res) => {
  const mode = String(req.body?.mode || '').toLowerCase();
  try {
    await startServer(mode);
  } catch (err) {
    pushLog(`ERR: ${err.message}`);
  }
  res.redirect('/');
});

app.post('/action/stop', async (req, res) => {
  await stopServer();
  res.redirect('/');
});

app.post('/action/restart-all', async (req, res) => {
  const restartBatch = path.join(PROJECT_ROOT, 'restart-all.bat');

  try {
    const child = spawn('cmd.exe', ['/c', 'start', '""', restartBatch], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    pushLog('Reinicio total lanzado desde el panel');
    res.type('html').send(`<!doctype html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="refresh" content="2;url=/" />
        <title>Reiniciando...</title>
        <style>
          body { font-family: Segoe UI, sans-serif; padding: 40px; background: #f6f7f8; color: #1f2a33; }
          .box { max-width: 560px; margin: 0 auto; background: white; border: 1px solid #d9dee3; border-radius: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Reiniciando todo</h1>
          <p>Se estan cerrando los procesos Node y se relanzara <strong>internet.bat</strong>.</p>
          <p>Esta ventana volvera al panel en unos segundos.</p>
        </div>
      </body>
      </html>`);
  } catch (err) {
    pushLog(`ERR: ${err.message}`);
    res.status(500).type('html').send(`<p>Error: ${err.message}</p><p><a href="/">Volver</a></p>`);
  }
});

function escapeForSingleQuotes(value) {
  return String(value).replace(/'/g, "''");
}

function buildRestartScript() {
  return path.join(PROJECT_ROOT, 'restart-all.bat');
}

app.post('/api/restart-all', async (req, res) => {
  const restartBatch = buildRestartScript();
  try {
    const child = spawn('cmd.exe', ['/c', 'start', '""', restartBatch], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    pushLog('Reinicio total lanzado: cerrando Node y relanzando internet.bat');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

(async () => {
  try {
    const server = await listenWithFallback(PANEL_PORT);
    PANEL_PORT = server.address().port;

    const panelUrl = `http://${PANEL_HOST}:${PANEL_PORT}`;
    console.log('===========================================');
    console.log('ATEL Panel de Control');
    console.log('===========================================');
    console.log(`Panel: ${panelUrl}`);
    openBrowser(panelUrl);

    if (['local', 'dynamic', 'fixed'].includes(AUTO_START_MODE)) {
      console.log(`Auto-start: ${AUTO_START_MODE}`);
      startServer(AUTO_START_MODE).catch((err) => {
        pushLog(`ERR: ${err.message}`);
        console.error(err.message);
      });
    }
  } catch (error) {
    console.error('No se pudo abrir el panel de control.');
    console.error(error.message);
    process.exitCode = 1;
  }
})();

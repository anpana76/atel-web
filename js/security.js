/* ==============================================================
   SECURITY.JS - HARDENING CLIENTE REALISTA
   Nota: la seguridad principal debe estar en cabeceras y backend.
============================================================== */
(function () {
    const TRUSTED_HOSTS = new Set([
        'www.atelsistems.com',
        'atelsistems.com',
        'localhost',
        '127.0.0.1'
    ]);

    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    // Forzar HTTPS fuera de entornos locales para evitar downgrade y MITM en enlaces directos.
    if (!isLocal && window.location.protocol !== 'https:') {
        const httpsUrl = `https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.replace(httpsUrl);
        return;
    }

    // Defensa de respaldo contra clickjacking solo en producción.
    // En entornos locales/preview (iframe de herramientas) esto puede causar recargas en bucle.
    const shouldEnforceFrameBusting = !isLocal && TRUSTED_HOSTS.has(host);

    if (shouldEnforceFrameBusting && window.top !== window.self) {
        try {
            window.top.location = window.self.location;
        } catch (error) {
            document.documentElement.style.display = 'none';
        }
    }

    // Indicador visual si el sitio se está sirviendo desde un dominio no autorizado.
    if (!TRUSTED_HOSTS.has(host)) {
        document.addEventListener('DOMContentLoaded', function () {
            const warning = document.createElement('div');
            warning.setAttribute('role', 'alert');
            warning.style.position = 'fixed';
            warning.style.top = '0';
            warning.style.left = '0';
            warning.style.right = '0';
            warning.style.zIndex = '9999';
            warning.style.background = '#8a1f1f';
            warning.style.color = '#fff';
            warning.style.padding = '12px 16px';
            warning.style.fontSize = '14px';
            warning.style.fontWeight = '700';
            warning.style.textAlign = 'center';
            warning.style.boxShadow = '0 3px 10px rgba(0,0,0,0.25)';
            warning.textContent = 'Dominio no verificado. Comprueba que estas en www.atelsistems.com antes de enviar datos.';
            document.body.prepend(warning);
        });
    }
})();

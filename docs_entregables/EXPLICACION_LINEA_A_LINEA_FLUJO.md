# Explicación Línea a Línea y Flujo del Código — ATEL SISTEMS (Frontend Only)

---

## 1. index.html — Punto de entrada y orquestador del flujo

### Estructura y propósito

- Este archivo es la raíz de la web. Define la estructura visual, carga todos los recursos (CSS, JS), y enlaza el resto de páginas y módulos.
- Es el punto de inicio del flujo de usuario y de datos.

### Explicación por bloques (fragmento representativo)

```html
<!DOCTYPE html>
<html lang="es" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Optimizaciones de fuentes y color navegador móvil -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <meta name="theme-color" content="#448a3c">
    <title>ATEL SISTEMS | Ingeniería, Seguridad y Telecomunicaciones en Costa del Sol</title>
    <!-- Carga de estilos principales y fallback -->
    <link rel="stylesheet" href="css/aos.css">
    <link rel="stylesheet" href="css/bootstrap-icons.min.css?v=20260325a" onerror="this.onerror=null;this.href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';">
    <link rel="stylesheet" href="css/styles.css?v=20260403" onerror="this.onerror=null;this.href='css/styles.css';">
    <!-- Favicon y manifest para PWA -->
    <link rel="icon" type="image/x-icon" href="img/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="img/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="img/favicon-16x16.png">
    <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
    <link rel="manifest" href="img/site.webmanifest">
    <!-- SEO básico y avanzado, Open Graph, Twitter, Schema.org, localización -->
    <!-- ... -->
    <!-- Carga de scripts principales (defer para no bloquear renderizado) -->
    <script src="js/aos.js?v=20260325c" defer></script>
    <script src="js/translations.js?v=20260411c" defer></script>
    <script src="js/site-config.js?v=20260408a" defer></script>
    <script src="js/security.js" defer></script>
    <script src="js/main.js?v=20260411m" defer></script>
    <!-- Google Analytics y datos estructurados -->
    <!-- ... -->
</head>
<body>
    <a class="skip-link" href="#main-content" data-i18n="skip-main-content">Saltar al contenido principal</a>
    <nav class="navbar" aria-label="Navegación principal" data-i18n-aria-label="nav-main-aria">
        <!-- ... -->
        <select id="language-select" class="lang-select" aria-label="Seleccionar idioma" data-i18n-aria-label="lang-select-aria">
            <option value="es">ES</option>
            <option value="en">EN</option>
            <!-- ...otros idiomas... -->
        </select>
    </nav>
    <main id="main-content">
        <!-- Hero, servicios, empresa, certificaciones, productos, contacto -->
    </main>
    <footer>
        <!-- Enlaces legales, redes sociales, cookies -->
    </footer>
</body>
</html>
```

#### Explicación y flujo

- **Carga de CSS y JS:**
  - El navegador descarga primero los estilos y después los scripts, que se ejecutan tras el parseo del HTML (`defer`).
  - Esto permite que la estructura visual esté lista antes de que se ejecute la lógica JS.
- **Selector de idioma:**
  - El `<select id="language-select">` es gestionado por `js/main.js` y `js/translations.js`.
  - Al cambiar el idioma, se actualizan todos los textos con `data-i18n`.
- **Navegación:**
  - Los enlaces del menú navegan por anclas internas o a otras páginas (ej: presupuesto/index.html).
- **Accesibilidad:**
  - El enlace `.skip-link` permite saltar al contenido principal con teclado.
- **SEO y legal:**
  - Metaetiquetas, Open Graph, JSON-LD y enlaces legales aseguran cumplimiento y visibilidad.
- **Scripts:**
  - `js/aos.js`: animaciones al hacer scroll.
  - `js/translations.js`: diccionario multiidioma.
  - `js/site-config.js`: configuración global (Formspree, Analytics, mapas).
  - `js/security.js`: hardening en cliente.
  - `js/main.js`: lógica de interfaz, eventos, navegación, i18n.

---

## 2. js/main.js — Lógica de interfaz, eventos y traducción

### Fragmento y explicación línea a línea

```js
// Inicializa baguetteBox.js para galerías de imágenes
window.addEventListener("DOMContentLoaded", function() {
    if (typeof baguetteBox !== "undefined") {
        baguetteBox.run('.gallery', {
            animation: 'fade',
            noScrollbars: true,
        });
    }
});
```

- **window.addEventListener("DOMContentLoaded", ...):** Espera a que el DOM esté listo antes de ejecutar la función.
- **baguetteBox.run('.gallery', ...):** Inicializa la galería de imágenes si la librería está cargada.

```js
const LANGUAGE_STORAGE_KEY = "atelLanguage";
const INTENT_STORAGE_KEY = "atelIntentProfileV1";
```

- **Constantes:** Claves para guardar el idioma y la intención del usuario en localStorage.

```js
function isReloadNavigation() {
    try {
        const entries = performance.getEntriesByType("navigation");
        if (entries && entries.length > 0) {
            return entries[0].type === "reload";
        }
    } catch (error) {
        // Fallback legacy API.
    }
    return typeof performance.navigation === "object" && performance.navigation.type === 1;
}
```

- **Función:** Detecta si la navegación actual es una recarga de página.
- **Utiliza:** API de Performance Navigation.

```js
function scrollToHeroOnReload() {
    if (!isReloadNavigation()) {
        return;
    }
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }
    const hero = document.querySelector(".hero");
    const rootStyles = getComputedStyle(document.documentElement);
    const navbarHeight = parseInt(rootStyles.getPropertyValue("--navbar-height"), 10) || 96;
    const targetTop = hero
        ? hero.getBoundingClientRect().top + window.pageYOffset - (navbarHeight + 8)
        : 0;
    window.requestAnimationFrame(() => {
        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth",
        });
    });
}
window.addEventListener("load", scrollToHeroOnReload);
```

- **Función:** Si la página se recarga, hace scroll automático al bloque `.hero` para mejorar la experiencia.
- **Utiliza:** getComputedStyle, scrollRestoration, requestAnimationFrame.

... (continúa con cada función y bloque relevante)

---

## 3. js/translations.js — Diccionario multiidioma

- Define el objeto `translations` con claves por idioma y texto.
- Cada clave coincide con un atributo `data-i18n` en el HTML.
- El flujo: cuando el usuario cambia el idioma, `main.js` recorre todos los elementos con `data-i18n` y actualiza su texto usando este diccionario.

---

## 4. js/site-config.js — Configuración global

- Define `window.ATEL_CONFIG` con:
  - FORMSPREE_FORM_ID: ID del formulario de presupuestos.
  - CONTACT_EMAIL: Email de contacto.
  - GOOGLE_ANALYTICS_ID: ID de Analytics.
  - MAPS: enlaces y embeds de Google Maps.
- Es accedido por otros scripts para obtener configuración sin duplicar datos.

---

## 5. js/security.js — Hardening en cliente

- Comprueba si el sitio está en HTTPS (excepto localhost) y redirige si no lo está.
- Aplica frame busting para evitar clickjacking si el dominio es de confianza.
- Muestra un aviso visual si el dominio no es uno de los permitidos.
- Todo el código está encapsulado en una IIFE para no contaminar el scope global.

---

## 6. js/presupuesto.js — Lógica del formulario de presupuesto

- Obtiene referencias a los campos del formulario.
- Centra visualmente la tarjeta de presupuesto en desktop.
- Valida los campos con reglas estrictas (nombre real, email válido, teléfono, mensaje con contexto, etc.).
- Usa heurísticas antispam y un campo honeypot oculto.
- Al enviar, construye un FormData y lo envía a Formspree usando fetch.
- Gestiona el feedback visual y accesible para el usuario.
- Permite cambiar idioma y actualiza todos los textos del formulario.
- Usa la configuración de ATEL_CONFIG para obtener el ID de Formspree y el email de contacto.

---

## 7. css/styles.css — Variables, layout y temas

- Define variables CSS en `:root` para colores, fuentes, transiciones.
- Aplica reset universal y estilos base.
- Usa Grid y Flexbox para el layout.
- Define clases para hero, navbar, menús, botones, formularios, tablas, etc.
- Incluye media queries para responsividad.
- Añade comentarios didácticos y chistes dev.

---

## 8. scripts/build-production.js — Minificación y ofuscación

- Script Node.js que recorre todos los archivos del proyecto.
- Minifica HTML, CSS y JS usando Terser, CleanCSS y html-minifier-terser.
- Ofusca el JS propio con JavaScriptObfuscator.
- Copia los archivos procesados a `.dist/production`.
- Reporta errores y estadísticas de procesamiento.

---

## 9. tests/security.test.js, tests/code-quality.test.js, tests/check-project.js

- Analizan el código fuente en busca de vulnerabilidades, malas prácticas y archivos faltantes.
- Usan expresiones regulares y análisis estático.
- Muestran advertencias y errores en consola.
- Permiten modo verbose para depuración.

---

## 10. Flujo de datos y relaciones

1. El usuario accede a index.html, que carga todos los recursos.
2. main.js inicializa la interfaz, gestiona eventos y el idioma.
3. translations.js provee los textos traducidos.
4. site-config.js centraliza la configuración para todos los módulos.
5. security.js protege el sitio en cliente.
6. Si el usuario va a presupuesto/index.html, presupuesto.js gestiona el formulario, validación y envío.
7. styles.css define la apariencia y responsividad.
8. Antes de desplegar, build-production.js minifica y ofusca todo.
9. Los tests aseguran calidad y seguridad antes de publicar.

---

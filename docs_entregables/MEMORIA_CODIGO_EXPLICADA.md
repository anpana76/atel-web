# Memoria Explicada del Código — ATEL SISTEMS (Frontend Only)

---

## Índice
1. Introducción
2. index.html
3. presupuesto/index.html
4. certificaciones/index.html
5. css/styles.css
6. js/main.js
7. js/presupuesto.js
8. js/security.js
9. js/site-config.js
10. js/translations.js
11. scripts/build-production.js
12. tests/security.test.js
13. tests/code-quality.test.js
14. tests/check-project.js
15. Flujo de datos y relaciones
16. Glosario de términos técnicos

---

## 1. Introducción
Este documento explica, archivo por archivo y bloque por bloque, el código fuente del proyecto ATEL SISTEMS. Se detallan las tecnologías, variables, funciones, clases, estructuras, patrones y justificaciones de cada decisión. Incluye referencias cruzadas y el flujo de datos entre archivos.

---

## 2. index.html
- **Tecnología:** HTML5 semántico, SEO, accesibilidad, Open Graph, Schema.org.
- **Variables:** No hay variables JS aquí, pero sí atributos data-i18n para traducción.
- **Estructura:**
  - `<head>`: metaetiquetas SEO, favicon, manifest, carga de CSS y JS.
  - `<nav>`: barra de navegación, menú principal, selector de idioma.
  - `<main>`: hero, mosaico visual, secciones de servicios, empresa, certificaciones, productos, contacto.
  - `<footer>`: enlaces legales, redes sociales, selector de cookies.
- **Enlaces:**
  - Carga todos los JS principales con `defer` (main.js, translations.js, site-config.js, security.js).
  - Carga CSS con fallback y versionado para evitar caché obsoleta.
- **Patrones:**
  - Uso de `data-i18n` para textos traducibles.
  - Uso de `<select>` para idiomas, enlazado con translations.js.
  - Uso de `<a>` con anclas internas y externas.
- **Justificación:**
  - Todo el HTML está preparado para ser accesible, SEO-friendly y multiidioma.

---

## 3. presupuesto/index.html
- **Tecnología:** HTML5, accesibilidad, multiidioma, honeypot antispam.
- **Variables:**
  - Campos de formulario con `name` para acceso desde JS.
  - `data-i18n` para traducción.
- **Estructura:**
  - Formulario con validación, honeypot, feedback accesible.
  - Selector de idioma.
  - Enlaces a scripts específicos (presupuesto.js, translations.js, site-config.js).
- **Patrones:**
  - Validación nativa HTML5 + validación avanzada en JS.
  - Uso de `<input type="text">`, `<input type="email">`, `<select>`, `<textarea>`.
- **Justificación:**
  - Captación de leads segura, accesible y multiidioma.

---

## 4. certificaciones/index.html
- **Tecnología:** HTML5, tabla accesible, multiidioma.
- **Variables:**
  - `data-i18n` en celdas de tabla para traducción.
- **Estructura:**
  - Tabla de certificaciones, CTA final, selector de idioma.
- **Patrones:**
  - Uso de `<table>` con roles ARIA.
- **Justificación:**
  - Mostrar certificaciones de forma clara, accesible y traducible.

---

## 5. css/styles.css
- **Tecnología:** CSS3, variables CSS, Grid, Flexbox, media queries.
- **Variables:**
  - Definidas en `:root` (ej: --primary, --navbar-height).
- **Clases:**
  - `.hero-tile`, `.navbar`, `.nav-menu`, `.skip-link`, `.intent-chip`, etc.
- **Patrones:**
  - Reset universal, mobile first, uso de !important solo donde es imprescindible.
- **Justificación:**
  - Centralizar colores y estilos para fácil personalización y mantenimiento.

---

## 6. js/main.js
- **Tecnología:** Vanilla JS ES6+, modularidad, eventos, localStorage.
- **Variables:**
  - `LANGUAGE_STORAGE_KEY`, `INTENT_STORAGE_KEY`, referencias a elementos DOM.
- **Funciones:**
  - `isReloadNavigation`, `scrollToHeroOnReload`, `getCurrentLanguageForDynamicText`, `updateIntentButtonsState`, etc.
- **Patrones:**
  - Event listeners globales, separación de lógica por función, uso de localStorage para idioma/intención.
- **Enlaces:**
  - Interactúa con translations.js para traducción, con site-config.js para configuración global.
- **Justificación:**
  - Modularidad, mantenibilidad, experiencia de usuario fluida y personalizada.

---

## 7. js/presupuesto.js
- **Tecnología:** Vanilla JS, validación avanzada, FormData, localStorage.
- **Variables:**
  - Referencias a campos del formulario, constantes de idioma.
- **Funciones:**
  - `centerBudgetCardOnLoad`, `trackEvent`, `getSafeLang`, `validateBusinessFields`, `setFieldError`, etc.
- **Patrones:**
  - Validación de datos orientada a leads reales, heurísticas antispam, feedback accesible.
- **Enlaces:**
  - Usa ATEL_CONFIG de site-config.js, traducciones de translations.js.
- **Justificación:**
  - Seguridad, calidad de datos, experiencia de usuario y cumplimiento legal.

---

## 8. js/security.js
- **Tecnología:** Vanilla JS, defensa en profundidad.
- **Variables:**
  - `TRUSTED_HOSTS`, `host`, `isLocal`.
- **Funciones:**
  - Forzado HTTPS, frame busting, aviso visual de dominio no autorizado.
- **Patrones:**
  - IIFE (función autoejecutable), comprobaciones de entorno.
- **Justificación:**
  - Minimizar riesgos de MITM, clickjacking y phishing en frontend.

---

## 9. js/site-config.js
- **Tecnología:** Vanilla JS, objeto global de configuración.
- **Variables:**
  - `window.ATEL_CONFIG` con FORMSPREE_FORM_ID, CONTACT_EMAIL, GOOGLE_ANALYTICS_ID, MAPS.
- **Patrones:**
  - Uso de Object.assign para permitir override.
- **Justificación:**
  - Centralizar configuración editable por el cliente o el técnico.

---

## 10. js/translations.js
- **Tecnología:** Vanilla JS, objeto de diccionarios.
- **Variables:**
  - `translations` con claves por idioma y clave de texto.
- **Patrones:**
  - Claves coinciden con data-i18n en HTML.
- **Justificación:**
  - Facilitar la traducción y ampliación de idiomas sin tocar el HTML.

---

## 11. scripts/build-production.js
- **Tecnología:** Node.js, Terser, CleanCSS, JavaScriptObfuscator, html-minifier-terser.
- **Variables:**
  - Rutas, listas de archivos, sets de JS propio.
- **Funciones:**
  - `processHtml`, `processCss`, `processJs`, `copyPathWithTransforms`, `main`.
- **Patrones:**
  - Minificación, ofuscación, modularidad, reporting.
- **Justificación:**
  - Optimizar tamaño, seguridad y rendimiento para producción.

---

## 12. tests/security.test.js
- **Tecnología:** Node.js, RegExp, análisis estático.
- **Variables:**
  - Rutas, expresiones regulares, banderas de estado.
- **Funciones:**
  - Verifica rel="noopener" en enlaces, busca innerHTML inseguro.
- **Justificación:**
  - Automatizar chequeos de seguridad antes de desplegar.

---

## 13. tests/code-quality.test.js
- **Tecnología:** Node.js, RegExp, análisis estático.
- **Variables:**
  - Rutas, contadores de !important y console.log.
- **Funciones:**
  - Busca !important en CSS, console.log en JS.
- **Justificación:**
  - Mantener calidad y limpieza del código en producción.

---

## 14. tests/check-project.js
- **Tecnología:** Node.js, child_process, fs.
- **Variables:**
  - Rutas, resultados, referencias de recursos.
- **Funciones:**
  - Verifica existencia de archivos, ejecuta scripts de test, lista referencias locales.
- **Justificación:**
  - Validar integridad y dependencias antes de entrega o despliegue.

---

## 15. Flujo de datos y relaciones
- **index.html** carga todos los recursos y es el punto de entrada.
- **js/main.js** y **js/translations.js** gestionan la experiencia de usuario y el multiidioma en todas las páginas.
- **js/presupuesto.js** y **presupuesto/index.html** trabajan juntos para la captación de leads.
- **js/security.js** protege todas las páginas cargadas.
- **css/styles.css** define la identidad visual y la responsividad.
- **scripts/build-production.js** y los tests aseguran calidad, seguridad y optimización antes de desplegar.
- **js/site-config.js** centraliza la configuración para facilitar el mantenimiento y la personalización.

---

## 16. Glosario de términos técnicos
- **Variable:** espacio de memoria con un nombre, almacena datos.
- **Constante:** variable cuyo valor no cambia.
- **Función:** bloque de código reutilizable que realiza una tarea.
- **Clase:** plantilla para crear objetos (no se usan clases ES6 en este proyecto, todo es funcional).
- **IIFE:** función autoejecutable, patrón para aislar el scope.
- **Objeto global:** variable accesible desde cualquier script (ej: window.ATEL_CONFIG).
- **Event listener:** función que responde a eventos del usuario o del sistema.
- **localStorage:** almacenamiento persistente en el navegador.
- **FormData:** API para construir fácilmente pares clave-valor para enviar formularios.
- **Honeypot:** campo oculto para detectar bots en formularios.
- **Minificación:** proceso de reducir el tamaño de archivos eliminando espacios, comentarios, etc.
- **Ofuscación:** proceso de hacer el código difícil de leer para proteger la lógica.
- **RegExp:** Expresiones regulares, usadas para buscar patrones en texto.
- **ARIA:** atributos para accesibilidad en HTML.
- **data-i18n:** atributo personalizado para marcar textos traducibles.
- **CDN:** Content Delivery Network, para servir archivos estáticos rápidamente.
- **SEO:** Search Engine Optimization, optimización para buscadores.
- **SPA:** Single Page Application, aquí se simula con navegación JS.
- **Microservicio:** aquí no se usan, todo es frontend puro.

---

**Este documento puede ampliarse con ejemplos de código y comentarios línea a línea si lo necesitas.**

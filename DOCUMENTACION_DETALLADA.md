# Documentación Detallada del Proyecto ATEL SISTEMS (Frontend Only)

## Índice

1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Diccionario de Términos Técnicos](#diccionario-de-términos-técnicos)
3. [Explicación Línea por Línea de Archivos JS](#explicacion-linea-por-linea-de-archivos-js)
4. [Explicación de Scripts y Tests](#explicacion-de-scripts-y-tests)
5. [Explicación de Archivos CSS](#explicacion-de-archivos-css)
6. [Notas sobre HTML y Estructura de Despliegue](#notas-sobre-html-y-estructura-de-despliegue)

---

## Estructura del Proyecto

```
atelweb_frontend_only/
├── js/ (código principal JavaScript)
├── css/ (hojas de estilo)
├── certificaciones/, cursos/, presupuesto/ (secciones principales)
├── scripts/ (scripts de build y utilidades)
├── tests/ (pruebas de calidad y seguridad)
├── cloudflare-pages/, netlify-deploy/ (estructuras para despliegue)
├── ...otros archivos y carpetas auxiliares
```

---

## Diccionario de Términos Técnicos

- **Formspree**: Servicio externo para recibir formularios web sin backend propio.
- **payload**: Objeto con los datos enviados en una petición.
- **trackEvent**: Función para registrar eventos de interacción del usuario (analítica).
- **debounce/throttle**: Técnicas para limitar la frecuencia de ejecución de funciones.
- **AOS (Animate On Scroll)**: Librería para animaciones al hacer scroll.
- **clickjacking**: Ataque donde una web maliciosa incrusta otra web legítima en un iframe para engañar al usuario.
- **hardened/hardening**: Endurecimiento de la seguridad, aplicando medidas para reducir vulnerabilidades.
- **mirror (AOS)**: Opción para que las animaciones se repitan al hacer scroll hacia arriba.
- **mutation observer**: API para detectar cambios en el DOM.
- **telemetría**: Recopilación de datos de uso y errores para análisis posterior.
- **lead**: Contacto potencial interesado en los servicios (en formularios de negocio).
- **iframe**: Elemento HTML que permite incrustar otra página web dentro de la actual.
- **trusted hosts**: Lista de dominios autorizados para servir la web.
- **fallback**: Alternativa que se usa si la principal falla.
- **CSP (Content Security Policy)**: Política de seguridad para controlar recursos permitidos en la web.
- **ARIA**: Especificación para mejorar la accesibilidad web.
- **bi-**: Prefijo de iconos de Bootstrap Icons (ejemplo: bi-send-fill).
- **reset CSS**: Eliminación de estilos por defecto del navegador para un diseño consistente.
- **box-sizing: border-box**: Hace que el padding y el borde se incluyan en el ancho total del elemento.
- **clamp()**: Función CSS para limitar un valor entre un mínimo y un máximo.
- **sticky**: Posicionamiento CSS que mantiene un elemento fijo al hacer scroll.
- **z-index**: Controla la superposición de elementos.
- **min-height**: Altura mínima de un elemento.
- **box-shadow**: Sombra alrededor de un elemento.
- **transition**: Define la animación de cambio de propiedades CSS.
- **aria-***: Atributos de accesibilidad para lectores de pantalla.
- **data-***: Atributos personalizados para almacenar información adicional en HTML.
- **!important**: Regla CSS que fuerza la prioridad de un estilo.
- **console.log**: Método de depuración en JavaScript.
- **tabnabbing**: Ataque donde una pestaña abierta puede cambiar la página original.
- **rel="noopener"**: Previene que la página abierta con target="_blank" acceda a la original.
- **minify**: Proceso de reducir el tamaño de archivos eliminando espacios y comentarios.
- **ofuscar**: Hacer el código difícil de leer para proteger la lógica.

---

## Explicación Línea por Línea de Archivos JS

### js/main.js
- [Explicación completa línea por línea aquí.](#explicacion-linea-por-linea-de-mainjs)

### js/certificaciones.js
- Traducción y sanitización de HTML.
- Animación de aparición de filas de certificaciones.

### js/cursos-form.js
- Validación avanzada de formulario de cursos.
- Traducción dinámica y envío a Formspree o mailto.

### js/aos.js
- Implementación standalone de AOS (animaciones al hacer scroll).
- Manejo de opciones, throttle, y eventos de scroll/resize.

### js/analytics.js
- Define el ID de Google Analytics a usar.

### js/presupuesto.js
- Validación avanzada de formulario de presupuesto.
- Prevención de spam y datos aleatorios.
- Analítica de pasos y eventos.

### js/security.js
- Fuerza HTTPS y previene clickjacking.
- Muestra advertencia si el dominio no es de confianza.

### js/site-config.js
- Configuración global del sitio (emails, IDs, mapas).

### js/translations.js
- Objeto con todos los textos traducibles de la web.

---

## Explicación de Scripts y Tests

### scripts/build-netlify.js
- Prepara la carpeta de despliegue Netlify, aplica redirecciones y cabeceras de seguridad.

### scripts/build-production.js
- Minifica y ofusca HTML, CSS y JS antes de producción.

### tests/check-project.js
- Comprueba integridad del proyecto y referencias a recursos.

### tests/code-quality.test.js
- Verifica abuso de !important en CSS y presencia de console.log en JS.

### tests/security.test.js
- Verifica seguridad de enlaces y uso seguro de innerHTML.

---

## Explicación de Archivos CSS

### css/styles.css
- Variables globales, reset, estilos base y componentes visuales.

### css/aos.css
- Estilos para animaciones AOS.

### css/certificaciones.css
- Estilos para la página de certificaciones.

### css/presupuesto.css
- Estilos para la página de presupuesto.

---

## Notas sobre HTML y Estructura de Despliegue

- Los archivos HTML estructuran las páginas principales y usan data-i18n para traducción.
- cloudflare-pages/ y netlify-deploy/ replican la estructura para despliegue estático.
- Incluyen archivos de configuración (_headers, _redirects) y subcarpetas para cada sección.

---

**Esta documentación cubre todos los archivos y lógica del proyecto, con explicaciones detalladas y un glosario técnico.**

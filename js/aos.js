/**
 * =====================================================
 * AOS (Animate On Scroll) - Versión Standalone
 * Sin dependencias externas
 * =====================================================
 */

const AOS = (function() {
    'use strict';

    // Variables privadas
    let elements = [];
    let initialized = false;

    // Opciones por defecto
    const defaults = {
        offset: 120,
        delay: 0,
        duration: 400,
        easing: 'ease',
        once: false,
        mirror: false,
        disableMutationObserver: false,
        throttleDelay: 99,
        debounceDelay: 50
    };

    let options = { ...defaults };

    /**
     * Throttle - limita la ejecución de una función
     */
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Detecta si el navegador soporta las características necesarias
     */
    function isBrowserSupported() {
        return !!(
            window.document &&
            window.navigator &&
            document.querySelector &&
            document.body
        );
    }

    /**
     * Obtiene todos los elementos con data-aos
     */
    function getElements() {
        return Array.from(document.querySelectorAll('[data-aos]'));
    }

    /**
     * Calcula la posición de un elemento
     */
    function getElementOffset(el) {
        const rect = el.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            bottom: rect.bottom + window.pageYOffset,
            height: rect.height
        };
    }

    /**
     * Verifica si un elemento está en la vista
     */
    function isInView(el) {
        const offset = getElementOffset(el);
        const elementTop = offset.top;
        const elementBottom = offset.bottom;
        const viewportTop = window.pageYOffset;
        const viewportBottom = window.pageYOffset + window.innerHeight;

        return elementBottom > viewportTop - options.offset &&
               elementTop < viewportBottom + options.offset;
    }

    /**
     * Anima un elemento
     */
    function animateElement(el) {
        if (el.classList.contains('aos-animate')) {
            return;
        }

        // Activar animación
        el.classList.add('aos-animate');

    }

    /**
     * Revierte la animación de un elemento
     */
    function resetElement(el) {
        if (!options.mirror) {
            return;
        }

        el.classList.remove('aos-animate');
    }

    /**
     * Maneja el evento de scroll
     */
    function handleScroll() {
        elements.forEach(el => {
            if (isInView(el)) {
                animateElement(el);
            } else if (options.mirror && !options.once) {
                resetElement(el);
            }
        });
    }

    /**
     * Inicializa AOS
     */
    function init(customOptions = {}) {
        if (!isBrowserSupported()) {
            console.warn('AOS: Tu navegador no soporta las características necesarias.');
            return false;
        }

        // Mezclar opciones
        options = { ...defaults, ...customOptions };

        // Aplicar ajustes globales usados por el CSS de AOS
        document.body.setAttribute('data-aos-easing', options.easing);
        document.body.setAttribute('data-aos-duration', String(options.duration));
        document.body.setAttribute('data-aos-delay', String(options.delay));

        // Obtener elementos
        elements = getElements();

        if (elements.length === 0) {
            return false;
        }

        // Agregar clase inicial a elementos
        elements.forEach(el => {
            el.classList.add('aos-init');
        });

        // Ejecutar scroll inicial
        handleScroll();

        // Agregar listener de scroll con throttle
        window.addEventListener('scroll', throttle(handleScroll, options.throttleDelay));

        // Agregar listener de resize
        window.addEventListener('resize', throttle(() => {
            elements = getElements();
        }, options.debounceDelay));

        initialized = true;
        return true;
    }

    /**
     * Refresh - recalcula elementos y animaciones
     */
    function refresh() {
        if (!initialized) {
            return;
        }
        elements = getElements();
        handleScroll();
    }

    /**
     * Refresh Hard - limpia y reinicializa
     */
    function refreshHard() {
        elements.forEach(el => {
            el.classList.remove('aos-init', 'aos-animate');
        });
        elements = [];
        initialized = false;
        init(options);
    }

    // API pública
    return {
        init: init,
        refresh: refresh,
        refreshHard: refreshHard
    };
})();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AOS;
}
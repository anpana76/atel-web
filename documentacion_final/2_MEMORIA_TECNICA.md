# Memoria Técnica del Proyecto

## 1. Contexto
Desarrollo frontend nativo para ATEL SISTEMS enfocando los recursos en rendimiento puro y puntuación perfecta en Lighthouse. Arquitectura SPA simulada mediante JS para los envíos o interacciones como la calculadora de presupuestos.

## 2. Pila Tecnológica
- **Maquetación**: HTML5 con enfoque semántico (uso correcto de sections, nav, headers, aria-labels para screen readers).
- **Secciones de Estilos**: CSS estructurado usando variables globales para colores corporativos y fuentes. Media Queries con enfoque Mobile First y CSS Grid avanzado para maquetación asimétrica en portada.
- **Scripts**: AOS para control de intersección en scroll. JS Modular para gestionar traductor, Lightbox de la galería y lógica condicional de la calculadora presupuestaria.
- **Media**: Reducción drástica del ancho de banda usando WebP con fallback configurado nativamente donde corresponda.

## 3. Topología del Proyecto
/css: Archivos de estilo, base unificada y fuentes locales.
/js: Lógica de analíticas, traducción, animaciones y main para control de DOM.
/img: Repositorio estático (vectores y WebP optimizado).
/presupuesto: Rutas lógicas aisladas.
/deploy: Instrucciones y guías técnicas para despliegues Nginx/SSG.

## 4. Servidor de Producción y Despliegue
Al tratarse de una arquitectura orientada al ecosistema JAMstack (puramente Frontend sin Backend propio ni Node/Python), la plataforma no necesita un entorno de ejecución dinámico.
Puede ser servida en cualquier plataforma CDN moderna como **Netlify, Vercel o GitHub Pages**, lo cual facilita despliegues en minutos, ofrece máxima seguridad por aislamiento y cachea automáticamente los recursos a nivel global.
En caso de requisitos de hosting tradicional, opcionalmente el contenido se puede hospedar tras un servidor HTTP/S como *Nginx* o *Apache*. Todo el flujo de recolección de datos (presupuestos) se procesa en el frontal y delega su capa transaccional a servicios Cloud / API en lugar de requerir una Base de Datos local.

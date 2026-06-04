# Guía Técnica y de Usuario — ATEL SISTEMS (Frontend Only)

---

## 1. Resumen Ejecutivo

Esta guía práctica explica cómo funciona cada archivo del proyecto, cómo personalizarlo y cómo mantenerlo. Es útil tanto para usuarios finales como para técnicos.

---

## 2. Guía de Archivos y Personalización

### index.html
- Página principal, SEO, accesibilidad, enlaces a recursos.
- Personaliza título, descripción, favicon y enlaces sociales.

### presupuesto/index.html
- Formulario de presupuestos, multiidioma, validación y honeypot.
- Personaliza textos y campos según tus necesidades.

### certificaciones/index.html
- Página de certificaciones, tabla dinámica, multiidioma.
- Añade o edita certificaciones en la tabla.

### css/styles.css
- Variables de color y fuentes en :root.
- Cambia colores, fuentes y estilos globales aquí.

### js/main.js
- Lógica de interfaz, navegación, animaciones, i18n.
- No es necesario modificar salvo para añadir nuevas funciones de UI.

### js/presupuesto.js
- Lógica del formulario de presupuesto, validación, envío a Formspree.
- Puedes adaptar validaciones o tracking de eventos.

### js/security.js
- Seguridad en cliente: HTTPS, frame busting, avisos de dominio.
- No modificar salvo para añadir dominios de confianza.

### js/site-config.js
- Configuración centralizada (Formspree, Analytics, mapas, contacto).
- Cambia aquí el ID de Formspree, email, Analytics y enlaces de mapas.

### js/translations.js
- Diccionario multiidioma, textos legales, cookies, accesibilidad.
- Añade o edita traducciones según los idiomas que necesites.

### scripts/build-production.js
- Minificación, ofuscación y empaquetado para producción.
- Solo para técnicos: ejecuta antes de desplegar.

### tests/security.test.js
- Pruebas automáticas de seguridad (XSS, tabnabbing).
- Ejecuta para validar seguridad antes de publicar.

### tests/code-quality.test.js
- Linter y chequeos de calidad de CSS y JS.
- Ejecuta para asegurar calidad de código.

### tests/check-project.js
- Checklist de integridad y dependencias del proyecto.
- Útil para verificar que no falta nada antes de entregar.

---

## 3. Flujo de Personalización y Despliegue

1. Clona el repositorio.
2. Configura Formspree en js/site-config.js.
3. Personaliza datos de empresa y colores en index.html y styles.css.
4. Prueba localmente abriendo index.html.
5. Verifica formulario, multiidioma y responsive.
6. Ejecuta scripts de test y build.
7. Publica en Netlify, Vercel o GitHub Pages.
8. Mantén la documentación y actualiza cambios según evolucione el proyecto.

---

## 4. Consejos y Buenas Prácticas

- Lee los comentarios en cada archivo: hay explicaciones y advertencias útiles.
- Mantén la configuración separada del código para facilitar futuras adaptaciones.
- Usa los tests automáticos antes de cada despliegue.
- Prioriza la accesibilidad y el SEO en cualquier cambio.
- Consulta la carpeta `documentacion_final/` para más detalles y anexos.

---

¿Dudas? Contacta con el responsable técnico de ATEL SISTEMS o revisa la documentación incluida.

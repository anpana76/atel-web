# Chuleta Tecnica de Reunion (1 Pagina)

## Mensaje base (20-30 segundos)

ATEL Web es un proyecto frontend-only para presentar y validar una web corporativa real.
Mantiene analiticas de interfaz en cliente para mejorar UX, sin bloquear la interaccion inicial del usuario.
La previsualizacion local se usa para demos con cliente y testers, no como backend de negocio en produccion.

## Preguntas frecuentes y respuesta rapida

1. Es frontend-only?
Respuesta corta: Si, el producto esta planteado para funcionar en hosting estatico con HTML, CSS y JS.
Soporte tecnico: documentacion_final/README.md:46.

2. Entonces para que se usa el servidor?
Respuesta corta: Para presentar avances y abrir acceso de prueba en demos.
Soporte tecnico: server-control-panel.js:1, public-preview-server.js:1.

3. Teneis analiticas aunque sea frontend-only?
Respuesta corta: Si, se mantienen eventos de interfaz en cliente para medir interaccion real.
Soporte tecnico: js/main.js:1009.

4. Por que el consentimiento no bloquea la navegacion?
Respuesta corta: Decidimos no condicionar la primera interaccion; el usuario puede navegar y luego ajustar preferencias.
Soporte tecnico: js/main.js:396, js/main.js:464.

5. Como controlais seguridad en frontend?
Respuesta corta: Con sanitizacion, validaciones de formulario y pruebas automatizadas de tabnabbing/XSS.
Soporte tecnico: js/main.js:11, js/main.js:18, tests/security.test.js:22, tests/security.test.js:49.

6. Como evitais spam en presupuestos?
Respuesta corta: Honeypot + reglas de calidad de datos + heuristicas anti texto aleatorio.
Soporte tecnico: presupuesto/index.html:87, js/presupuesto.js:90, js/presupuesto.js:121.

7. El formulario evita envios duplicados?
Respuesta corta: Si, se bloquea el boton mientras la peticion esta en curso.
Soporte tecnico: js/presupuesto.js:258, js/presupuesto.js:286, js/presupuesto.js:339.

8. Cuantos idiomas soporta?
Respuesta corta: 8 idiomas con sistema i18n y fallback de claves.
Soporte tecnico: js/translations.js:4, js/presupuesto.js:34, js/main.js:149.

9. Como cuidais rendimiento en la home?
Respuesta corta: Preload de imagenes clave, animaciones controladas y throttle en scroll/resize.
Soporte tecnico: index.html:65, js/aos.js:31, js/aos.js:159.

10. Como se prueban seguridad y calidad?
Respuesta corta: Con scripts locales que validan tabnabbing, XSS, !important y console.log residuales.
Soporte tecnico: tests/security.test.js:22, tests/security.test.js:54, tests/code-quality.test.js:25, tests/code-quality.test.js:45.

11. Que pasa con las sesiones de prueba?
Respuesta corta: Se guardan para reproducir navegacion y feedback de testers.
Soporte tecnico: server-control-panel.js:1, public-preview-server.js:1.

12. Hay trazabilidad para preguntas tecnicas largas?
Respuesta corta: Si, existe glosario integral por terminos con referencias por archivo y linea.
Soporte tecnico: documentacion_final/GLOSARIO_TECNICO.md.

## Mini guion para cerrar una reunion

1. Mostramos el flujo completo de usuario en frontend.
2. Enseñamos medicion real de uso con sesiones de prueba.
3. Confirmamos seguridad y calidad con validaciones y tests.
4. Recogemos feedback del cliente y priorizamos siguiente iteracion.

## Frases utiles (rapidas)

- Arquitectura: "Producto frontend-only, servidor solo para demos y validacion UX".
- Analitica: "Medimos interaccion real sin frenar la navegacion inicial".
- Seguridad: "No confiamos en una sola barrera: sanitizacion, validacion y pruebas".
- Escalado: "Cuando se apruebe fase siguiente, pasamos pendientes de cumplimiento a hardening".

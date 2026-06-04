# Glosario Tecnico Integral de Comentarios (ATEL Web)

## Objetivo

Este documento consolida las palabras clave tecnicas que aparecen en los comentarios del codigo del proyecto. Esta pensado para responder preguntas tecnicas en demos con cliente y sesiones de prueba.

## Decisiones de alcance confirmadas (04-04-2026)

- El servidor local se usa para presentar avances a cliente y testers.
- Se mantiene enfoque frontend-only para el producto.
- Se conservan analiticas y medicion de interaccion.
- El consentimiento se mantiene no bloqueante para no condicionar la navegacion.
- Los parches estructurales de cumplimiento quedan en suspenso para una fase posterior.

## Cobertura revisada

Se revisaron comentarios tecnicos en los archivos activos de codigo, scripts y tests del proyecto.

| Archivo | Comentarios detectados | Rol tecnico |
| --- | ---: | --- |
| js/main.js | 71 | Logica principal de interfaz, i18n, cookies, UX, CTA |
| js/aos.js | 51 | Motor de animaciones standalone |
| index.html | 42 | Estructura principal, SEO, accesibilidad, secciones |
| run-local-windows.bat | 33 | Bootstrap local en Windows con fallback |
| js/presupuesto.js | 16 | Validacion comercial y envio de formulario |
| js/translations.js | 16 | Diccionario de idiomas y helpers |
| js/security.js | 12 | Medidas disuasorias en cliente |
| tests/security.test.js | 7 | Pruebas de tabnabbing y XSS |
| presupuesto/index.html | 5 | Formulario de captacion |
| tests/code-quality.test.js | 4 | Pruebas de calidad CSS y JS |
| run-local-linux.sh | 2 | Arranque local en Linux |
| run-local-windows.ps1 | 0 | Arranque local sencillo en PowerShell |

## Diccionario tecnico por palabras clave

1. i18n: Internacionalizacion basada en claves data-i18n y diccionario centralizado. Referencias: js/main.js:7, js/translations.js:1, js/translations.js:4.
2. Fallback de traducciones: Devolucion segura de clave cuando falta texto en idioma objetivo. Referencias: js/presupuesto.js:34, js/translations.js:825, js/translations.js:987.
3. data-i18n-html: Canal controlado para renderizar markup traducido con sanitizacion. Referencia: js/main.js:120.
4. RTL (Right-to-Left): Ajuste de direccion de texto para arabe. Referencia: js/main.js:149.
5. Sanitizacion HTML basica: Escape seguro de contenido en traducciones para reducir XSS. Referencia: js/main.js:11.
6. Sanitizacion con allowlist: Parser que limita etiquetas y atributos permitidos antes de usar innerHTML. Referencias: js/main.js:18, tests/security.test.js:53.
7. Reporte centralizado de errores cliente: Captura de errores globales y promesas no manejadas para diagnostico. Referencia: js/main.js:65.
8. Telemetria defensiva: Wrapper que evita romper UX si la capa de analytics no esta disponible. Referencias: js/presupuesto.js:8, js/main.js:56.
9. Analitica de CTA: Medicion de clics en acciones clave (presupuesto, WhatsApp, menu, idioma). Referencias: js/main.js:962, js/main.js:1009.
10. Acordeon de servicios: Patron de contenido expandible con scroll suave y cierre de bloques alternos. Referencia: js/main.js:180.
11. Scroll suave anclas: Navegacion interna asistida para mejorar continuidad visual. Referencia: js/main.js:551.
12. Rotacion de imagenes servicios: Soporte de listas de imagenes por bloque con navegacion y pausa por foco/hover. Referencias: js/main.js:252, js/main.js:591.
13. Fallback visual de AOS: Si AOS no carga, se evita ocultar contenido marcado con data-aos. Referencia: js/main.js:388.
14. Banner de cookies: Gestion de preferencias con persistencia en localStorage y auditoria de cambios. Referencia: js/main.js:396.
15. Consentimiento persistente: Registro local de elecciones (necessary/preferences/analytics/marketing). Referencias: js/main.js:409, js/main.js:464.
16. Modal legal SPA-like: Apertura y cierre de textos legales sin recargar pagina. Referencia: js/main.js:890.
17. Menu hamburguesa accesible: Control mobile con aria-expanded y etiquetas traducibles. Referencia: js/main.js:962.
18. Lightbox de imagenes: Visualizacion ampliada de hero e imagenes de contenido con cierre por ESC/click. Referencia: js/main.js:760.
19. Auto-fit de hero tiles: Decision contain/cover segun diferencia de ratio imagen-contenedor. Referencia: js/main.js:661.
20. Validacion orientada a leads: Reglas de calidad comercial (nombre real, telefono util, mensaje con contexto). Referencia: js/presupuesto.js:121.
21. Heuristicas anti-spam: Deteccion de patrones aleatorios para reducir entradas basura. Referencia: js/presupuesto.js:90.
22. Hitos de formulario: Tracking de avance por campo para medir abandono por etapa. Referencia: js/presupuesto.js:199.
23. Doble envio protegido: Bloqueo temporal del boton durante peticion asincrona. Referencias: js/presupuesto.js:258, js/presupuesto.js:286.
24. Integracion Formspree: Envio frontend a endpoint externo configurable por ID. Referencia: js/presupuesto.js:291.
25. Honeypot antispam: Campo oculto que debe quedar vacio para usuarios legitimos. Referencia: presupuesto/index.html:87.
26. Estado accesible de envio: Feedback de formulario con role status y aria-live. Referencia: presupuesto/index.html:100.
27. AOS standalone: Libreria de animacion sin dependencias externas. Referencia: js/aos.js:3.
28. Throttle: Control de frecuencia en eventos scroll/resize para rendimiento. Referencias: js/aos.js:31, js/aos.js:159.
29. Feature detection AOS: Verificacion de capacidades del navegador antes de inicializar. Referencia: js/aos.js:46.
30. Refresh Hard AOS: Reinicializacion completa de estado y elementos animables. Referencia: js/aos.js:183.
31. Catalogo de traducciones: Repositorio de textos para 8 idiomas y helpers de acceso. Referencias: js/translations.js:2, js/translations.js:984.
32. SEO basico: Titulo, descripcion y Open Graph para visibilidad inicial en buscadores. Referencia: index.html:28.
33. SEO avanzado y local: Canonical, metadatos geo y contexto de negocio local. Referencias: index.html:39, index.html:53.
34. Social meta tags: Metadatos para previsualizacion en redes y tarjetas. Referencia: index.html:59.
35. Rendimiento inicial: Preload de imagenes clave y carga diferida de scripts. Referencia: index.html:65.
36. Navegacion accesible: Skip link y labels ARIA para lector de pantalla y teclado. Referencias: index.html:130, index.html:131.
37. Bootstrap local Windows: Script de arranque que instala/verifica runtime y selecciona puerto libre. Referencias: run-local-windows.bat:6, run-local-windows.bat:117, run-local-windows.bat:222.
38. Fallback Python/Node: Estrategia de resiliencia de ejecucion local cuando falta runtime preferido. Referencias: run-local-windows.bat:70, run-local-windows.bat:92.
39. Arranque local Linux: Servicio simple con python -m http.server enlazado a localhost. Referencia: run-local-linux.sh:4.
40. Arranque local PowerShell: Script ligero para levantar servidor local en Windows. Referencias: run-local-windows.ps1:15, run-local-windows.ps1:17.
41. Tabnabbing test: Verificacion de target blank para exigir rel noopener. Referencias: tests/security.test.js:22, tests/security.test.js:23.
42. XSS test por innerHTML: Regla automatizada para detectar asignaciones sin saneamiento. Referencias: tests/security.test.js:49, tests/security.test.js:54.
43. Control de deuda CSS: Umbral de !important para evitar rigidez de cascada. Referencias: tests/code-quality.test.js:22, tests/code-quality.test.js:25.
44. Higiene de produccion JS: Deteccion de console.log residuales en codigo cliente. Referencias: tests/code-quality.test.js:45, tests/code-quality.test.js:48.

## Como usar este glosario en reuniones tecnicas

- Si te preguntan por una decision, responde con definicion corta y referencia de archivo:linea.
- Si te preguntan por seguridad, usa primero terminos 5, 6, 41 y 42.
- Si te preguntan por analitica y pruebas con cliente, usa primero terminos 7, 8, 9, 11 y 12.
- Si te preguntan por arquitectura de producto, usa primero terminos 1, 2, 3 y 6.

## Nota de mantenimiento

Cuando se agreguen nuevos bloques comentados en JS/HTML/scripts/tests, anadir aqui el termino y su referencia para mantener trazabilidad completa.

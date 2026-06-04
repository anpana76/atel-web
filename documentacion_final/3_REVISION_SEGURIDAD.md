# Revisión de Seguridad y Normativa

## 1. Seguridad Frontend
- **XSS (Cross-Site Scripting)**: El código JavaScript analizado (por ejemplo, el inyector de Lightbox en main.js) no utiliza métodos inseguros como innerHTML frente a datos proporcionados por el usuario. No se capta información externa sujeta a inyección directa.
- **Exposición de Datos**: Al ser una aplicación pura en tecnología de Frontend (Vanilla sin Base de Datos conectada directamente desde el lado del cliente), la exposición es superficial.

## 2. Seguridad en Despliegue y Arquitectura
- **Eliminación de Superficie de Ataque Backend**: Al no existir servidor activo (Node.js, Python, Flask, PHP) ni base de datos, los vectores de ataque (inyecciones SQL, ejecución remota de código en RCE) no aplican en la arquitectura cliente.
- **Formularios y Captura (Formspree)**: La lógica del formulario se apoya en un servicio "Serverless/Proxy" validado que gestiona el filtrado antispam (Akismet/ReCaptcha) sin comprometer el servidor en el que reside la página.
- **Cabeceras de Seguridad y Hosting moderno (Netlify/Vercel/Cloudflare)**:
  - Al utilizar repositorios y despliegues estáticos, los certificados SSL (HTTPS en tránsito) son configurados por defecto. 

## 3. Normativa Legal (RGPD)
- **Adaptación legal comprobada**: En index.html los textos contemplan explícitamente el Aviso Legal, Política de Privacidad y Política de Cookies requeridas por la LSSI y el RGPD español. Se cita debidamente al delegado del tratamiento (ATEL SISTEMS S.L.) y se proporciona el e-mail de baja/acceso y enrutamiento a AEPD.
- **Barra de cookies (Consentimiento explícito)**: Implementada para impedir la carga nativa de motores de terceros (Analytics) hasta que el usuario dé el visto bueno (Opt-In explícito).

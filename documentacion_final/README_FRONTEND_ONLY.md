# ATEL SISTEMS - Version Frontend-Only

Guia consolidada para publicar la web sin backend.

## Alcance

Esta version funciona como sitio estatico y permite:

- Web corporativa completa.
- Formularios de presupuesto por Formspree.
- Multiidioma desde `js/translations.js`.
- Analytics opcional.

No incluye panel administrativo ni persistencia de backend.

## Configuracion minima

### 1) Formulario de presupuestos

La configuracion se define en `js/site-config.js`:

```javascript
window.ATEL_CONFIG = {
  FORMSPREE_FORM_ID: "TU_ID",
  CONTACT_EMAIL: "tu-email@dominio.com",
  GOOGLE_ANALYTICS_ID: "G-XXXXXXXXXX"
};
```

Notas:

- `FORMSPREE_FORM_ID` es obligatorio para enviar formularios.
- `GOOGLE_ANALYTICS_ID` es opcional.

### 2) Analytics

El archivo `js/analytics.js` usa `window.ATEL_CONFIG.GOOGLE_ANALYTICS_ID` como origen principal.

## Ejecucion local

- Windows: `autoejecutable-produccion.bat`
- Linux: `./autoejecutable-produccion.sh` (tras `chmod +x`)

Tambien puedes usar:

```bash
npm run build:prod
npm run serve:prod
```

## Estructura actual relevante

```text
index.html
certificaciones/index.html
presupuesto/index.html
css/
js/
scripts/build-production.js
public-preview-server.js
```

## Publicacion

Opciones habituales:

- Netlify
- Vercel
- GitHub Pages
- Apache/Nginx

## Verificacion rapida

1. Carga la home.
2. Navega a presupuesto y envia un formulario de prueba.
3. Confirma recepcion en Formspree.
4. Revisa consola del navegador sin errores criticos.

## Referencias

- [QUICKSTART.md](QUICKSTART.md)
- [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- [README.md](README.md)

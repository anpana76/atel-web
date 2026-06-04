# Configuracion Frontend-Only

> Referencia técnica alineada con [tecnica/README.md](tecnica/README.md) dentro de la nueva estructura de documentación.

Esta referencia resume los valores y zonas del proyecto que normalmente se personalizan.

## 1. Formspree

Archivo: `js/site-config.js`

Valor principal:

```text
FORMSPREE_FORM_ID: ""
```

Debes rellenar ese valor con el ID real de tu formulario en Formspree.

## 2. Google Analytics (opcional)

Archivo principal: `js/site-config.js`

Apoyo tecnico: `js/analytics.js` (consume el valor configurado).

Valor de referencia:

```text
GOOGLE_ANALYTICS_ID: "G-XXXXXXXXXX"
```

Si no vas a usar Analytics, deja esta parte desactivada.

## 3. Mapas (enlaces y embeds)

Archivo: `js/site-config.js`

Valores de referencia:

```text
MAPS: {
	linkMalaga: "https://maps.google.com/?q=...",
	linkMarbella: "https://maps.google.com/?q=...",
	embedMalaga: "https://www.google.com/maps/embed?...",
	embedMarbella: "https://www.google.com/maps?q=...&output=embed"
}
```

Estos valores alimentan el selector de sedes en contacto y el iframe del mapa.

## 4. Datos de empresa

Archivo principal: `index.html`

Valores habituales que se cambian:

```text
COMPANY_NAME = "ATEL SISTEMS"
COMPANY_PHONE = "+34952363167"
COMPANY_EMAIL = "info@atelmalaga.com"
COMPANY_ADDRESS = "Calle Alcalde Gomez Gomez, 16, 29006 Malaga, Espana"
COMPANY_LAT = "36.7213"
COMPANY_LON = "-4.4214"
```

## 5. SEO y Open Graph

Archivo: `index.html` dentro del bloque `<head>`.

Valores de ejemplo:

```text
OG_DESCRIPTION = "ATEL SISTEMS: Ingenieria y Mantenimiento Tecnico Integral en Malaga"
OG_IMAGE = "https://atelsistems.com/img/hero.webp"
OG_TITLE = "ATEL SISTEMS | Ingenieria y Mantenimiento"
```

## 6. Colores

Archivo: `css/styles.css`, en el bloque `:root`.

Valores actuales de referencia:

```text
PRIMARY_COLOR = "#448a3c"
PRIMARY_HOVER = "#63a355"
DARK_COLOR = "#2d2d2d"
LIGHT_BG = "#f4f7f4"
```

## 7. Redes sociales

Archivo: `index.html`.

Zonas donde se configuran:

1. Bloque JSON-LD `sameAs`.
2. Iconos del footer (enlaces directos).

Ejemplos:

```text
SOCIAL_FACEBOOK = "https://www.facebook.com/atelmalaga"
SOCIAL_LINKEDIN = "https://www.linkedin.com/company/atel-sistems"
```

## Notas importantes

1. Este archivo es una referencia, no un `.env` real.
2. El proyecto frontend-only no carga variables de entorno del servidor.
3. Los cambios se aplican editando directamente HTML, CSS y JS.

## Flujo recomendado de cambios

1. Configura Formspree, Analytics y mapas en `js/site-config.js`.
2. Ajusta textos en `js/translations.js`.
3. Revisa datos de empresa y SEO en `index.html`.
4. Revisa colores en `css/styles.css`.
5. Verifica en local que todo carga correctamente.

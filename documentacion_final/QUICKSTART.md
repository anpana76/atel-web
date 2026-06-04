<!-- GUÍA RÁPIDA DE DESPLIEGUE - ATEL SISTEMS FRONTEND-ONLY -->

> Consulta [usuario/README.md](usuario/README.md) y [tecnica/README.md](tecnica/README.md) para la documentación organizada por perfiles.

# 🚀 Despliegue en 5 minutos

## Paso 1: Configura Formspree (2 minutos)

1. Ve a https://formspree.io/
2. Regístrate (gratuitamente con Google/GitHub)
3. Click "Create" → "Form"
4. Dale un nombre: "Presupuestos ATEL"
5. **COPIA EL ID** que aparece (pequeño código como `xyzabcd123`)

## Paso 2: Configura tu sitio (1 minuto)

Abre `atelweb_frontend_only/js/site-config.js`

Configura tu ID en:
```javascript
FORMSPREE_FORM_ID: "TU_ID"
```

Ejemplo:
```javascript
FORMSPREE_FORM_ID: "ezyxwvu123"
```

Guarda (Ctrl+S)

## Paso 3: Elige tu hosting (2-3 minutos)

### 🌟 OPCIÓN RECOMENDADA: Netlify (Gratis)

1. Ve a https://app.netlify.com/
2. Regístrate con Google o Email
3. Click "Add new site" → "Deploy manually"
4. **Arrastra la carpeta `atelweb_frontend_only` aquí**
5. ¡Espera 30 segundos!
6. Tu sitio estará en `https://tu-nombre-random.netlify.app`

**Para cambiar el dominio después:**
- Site Settings → Domain management → Change site name

---

### 📦 OPCIÓN 2: Vercel (Gratis)

1. Ve a https://vercel.com/
2. Regístrate
3. "Add New Project" → "Deploy existing code"
4. Selecciona `atelweb_frontend_only`
5. Click "Deploy"
6. Tu URL está lista (ej: `atelweb-frontend.vercel.app`)

---

### 🌐 OPCIÓN 3: GitHub Pages (Gratis)

1. Crea un repositorio en GitHub llamado `tu-usuario.github.io`
2. Sube esta carpeta en `public/` o como raíz
3. Ve a Settings → Pages → Source = main branch
4. Tu sitio: `https://tu-usuario.github.io`

---

## ✅ Verifica que funciona

Después de desplegar:

1. Abre tu sitio en el navegador
2. Ve a "Solicitar Presupuesto"
3. Llena el formulario
4. ✅ Si se envía = **¡Funciona!**
5. Verifica que recibiste el email

---

## 📧 Dónde ves los presupuestos

### En Formspree:
1. Inicia sesión en https://formspree.io/
2. Dashboard → Selecciona tu formulario
3. Pestaña "Submissions" → Ves todos los presupuestos ahí
4. También **recibes emails** automáticamente en tu inbox

### Si no recibes emails:
- Revisa SPAM
- Añade `Formspree` a tus contactos en tu email

---

## 🎨 Personalización básica

**Cambiar nombre/teléfono** de contacto:

Abre `index.html` → Busca "ATEL SISTEMS" y reemplaza
- "+34952363167" → tu teléfono
- "Calle Alcalde Gómez Gómez, 16" → tu dirección
- "info@atelsistems.com" → tu email

**Cambiar colores verde:**

Abre `css/styles.css` → Busca:
```css
--primary: #448a3c;  /* Verde */
```

Reemplaza `#448a3c` con tu color (ej: `#0066ff` para azul)

---

## 🆘 Problemas comunes

### "Por favor, configura tu Formspree ID"
- ¿Copiaste el ID correctamente en `site-config.js`?
- ¿Está sin comillas o con comillas?
```javascript
// ❌ MALO
FORMSPREE_FORM_ID: MY_FORM_ID

// ✅ BIEN
FORMSPREE_FORM_ID: "abcd1234"
```

### El formulario dice "error"
- Abre DevTools (F12) → Console
- ¿Ves un error?
- Verifica que Formspree ID sea válido

### Las imágenes no cargan
- Algunos hosting no permiten WebP
- Convierte a JPG: https://convertio.co/
- Actualiza rutas en `index.html`

### El sitio ve lento
- Formspree puede tardar 1-2 segundos en responder
- Es normal en hosting gratuito

---

## 📱 URLs útiles de referencia

- **Editor de tu sitio**: https://app.netlify.com (si usaste Netlify)
- **Tu dashboard Formspree**: https://formspree.io/forms
- **Google Analytics** (si lo agraste): https://analytics.google.com

---

## 🎉 ¡Listo!

Tu sitio está en vivo y los clientes pueden solicitar presupuestos.

**Próximos pasos:**
1. ✅ Compra un dominio (Namecheap, GoDaddy, etc.)
2. ✅ Apunta el dominio a Netlify/Vercel
3. ✅ Configura HTTPS automático
4. ✅ [**Guía completa en README_FRONTEND_ONLY.md**](README_FRONTEND_ONLY.md)

---

## 💬 Necesitas ayuda?

- **Formspree no funciona** → https://formspree.io/en/documentation/
- **Cómo cambiar dominio** → Busca "[Tu hosting] custom domain"
- **Cambios más avanzados** → Edita archivos HTML/CSS/JS directamente

**¡Éxito con tu sitio web!** 🚀

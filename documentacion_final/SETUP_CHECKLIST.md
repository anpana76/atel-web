📋 CHECKLIST DE CONFIGURACIÓN - ATEL SISTEMS FRONTEND-ONLY
===========================================================

> La guía se complementa con [usuario/README.md](usuario/README.md) y [tecnica/README.md](tecnica/README.md).

En este archivo encontrarás un paso a paso de qué debes hacer para poner tu sitio en línea.

## FASE 1: CONFIGURACIÓN (5-10 minutos) ⚙️

### Step 1: Obtén tu Formspree ID
- [ ] Ve a https://formspree.io/
- [ ] Regístrate (gratuitamente con Google o Email)
- [ ] Click "Create" → "Form"
- [ ] Dale el nombre: "Presupuestos ATEL"
- [ ] **COPIA EL ID** que aparece (ej: "xyzabc123")
- [ ] Guarda en un documento temporal

### Step 2: Configura Formspree en tu proyecto
- [ ] Abre: `js/site-config.js`
- [ ] Busca la propiedad:
  ```
  FORMSPREE_FORM_ID: "",
  ```
- [ ] Rellena tu ID real (ej: `"xyzabc123"`)
- [ ] Guarda (Ctrl+S)
- [ ] Verifica que quedó así:
  ```
  FORMSPREE_FORM_ID: "xyzabc123",
  ```

### Step 3: (Opcional) Configura Google Analytics
- [ ] Si quieres trackear usuarios, ve a https://analytics.google.com/
- [ ] Crea una propiedad para tu sitio
- [ ] Copia tu "Measurement ID" (ej: G-XXXXXXXXXX)
- [ ] **NOTA:** Sin backend, no puedes ver los datos en tu web, solo en Google Analytics

### Step 4: Personaliza datos de la empresa
- [ ] Abre: `index.html`
- [ ] Busca `ATEL SISTEMS` y reemplaza por tu empresa
- [ ] Busca `+34952363167` y reemplaza por tu teléfono
- [ ] Busca `info@atelsistems.com` y reemplaza por tu email
- [ ] Busca `Calle Alcalde Gómez...` y reemplaza por tu dirección
- [ ] Busca `/img/logo.webp` y reemplaza con tu logo si quieres

### Step 5: Personaliza colores (Opcional)
- [ ] Abre: `css/styles.css`
- [ ] Busca la sección `:root {` (líneas 8-13)
- [ ] Cambia `--primary: #448a3c;` por tu color
  - [ ] Verde es #448a3c
  - [ ] Cambia a #0066ff para azul, #ff6600 para naranja, etc.
  - [ ] Usa https://colorpicker.com/ para elegir
- [ ] Guarda

---

## FASE 2: PRUEBAS LOCALES (5 minutos) ✅

Antes de publicar, prueba que todo funcione localmente:

### Step 6: Abre el sitio en tu navegador
- [ ] Navega a: `atelweb_frontend_only/index.html`
- [ ] Doble-click en el archivo (se abre en navegador)
- [ ] O: Arrastra `index.html` al navegador

### Step 7: Verifica la página principal
- [ ] ¿Se ven todas las secciones? (Hero, Servicios, Empresa, Contacto)
- [ ] ¿Los estilos se cargaron? (Colores, fuentes, layout)
- [ ] ¿Las imágenes aparecen?
- [ ] ¿El menú es responsivo? (Redimensiona ventana)

### Step 8: Prueba el formulario
- [ ] Click en "Solicitar Presupuesto"
- [ ] Llena el formulario con datos de ejemplo
- [ ] Click en "Enviar solicitud"
- [ ] ¿Ves mensaje "✅ Solicitud enviada"?
- [ ] Si hay error: ¿Dice "Por favor, configura tu Formspree ID"?
  - [ ] Sí → Vuelve a verificar que copiaste el ID correctamente
  - [ ] No → El error está en otra parte, revisa la consola (F12)

### Step 9: Verifica que recibes el email
- [ ] Abre tu bandeja de Formspree: https://formspree.io/forms
- [ ] ¿Ves el presupuesto que acabas de enviar?
- [ ] ¿Recibiste email en tu bandeja principal?
- [ ] Si no ves el email:
  - [ ] Revisar SPAM
  - [ ] Esperar 1-2 minutos (email puede ser lento)
  - [ ] Verificar que tu Formspree ID sea correcto

### Step 10: Test de idiomas (Opcional)
- [ ] En la página principal, click en selector de idioma
- [ ] Selecciona "EN" (English)
- [ ] ¿Los textos cambian a inglés?
- [ ] Prueba con otras opciones (DE, RU, UK, AR)

---

## FASE 3: DESPLIEGUE A INTERNET (3-5 minutos) 🚀

### OPCIÓN A: NETLIFY (Recomendado - Lo más fácil)

- [ ] Ve a https://app.netlify.com/
- [ ] Regístrate (con Google es lo más rápido)
- [ ] Click "Add new site" → "Deploy manually"
- [ ] **Arrastra la carpeta `atelweb_frontend_only` aquí**
- [ ] Espera 30 segundos a que se suba
- [ ] Tu URL estará en formato: `https://xxxxx-xxxxx.netlify.app`
- [ ] Ahora tu sitio está EN VIVO
- [ ] (Opcional) En "Site Settings" → "Change site name" para nombre personalizado

### OPCIÓN B: VERCEL (También muy fácil)

- [ ] Ve a https://vercel.com/
- [ ] Regístrate
- [ ] "Add New Project" 
- [ ] Selecciona `atelweb_frontend_only`
- [ ] Click "Deploy"
- [ ] Tu sitio estará en `https://[tu-proyecto].vercel.app`

### OPCIÓN C: GITHUB PAGES (Para devs)

- [ ] Crea repo llamado `tu-usuario.github.io`
- [ ] Sube la carpeta `atelweb_frontend_only` en la raíz
- [ ] Tu sitio: `https://tu-usuario.github.io/`

---

## FASE 4: CUSTOM DOMAIN (Opcional - 5 minutos) 🌐

Si quieres tu propio dominio:

### Step 11: Compra un dominio
- [ ] Ve a Namecheap (https://www.namecheap.com/) o GoDaddy
- [ ] Busca y compra `tuempresa.com` (anual ≈ $10)
- [ ] Nota los datos de acceso

### Step 12: Conecta el dominio a Netlify
- [ ] En Netlify → Site Settings → Domain management
- [ ] Click "Add domain"
- [ ] Ingresa tu dominio
- [ ] Sigue las instrucciones para cambiar DNS en Namecheap
- [ ] Espera 24 horas a que se propague
- [ ] Tu sitio estará en `https://tuempresa.com`

---

## VERIFICACIONES FINALES ✔️

### Step 13: Verifica funcionalidad en producción
- [ ] Abre tu sitio en línea
- [ ] Envía un presupuesto real desde internet
- [ ] Verifica que llega en Formspree
- [ ] Verifica que llega email a tu inbox
- [ ] Prueba desde diferentes navegadores (Chrome, Firefox, Safari)
- [ ] Prueba desde teléfono móvil
- [ ] Verifica HTTPS (busca el candado 🔒 en URL)

### Step 14: SEO básico
- [ ] Google encuentra tu sitio en búsquedas
  - [ ] Ve a Google Search Console (https://search.google.com/search-console/)
  - [ ] Añade tu dominio
  - [ ] Espera 1-2 semanas a que indexe
- [ ] Meta description aparece en Google (si es necesario, ajusta en index.html)

---

## MANTENIMIENTO FUTURO 🔧

### Cambios frecuentes:
- [ ] Cambiar teléfono: `index.html` + buscar número
- [ ] Cambiar email: `index.html` + buscar email
- [ ] Cambiar descripción de servicios: `index.html` sección "servicios"
- [ ] Cambiar precios: Agregar campo en formulario `presupuesto/index.html`

### Monitoreo:
- [ ] Revisa Formspree cada semana para nuevos presupuestos
- [ ] Revisa Google Analytics para ver tráfico
- [ ] Si formulario falla: Abre DevTools (F12) y busca errores

---

## ¿PROBLEMAS? 🆘

Si algo no funciona:

1. **Formulario dice "error"**
   - Abre F12 → Console
   - ¿Ves "Por favor, configura tu Formspree ID"?
     - → Verifica que copiaste correctamente el ID
   - ¿Ves otro error?
     - → Copia el error y búscalo en Google

2. **No recibes emails**
   - ¿Aparece en el dashboard de Formspree?
     - Sí → Revisa SPAM de tu email
     - No → El formulario no se envió (error arriba)

3. **El sitio se ve feo**
   - Limpia cache: Ctrl+Shift+Del
   - Vuelve a cargar: Ctrl+F5

4. **Las imágenes no cargan**
   - El hosting no acepta WebP
   - Convierte a JPG: https://convertio.co/
   - Actualiza rutas en HTML

---

## RECURSOS DE AYUDA 📚

- **Documentación Formspree**: https://formspree.io/en/documentation/
- **Documentación Netlify**: https://docs.netlify.com/
- **Documentación Vercel**: https://vercel.com/docs
- **Google Analytics Help**: https://support.google.com/analytics
- **Mi proyecto está en**: `atelweb_frontend_only/`

---

## PRÓXIMOS PASOS AVANZADOS (Opcional) 🎓

Después de que todo funcione:

- [ ] Configurar email automático de respuesta en Formspree
- [ ] Integrar chatbot (Typeform, Tidio, etc.)
- [ ] Agregar más páginas (Blog, Portafolio, etc.)
- [ ] Mejorar SEO con estructurados (Schema.org)
- [ ] Añadir testimonios de clientes
- [ ] Configurar pixel de Facebook/Google Ads

---

## ✨ ¡LISTO!

Una vez completados los pasos de FASE 1 y FASE 2, tu sitio está funcional.

Puedes publicarlo en FASE 3 cuando quieras.

**¡Buena suerte con tu sitio web!** 🚀

---

**Documento actualizado:** 25 de marzo de 2026  
**Versión:** 1.0  
**Proyecto:** ATEL SISTEMS Frontend-Only


## FASE 1.5: AUDITORIA DE CODIGO Y SEGURIDAD (Nuevo - Abril 2026)

Antes de seguir, verifica que el codigo esta limpio y sin vulnerabilidades web:
- [ ] Abre una terminal en la raiz del proyecto `atelweb_frontend_only`.
- [ ] Ejecuta `npm test`.
- [ ] Si prefieres, lanza pruebas individuales: `node tests/security.test.js` y `node tests/code-quality.test.js`.
- [ ] Comprueba que ambos tests pasen en verde (sin tabnabbing, sin inyecciones XSS y sin fugas de consola).
- [ ] Si da error, corrige antes de subir a internet.


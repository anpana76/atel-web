# Publicacion en Internet con HTTPS

Objetivo: publicar este proyecto en un dominio propio usando Ubuntu + Nginx + Certbot.

## Flujo recomendado

1. Apunta `atelsistems.com` y `atelsistems.es` al VPS con registros `A`.
2. Si quieres usar `www`, crea un `CNAME` hacia el dominio principal elegido.
3. Sube el proyecto al servidor.
4. Ejecuta el instalador interactivo y responde a las preguntas iniciales.
5. Verifica la publicacion final en el navegador.

## 1) DNS del dominio

En el panel DNS de tu proveedor:

- Registro `A` para `atelsistems.com` -> IP publica del VPS
- Registro `A` para `atelsistems.es` -> IP publica del VPS
- Si usas `www`, crea `CNAME` hacia el dominio principal elegido

Espera la propagacion (normalmente minutos, a veces horas).

## 2) Subir proyecto al servidor

Conecta por SSH y crea la ruta destino:

```bash
sudo mkdir -p /var/www/atelweb_frontend_only
sudo chown -R $USER:$USER /var/www/atelweb_frontend_only
```

Sube los archivos desde tu PC o clona el repositorio directamente en el VPS.

## 3) Ejecutar la configuracion automatica

Entra por SSH al VPS y ejecuta:

```bash
cd /var/www/atelweb_frontend_only/deploy
sudo bash setup-ubuntu-https.sh
```

El asistente pedira:

- Dominio principal
- Alias `www`
- Email para Certbot
- Ruta del sitio
- Confirmacion final de instalacion

## 4) Verificar publicacion

Abre en navegador las URLs que te indique el instalador. Si el dominio es correcto, deberias ver:

- `https://atelsistems.com`
- `https://atelsistems.es`
- `https://atelsistems.com/presupuesto/`

## 5) Comandos utiles de diagnostico

```bash
sudo nginx -t
sudo systemctl status nginx --no-pager
sudo certbot certificates
```

## Archivos incluidos

- [nginx-atelmalaga.conf](nginx-atelmalaga.conf): plantilla de referencia para Nginx
- [setup-ubuntu-https.sh](setup-ubuntu-https.sh): instalador interactivo para Linux
- [package-local.sh](package-local.sh): genera un paquete de despliegue con la web final en `site/`

# Publicacion en Internet con HTTPS (Debian + Nginx)

Objetivo: publicar este proyecto en un dominio propio usando Debian + Nginx + Certbot (Let's Encrypt), con instalacion automatica, monitorizacion periodica y hardening de red.

**Nota:** Este procedimiento es compatible con Debian limpio (sin paquetes previos).

## Instalador recomendado (todo en uno)

Usa este script para automatizar toda la preparacion del servidor:

```bash
cd /ruta/del/proyecto/deploy
sudo bash autoejecutable-debian-servidor.sh
```

Si ejecutas desde USB/paquete local, tienes lanzador directo en la raiz del proyecto:

```bash
sudo bash INSTALAR_DEBIAN_TODO_EN_UNO.sh
```

El instalador realiza automaticamente:

- Instalacion de Nginx, Certbot, nftables y dependencias.
- Copia del proyecto a `/var/www/atelweb_frontend_only`.
- Configuracion de Nginx para la web y subrutas (`/presupuesto/`, `/certificaciones/`).
- Hardening de red (bloqueo de forwarding para evitar salto a otros equipos de la red).
- Watchdog de salud con `systemd` cada 5 minutos.
- Script para activar HTTPS cuando tengas el dominio definitivo.

Por defecto se aplica perfil de red `strict` para evitar accesos del servidor a redes privadas de la LAN.

Si aun no tienes dominio, puedes ejecutar igualmente el instalador y dejar HTTPS para despues.

Perfiles de red disponibles:

- `strict` (recomendado): bloquea nuevas conexiones salientes del servidor a redes privadas/locales.
- `standard`: mantiene bloqueo de forwarding, pero no bloquea salidas a LAN.

Ejemplo en modo standard:

```bash
sudo bash autoejecutable-debian-servidor.sh --network-profile standard
```

Comando para activar HTTPS mas adelante:

```bash
sudo /usr/local/bin/atel-enable-https.sh tu-dominio.com www.tu-dominio.com tu-email@dominio.com
```

## Flujo recomendado

1. Apunta `atelsistems.com` y `atelsistems.es` al servidor Debian con registros DNS tipo `A`.
2. Si quieres usar `www`, crea un `CNAME` hacia el dominio principal elegido.
3. Sube el proyecto al servidor (o por USB).
4. Ejecuta el instalador automatico `autoejecutable-debian-servidor.sh`.
5. Verifica la publicacion final en navegador.

## 1) DNS del dominio

En el panel DNS de tu proveedor:

- Registro `A` para `atelsistems.com` → IP pública del servidor Debian.
- Registro `A` para `atelsistems.es` → IP pública del servidor Debian.
- Si usas `www`, configura un `CNAME` hacia el dominio principal.

Espera la propagacion (normalmente minutos, a veces horas).

## 2) Preparar Debian

Conecta por SSH y actualiza el sistema:

```bash
sudo apt update
sudo apt upgrade -y
```

## 3) Subir proyecto al servidor

Crea la ruta destino:

```bash
sudo mkdir -p /var/www/atelweb_frontend_only
sudo chown -R $USER:$USER /var/www/atelweb_frontend_only
```

Sube los archivos desde tu PC o clona el repositorio directamente en el servidor:

```bash
cd /var/www/atelweb_frontend_only
git clone https://github.com/anpana76/atelweb_frontend_only.git .
```

O copia manualmente los archivos vía SCP/SFTP.

## 4) Ejecutar la configuracion automatica

Entra por SSH al servidor Debian y ejecuta:

```bash
cd /var/www/atelweb_frontend_only/deploy
sudo bash autoejecutable-debian-servidor.sh
```

Si ya tienes dominio y correo para certificados, puedes pasarlos en linea:

```bash
sudo bash autoejecutable-debian-servidor.sh \
  --domain atelsistems.com \
  --www-domain www.atelsistems.com \
  --email admin@atelsistems.com
```

Desde el lanzador USB equivale a:

```bash
sudo bash INSTALAR_DEBIAN_TODO_EN_UNO.sh \
  --domain atelsistems.com \
  --www-domain www.atelsistems.com \
  --email admin@atelsistems.com
```

Si aun no tienes dominio, instala solo en HTTP y activa HTTPS despues con:

```bash
sudo /usr/local/bin/atel-enable-https.sh atelsistems.com www.atelsistems.com admin@atelsistems.com
```

## 5) Verificar publicacion

Abre en navegador las URLs que te indique el instalador:

- `https://atelsistems.com`
- `https://atelsistems.es`
- `https://atelsistems.com/presupuesto/`

Comprueba que:

- El certificado es valido (candado en navegador).
- Las paginas cargan sin errores de rutas.
- HTTP redirige automaticamente a HTTPS.

## 6) Comandos utiles de diagnostico

### Estado de Nginx

```bash
sudo systemctl status nginx
```

### Validar configuracion de Nginx

```bash
sudo nginx -t
```

### Recargar Nginx tras cambios

```bash
sudo systemctl reload nginx
```

### Ver certificados de Certbot

```bash
sudo certbot certificates
```

### Renovar certificados manualmente

```bash
sudo certbot renew
```

La renovacion automatica se configura durante la instalacion (cron job cada 12 horas).

## 7) Cambios comunes tras despliegue

### Actualizar el sitio (nueva version del codigo)

Si actualizas el repositorio:

```bash
cd /var/www/atelweb_frontend_only
git pull origin ATEL_web
```

O copia nuevos archivos vía SCP/SFTP. No es necesario reiniciar Nginx; la cambios son inmediatos.

### Cambiar el dominio o alias

Si cambias el dominio despues de la instalacion:

1. Edita `/etc/nginx/sites-available/atelsistems.conf`:

```bash
sudo nano /etc/nginx/sites-available/atelsistems.conf
```

1. Cambia `server_name` con los nuevos dominios.

1. Recarga Nginx:

```bash
sudo systemctl reload nginx
```

1. Emite un certificado para los nuevos dominios (o renueva el existente):

```bash
sudo certbot certonly --nginx -d atelsistems.com -d atelsistems.es -d www.atelsistems.com
```

### Respaldar configuracion

Haz backup de la configuracion de Nginx y certificados:

```bash
sudo tar -czf ~/nginx-backup-$(date +%Y-%m-%d).tar.gz \
  /etc/nginx \
  /etc/letsencrypt
```

## 8) Diferencias minimas entre Ubuntu y Debian

Aunque son muy similares, aqui estan las diferencias menores:

| Aspecto | Ubuntu | Debian |
| --- | --- | --- |
| Gestor paquetes | APT | APT |
| Nginx disponible | Sí | Sí |
| Certbot disponible | Sí | Sí |
| Ubicacion UFW | `/etc/ufw` | `/etc/ufw` |
| Ciclo de soporte | 5 años LTS | 5 años + 2 años soporte extendido |

En practica, los scripts funcionan identicamente.

## 9) Troubleshooting

### "certbot: command not found"

Instala Certbot manualmente:

```bash
sudo apt install certbot python3-certbot-nginx
```

### "nginx: [emerg] address already in use"

El puerto 80 o 443 estan ocupados:

```bash
sudo lsof -i :80
sudo lsof -i :443
```

Mata el proceso que ocupa el puerto o elige otro.

### "Permission denied" en `/var/www/`

Verifica permisos:

```bash
sudo chown -R $USER:$USER /var/www/atelweb_frontend_only
sudo chmod -R 755 /var/www/atelweb_frontend_only
```

### El certificado expira en breve

Certbot renueva automaticamente, pero si quieres forzar:

```bash
sudo certbot renew --force-renewal
```

## 10) Monitoreo continuo

El instalador crea un watchdog automatico:

- Servicio: `atel-healthcheck.service`
- Temporizador: `atel-healthcheck.timer` (cada 5 minutos)
- Log: `/var/log/atel-healthcheck.log`

Comandos utiles:

```bash
sudo systemctl status atel-healthcheck.timer
sudo systemctl start atel-healthcheck.service
sudo tail -f /var/log/atel-healthcheck.log
```

## 11) Aislamiento de red

El instalador aplica estas medidas:

- `net.ipv4.ip_forward=0` y `net.ipv6.conf.all.forwarding=0`.
- Politica `forward drop` en `nftables`.
- Entrada permitida solo a `22`, `80`, `443`.
- En perfil `strict`, tambien bloquea nuevas conexiones salientes a rangos privados de LAN.

Con esto, el servidor publica la web pero no se usa como puente para acceder al resto de equipos de la red local.

### Ver logs de Nginx

```bash
sudo tailf /var/log/nginx/access.log
sudo tailf /var/log/nginx/error.log
```

### Ver logs de Certbot

```bash
sudo journalctl -u certbot.timer -f
```

## 12) Recursos

- [Documentacion Nginx Debian](https://wiki.debian.org/Nginx)
- [Let's Encrypt / Certbot](https://certbot.eff.org/)
- [Guia Nginx basica](https://nginx.org/en/docs/beginners_guide.html)
- Script de instalacion recomendado: [autoejecutable-debian-servidor.sh](autoejecutable-debian-servidor.sh)
- Lanzador USB recomendado: [../INSTALAR_DEBIAN_TODO_EN_UNO.sh](../INSTALAR_DEBIAN_TODO_EN_UNO.sh)
- Script alternativo legado: [setup-ubuntu-https.sh](setup-ubuntu-https.sh)

## Archivos incluidos

- [autoejecutable-debian-servidor.sh](autoejecutable-debian-servidor.sh): instalador Debian todo en uno.
- [../INSTALAR_DEBIAN_TODO_EN_UNO.sh](../INSTALAR_DEBIAN_TODO_EN_UNO.sh): lanzador directo para USB.
- [setup-ubuntu-https.sh](setup-ubuntu-https.sh): instalador interactivo legado (compatible Debian).
- [nginx-atelmalaga.conf](nginx-atelmalaga.conf): plantilla de referencia para Nginx.

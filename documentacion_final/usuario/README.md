# Documentación de Usuario

Este bloque reúne la información pensada para operación diaria, puesta en marcha y consulta rápida.

## Guías recomendadas

- [QUICKSTART.md](../QUICKSTART.md)
- [README_FRONTEND_ONLY.md](../README_FRONTEND_ONLY.md)
- [SETUP_CHECKLIST.md](../SETUP_CHECKLIST.md)
- [1_PRESENTACION_PROYECTO.md](../1_PRESENTACION_PROYECTO.md)

## Qué debe consultar primero un usuario

1. [QUICKSTART.md](../QUICKSTART.md) si quiere arrancar rápido.
2. [SETUP_CHECKLIST.md](../SETUP_CHECKLIST.md) si quiere seguir una lista de verificación.
3. [README_FRONTEND_ONLY.md](../README_FRONTEND_ONLY.md) si necesita visión general del sitio.

## Para instalar en un PC local de empresa

Usa [deploy/package-local.sh](../../deploy/package-local.sh) para generar un paquete de despliegue con la web final en `site/` y los scripts de soporte en `support/`.

Dentro del paquete, ejecuta primero [INSTALAR_DEBIAN_TODO_EN_UNO.sh](../../INSTALAR_DEBIAN_TODO_EN_UNO.sh) para copiar solo la web al servidor.

## Para ponerlo en servidor

Usa la guía de despliegue en [deploy/DEPLOY_UBUNTU_HTTPS.md](../../deploy/DEPLOY_UBUNTU_HTTPS.md) o el instalador interactivo [deploy/setup-ubuntu-https.sh](../../deploy/setup-ubuntu-https.sh).

## Nota

Si el usuario final no administra el servidor, no necesita tocar la parte técnica: solo revisar la guía rápida y los pasos de configuración inicial.
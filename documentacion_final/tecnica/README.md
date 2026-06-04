# Documentación Técnica

Este bloque agrupa la documentación dirigida a desarrollo, despliegue, soporte y validación técnica.

## Documentos técnicos principales

- [2_MEMORIA_TECNICA.md](../2_MEMORIA_TECNICA.md)
- [3_REVISION_SEGURIDAD.md](../3_REVISION_SEGURIDAD.md)
- [CONFIG_REFERENCE.md](../CONFIG_REFERENCE.md)
- [GLOSARIO_TECNICO.md](../GLOSARIO_TECNICO.md)
- [CHULETA_REUNION_TECNICA.md](../CHULETA_REUNION_TECNICA.md)
- [CHANGES.md](../CHANGES.md)

## Despliegue y operación

- [deploy/DEPLOY_UBUNTU_HTTPS.md](../../deploy/DEPLOY_UBUNTU_HTTPS.md)
- [deploy/DEPLOY_DEBIAN_HTTPS.md](../../deploy/DEPLOY_DEBIAN_HTTPS.md)
- [deploy/DEPLOY_WINDOWS_HTTPS.md](../../deploy/DEPLOY_WINDOWS_HTTPS.md)
- [deploy/setup-ubuntu-https.sh](../../deploy/setup-ubuntu-https.sh)
- [deploy/nginx-atelmalaga.conf](../../deploy/nginx-atelmalaga.conf)
- [deploy/package-local.sh](../../deploy/package-local.sh)

El empaquetado recomendado para entrega es [deploy/package-local.sh](../../deploy/package-local.sh), que deja la web final en `site/` y separa los ficheros de soporte en `support/`.

## Qué revisar al cambiar código

1. Rutas relativas y absolutas en [index.html](../../index.html) y [certificaciones/index.html](../../certificaciones/index.html).
2. Validaciones automáticas en [tests/check-project.js](../../tests/check-project.js).
3. Seguridad de frontend en [tests/security.test.js](../../tests/security.test.js).
4. Calidad de código en [tests/code-quality.test.js](../../tests/code-quality.test.js).

## Nota

Si el proyecto se despliega en un dominio propio, la referencia de dominio debe vivir en el instalador o en la configuración del servidor, no en el HTML.
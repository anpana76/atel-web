## LEEME - Implementacion en Windows y Linux

Este documento explica como preparar y ejecutar la version de produccion del proyecto en ambos entornos.

Indice documental general: [DOCUMENTACION.md](DOCUMENTACION.md)

## Modelos disponibles

- Modelo cliente final: [LEEME_CLIENTE_FINAL.md](LEEME_CLIENTE_FINAL.md)
- Modelo tecnico: [LEEME_TECNICO.md](LEEME_TECNICO.md)

## 1. Requisitos

- Node.js 18 o superior
- npm (incluido con Node.js)
- Git (opcional, recomendado)

Comprobar versiones:

```bash
node -v
npm -v
```

## 2. Instalacion inicial (una sola vez)

Desde la raiz del proyecto:

```bash
npm install
```

## 3. Implementacion en Windows

### Opcion recomendada (autoejecutable)

Ejecutar el archivo:

```bat
autoejecutable-produccion.bat
```

Este script hace automaticamente:

1. `npm run build:prod`
2. `npm run serve:prod`

### Opcion manual

```bat
npm run build:prod
npm run serve:prod
```

## 4. Implementacion en Linux

### Opcion recomendada (autoejecutable)

Dar permisos de ejecucion (solo la primera vez):

```bash
chmod +x autoejecutable-produccion.sh
```

Ejecutar:

```bash
./autoejecutable-produccion.sh
```

Este script hace automaticamente:

1. `npm run build:prod`
2. `npm run serve:prod`

### Opcion manual

```bash
npm run build:prod
npm run serve:prod
```

## 5. Resultado esperado

- Se genera la carpeta de produccion en `.dist/production`
- El servidor arranca en `http://localhost:8080` (o puerto alternativo libre)

## 6. Parar el servidor

En ambos sistemas:

- Pulsar `Ctrl + C` en la terminal donde se esta ejecutando

## 7. Solucion de problemas rapida

- Error `npm no esta disponible`: instalar Node.js y reiniciar terminal
- Error de permisos en Linux: volver a ejecutar `chmod +x autoejecutable-produccion.sh`
- Puerto ocupado: cerrar proceso que use ese puerto o reiniciar

## 8. Despliegue productivo en servidor

Para publicar en internet con HTTPS:

- Linux (Ubuntu + Nginx): [deploy/DEPLOY_UBUNTU_HTTPS.md](deploy/DEPLOY_UBUNTU_HTTPS.md)
- Linux (Debian + Nginx): [deploy/DEPLOY_DEBIAN_HTTPS.md](deploy/DEPLOY_DEBIAN_HTTPS.md) (compatible con Ubuntu)
- Windows Server + IIS: [deploy/DEPLOY_WINDOWS_HTTPS.md](deploy/DEPLOY_WINDOWS_HTTPS.md)


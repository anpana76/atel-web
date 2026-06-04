## LEEME - Implementacion tecnica (Windows y Linux)

Este documento esta orientado a equipo tecnico para build y levantamiento de produccion local.

## 1. Requisitos

- Node.js 18+
- npm

Validacion:

```bash
node -v
npm -v
```

## 2. Instalacion de dependencias

Desde la raiz del proyecto:

```bash
npm install
```

## 3. Flujo de produccion

El flujo oficial consta de 2 pasos:

1. `npm run build:prod`
2. `npm run serve:prod`

Para preparar una carpeta lista para subir a Netlify:

1. `npm run build:netlify`
2. Sube la carpeta `netlify-deploy/`

Salida de build esperada:

- `.dist/production`

## 4. Windows

### 4.1 Autoejecutable

```bat
autoejecutable-produccion.bat
```

### 4.2 Manual

```bat
npm run build:prod
npm run serve:prod
```

## 5. Linux

### 5.1 Autoejecutable

Primera ejecucion:

```bash
chmod +x autoejecutable-produccion.sh
```

Ejecucion:

```bash
./autoejecutable-produccion.sh
```

### 5.2 Manual

```bash
npm run build:prod
npm run serve:prod
```

## 6. Validaciones tecnicas recomendadas

- Confirmar que existe `.dist/production` tras `build:prod`.
- Confirmar respuesta HTTP del servidor en `http://localhost:8080`.
- Revisar consola por errores JS/CSS en navegador.

## 7. Troubleshooting

- `npm` no reconocido: reinstalar Node.js y abrir nueva terminal.
- Permisos Linux: repetir `chmod +x autoejecutable-produccion.sh`.
- Puerto ocupado: liberar puerto o configurar otro disponible.

## 8. Parada de servicio

- `Ctrl + C` en la terminal activa.

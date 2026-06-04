## LEEME - Guia rapida para cliente final

Este documento esta pensado para ejecutar el proyecto de forma simple, sin pasos tecnicos avanzados.

## Opcion 1: Windows

1. Abrir la carpeta del proyecto.
2. Hacer doble clic en `autoejecutable-produccion.bat`.
3. Esperar a que el sistema termine de preparar la version de produccion.
4. Abrir el navegador en `http://localhost:8080`.

Para detener el servicio:

- Volver a la ventana de comandos y pulsar `Ctrl + C`.

## Opcion 2: Linux

1. Abrir una terminal en la carpeta del proyecto.
2. Dar permisos al script (solo la primera vez):

```bash
chmod +x autoejecutable-produccion.sh
```

3. Ejecutar el autoejecutable:

```bash
./autoejecutable-produccion.sh
```

4. Abrir el navegador en `http://localhost:8080`.

Para detener el servicio:

- Pulsar `Ctrl + C` en la terminal.

## Si aparece un error

- Verificar que Node.js esta instalado.
- Verificar que npm esta disponible.
- Si el puerto esta ocupado, cerrar otros servidores que usen ese puerto y repetir.

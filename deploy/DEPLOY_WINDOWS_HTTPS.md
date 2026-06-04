# Publicacion en Internet con HTTPS (Windows Server + IIS)

Objetivo: publicar este proyecto en un dominio propio usando Windows Server + IIS + certificado TLS.

## Flujo recomendado

1. Apunta `atelsistems.com` y `atelsistems.es` al servidor con DNS.
2. Genera el build de produccion del proyecto.
3. Publica `.dist/production` en IIS.
4. Configura HTTPS con certificado valido.
5. Verifica la publicacion final en navegador.

## 1) DNS del dominio

En el panel DNS de tu proveedor:

- Registro `A` para `atelsistems.com` -> IP publica del servidor Windows.
- Registro `A` para `atelsistems.es` -> IP publica del servidor Windows.
- Si usas `www`, crea `CNAME` hacia el dominio principal.

Espera la propagacion (normalmente minutos, a veces horas).

## 2) Preparar build de produccion

En tu maquina de trabajo, desde la raiz del proyecto:

```bat
npm install
npm run build:prod
```

El resultado debe quedar en:

```text
.dist/production
```

## 3) Publicar en IIS

### 3.1 Instalar IIS (si no esta instalado)

En PowerShell como administrador:

```powershell
Install-WindowsFeature -Name Web-Server -IncludeManagementTools
```

### 3.2 Copiar archivos al servidor

Copia el contenido de `.dist/production` a una ruta de publicacion, por ejemplo:

```text
C:\inetpub\atelweb_frontend_only
```

### 3.3 Crear el sitio en IIS

1. Abre `IIS Manager`.
2. `Sites` -> `Add Website...`
3. Rellena:
   - `Site name`: `atelsistems`
   - `Physical path`: `C:\inetpub\atelweb_frontend_only`
   - `Binding`: `http`, puerto `80`, host `atelsistems.com`
4. Crea un segundo binding `http` para `atelsistems.es` (si aplica).

## 4) Configurar HTTPS

Puedes usar cualquier CA valida. La opcion habitual en Windows es Let's Encrypt con win-acme.

## 4.1 Emitir certificado con win-acme (recomendado)

1. Descarga win-acme: https://www.win-acme.com/
2. Ejecuta `wacs.exe` como administrador.
3. Elige crear certificado para un sitio existente de IIS.
4. Selecciona el sitio `atelsistems`
5. Incluye los hostnames necesarios (`atelsistems.com`, `atelsistems.es`, `www.atelsistems.com` si aplica).
6. Acepta instalacion automatica del certificado y renovacion programada.

Al terminar, IIS tendra binding `https` en puerto `443` con el certificado asignado.

## 4.2 Forzar redireccion HTTP -> HTTPS (recomendado)

En IIS:

1. Instala `URL Rewrite` si no lo tienes.
2. En el sitio, crea regla `Blank rule`:
   - Condicion: `{HTTPS}` `Matches the Pattern` `^OFF$`
   - Accion: `Redirect` a `https://{HTTP_HOST}/{R:1}`
   - Tipo: `Permanent (301)`

## 5) Verificar publicacion

Comprueba en navegador:

- `https://atelsistems.com`
- `https://atelsistems.es`
- `https://atelsistems.com/presupuesto/`

Validaciones esperadas:

- Certificado valido (candado en navegador).
- Redireccion de `http` a `https` activa.
- Paginas cargan sin errores de rutas.

## 6) Comandos utiles de diagnostico

### Estado de IIS

```powershell
Get-Service W3SVC
```

### Reiniciar IIS

```powershell
iisreset
```

### Ver renovacion de certificados (si usas win-acme)

Revisa el `Task Scheduler` y la tarea de renovacion creada por win-acme.

## Notas operativas

- Si actualizas el sitio, vuelve a copiar los archivos de `.dist/production` al `Physical path` de IIS.
- Para cambios grandes, haz backup previo de la carpeta publicada.
- Si cambias de dominio, vuelve a emitir certificado para los nuevos hostnames.

echo off
setlocal EnableExtensions EnableDelayedExpansion
title ATEL - Local Server Bootstrap (Verbose + Logs + Port Fallback)

REM ============================================================
REM ATEL bootstrap:
REM 1) Verifica winget (e intenta habilitarlo si falta)
REM 2) Verifica/instala runtime (Python preferido, Node fallback)
REM 3) Detecta puerto libre automaticamente
REM 4) Arranca servidor y abre navegador
REM 5) Al cerrar, permite desinstalar lo instalado en esta sesion
REM 6) Log detallado en archivo
REM ============================================================

set "ROOT=%~dp0"
set "BASE_PORT=8080"
set "PORT="
set "URL="
set "SERVER_KIND="

set "INSTALLED_WINGET=0"
set "INSTALLED_PYTHON=0"
set "INSTALLED_NODE=0"

REM ---------- Log setup ----------
if not exist "%ROOT%logs" mkdir "%ROOT%logs" >nul 2>&1
for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToString(\"yyyyMMdd-HHmmss\")"') do set "TS=%%I"
if not defined TS set "TS=%DATE:~6,4%%DATE:~3,2%%DATE:~0,2%-%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "TS=%TS: =0%"
set "LOGFILE=%ROOT%logs\bootstrap-%TS%.log"

cd /d "%ROOT%" || (
  echo [ERROR] No se pudo entrar al directorio del proyecto: "%ROOT%"
  goto :END
)

set "T0=%TIME%"
call :DASHLINE
call :LOG "[DASH] ATEL Local Bootstrap"
call :LOG "[DASH] Proyecto: %CD%"
call :LOG "[DASH] Fecha/Hora: %DATE% %TIME%"
call :LOG "[DASH] Log file: %LOGFILE%"
call :DASHLINE
echo.

REM ------------------------------------------------------------
REM PASO 1: Comprobar winget
REM ------------------------------------------------------------
call :STEP "Comprobando winget"
call :CHECK_WINGET
if errorlevel 1 (
  call :WARN "winget no esta disponible. Intentando habilitar App Installer..."
  call :TRY_INSTALL_WINGET
  call :CHECK_WINGET
  if errorlevel 1 (
    call :ERRORMSG "No se pudo habilitar winget automaticamente."
    call :LOG "[INFO] Sin winget no puedo instalar dependencias automaticamente."
    call :LOG "[INFO] Instala App Installer desde Microsoft Store y vuelve a ejecutar."
    goto :END
  ) else (
    set "INSTALLED_WINGET=1"
    call :OK "winget disponible tras instalacion/reparacion."
  )
) else (
  call :OK "winget ya estaba disponible."
)

echo.
REM ------------------------------------------------------------
REM PASO 2: Comprobar Python (preferido)
REM ------------------------------------------------------------
call :STEP "Comprobando Python"
call :CHECK_PYTHON
if errorlevel 1 (
  call :WARN "Python no encontrado. Intentando instalar Python 3.12..."
  call :INSTALL_PYTHON
  call :CHECK_PYTHON
  if errorlevel 1 (
    call :WARN "Python no quedo disponible tras instalacion. Se intentara Node.js."
  ) else (
    set "INSTALLED_PYTHON=1"
    set "SERVER_KIND=python"
    call :OK "Python instalado y disponible."
  )
) else (
  set "SERVER_KIND=python"
  call :OK "Python ya estaba disponible."
)

echo.
REM ------------------------------------------------------------
REM PASO 3: Fallback a Node si Python no esta listo
REM ------------------------------------------------------------
if not defined SERVER_KIND (
  call :STEP "Comprobando Node.js (fallback)"
  call :CHECK_NODE
  if errorlevel 1 (
    call :WARN "Node.js no encontrado. Intentando instalar Node.js LTS..."
    call :INSTALL_NODE
    call :CHECK_NODE
    if errorlevel 1 (
      call :ERRORMSG "No hay runtime disponible (ni Python ni Node)."
      goto :POST_SERVER
    ) else (
      set "INSTALLED_NODE=1"
      set "SERVER_KIND=node"
      call :OK "Node.js instalado y disponible."
    )
  ) else (
    set "SERVER_KIND=node"
    call :OK "Node.js ya estaba disponible."
  )
)

echo.
REM ------------------------------------------------------------
REM PASO 4: Seleccionar puerto libre (BASE_PORT en adelante)
REM ------------------------------------------------------------
call :STEP "Buscando puerto libre desde %BASE_PORT%"
call :FIND_FREE_PORT %BASE_PORT%
if not defined PORT (
  call :ERRORMSG "No se encontro puerto libre en el rango evaluado."
  goto :POST_SERVER
)
set "URL=http://localhost:%PORT%"
call :OK "Puerto libre seleccionado: %PORT%"

echo.
REM ------------------------------------------------------------
REM PASO 5: Arranque
REM ------------------------------------------------------------
call :DASHLINE
call :LOG "[DASH] RESUMEN PRE-ARRANQUE"
call :LOG "[DASH] winget instalado en esta sesion: %INSTALLED_WINGET%"
call :LOG "[DASH] python instalado en esta sesion: %INSTALLED_PYTHON%"
call :LOG "[DASH] node instalado en esta sesion:   %INSTALLED_NODE%"
call :LOG "[DASH] runtime elegido: %SERVER_KIND%"
call :LOG "[DASH] puerto: %PORT%"
call :LOG "[DASH] url: %URL%"
call :DASHLINE
echo.

if /I "%SERVER_KIND%"=="python" goto :RUN_PYTHON
if /I "%SERVER_KIND%"=="node" goto :RUN_NODE

call :ERRORMSG "No se puede iniciar servidor: runtime no definido."
goto :POST_SERVER

:RUN_PYTHON
call :STEP "Iniciando servidor Python"
call :LOG "[INFO] Abriendo navegador en %URL%"
start "" "%URL%"
call :LOG "[INFO] Pulsa CTRL + C para detener el servidor."
echo.
python -m http.server %PORT%
goto :POST_SERVER

:RUN_NODE
call :STEP "Iniciando servidor Node (npx http-server)"
call :LOG "[INFO] Abriendo navegador en %URL%"
start "" "%URL%"
call :LOG "[INFO] Pulsa CTRL + C para detener el servidor."
echo.
npx --yes http-server . -p %PORT% -c-1
goto :POST_SERVER

REM ------------------------------------------------------------
REM PASO 6: Post-cierre y opcion de limpieza
REM ------------------------------------------------------------
:POST_SERVER
echo.
call :DASHLINE
call :LOG "[DASH] SERVIDOR DETENIDO"
call :LOG "[DASH] Si instalamos algo en esta sesion, puedes desinstalarlo ahora."
call :DASHLINE
echo.

if "%INSTALLED_WINGET%%INSTALLED_PYTHON%%INSTALLED_NODE%"=="000" (
  call :LOG "[INFO] No se instalo nada en esta sesion."
  goto :END
)

call :LOG "[INFO] Componentes instalados en esta sesion:"
if "%INSTALLED_WINGET%"=="1" call :LOG "  - App Installer / winget"
if "%INSTALLED_PYTHON%"=="1" call :LOG "  - Python 3.12"
if "%INSTALLED_NODE%"=="1" call :LOG "  - Node.js LTS"
echo.
choice /C SD /M "Quieres desinstalar lo instalado en esta sesion? (S=Si, D=Dejarlo)"
if errorlevel 2 goto :KEEP_ALL
if errorlevel 1 goto :UNINSTALL_ALL

:KEEP_ALL
call :OK "Se mantienen los componentes instalados."
goto :END

:UNINSTALL_ALL
call :STEP "Desinstalando componentes instalados en esta sesion"

if "%INSTALLED_PYTHON%"=="1" (
  call :LOG "[UNINSTALL] Python 3.12..."
  winget uninstall -e --id Python.Python.3.12 --accept-source-agreements
)

if "%INSTALLED_NODE%"=="1" (
  call :LOG "[UNINSTALL] Node.js LTS..."
  winget uninstall -e --id OpenJS.NodeJS.LTS --accept-source-agreements
)

if "%INSTALLED_WINGET%"=="1" (
  call :LOG "[UNINSTALL] App Installer (winget)..."
  call :WARN "En algunos equipos esta desinstalacion puede requerir confirmacion o fallar por politicas."
  winget uninstall -e --id Microsoft.AppInstaller --accept-source-agreements
)

call :OK "Proceso de desinstalacion finalizado."
goto :END

REM ============================================================
REM FUNCIONES
REM ============================================================

:FIND_FREE_PORT
set "PORT="
set /a START=%~1
set /a END=%~1+50
for /L %%P in (%START%,1,%END%) do (
  call :IS_PORT_FREE %%P
  if !errorlevel! EQU 0 (
    set "PORT=%%P"
    goto :EOF
  )
)
exit /b 1

:IS_PORT_FREE
set "CHKPORT=%~1"
netstat -ano | findstr /R /C:":%CHKPORT% .*LISTENING" >nul 2>&1
if %errorlevel%==0 (
  exit /b 1
) else (
  exit /b 0
)

:CHECK_WINGET
where winget >nul 2>&1
if %errorlevel%==0 (exit /b 0)
exit /b 1

:CHECK_PYTHON
where python >nul 2>&1
if %errorlevel%==0 (exit /b 0)
exit /b 1

:CHECK_NODE
where node >nul 2>&1
if %errorlevel%==0 (exit /b 0)
exit /b 1

:TRY_INSTALL_WINGET
REM Intento directo (si disponible por otros aliases/rutas)
winget install -e --id Microsoft.AppInstaller --accept-package-agreements --accept-source-agreements >nul 2>&1
if %errorlevel%==0 exit /b 0

REM Fallback manual asistido
call :LOG "[INFO] Abriendo Microsoft Store en App Installer..."
start "" "ms-windows-store://pdp/?ProductId=9NBLGGH4NNS1"
call :LOG "[INFO] Completa la instalacion en Store y pulsa una tecla para reintentar."
pause
exit /b 0

:INSTALL_PYTHON
call :LOG "[INSTALL] winget install Python.Python.3.12"
winget install -e --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements
exit /b 0

:INSTALL_NODE
call :LOG "[INSTALL] winget install OpenJS.NodeJS.LTS"
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
exit /b 0

:STEP
call :LOG "[STEP] %~1"
exit /b 0

:OK
call :LOG "[OK] %~1"
exit /b 0

:WARN
call :LOG "[WARN] %~1"
exit /b 0

:ERRORMSG
call :LOG "[ERROR] %~1"
exit /b 0

:DASHLINE
call :LOG "============================================================"
exit /b 0

:LOG
echo %~1
>> "%LOGFILE%" echo %DATE% %TIME% %~1
exit /b 0

:END
set "T1=%TIME%"
echo.
call :DASHLINE
call :LOG "[FIN] Bootstrap completado."
call :LOG "[FIN] Hora inicio: %T0%"
call :LOG "[FIN] Hora fin:    %T1%"
call :LOG "[FIN] Revisa el log: %LOGFILE%"
call :DASHLINE
pause
endlocal
@echo off
setlocal EnableExtensions

REM Autoejecutable de produccion:
REM 1) npm run build:prod
REM 2) npm run serve:prod

cd /d "%~dp0" || (
    echo [ERROR] No se pudo entrar en el directorio del proyecto.
    exit /b 1
)

echo ===========================================
echo ATEL - Autoejecutable Produccion
echo ===========================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm no esta disponible en PATH.
    echo Instala Node.js y vuelve a intentarlo.
    exit /b 1
)

echo [1/2] Construyendo produccion...
call npm run build:prod
if errorlevel 1 (
    echo.
    echo [ERROR] Fallo el build de produccion.
    exit /b 1
)

echo.
echo [2/2] Iniciando servidor de produccion...
echo URL esperada: http://localhost:8080 (o puerto alternativo libre)
echo Pulsa Ctrl+C para detener el servidor.
echo.
call npm run serve:prod

set "EXIT_CODE=%ERRORLEVEL%"
echo.
if not "%EXIT_CODE%"=="0" (
    echo [WARN] El servidor termino con codigo %EXIT_CODE%.
)

exit /b %EXIT_CODE%

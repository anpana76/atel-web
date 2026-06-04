@echo off
setlocal EnableExtensions
title ATEL - Panel de Control del Servidor

cd /d "%~dp0" || exit /b 1

echo ===========================================
echo ATEL Web - Panel de Control
echo ===========================================
echo.
echo Iniciando panel. La URL se mostrara cuando el servidor quede listo.
echo.

set "OPEN_BROWSER=1"
set "AUTO_START_MODE=local"
npm run serve:panel

echo.
echo Panel detenido.
pause
endlocal

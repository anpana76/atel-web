@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

for /f "tokens=1" %%P in ('powershell -NoProfile -Command "Get-CimInstance Win32_Process ^| Where-Object { $_.Name -eq ''node.exe'' -and $_.CommandLine -and $_.CommandLine -like ''*atelweb_frontend_only*'' } ^| Select-Object -ExpandProperty ProcessId"') do (
    taskkill /PID %%P /F >nul 2>&1
)

call "%~dp0internet.bat"
endlocal

param(
    [int]$Port = 8080,
    [string]$Host = "127.0.0.1"
)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Error "No se encontro Python en PATH. Instala Python o agrega python.exe al PATH."
    exit 1
}

Write-Host "Iniciando servidor local en http://$Host`:$Port"
Write-Host "Pulsa Ctrl+C para detenerlo."
python -m http.server $Port --bind $Host

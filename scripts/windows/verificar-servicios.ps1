# No requiere administrador: comprueba si los servicios existen y el puerto 3002.
$ErrorActionPreference = "SilentlyContinue"

Write-Host "=== FD Media Ops - Verificacion de servicios ===" -ForegroundColor Cyan
Write-Host ""

$names = @("FDMediaOpsApp", "FDMediaOpsWorker", "FDMediaOpsTest")
foreach ($n in $names) {
  $s = Get-Service -Name $n -ErrorAction SilentlyContinue
  if ($s) {
    Write-Host "[OK] $n : $($s.Status)" -ForegroundColor Green
  } else {
    Write-Host "[--] $n : no instalado" -ForegroundColor Yellow
  }
}

Write-Host ""
$port = netstat -ano | Select-String ":3002\s"
if ($port) {
  Write-Host "[OK] Algo escucha en el puerto 3002:" -ForegroundColor Green
  $port | ForEach-Object { Write-Host "     $_" }
} else {
  Write-Host "[!!] Nada escucha en el puerto 3002 (la app no esta arriba)." -ForegroundColor Red
}

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$logDir = Join-Path $RepoRoot "logs"
if ($logDir -and (Test-Path "$logDir\nssm-install.log")) {
  Write-Host ""
  Write-Host "Ultimo log de instalacion: $logDir\nssm-install.log"
}

Write-Host ""
Write-Host "Si los servicios NO aparecen en services.msc:" -ForegroundColor Cyan
Write-Host "  1) Clic derecho en reparar-servicios-completo.cmd -> Ejecutar como administrador"
Write-Host "  2) O:  winget install NSSM.NSSM"
Write-Host "  3) Luego install-services.ps1 como administrador"
Write-Host ""
Write-Host "En services.msc busca el nombre para mostrar: FD Media Ops"
Write-Host ""

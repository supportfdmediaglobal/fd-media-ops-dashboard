#Requires -RunAsAdministrator
$ErrorActionPreference = "Stop"

. "$PSScriptRoot\_nssm-paths.ps1"
$nssm = Get-NssmExePath
if (-not $nssm -or -not (Test-Path -LiteralPath $nssm)) {
  if ($env:NSSM -and (Test-Path -LiteralPath $env:NSSM)) {
    $nssm = (Resolve-Path -LiteralPath $env:NSSM).Path
  } else {
    Write-Error "NSSM no encontrado. winget install NSSM.NSSM o define `$env:NSSM"
  }
}

foreach ($name in @("FDMediaOpsTest", "FDMediaOpsApp", "FDMediaOpsWorker")) {
  $svc = Get-Service -Name $name -ErrorAction SilentlyContinue
  if (-not $svc) {
    Write-Host "No existe: $name"
    continue
  }
  Write-Host "Deteniendo $name..."
  if ($svc.Status -eq "Running") {
    Stop-Service -Name $name -Force
  }
  & $nssm remove $name confirm
  Write-Host "Eliminado: $name"
}

Write-Host "Hecho."

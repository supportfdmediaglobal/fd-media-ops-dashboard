#Requires -RunAsAdministrator
<#
  Instala dos servicios Windows (NSSM):
  - FDMediaOpsApp   -> npm run start  (Next.js en puerto 3002; requiere npm run build)
  - FDMediaOpsWorker -> npm run worker:dev (monitoreo + alertas)
#>
$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$LogsDir = Join-Path $RepoRoot "logs"
if (-not (Test-Path $LogsDir)) {
  New-Item -ItemType Directory -Path $LogsDir | Out-Null
}

$transcript = Join-Path $LogsDir "nssm-install.log"
try { Stop-Transcript -ErrorAction SilentlyContinue } catch {}
Start-Transcript -Path $transcript -Append -Force | Out-Null

try {
  . "$PSScriptRoot\_nssm-paths.ps1"

  $nssm = Get-NssmExePath
  if (-not $nssm) {
    throw @"
No se encontró nssm.exe (ni en PATH ni en WinGet Packages).
1) winget install NSSM.NSSM
   o descarga https://nssm.cc/download y guarda nssm.exe en C:\nssm\win64\
2) O define antes: `$env:NSSM = 'C:\ruta\completa\nssm.exe'
"@
  }

  $npmCmd = Get-NpmCmdPath
  if (-not $npmCmd) {
    throw "No se encontró npm.cmd. Instala Node.js LTS (https://nodejs.org) y vuelve a ejecutar este script como administrador."
  }

  $nodeDir = Split-Path -Parent $npmCmd
  # Asegura que node.exe se resuelva al arrancar como servicio (NSSM usa cuenta local).
  $envExtra = "NODE_ENV=production;PATH=$nodeDir;%PATH%"

  function Install-One {
    param(
      [string]$Name,
      [string]$Display,
      [string]$Description,
      [string]$NpmArgs,
      [string]$ExtraEnv
    )

    $stdout = Join-Path $LogsDir "$Name-stdout.log"
    $stderr = Join-Path $LogsDir "$Name-stderr.log"

    $existing = Get-Service -Name $Name -ErrorAction SilentlyContinue
    if ($existing) {
      Write-Host "Deteniendo y eliminando servicio existente: $Name"
      if ($existing.Status -eq "Running") {
        Stop-Service -Name $Name -Force
      }
      & $nssm remove $Name confirm
    }

    Write-Host "Instalando $Name..."
    & $nssm install $Name $npmCmd

    & $nssm set $Name AppDirectory $RepoRoot
    & $nssm set $Name AppParameters $NpmArgs
    & $nssm set $Name DisplayName $Display
    & $nssm set $Name Description $Description
    & $nssm set $Name AppStdout $stdout
    & $nssm set $Name AppStderr $stderr
    & $nssm set $Name AppStdoutCreationDisposition 4
    & $nssm set $Name AppStderrCreationDisposition 4
    & $nssm set $Name AppRotateFiles 1
    & $nssm set $Name AppRotateOnline 1
    & $nssm set $Name AppRotateBytes 1048576
    if ($ExtraEnv) {
      & $nssm set $Name AppEnvironmentExtra $ExtraEnv
    }
    & $nssm set $Name Start SERVICE_AUTO_START
  }

  Write-Host "Raíz del proyecto: $RepoRoot"
  Write-Host "NSSM: $nssm"
  Write-Host "npm:  $npmCmd"
  Write-Host "Log:  $transcript"

  Install-One -Name "FDMediaOpsApp" `
    -Display "FD Media Ops - Web (Next.js)" `
    -Description "Dashboard Next.js en el puerto 3002" `
    -NpmArgs "run start" `
    -ExtraEnv $envExtra

  Install-One -Name "FDMediaOpsWorker" `
    -Display "FD Media Ops - Worker de monitoreo" `
    -Description "Chequeos HTTP periodicos y alertas del agente" `
    -NpmArgs "run worker:dev" `
    -ExtraEnv $envExtra

  Write-Host ""
  Write-Host "Iniciando servicios..."
  Start-Service FDMediaOpsApp
  Start-Service FDMediaOpsWorker

  Write-Host ""
  Write-Host "Listo. Servicios instalados y arrancados."
  Write-Host "  - App:    http://localhost:3002"
  Write-Host "  - Logs:   $LogsDir"
  Write-Host "  - Buscar en services.msc: FD Media Ops"
}
finally {
  try { Stop-Transcript -ErrorAction SilentlyContinue } catch {}
}

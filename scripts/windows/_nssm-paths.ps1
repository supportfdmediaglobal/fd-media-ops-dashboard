# Funciones compartidas: localizar nssm.exe y npm.cmd sin depender del PATH del usuario.

function Get-NssmExePath {
  if ($env:NSSM -and (Test-Path -LiteralPath $env:NSSM)) {
    return (Resolve-Path -LiteralPath $env:NSSM).Path
  }

  $cmd = Get-Command nssm -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }

  foreach ($wingetRoot in @(
      (Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages")
      (Join-Path $env:ProgramData "Microsoft\WinGet\Packages")
    )) {
    if (-not (Test-Path -LiteralPath $wingetRoot)) { continue }
    $found = Get-ChildItem -LiteralPath $wingetRoot -Filter "nssm.exe" -Recurse -ErrorAction SilentlyContinue |
      Select-Object -First 1
    if ($found) { return $found.FullName }
  }

  $candidates = @(
    "C:\nssm\win64\nssm.exe"
    "C:\nssm\nssm.exe"
    "$(Join-Path $env:ProgramFiles 'nssm\win64\nssm.exe')"
    "$(Join-Path $env:ProgramFiles 'nssm\nssm.exe')"
  )
  foreach ($p in $candidates) {
    if ($p -and (Test-Path -LiteralPath $p)) { return (Resolve-Path -LiteralPath $p).Path }
  }

  return $null
}

function Get-NpmCmdPath {
  $cmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }

  $where = & where.exe npm.cmd 2>$null
  if ($where) {
    $line = ($where | Select-Object -First 1).ToString().Trim()
    if ($line -and (Test-Path -LiteralPath $line)) { return $line }
  }

  foreach ($p in @(
      "$(Join-Path $env:ProgramFiles 'nodejs\npm.cmd')"
      "$(Join-Path ${env:ProgramFiles(x86)} 'nodejs\npm.cmd')"
      "$(Join-Path $env:LOCALAPPDATA 'Programs\nodejs\npm.cmd')"
    )) {
    if ($p -and (Test-Path -LiteralPath $p)) { return (Resolve-Path -LiteralPath $p).Path }
  }

  return $null
}

function Get-NodeBinDirectory {
  $npm = Get-NpmCmdPath
  if (-not $npm) { return $null }
  return (Split-Path -Parent $npm)
}

@echo off
chcp 65001 >nul
set "REPO=c:\fdmediaops"
cd /d "%REPO%"

echo ============================================
echo FD Media Ops - Reparar servicios Windows
echo (debe ejecutarse como Administrador)
echo ============================================
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: Ejecuta este archivo con clic derecho "Ejecutar como administrador".
  pause
  exit /b 1
)

echo.
echo [1/3] npm run build ...
call npm run build
if errorlevel 1 (
  echo ERROR: Fallo el build.
  pause
  exit /b 1
)

echo.
echo [2/3] Desinstalar servicios NSSM antiguos ...
powershell -NoProfile -ExecutionPolicy Bypass -File "%REPO%\scripts\windows\uninstall-services.ps1"
if errorlevel 1 (
  echo ERROR: Fallo uninstall-services.ps1
  pause
  exit /b 1
)

echo.
echo [3/3] Instalar FDMediaOpsApp y FDMediaOpsWorker ...
powershell -NoProfile -ExecutionPolicy Bypass -File "%REPO%\scripts\windows\install-services.ps1"
if errorlevel 1 (
  echo ERROR: Fallo install-services.ps1
  pause
  exit /b 1
)

echo.
echo Listo. Prueba: http://localhost:3002
echo Servicios: FDMediaOpsApp, FDMediaOpsWorker
pause

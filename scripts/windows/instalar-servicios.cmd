@echo off
chcp 65001 >nul
set "PS1=%~dp0install-services.ps1"
echo.
echo Se abrira PowerShell como administrador (UAC). Acepta para instalar los servicios.
echo.
pause
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath powershell.exe -Verb RunAs -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','%PS1%'"
echo.
echo Comprueba en services.msc los servicios "FD Media Ops".
pause

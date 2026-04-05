# Servicios Windows (NSSM)

Estos scripts registran la **app web** (`npm run start`) y el **worker de monitoreo** (`npm run worker:dev`) como servicios de Windows mediante [NSSM](https://nssm.cc/).

## Requisitos

1. **Node.js** instalado y `npm` en el `PATH` (consola **como administrador**).
2. En la raíz del repo: `npm install`, `.env` con `DATABASE_URL` y demás variables, y **`npm run build`** (obligatorio para `next start`).
3. **PostgreSQL** accesible con la misma `DATABASE_URL` que uses en `.env`.
4. **NSSM** (win64): descarga desde [nssm.cc](https://nssm.cc/download), descomprime y:
   - añade la carpeta de `nssm.exe` al `PATH`, **o**
   - antes de ejecutar el script:  
     `$env:NSSM = "C:\ruta\completa\nssm.exe"`

## Reparación completa (build + quitar viejos + instalar bien)

Clic derecho **Ejecutar como administrador** sobre:

`scripts\windows\reparar-servicios-completo.cmd`

Hace `npm run build`, desinstala `FDMediaOpsTest` / servicios previos y vuelve a crear **FDMediaOpsApp** y **FDMediaOpsWorker**.

## Instalar

**Opción A — Clic derecho “Ejecutar como administrador”** sobre:

`scripts\windows\instalar-servicios.cmd`

(se abrirá UAC y luego el script de instalación).

**Opción B — PowerShell como administrador**, desde la raíz del proyecto:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\windows\install-services.ps1
```

Los logs del servicio se escriben en `logs\` (stdout/stderr por servicio).

## Desinstalar

```powershell
.\scripts\windows\uninstall-services.ps1
```

## No aparecen servicios en `services.msc`

1. Ejecuta **sin** admin (para diagnóstico):
   ```powershell
   .\scripts\windows\verificar-servicios.ps1
   ```
2. Instala NSSM si hace falta: `winget install NSSM.NSSM`
3. **Clic derecho → Ejecutar como administrador** en `reparar-servicios-completo.cmd`  
   Los scripts ahora **buscan `nssm.exe` en WinGet** (aunque el PATH de “Administrador” no lo tenga) y dejan log en `logs\nssm-install.log` si algo falla.

En **Servicios**, busca el nombre para mostrar **“FD Media Ops”** (no solo por el nombre corto `FDMediaOpsApp`).

## Si ves `FDMediaOpsTest` pero no abre `http://localhost:3002`

Ese nombre era un **servicio de prueba** (solo `cmd.exe`), no la app Next.js. No sirve para el dashboard.

1. PowerShell **como administrador**:
   ```powershell
   .\scripts\windows\uninstall-services.ps1
   ```
   (elimina `FDMediaOpsTest`, `FDMediaOpsApp` y `FDMediaOpsWorker` si existen).

2. Asegúrate de tener build: `npm run build` en la raíz del repo.

3. Vuelve a instalar:
   ```powershell
   .\scripts\windows\install-services.ps1
   ```

El servicio correcto del sitio web es **FDMediaOpsApp** (`npm run start` → puerto **3002**). Comprueba con:

```powershell
netstat -ano | findstr :3002
```

## Gestión manual

- Servicios: `services.msc` → buscar **FD Media Ops**.
- CLI: `Stop-Service FDMediaOpsApp`, `Start-Service FDMediaOpsWorker`, etc.

## SMTP / agente

Las mismas variables (`SMTP_*`, etc.) deben estar en el `.env` en la raíz del repo; NSSM ejecuta `npm` con directorio de trabajo esa raíz, y Node carga `.env` al arrancar.

## Desarrollo (`npm run dev`)

No conviene instalar `next dev` como servicio (recarga, uso de recursos). Úsalo solo en consola para desarrollo.

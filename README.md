# FD Media Ops Dashboard (FD Media Global)

Dashboard autohospedado (VPS/Docker) para monitorear servicios web, registrar histórico de caídas/uptime y visualizar incidentes.

## Requisitos

- Docker + Docker Compose

## Configuración

1) Crea un archivo `.env` en la raíz (puedes copiar `.env.example`) y define:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `AUTH_SECRET` (cadena larga aleatoria)
- `MONITOR_INTERVAL_SECONDS` (opcional, por defecto `60`)

## Levantar en Docker

En la raíz del proyecto:

```bash
cp .docker.env.example .docker.env
docker compose up -d --build
```

Luego abre el dashboard en `http://<tu-servidor>:3002`.

Nota: `docker compose` carga variables desde `.env` automáticamente. Para evitar mezclar con `DATABASE_URL` local, usa `.docker.env` y ejecútalo así:

```bash
docker compose --env-file .docker.env up -d --build
```

## Base de datos / Migraciones

Este proyecto usa Prisma + Postgres.

- Para desarrollo local (sin Docker), asegúrate de tener `DATABASE_URL` apuntando a tu Postgres y corre:

```bash
npm run db:migrate
```

En Docker (una vez levantado `db`), puedes correr la migración dentro del contenedor `app`:

```bash
docker compose exec app npm run db:migrate
```

## Worker de monitoreo

El servicio `worker` corre un scheduler que ejecuta checks cada `MONITOR_INTERVAL_SECONDS` y guarda:

- `checks`: resultados crudos (ok/status/latencia/error)
- `incidents`: ventanas de caída (DOWN) agregadas

## Reverse proxy (recomendado)

Para producción, pon el dashboard detrás de Nginx o Caddy y habilita TLS (HTTPS).

## Marketing — carrusel diario Instagram (FD Bienestar)

Ruta en la app: **`/marketing`** (requiere sesión admin).

- Genera **7 diapositivas** (emocional, financiero, alimenticio + portada y cierre con aviso legal).
- **Misma fecha** → mismo contenido hasta que pulses *regenerar*.
- **Descarga .txt**, copia por slide, **leyenda sugerida** para el post y vista **semana actual**.

Variables opcionales (reinicia `npm run dev` tras cambiarlas):

- `NEXT_PUBLIC_INSTAGRAM_HANDLE` — ej. `@fdbienestar` o `fdbienestar`
- `NEXT_PUBLIC_BIENESTAR_SITE` — URL visible en el cierre del carrusel

Migración de tablas marketing (si aún no la aplicaste):

```bash
npx prisma migrate deploy
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

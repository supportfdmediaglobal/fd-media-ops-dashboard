import "dotenv/config";
import { defineConfig } from "@prisma/config";

/** Dev fallback: Postgres local (p. ej. 127.0.0.1:5432). Sobrescribe con DATABASE_URL en `.env`. */
const defaultDatabaseUrl =
  "postgresql://postgres:postgres@127.0.0.1:5432/fd_ops?schema=public";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? defaultDatabaseUrl,
  },
});


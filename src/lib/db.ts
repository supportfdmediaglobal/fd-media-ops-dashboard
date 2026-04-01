import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrisma() {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function clientLooksStale(client: PrismaClient): boolean {
  // Si corriste `prisma generate` con el server encendido, global puede guardar un client viejo.
  return typeof (client as unknown as { marketingCarousel?: unknown })
    .marketingCarousel === "undefined";
}

let prisma: PrismaClient =
  global.prisma && !clientLooksStale(global.prisma)
    ? global.prisma
    : createPrisma();

if (global.prisma && clientLooksStale(global.prisma)) {
  global.prisma.$disconnect().catch(() => {});
  global.prisma = prisma;
} else if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export { prisma };


// Plain Node worker (no tsx) for Windows compatibility.
// Runs periodic checks and writes checks/incidents to Postgres via Prisma.

require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

function authSecret() {
  return process.env.AUTH_SECRET || "";
}

function parseIntervalSeconds() {
  const raw = process.env.MONITOR_INTERVAL_SECONDS || "60";
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 10) return 60;
  return Math.floor(n);
}

function getPrisma() {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const DEFAULT_SERVICES = [
  {
    key: "bienestar",
    name: "FD Bienestar",
    url: "https://bienestar.fdmediaglobal.cloud/",
    method: "GET",
    expectedStatus: 200,
    timeoutMs: 10_000,
    optionalKeyword: null,
  },
  {
    key: "aiteacher",
    name: "Virtual Teacher (Login)",
    url: "https://aiteacher.fdmediaglobal.cloud/login",
    method: "GET",
    expectedStatus: 200,
    timeoutMs: 10_000,
    optionalKeyword: null,
  },
];

async function ensureAdminUser(prisma) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  // Lazy require to avoid pulling bcrypt into the happy path for worker.
  const bcrypt = require("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, passwordHash } });
}

async function ensureDefaultServices(prisma) {
  for (const s of DEFAULT_SERVICES) {
    await prisma.service.upsert({
      where: { key: s.key },
      update: {
        name: s.name,
        url: s.url,
        method: s.method,
        expectedStatus: s.expectedStatus,
        timeoutMs: s.timeoutMs,
        optionalKeyword: s.optionalKeyword,
        isEnabled: true,
      },
      create: {
        key: s.key,
        name: s.name,
        url: s.url,
        method: s.method,
        expectedStatus: s.expectedStatus,
        timeoutMs: s.timeoutMs,
        optionalKeyword: s.optionalKeyword,
        isEnabled: true,
      },
    });
  }
}

async function runHttpCheck(service) {
  const controller = new AbortController();
  const start = Date.now();
  const timeout = setTimeout(() => controller.abort(), service.timeoutMs);

  try {
    const res = await fetch(service.url, {
      method: service.method,
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });
    const latencyMs = Date.now() - start;
    const statusCode = res.status;
    const okStatus = statusCode === service.expectedStatus;

    if (!service.optionalKeyword) {
      return { ok: okStatus, statusCode, latencyMs, error: null };
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/") && !contentType.includes("json")) {
      return {
        ok: false,
        statusCode,
        latencyMs,
        error: "Keyword check requires text response",
      };
    }
    const body = await res.text();
    const hasKeyword = body.includes(service.optionalKeyword);
    return {
      ok: okStatus && hasKeyword,
      statusCode,
      latencyMs,
      error: hasKeyword ? null : "Keyword not found",
    };
  } catch (e) {
    const latencyMs = Date.now() - start;
    return {
      ok: false,
      statusCode: null,
      latencyMs,
      error: e && e.message ? e.message : "Unknown error while fetching",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function deriveIncident(prisma, serviceId, ok) {
  const openIncident = await prisma.incident.findFirst({
    where: { serviceId, resolvedAt: null },
    orderBy: { startedAt: "desc" },
  });

  if (!ok) {
    if (!openIncident) {
      await prisma.incident.create({
        data: { serviceId, startedAt: new Date() },
      });
    }
    return;
  }

  if (openIncident) {
    const resolvedAt = new Date();
    const durationMs = BigInt(resolvedAt.getTime() - openIncident.startedAt.getTime());
    await prisma.incident.update({
      where: { id: openIncident.id },
      data: { resolvedAt, durationMs },
    });
  }
}

async function runOnce(prisma) {
  await ensureAdminUser(prisma);
  await ensureDefaultServices(prisma);

  const services = await prisma.service.findMany({
    where: { isEnabled: true },
    orderBy: { name: "asc" },
  });

  for (const s of services) {
    const result = await runHttpCheck({
      key: s.key,
      url: s.url,
      method: s.method,
      expectedStatus: s.expectedStatus,
      timeoutMs: s.timeoutMs,
      optionalKeyword: s.optionalKeyword,
    });

    await prisma.check.create({
      data: {
        serviceId: s.id,
        ok: result.ok,
        statusCode: result.statusCode ?? undefined,
        latencyMs: result.latencyMs ?? undefined,
        error: result.error ?? undefined,
      },
    });

    await deriveIncident(prisma, s.id, result.ok);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!authSecret()) {
    // Not strictly required for worker, but keeps env consistent.
    console.warn("AUTH_SECRET is empty; set it in .env");
  }

  const prisma = getPrisma();
  const intervalSeconds = parseIntervalSeconds();

  console.log(`[worker] interval=${intervalSeconds}s`);
  await runOnce(prisma);

  setInterval(() => {
    runOnce(prisma).catch((e) => console.error("[worker] run failed", e));
  }, intervalSeconds * 1000);
}

main().catch((e) => {
  console.error("[worker] fatal", e);
  process.exitCode = 1;
});


import { prisma } from "@/lib/db";
import { ensureDefaultServices } from "@/lib/seed";
import { runHttpCheck } from "@/lib/monitor";
import { deriveIncidentForCheck } from "@/lib/incidentLogic";

export async function runMonitorOnce() {
  await ensureDefaultServices();
  const services = await prisma.service.findMany({
    where: { isEnabled: true },
    orderBy: { name: "asc" },
  });

  for (const service of services) {
    const result = await runHttpCheck({
      id: service.key,
      name: service.name,
      url: service.url,
      method: service.method,
      expectedStatus: service.expectedStatus,
      timeoutMs: service.timeoutMs,
      optionalKeyword: service.optionalKeyword ?? undefined,
    });

    await prisma.check.create({
      data: {
        serviceId: service.id,
        ok: result.ok,
        statusCode: result.statusCode ?? undefined,
        latencyMs: result.latencyMs ?? undefined,
        error: result.error ?? undefined,
      },
    });

    await deriveIncidentForCheck(service.id, result.ok, {
      serviceMeta: { key: service.key, name: service.name, url: service.url },
      lastError: result.error,
    });
  }
}

// Intentionally not auto-running here; the worker entrypoint owns scheduling.


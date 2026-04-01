import { prisma } from "@/lib/db";
import { NoopAlertSink } from "@/lib/alerts/noop";
import type { AlertSink } from "@/lib/alerts/types";

export async function deriveIncidentForCheck(
  serviceId: string,
  ok: boolean,
  opts?: { sink?: AlertSink; serviceMeta?: { key: string; name: string; url: string }; lastError?: string | null }
) {
  const sink = opts?.sink ?? NoopAlertSink;
  const openIncident = await prisma.incident.findFirst({
    where: { serviceId, resolvedAt: null },
    orderBy: { startedAt: "desc" },
  });

  if (!ok) {
    if (!openIncident) {
      const created = await prisma.incident.create({
        data: {
          serviceId,
          startedAt: new Date(),
        },
      });

      if (opts?.serviceMeta) {
        await sink.send({
          type: "incident_opened",
          serviceKey: opts.serviceMeta.key,
          serviceName: opts.serviceMeta.name,
          url: opts.serviceMeta.url,
          startedAt: created.startedAt.toISOString(),
          lastError: opts.lastError ?? null,
        });
      }
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

    if (opts?.serviceMeta) {
      await sink.send({
        type: "incident_resolved",
        serviceKey: opts.serviceMeta.key,
        serviceName: opts.serviceMeta.name,
        url: opts.serviceMeta.url,
        startedAt: openIncident.startedAt.toISOString(),
        resolvedAt: resolvedAt.toISOString(),
        durationMs: Number(durationMs),
      });
    }
  }
}


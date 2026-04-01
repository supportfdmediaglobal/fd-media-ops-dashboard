import { prisma } from "@/lib/db";
import { ensureDefaultServices } from "@/lib/seed";

export type SummaryRow = {
  key: string;
  name: string;
  url: string;
  isEnabled: boolean;
  lastOk: boolean | null;
  lastCheckedAt: string | null;
  statusCode: number | null;
  latencyMs: number | null;
  lastError: string | null;
  openIncidentStartedAt: string | null;
};

export type IncidentRow = {
  id: string;
  serviceName: string;
  startedAt: string;
  resolvedAt: string | null;
  durationSec: number | null;
};

export type CheckRow = {
  id: string;
  serviceName: string;
  checkedAt: string;
  ok: boolean;
  statusCode: number | null;
  latencyMs: number | null;
  error: string | null;
};

export type AvailabilityDay = {
  day: string;
  ok: number;
  total: number;
  uptimePct: number;
};

export type AvailabilityRow = {
  service: string;
  days: AvailabilityDay[];
};

export type MonitoreoPayload = {
  generatedAt: string;
  summary: SummaryRow[];
  incidents: IncidentRow[];
  checks: CheckRow[];
  availability: AvailabilityRow[];
};

function toDayKeyUtc(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getMonitoreoData(): Promise<MonitoreoPayload> {
  await ensureDefaultServices();

  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
    include: {
      checks: { orderBy: { checkedAt: "desc" }, take: 1 },
      incidents: {
        where: { resolvedAt: null },
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  });

  const incidents = await prisma.incident.findMany({
    orderBy: { startedAt: "desc" },
    take: 100,
    include: { service: true },
  });

  const checks = await prisma.check.findMany({
    orderBy: { checkedAt: "desc" },
    take: 200,
    include: { service: true },
  });

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const checksAvail = await prisma.check.findMany({
    where: { checkedAt: { gte: since } },
    orderBy: { checkedAt: "asc" },
    include: { service: true },
  });

  const byService = new Map<string, Map<string, { day: string; ok: number; total: number }>>();
  for (const c of checksAvail) {
    const name = c.service.name;
    const day = toDayKeyUtc(c.checkedAt);
    if (!byService.has(name)) byService.set(name, new Map());
    const map = byService.get(name)!;
    const row = map.get(day) ?? { day, ok: 0, total: 0 };
    row.total += 1;
    if (c.ok) row.ok += 1;
    map.set(day, row);
  }

  const availability: AvailabilityRow[] = Array.from(byService.entries()).map(
    ([service, days]) => ({
      service,
      days: Array.from(days.values())
        .sort((a, b) => a.day.localeCompare(b.day))
        .map((d) => ({
          day: d.day,
          ok: d.ok,
          total: d.total,
          uptimePct:
            d.total === 0 ? 0 : Math.round((d.ok / d.total) * 1000) / 10,
        })),
    })
  );

  const summary: SummaryRow[] = services.map((s) => {
    const last = s.checks[0] ?? null;
    const open = s.incidents[0] ?? null;
    return {
      key: s.key,
      name: s.name,
      url: s.url,
      isEnabled: s.isEnabled,
      lastOk: last ? last.ok : null,
      lastCheckedAt: last ? last.checkedAt.toISOString() : null,
      statusCode: last?.statusCode ?? null,
      latencyMs: last?.latencyMs ?? null,
      lastError: last?.error ?? null,
      openIncidentStartedAt: open ? open.startedAt.toISOString() : null,
    };
  });

  const incidentRows: IncidentRow[] = incidents.map((i) => ({
    id: i.id,
    serviceName: i.service.name,
    startedAt: i.startedAt.toISOString(),
    resolvedAt: i.resolvedAt ? i.resolvedAt.toISOString() : null,
    durationSec:
      i.durationMs != null ? Math.round(Number(i.durationMs) / 1000) : null,
  }));

  const checkRows: CheckRow[] = checks.map((c) => ({
    id: c.id,
    serviceName: c.service.name,
    checkedAt: c.checkedAt.toISOString(),
    ok: c.ok,
    statusCode: c.statusCode,
    latencyMs: c.latencyMs,
    error: c.error,
  }));

  return {
    generatedAt: new Date().toISOString(),
    summary,
    incidents: incidentRows,
    checks: checkRows,
    availability,
  };
}

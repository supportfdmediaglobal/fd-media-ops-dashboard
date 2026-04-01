import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDefaultServices } from "@/lib/seed";

export async function GET() {
  await ensureDefaultServices();

  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
    include: {
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 1,
      },
      incidents: {
        where: { resolvedAt: null },
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    services: services.map((s) => {
      const lastCheck = s.checks[0] ?? null;
      const openIncident = s.incidents[0] ?? null;
      return {
        id: s.key,
        name: s.name,
        url: s.url,
        isEnabled: s.isEnabled,
        lastCheck: lastCheck
          ? {
              checkedAt: lastCheck.checkedAt.toISOString(),
              ok: lastCheck.ok,
              statusCode: lastCheck.statusCode,
              latencyMs: lastCheck.latencyMs,
              error: lastCheck.error,
            }
          : null,
        openIncident: openIncident
          ? {
              startedAt: openIncident.startedAt.toISOString(),
            }
          : null,
      };
    }),
  });
}


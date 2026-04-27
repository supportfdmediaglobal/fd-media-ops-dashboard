import { prisma } from "@/lib/db";
import { DEFAULT_SERVICES } from "@/lib/services";

export async function ensureDefaultServices() {
  const excluded = new Set(
    (
      await prisma.seedServiceExclusion.findMany({
        select: { key: true },
      })
    ).map((r) => r.key)
  );

  for (const s of DEFAULT_SERVICES) {
    if (excluded.has(s.id)) continue;
    await prisma.service.upsert({
      where: { key: s.id },
      update: {
        name: s.name,
        url: s.url,
        method: s.method,
        expectedStatus: s.expectedStatus,
        timeoutMs: s.timeoutMs,
        optionalKeyword: s.optionalKeyword ?? null,
        isEnabled: true,
      },
      create: {
        key: s.id,
        name: s.name,
        url: s.url,
        method: s.method,
        expectedStatus: s.expectedStatus,
        timeoutMs: s.timeoutMs,
        optionalKeyword: s.optionalKeyword ?? null,
        isEnabled: true,
      },
    });
  }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureDefaultServices } from "@/lib/seed";
import { isSmtpConfigured } from "@/lib/alerts/email";

export async function GET() {
  await ensureDefaultServices();
  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
  });
  const rules = await prisma.agentRule.findMany();
  const byServiceId = new Map(rules.map((r) => [r.serviceId, r]));

  return NextResponse.json({
    smtpConfigured: isSmtpConfigured(),
    rules: services.map((s) => {
      const r = byServiceId.get(s.id);
      return {
        serviceKey: s.key,
        serviceName: s.name,
        url: s.url,
        enabled: r?.enabled ?? false,
        action: r?.action ?? "EMAIL",
        emailTo: r?.emailTo ?? "",
        notifyOnOpen: r?.notifyOnOpen ?? true,
        notifyOnResolve: r?.notifyOnResolve ?? true,
      };
    }),
  });
}

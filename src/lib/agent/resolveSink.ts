import { prisma } from "@/lib/db";
import { NoopAlertSink } from "@/lib/alerts/noop";
import { createEmailAlertSink } from "@/lib/alerts/email";
import type { AlertSink } from "@/lib/alerts/types";

function parseRecipients(raw: string): string[] {
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function getAlertSinkForService(
  serviceId: string
): Promise<AlertSink> {
  const rule = await prisma.agentRule.findUnique({
    where: { serviceId },
  });

  if (!rule?.enabled || rule.action !== "EMAIL") return NoopAlertSink;

  const recipients = parseRecipients(rule.emailTo);
  if (recipients.length === 0) return NoopAlertSink;

  return createEmailAlertSink({
    recipients,
    notifyOnOpen: rule.notifyOnOpen,
    notifyOnResolve: rule.notifyOnResolve,
  });
}

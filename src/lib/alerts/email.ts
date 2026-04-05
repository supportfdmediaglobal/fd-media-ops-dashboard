import nodemailer from "nodemailer";
import type { AlertEvent } from "@/lib/alerts/types";
import type { AlertSink } from "@/lib/alerts/types";

/** Remitente: `SMTP_FROM` preferido; `MAIL_FROM` se acepta por compatibilidad. */
function smtpFromAddress(): string | undefined {
  return (
    process.env.SMTP_FROM?.trim() ||
    process.env.MAIL_FROM?.trim() ||
    undefined
  );
}

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim() && smtpFromAddress());
}

function getTransport() {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return null;

  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure =
    process.env.SMTP_SECURE === "true" || String(port) === "465";
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth:
      user && pass
        ? {
            user,
            pass,
          }
        : undefined,
  });
}

function formatEventText(event: AlertEvent): { subject: string; text: string } {
  if (event.type === "incident_opened") {
    return {
      subject: `[FD Ops] Caída: ${event.serviceName}`,
      text: [
        `Servicio: ${event.serviceName} (${event.serviceKey})`,
        `URL: ${event.url}`,
        `Inicio: ${event.startedAt}`,
        event.lastError ? `Error: ${event.lastError}` : "",
        "",
        "El agente de monitoreo detectó un fallo en el chequeo HTTP.",
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }
  if (event.type === "incident_resolved") {
    return {
      subject: `[FD Ops] Recuperado: ${event.serviceName}`,
      text: [
        `Servicio: ${event.serviceName} (${event.serviceKey})`,
        `URL: ${event.url}`,
        `Caída desde: ${event.startedAt}`,
        `Recuperado: ${event.resolvedAt}`,
        `Duración aprox.: ${Math.round(event.durationMs / 1000)} s`,
        "",
        "El servicio volvió a responder correctamente.",
      ].join("\n"),
    };
  }
  return {
    subject: `[FD Ops] Alerta: ${event.serviceName}`,
    text: JSON.stringify(event),
  };
}

export async function sendAlertEmail(
  recipients: string[],
  event: AlertEvent
): Promise<boolean> {
  const from = smtpFromAddress();
  const transport = getTransport();
  if (!transport || !from) {
    console.warn(
      "[agent/email] SMTP no configurado (SMTP_HOST y SMTP_FROM o MAIL_FROM). No se envía correo."
    );
    return false;
  }

  const { subject, text } = formatEventText(event);
  await transport.sendMail({
    from,
    to: recipients,
    subject,
    text,
  });
  return true;
}

export function createEmailAlertSink(opts: {
  recipients: string[];
  notifyOnOpen: boolean;
  notifyOnResolve: boolean;
}): AlertSink {
  return {
    name: "email",
    async send(event: AlertEvent) {
      if (event.type === "latency_high") return;
      if (event.type === "incident_opened" && !opts.notifyOnOpen) return;
      if (event.type === "incident_resolved" && !opts.notifyOnResolve) return;

      try {
        await sendAlertEmail(opts.recipients, event);
      } catch (e) {
        console.error("[agent/email] send failed", e);
      }
    },
  };
}

import { NextResponse } from "next/server";
import { isSmtpConfigured, sendAlertEmail } from "@/lib/alerts/email";

type Body = { to?: string };

/** Envía un correo de prueba (misma configuración SMTP que el agente). */
export async function POST(req: Request) {
  if (!isSmtpConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "SMTP no configurado. Define SMTP_HOST y SMTP_FROM (o MAIL_FROM) en el entorno del servidor.",
      },
      { status: 400 }
    );
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  const to = body?.to?.trim();
  if (!to) {
    return NextResponse.json(
      { ok: false, error: "Indica el campo `to` (correo destino)." },
      { status: 400 }
    );
  }

  try {
    const sent = await sendAlertEmail([to], {
      type: "incident_opened",
      serviceKey: "test",
      serviceName: "Prueba del agente",
      url: "https://example.com",
      startedAt: new Date().toISOString(),
      lastError: null,
    });
    if (!sent) {
      return NextResponse.json(
        { ok: false, error: "No se pudo enviar (revisa SMTP en el servidor)." },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al enviar";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

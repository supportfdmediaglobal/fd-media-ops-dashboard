import { NextResponse } from "next/server";
import { createSession, ensureAdminUser, verifyCredentials } from "@/lib/auth";

export async function POST(req: Request) {
  await ensureAdminUser();

  const body = (await req.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Email y contraseña son requeridos." },
      { status: 400 }
    );
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Credenciales inválidas." },
      { status: 401 }
    );
  }

  await createSession(user);
  return NextResponse.json({ ok: true });
}


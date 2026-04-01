"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = useMemo(
    () => loading || !email.trim() || !password,
    [loading, email, password]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json().catch(() => null)) as unknown;
      const ok =
        typeof json === "object" &&
        json !== null &&
        "ok" in json &&
        (json as { ok: unknown }).ok === true;
      const apiError =
        typeof json === "object" &&
        json !== null &&
        "error" in json &&
        typeof (json as { error?: unknown }).error === "string"
          ? (json as { error: string }).error
          : null;

      if (!res.ok || !ok) {
        setError(apiError ?? `No se pudo iniciar sesión (HTTP ${res.status}).`);
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
        <h1 className="text-xl font-semibold tracking-tight">
          FD Media Ops Dashboard
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Inicia sesión para acceder al monitoreo y reportes.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950"
        >
          <label className="block text-sm font-medium">Correo</label>
          <input
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-white/10 dark:bg-black dark:focus:ring-white/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@fdmediaglobal.cloud"
            autoComplete="email"
          />

          <label className="mt-4 block text-sm font-medium">Contraseña</label>
          <input
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-white/10 dark:bg-black dark:focus:ring-white/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            type="password"
            autoComplete="current-password"
          />

          {error ? (
            <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={disabled}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          La cuenta admin se toma de variables de entorno (`ADMIN_EMAIL` /
          `ADMIN_PASSWORD`) y se crea automáticamente si no existe.
        </div>
      </div>
    </div>
  );
}


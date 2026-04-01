"use client";

import { useEffect, useMemo, useState } from "react";

type ServiceDto = {
  id: string;
  name: string;
  url: string;
  method: "GET" | "HEAD";
  expectedStatus: number;
  timeoutMs: number;
  optionalKeyword?: string;
};

type ServicesResponse = {
  services: ServiceDto[];
};

function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
      {label}
    </span>
  );
}

export function ServicesPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/services", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ServicesResponse;
        if (!cancelled) setServices(json.services ?? []);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const subtitle = useMemo(() => {
    if (loading) return "Cargando servicios…";
    if (error) return "No se pudo cargar el listado.";
    return `${services.length} servicio(s) configurado(s)`;
  }, [loading, error, services.length]);

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">Monitoreo</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </div>
        </div>
        <StatusPill label="Servicios (desde DB)" />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-black/30 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">Servicio</th>
              <th className="px-4 py-3 font-medium">URL</th>
              <th className="px-4 py-3 font-medium">Esperado</th>
              <th className="px-4 py-3 font-medium">Timeout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400" colSpan={4}>
                  Cargando…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="px-4 py-4 text-red-700 dark:text-red-300" colSpan={4}>
                  Error: {error}
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400" colSpan={4}>
                  No hay servicios configurados.
                </td>
              </tr>
            ) : (
              services.map((s) => (
                <tr key={s.id} className="bg-white dark:bg-zinc-950">
                  <td className="px-4 py-4 font-medium">{s.name}</td>
                  <td className="px-4 py-4">
                    <a
                      className="break-all text-zinc-700 underline underline-offset-4 hover:text-black dark:text-zinc-300 dark:hover:text-white"
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.url}
                    </a>
                  </td>
                  <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400">
                    {s.method} {s.expectedStatus}
                  </td>
                  <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400">
                    {Math.round(s.timeoutMs / 1000)}s
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}


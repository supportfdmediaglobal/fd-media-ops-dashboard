"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { MonitoreoPayload } from "@/lib/monitoreoData";
import { downloadCsv, rowsToCsv } from "@/lib/csv";

function formatLocal(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function Section({
  id,
  title,
  subtitle,
  open,
  onToggle,
  children,
  onExportCsv,
}: {
  id: string;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  onExportCsv: () => void;
}) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950"
    >
      <div className="flex w-full items-start justify-between gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-white/5">
        <button
          type="button"
          onClick={onToggle}
          className="min-w-0 flex-1 text-left"
        >
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </div>
          {subtitle ? (
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </div>
          ) : null}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-black/10 px-2 py-1 text-xs font-medium text-zinc-600 dark:border-white/10 dark:text-zinc-300">
            <button
              type="button"
              className="font-semibold underline-offset-2 hover:underline"
              onClick={onExportCsv}
            >
              CSV
            </button>
          </span>
          <button
            type="button"
            onClick={onToggle}
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-expanded={open}
            aria-label={open ? "Contraer sección" : "Expandir sección"}
          >
            {open ? "▼" : "▶"}
          </button>
        </div>
      </div>
      {open ? <div className="border-t border-black/5 px-0 py-0 dark:border-white/10">{children}</div> : null}
    </section>
  );
}

const SECTION_IDS = ["resumen", "incidentes", "checks", "disponibilidad"] as const;

export function MonitoreoPanel({ data }: { data: MonitoreoPayload }) {
  const stamp = () => new Date().toISOString().slice(0, 10);

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    resumen: true,
    incidentes: false,
    checks: false,
    disponibilidad: false,
  });

  const toggle = (id: string) =>
    setOpenMap((m) => ({ ...m, [id]: !m[id] }));

  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, "");
    if (SECTION_IDS.includes(raw as (typeof SECTION_IDS)[number])) {
      setOpenMap((m) => ({ ...m, [raw]: true }));
      window.requestAnimationFrame(() => {
        document.getElementById(raw)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  const exportSummary = () => {
    const csv = rowsToCsv(
      [
        "key",
        "name",
        "url",
        "is_enabled",
        "last_ok",
        "last_checked_at",
        "status_code",
        "latency_ms",
        "last_error",
        "open_incident_started_at",
      ],
      data.summary.map((s) => [
        s.key,
        s.name,
        s.url,
        s.isEnabled,
        s.lastOk === null ? "" : s.lastOk,
        s.lastCheckedAt ?? "",
        s.statusCode ?? "",
        s.latencyMs ?? "",
        s.lastError ?? "",
        s.openIncidentStartedAt ?? "",
      ])
    );
    downloadCsv(`monitoreo-resumen-${stamp()}.csv`, csv);
  };

  const exportIncidents = () => {
    const csv = rowsToCsv(
      ["id", "service", "started_at", "resolved_at", "duration_sec"],
      data.incidents.map((i) => [
        i.id,
        i.serviceName,
        i.startedAt,
        i.resolvedAt ?? "",
        i.durationSec ?? "",
      ])
    );
    downloadCsv(`monitoreo-incidentes-${stamp()}.csv`, csv);
  };

  const exportChecks = () => {
    const csv = rowsToCsv(
      ["id", "service", "checked_at", "ok", "status_code", "latency_ms", "error"],
      data.checks.map((c) => [
        c.id,
        c.serviceName,
        c.checkedAt,
        c.ok,
        c.statusCode ?? "",
        c.latencyMs ?? "",
        c.error ?? "",
      ])
    );
    downloadCsv(`monitoreo-checks-${stamp()}.csv`, csv);
  };

  const exportAvailability = () => {
    const rows: (string | number)[][] = [];
    for (const a of data.availability) {
      for (const d of a.days) {
        rows.push([a.service, d.day, d.ok, d.total, d.uptimePct]);
      }
    }
    const csv = rowsToCsv(
      ["service", "day", "ok_count", "total_checks", "uptime_pct"],
      rows
    );
    downloadCsv(`monitoreo-disponibilidad-${stamp()}.csv`, csv);
  };

  const exportAll = () => {
    exportSummary();
    window.setTimeout(() => exportIncidents(), 150);
    window.setTimeout(() => exportChecks(), 300);
    window.setTimeout(() => exportAvailability(), 450);
  };

  const emptyHint = useMemo(
    () =>
      data.summary.every((s) => !s.lastCheckedAt)
        ? "Aún no hay checks. Arranca el worker (`npm run worker:dev`)."
        : null,
    [data.summary]
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Monitoreo</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Estado de servicios, incidentes, checks y disponibilidad (últimos 7
            días). Datos agrupados; expande cada bloque.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Generado: {formatLocal(data.generatedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={exportAll}
          className="shrink-0 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Exportar todo (4 CSV)
        </button>
      </div>

      {emptyHint ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          {emptyHint}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4">
        <Section
          id="resumen"
          title="Resumen de servicios"
          subtitle="Último check por servicio e incidente abierto"
          open={openMap.resumen}
          onToggle={() => toggle("resumen")}
          onExportCsv={exportSummary}
        >
          <div className="overflow-x-auto p-4 pt-0">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Servicio</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-3 py-2 font-medium">Último check</th>
                  <th className="px-3 py-2 font-medium">Latencia</th>
                  <th className="px-3 py-2 font-medium">Incidente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {data.summary.map((s) => (
                  <tr key={s.key}>
                    <td className="px-3 py-3 font-medium">
                      <div>{s.name}</div>
                      <a
                        href={s.url}
                        className="break-all text-xs text-zinc-500 underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {s.url}
                      </a>
                    </td>
                    <td className="px-3 py-3">
                      {s.lastOk == null ? (
                        <span className="text-zinc-500">Sin datos</span>
                      ) : s.lastOk ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                          UP
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950/50 dark:text-red-200">
                          DOWN
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                      {formatLocal(s.lastCheckedAt)}
                      {s.statusCode != null ? (
                        <span className="ml-2 text-xs">· {s.statusCode}</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                      {s.latencyMs != null ? `${s.latencyMs} ms` : "—"}
                    </td>
                    <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                      {s.openIncidentStartedAt
                        ? `Abierto desde ${formatLocal(s.openIncidentStartedAt)}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          id="incidentes"
          title="Incidentes"
          subtitle="Últimos 100"
          open={openMap.incidentes}
          onToggle={() => toggle("incidentes")}
          onExportCsv={exportIncidents}
        >
          <div className="overflow-x-auto p-4 pt-0">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Servicio</th>
                  <th className="px-3 py-2 font-medium">Inicio</th>
                  <th className="px-3 py-2 font-medium">Fin</th>
                  <th className="px-3 py-2 font-medium">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {data.incidents.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-zinc-500" colSpan={4}>
                      Sin incidentes.
                    </td>
                  </tr>
                ) : (
                  data.incidents.map((i) => (
                    <tr key={i.id}>
                      <td className="px-3 py-3 font-medium">{i.serviceName}</td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatLocal(i.startedAt)}
                      </td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {i.resolvedAt ? formatLocal(i.resolvedAt) : "—"}
                      </td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {i.durationSec != null ? `${i.durationSec}s` : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          id="checks"
          title="Checks"
          subtitle="Últimos 200"
          open={openMap.checks}
          onToggle={() => toggle("checks")}
          onExportCsv={exportChecks}
        >
          <div className="max-h-[420px] overflow-auto p-4 pt-0">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Servicio</th>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">OK</th>
                  <th className="px-3 py-2 font-medium">HTTP</th>
                  <th className="px-3 py-2 font-medium">ms</th>
                  <th className="px-3 py-2 font-medium">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {data.checks.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 text-zinc-500" colSpan={6}>
                      Sin checks.
                    </td>
                  </tr>
                ) : (
                  data.checks.map((c) => (
                    <tr key={c.id}>
                      <td className="px-3 py-3 font-medium">{c.serviceName}</td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatLocal(c.checkedAt)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={
                            c.ok
                              ? "text-emerald-700 dark:text-emerald-300"
                              : "text-red-700 dark:text-red-300"
                          }
                        >
                          {c.ok ? "UP" : "DOWN"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {c.statusCode ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">
                        {c.latencyMs ?? "—"}
                      </td>
                      <td className="max-w-[220px] truncate px-3 py-3 text-zinc-600 dark:text-zinc-400" title={c.error ?? ""}>
                        {c.error ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          id="disponibilidad"
          title="Disponibilidad"
          subtitle="Por servicio, últimos 7 días"
          open={openMap.disponibilidad}
          onToggle={() => toggle("disponibilidad")}
          onExportCsv={exportAvailability}
        >
          <div className="space-y-6 p-4 pt-0">
            {data.availability.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin datos de disponibilidad.</p>
            ) : (
              data.availability.map((a) => (
                <div key={a.service}>
                  <div className="mb-2 text-sm font-semibold">{a.service}</div>
                  <div className="overflow-x-auto rounded-xl border border-black/5 dark:border-white/10">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-black/30 dark:text-zinc-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">Día</th>
                          <th className="px-3 py-2 font-medium">OK</th>
                          <th className="px-3 py-2 font-medium">Total</th>
                          <th className="px-3 py-2 font-medium">Uptime</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/10">
                        {a.days.map((d) => (
                          <tr key={d.day}>
                            <td className="px-3 py-2 font-medium">{d.day}</td>
                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                              {d.ok}
                            </td>
                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                              {d.total}
                            </td>
                            <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                              {d.uptimePct}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

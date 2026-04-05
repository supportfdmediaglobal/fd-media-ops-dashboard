"use client";

import { useCallback, useEffect, useState } from "react";

type RuleRow = {
  serviceKey: string;
  serviceName: string;
  url: string;
  enabled: boolean;
  action: string;
  emailTo: string;
  notifyOnOpen: boolean;
  notifyOnResolve: boolean;
};

export function AgentPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/agent/rules");
      const json = (await res.json()) as {
        smtpConfigured?: boolean;
        rules?: RuleRow[];
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? `HTTP ${res.status}`);
        return;
      }
      setSmtpConfigured(Boolean(json.smtpConfigured));
      setRules(json.rules ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(row: RuleRow) {
    setSavingKey(row.serviceKey);
    setError(null);
    try {
      const res = await fetch(`/api/agent/rules/${encodeURIComponent(row.serviceKey)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          enabled: row.enabled,
          emailTo: row.emailTo,
          notifyOnOpen: row.notifyOnOpen,
          notifyOnResolve: row.notifyOnResolve,
          action: "EMAIL",
        }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? `No se guardó (${res.status})`);
        return;
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSavingKey(null);
    }
  }

  async function sendTest() {
    const to = testEmail.trim();
    if (!to) {
      setTestStatus("Escribe un correo para la prueba.");
      return;
    }
    setTestLoading(true);
    setTestStatus(null);
    try {
      const res = await fetch("/api/agent/test-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !json?.ok) {
        setTestStatus(json?.error ?? `Error HTTP ${res.status}`);
        return;
      }
      setTestStatus("Correo de prueba enviado.");
    } catch (e) {
      setTestStatus(e instanceof Error ? e.message : "Error");
    } finally {
      setTestLoading(false);
    }
  }

  function updateRule(
    serviceKey: string,
    patch: Partial<RuleRow>
  ) {
    setRules((prev) =>
      prev.map((r) => (r.serviceKey === serviceKey ? { ...r, ...patch } : r))
    );
  }

  if (loading) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando agente…</p>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold">Correo (SMTP)</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          El worker de monitoreo envía alertas con la misma configuración SMTP que
          definas en el servidor (variables de entorno). La sección agente solo
          indica <strong>qué servicios</strong> notificar y a <strong>qué
          direcciones</strong>.
        </p>
        <ul className="mt-3 list-inside list-disc text-xs text-zinc-500 dark:text-zinc-400">
          <li>
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">SMTP_HOST</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">SMTP_FROM</code>{" "}
            (obligatorios; también se acepta <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">MAIL_FROM</code>)
          </li>
          <li>
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">SMTP_PORT</code>{" "}
            (por defecto 587),{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">SMTP_SECURE</code>{" "}
            (<code>true</code> para puerto 465)
          </li>
          <li>
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">SMTP_USER</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">SMTP_PASS</code>{" "}
            (si tu relay lo requiere)
          </li>
        </ul>
        <div
          className={`mt-4 rounded-xl px-3 py-2 text-sm ${
            smtpConfigured
              ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
          }`}
        >
          {smtpConfigured
            ? "SMTP detectado en el entorno (HOST y FROM)."
            : "No se detectó SMTP completo en el servidor. Configura las variables y reinicia la app."}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Correo de prueba
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-white/10 dark:bg-black dark:focus:ring-white/20"
            />
          </div>
          <button
            type="button"
            disabled={testLoading}
            onClick={() => void sendTest()}
            className="rounded-xl border border-black/15 px-4 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
          >
            {testLoading ? "Enviando…" : "Enviar prueba"}
          </button>
        </div>
        {testStatus ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{testStatus}</p>
        ) : null}
      </section>

      {error ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <section className="space-y-6">
        <h2 className="text-sm font-semibold">Reglas por servicio</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Activa el agente para un servicio, indica los correos (separados por coma) y
          cuándo avisar: al detectar caída y/o al recuperarse. El chequeo lo ejecuta el
          worker según <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">MONITOR_INTERVAL_SECONDS</code>.
        </p>

        {rules.map((row) => (
          <div
            key={row.serviceKey}
            className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold">{row.serviceName}</div>
                <div className="mt-1 font-mono text-xs text-zinc-500">{row.url}</div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(e) =>
                    updateRule(row.serviceKey, { enabled: e.target.checked })
                  }
                  className="rounded border-zinc-300"
                />
                Agente activo
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Acción
                </label>
                <div className="mt-1 rounded-xl border border-black/10 bg-zinc-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900">
                  Correo electrónico
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Destinatarios (correo, separados por coma)
                </label>
                <input
                  type="text"
                  value={row.emailTo}
                  onChange={(e) =>
                    updateRule(row.serviceKey, { emailTo: e.target.value })
                  }
                  placeholder="ops@ejemplo.com, otro@ejemplo.com"
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-white/10 dark:bg-black dark:focus:ring-white/20"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={row.notifyOnOpen}
                  onChange={(e) =>
                    updateRule(row.serviceKey, { notifyOnOpen: e.target.checked })
                  }
                  className="rounded border-zinc-300"
                />
                Notificar al detectar caída
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={row.notifyOnResolve}
                  onChange={(e) =>
                    updateRule(row.serviceKey, {
                      notifyOnResolve: e.target.checked,
                    })
                  }
                  className="rounded border-zinc-300"
                />
                Notificar al recuperarse
              </label>
            </div>

            <button
              type="button"
              disabled={savingKey === row.serviceKey}
              onClick={() => void save(row)}
              className="mt-6 inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {savingKey === row.serviceKey ? "Guardando…" : "Guardar"}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

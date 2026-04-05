"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddServiceForm({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [method, setMethod] = useState<"GET" | "HEAD">("GET");
  const [expectedStatus, setExpectedStatus] = useState("200");
  const [timeoutMs, setTimeoutMs] = useState("10000");
  const [optionalKeyword, setOptionalKeyword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          url,
          key: key.trim() || undefined,
          method,
          expectedStatus: Number(expectedStatus) || 200,
          timeoutMs: Number(timeoutMs) || 10000,
          optionalKeyword: optionalKeyword.trim() || undefined,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.error ?? `Error HTTP ${res.status}`);
        return;
      }
      setName("");
      setUrl("");
      setKey("");
      setOptionalKeyword("");
      onOpenChange(false);
      setSuccess("Servicio añadido. El worker lo monitoreará en el siguiente ciclo.");
      router.refresh();
      window.setTimeout(() => setSuccess(null), 6000);
    } catch {
      setError("No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !name.trim() || !url.trim();

  return (
    <div
      id="agregar-servicio"
      className="mt-6 scroll-mt-24 rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950"
    >
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-white/5"
      >
        <div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Agregar servicio a monitorear
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Nombre y URL obligatorios; método GET/HEAD, código HTTP esperado y timeout
            opcionales.
          </div>
        </div>
        <span className="text-zinc-400" aria-hidden>
          {open ? "▼" : "▶"}
        </span>
      </button>
      {success ? (
        <div className="border-t border-black/5 px-5 py-3 text-sm text-emerald-800 dark:border-white/10 dark:text-emerald-200">
          {success}
        </div>
      ) : null}
      {error ? (
        <div className="border-t border-black/5 px-5 py-3 text-sm text-red-800 dark:border-white/10 dark:text-red-200">
          {error}
        </div>
      ) : null}
      {open ? (
        <form
          onSubmit={onSubmit}
          className="space-y-4 border-t border-black/5 px-5 py-4 dark:border-white/10"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Nombre visible
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mi API de producción"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-white/10 dark:bg-black dark:focus:ring-white/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                URL a comprobar
              </label>
              <input
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ejemplo.com/health"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-white/10 dark:bg-black dark:focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Clave interna (opcional)
              </label>
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="auto desde el nombre si vacío"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-white/10 dark:bg-black dark:focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Método HTTP
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as "GET" | "HEAD")}
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black"
              >
                <option value="GET">GET</option>
                <option value="HEAD">HEAD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Código HTTP esperado
              </label>
              <input
                value={expectedStatus}
                onChange={(e) => setExpectedStatus(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-white/10 dark:bg-black dark:focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Timeout (ms)
              </label>
              <input
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-white/10 dark:bg-black dark:focus:ring-white/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Palabra clave en el cuerpo (opcional)
              </label>
              <input
                value={optionalKeyword}
                onChange={(e) => setOptionalKeyword(e.target.value)}
                placeholder="Si el HTML debe contener un texto concreto"
                className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-white/10 dark:bg-black dark:focus:ring-white/20"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "Guardando…" : "Guardar servicio"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

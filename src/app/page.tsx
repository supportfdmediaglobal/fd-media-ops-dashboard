import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";

export default function Home() {
  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid gap-6">
          <section className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
            <div className="text-sm font-semibold">Monitoreo</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Servicios, incidentes, checks y disponibilidad en una sola vista,
              con secciones expandibles y exportación a CSV.
            </div>
            <Link
              href="/monitoreo"
              className="mt-4 inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Ir a monitoreo
            </Link>
          </section>
          <section className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
            <div className="text-sm font-semibold">Marketing</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Carrusel diario para Instagram (FD Bienestar): emocional,
              financiero y alimenticio.
            </div>
            <Link
              href="/marketing"
              className="mt-4 inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Abrir módulo marketing
            </Link>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}

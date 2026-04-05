import { DashboardShell } from "@/components/DashboardShell";
import { AgentPanel } from "@/components/agent/AgentPanel";

export const dynamic = "force-dynamic";

export default function AgentPage() {
  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <h1 className="text-xl font-semibold tracking-tight">Agente de alertas</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Configura notificaciones por servicio (FD Bienestar, Virtual Teacher, etc.).
          Cuando el monitoreo detecte un incidente nuevo o su cierre, se puede enviar un
          correo según las reglas activas.
        </p>
        <div className="mt-8">
          <AgentPanel />
        </div>
      </main>
    </DashboardShell>
  );
}

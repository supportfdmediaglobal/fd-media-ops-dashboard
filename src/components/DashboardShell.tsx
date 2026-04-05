import type { ReactNode } from "react";
import { TopNav } from "@/components/TopNav";
import { LogoutButton } from "@/components/LogoutButton";

export function DashboardShell({
  children,
  auth = "authed",
}: {
  children: ReactNode;
  /** `login`: barra superior sin enlaces protegidos; resalta “Iniciar sesión”. */
  auth?: "authed" | "login";
}) {
  return (
    <div className="flex min-h-full flex-col bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="shrink-0 border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col">
            <div className="text-lg font-semibold tracking-tight">
              FD Media Ops
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Monitoreo y operaciones — FD Media Global
            </div>
          </div>
          {auth === "authed" ? (
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <TopNav />
              <LogoutButton />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="rounded-full bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black">
                Iniciar sesión
              </span>
            </div>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}

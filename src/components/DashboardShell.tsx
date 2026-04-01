import type { ReactNode } from "react";
import { TopNav } from "@/components/TopNav";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <div className="text-lg font-semibold tracking-tight">
              FD Media Ops Dashboard
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Monitoreo y operaciones — FD Media Global
            </div>
          </div>
          <TopNav />
        </div>
      </header>
      {children}
    </div>
  );
}

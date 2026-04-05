"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({
  href,
  label,
  matchPrefix,
}: {
  href: string;
  label: string;
  matchPrefix?: boolean;
}) {
  const pathname = usePathname();
  const active = matchPrefix
    ? pathname.startsWith(href)
    : pathname === href;

  return (
    <Link
      href={href}
      className={[
        "rounded-full px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function TopNav() {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      <NavLink href="/" label="Inicio" />
      <NavLink href="/monitoreo" label="Monitoreo" matchPrefix />
      <NavLink href="/agent" label="Agente" matchPrefix />
      <NavLink href="/marketing" label="Marketing" matchPrefix />
    </nav>
  );
}


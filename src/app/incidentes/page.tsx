"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IncidentesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/monitoreo#incidentes");
  }, [router]);
  return (
    <div className="p-8 text-sm text-zinc-600">Redirigiendo a monitoreo…</div>
  );
}

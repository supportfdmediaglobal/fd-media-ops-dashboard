"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DisponibilidadRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/monitoreo#disponibilidad");
  }, [router]);
  return (
    <div className="p-8 text-sm text-zinc-600">Redirigiendo a monitoreo…</div>
  );
}

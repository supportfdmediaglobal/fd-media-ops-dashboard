import { DashboardShell } from "@/components/DashboardShell";
import { MonitoreoPanel } from "@/components/monitoreo/MonitoreoPanel";
import { getMonitoreoData } from "@/lib/monitoreoData";

export const dynamic = "force-dynamic";

export default async function MonitoreoPage() {
  const data = await getMonitoreoData();
  return (
    <DashboardShell>
      <MonitoreoPanel data={data} />
    </DashboardShell>
  );
}

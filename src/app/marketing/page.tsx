import { DashboardShell } from "@/components/DashboardShell";
import { MarketingCarouselTool } from "@/components/marketing/MarketingCarouselTool";

export const dynamic = "force-dynamic";

export default function MarketingPage() {
  return (
    <DashboardShell>
      <MarketingCarouselTool />
    </DashboardShell>
  );
}

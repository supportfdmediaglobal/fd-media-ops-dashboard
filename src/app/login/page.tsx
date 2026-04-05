import { DashboardShell } from "@/components/DashboardShell";
import { LoginClient } from "@/components/LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const next = sp?.next ?? "/";
  return (
    <DashboardShell auth="login">
      <LoginClient nextPath={next} />
    </DashboardShell>
  );
}


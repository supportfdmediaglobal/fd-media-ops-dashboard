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
    <LoginClient nextPath={next} />
  );
}


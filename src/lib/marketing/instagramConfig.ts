import { prisma } from "@/lib/db";

export async function resolveInstagramCredentials(): Promise<{
  businessAccountId: string;
  accessToken: string;
} | null> {
  const row = await prisma.marketingInstagramConfig.findUnique({
    where: { id: "default" },
  });
  const dbId = row?.businessAccountId?.trim();
  const dbToken = row?.accessToken?.trim();
  const envId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim();
  const envToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const businessAccountId = dbId || envId || "";
  const accessToken = dbToken || envToken || "";
  if (!businessAccountId || !accessToken) return null;
  return { businessAccountId, accessToken };
}

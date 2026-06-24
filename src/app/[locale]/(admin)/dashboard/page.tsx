import { redirect } from "next/navigation";
import { getCurrentActor } from "@/src/libs/server/auth-helper";
import { inferPrimaryRole, ROLE_DASHBOARD } from "@/src/libs/server/rbac-config";
import DashboardClient from "./dashboard-client";
import { getDashboardStats } from "./actions";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const tab = typeof resolvedSearchParams.tab === "string" ? resolvedSearchParams.tab : undefined;
  
  const actor = await getCurrentActor();
  if (actor) {
    const primaryRole = inferPrimaryRole(actor);
    const dest = ROLE_DASHBOARD[primaryRole];
    if (dest && dest !== "/dashboard") {
      redirect(`/${locale}${dest}`);
    }
  }

  const stats = await getDashboardStats();

  return <DashboardClient tab={tab} initialData={stats} />;
}
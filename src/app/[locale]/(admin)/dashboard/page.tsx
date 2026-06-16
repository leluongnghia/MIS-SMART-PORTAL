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
  
  const initialData = await getDashboardStats();

  return <DashboardClient tab={tab} initialData={initialData} />;
}
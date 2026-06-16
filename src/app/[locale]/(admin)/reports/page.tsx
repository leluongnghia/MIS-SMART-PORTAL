import ReportsClient from "./reports-client";
import { getReportsData } from "./actions";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dbData = await getReportsData();

  return <ReportsClient locale={locale} data={dbData as any} />;
}

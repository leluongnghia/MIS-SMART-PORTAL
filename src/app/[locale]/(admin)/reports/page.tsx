import { getReportsData } from './actions';
import ReportsClient from './reports-client';

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const reportsData = await getReportsData();

  return <ReportsClient locale={locale} data={reportsData as any} />;
}

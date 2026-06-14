import { getDashboardStats } from './actions';
import DashboardClient from './dashboard-client';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const stats = await getDashboardStats();

  return <DashboardClient locale={locale} stats={stats as any} />;
}

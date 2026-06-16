import { getTranslations } from 'next-intl/server';
import { getCurrentActor, canManageReports } from '@/src/libs/server/auth-helper';
import { redirect } from 'next/navigation';
import ReportsClient from './reports-client';
import { getDashboardStats } from './actions';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Admin' });
  return {
    title: `Báo cáo Hệ thống - ${t('title')}`,
  };
}

export default async function ReportsPage() {
  const actor = await getCurrentActor();
  if (!actor) {
    redirect('/sign-in');
  }

  // Managers and Admins can view reports
  const isAdmin = actor.role === 'ADMIN';
  const isManager = actor.role === 'MANAGER';
  
  if (!isAdmin && !isManager) {
    redirect('/unauthorized'); // or handle gracefully
  }

  const initialStats = await getDashboardStats();

  return <ReportsClient isAdmin={isAdmin} initialStats={initialStats} />;
}

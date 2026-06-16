import { getTranslations } from 'next-intl/server';
import { getCurrentActor, canViewSystemSettings } from '@/src/libs/server/auth-helper';
import { redirect } from 'next/navigation';
import SettingsClient from './settings-client';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Admin' });
  return {
    title: `Cấu hình Hệ thống - ${t('title')}`,
  };
}

export default async function SettingsPage() {
  const actor = await getCurrentActor();
  if (!actor) {
    redirect('/sign-in');
  }

  if (!canViewSystemSettings(actor)) {
    redirect('/unauthorized');
  }

  const isAdmin = actor.role === 'ADMIN';

  return <SettingsClient isAdmin={isAdmin} />;
}

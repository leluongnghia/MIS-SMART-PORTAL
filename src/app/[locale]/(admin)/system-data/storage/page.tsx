import { getTranslations } from 'next-intl/server';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import { redirect } from 'next/navigation';
import StorageClient from './storage-client';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Admin' });
  return {
    title: `Lưu trữ & Dữ liệu - ${t('title')}`,
  };
}

export default async function StoragePage() {
  const actor = await getCurrentActor();
  if (!actor) {
    redirect('/sign-in');
  }

  // Allow ADMIN and MANAGER, or even STAFF if they need to access specific files
  // Currently we'll let everyone in and filter files inside the client based on auth-helper
  
  return <StorageClient actor={actor} />;
}

import { getTranslations } from 'next-intl/server';
import { getCurrentActor, canManageCategories } from '@/src/libs/server/auth-helper';
import { redirect } from 'next/navigation';
import CategoriesClient from './categories-client';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Admin' });
  return {
    title: `Quản lý Danh mục - ${t('title')}`,
  };
}

export default async function CategoriesPage() {
  const actor = await getCurrentActor();
  if (!actor) {
    redirect('/sign-in');
  }

  // Everyone can view, but only admin can manage. We pass the permission down.
  const canManage = canManageCategories(actor);

  return <CategoriesClient canManage={canManage} />;
}

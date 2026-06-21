import { getTranslations } from 'next-intl/server';
import { getCurrentActor } from '@/src/libs/server/auth-helper';
import StorageClient from './storage-client';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Admin' });
  return {
    title: `Lưu trữ & Dữ liệu - ${t('title')}`,
  };
}

function AccessNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
      <h2 className="text-lg font-bold">Chưa xác định người dùng</h2>
      <p className="mt-2 text-sm">Vui lòng quay lại dashboard, chọn tài khoản đăng nhập rồi mở lại Lưu trữ & Dữ liệu.</p>
    </div>
  );
}

export default async function StoragePage() {
  const actor = await getCurrentActor();
  if (!actor) {
    return <AccessNotice />;
  }

  return <StorageClient actor={actor} />;
}

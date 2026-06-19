import { getTranslations } from 'next-intl/server';
import { getCurrentActor, canViewSystemSettings } from '@/src/libs/server/auth-helper';
import SettingsClient from './settings-client';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Admin' });
  return {
    title: `Cấu hình Hệ thống - ${t('title')}`,
  };
}

function AccessNotice({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm">{description}</p>
    </div>
  );
}

export default async function SettingsPage() {
  const actor = await getCurrentActor();
  if (!actor) {
    return <AccessNotice title="Chưa xác định người dùng" description="Vui lòng quay lại dashboard, chọn tài khoản đăng nhập rồi mở lại Cấu hình hệ thống." />;
  }

  if (!canViewSystemSettings(actor)) {
    return <AccessNotice title="Không có quyền truy cập" description="Module Cấu hình hệ thống chỉ dành cho vai trò được cấp quyền quản trị." />;
  }

  const isAdmin = actor.role === 'ADMIN';

  return <SettingsClient isAdmin={isAdmin} />;
}

import type { ReactNode } from 'react';
import AdminShell from '@/src/components/admin/admin-shell';
import { PermissionsProvider } from '@/src/hooks/usePermissions';

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <PermissionsProvider>
      <AdminShell locale={locale}>{children}</AdminShell>
    </PermissionsProvider>
  );
}

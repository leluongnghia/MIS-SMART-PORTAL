'use client';

import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function PermissionError({
  error,
  reset,
}: {
  error: Error & { digest?: string; code?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-6 dark:bg-red-900/20">
        <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-500" />
      </div>
      <h2 className="mb-4 text-3xl font-bold tracking-tight">Từ chối truy cập</h2>
      <p className="mb-8 max-w-[500px] text-muted-foreground">
        Tài khoản của bạn hiện tại không có quyền truy cập vào trang quản trị phân quyền hệ thống. Vui lòng đăng nhập bằng tài khoản Administrator.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Trở về trang chủ
        </Link>
      </div>
    </div>
  );
}

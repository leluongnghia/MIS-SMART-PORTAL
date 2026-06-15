'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { UserCheck } from 'lucide-react';

export default function approvalsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'vi';

  useEffect(() => {
    const userId = localStorage.getItem('mis_edutask_logged_in_user_id');
    const loggedIn = localStorage.getItem('mis_edutask_logged_in') === 'true';
    if (!loggedIn || !userId) return;
    import('@/src/mockData').then(({ MOCK_USERS }) => {
      const user = MOCK_USERS.find(u => u.id === userId);
      if (user && user.workspaceId && user.workspaceId !== 'BGH' && user.workspaceId !== 'KHAO_THI' && user.workspaceId !== 'TUYEN_SINH_PR' && user.role !== 'ADMIN') {
        router.replace(`/${locale}/dashboard?tab=nghiphep`);
      }
    });
  }, [locale, router]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Phê duyệt</h2>
        <p className="text-sm text-slate-500">Quản lý các yêu cầu phê duyệt</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1,2,3].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mục {i}</CardTitle>
              <UserCheck className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

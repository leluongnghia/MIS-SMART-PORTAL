import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { WORKSPACES, MOCK_USERS } from '@/src/mockData';

// Giả lập lấy current user từ cookie/session (ở đây dùng MOCK_USERS cho đơn giản)
const getCurrentUserId = () => {
  return 'u1'; // Default giả lập Admin
};

export default async function DepartmentLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string; departmentId: string }>;
}) {
  const { locale, departmentId } = await params;
  
  // Kiểm tra xem bộ phận có tồn tại không
  const department = WORKSPACES.find(w => w.id === departmentId);
  if (!department) {
    redirect(`/${locale}/dashboard`);
  }

  // TODO: Add real permission checks here.
  // Example: if (currentUser.role !== 'ADMIN' && currentUser.workspaceId !== departmentId) redirect(...)

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

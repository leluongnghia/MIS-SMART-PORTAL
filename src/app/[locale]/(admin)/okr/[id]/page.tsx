import { notFound } from 'next/navigation';
import { db, schema } from '@/src/libs/server/db';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function OkrDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  
  // Tạm thời query từ bảng tasks (vì cảnh báo/followUps lấy từ tasks)
  const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id)).limit(1);

  if (!task) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/okr`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Chi tiết Công việc/OKR</h2>
          <p className="text-sm text-slate-500">ID: {task.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-slate-500">Người phụ trách</p>
              <p>{task.assignedName || 'Chưa phân công'}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Trạng thái</p>
              <p>{task.status}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Độ ưu tiên</p>
              <p>{task.priority}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Hạn chót</p>
              <p>{task.deadline || 'Không có'}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Bộ phận</p>
              <p>{task.workspaceId}</p>
            </div>
          </div>

          {task.description && (
            <div className="pt-4 border-t">
              <p className="font-semibold text-slate-500 mb-2">Mô tả chi tiết</p>
              <div className="bg-slate-50 p-4 rounded-md text-sm whitespace-pre-wrap">
                {task.description}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

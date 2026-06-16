'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { ClipboardCheck, Calendar, Clock, CheckCircle2 } from 'lucide-react';

export default function PlansPage({ initialData }: { initialData?: any }) {
  console.log("DB Data:", initialData);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Kế hoạch hoạt động</h2>
        <p className="text-sm text-slate-500">Giám sát và quản lý tiến độ các kế hoạch chiến lược</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kế hoạch {i}</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Đang triển khai</div>
              <p className="text-xs text-slate-500">Đạt 60% tiến độ</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

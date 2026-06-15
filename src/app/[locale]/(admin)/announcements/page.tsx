'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Bell } from 'lucide-react';

export default function announcementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Thông báo nội bộ</h2>
        <p className="text-sm text-slate-500">Thông báo từ Ban Giám Hiệu</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1,2,3].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mục {i}</CardTitle>
              <Bell className="h-4 w-4 text-slate-500" />
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

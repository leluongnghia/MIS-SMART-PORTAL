'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Database } from 'lucide-react';

export default function dataPage({ initialData }: { initialData?: any }) {
  console.log("DB Data:", initialData);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Kho dữ liệu</h2>
        <p className="text-sm text-slate-500">Lưu trữ và đồng bộ dữ liệu</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1,2,3].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mục {i}</CardTitle>
              <Database className="h-4 w-4 text-slate-500" />
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

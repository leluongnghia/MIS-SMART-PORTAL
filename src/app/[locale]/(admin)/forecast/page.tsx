'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { TrendingUp, BarChart3, LineChart, PieChart } from 'lucide-react';

export default function ForecastPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Phân tích & Dự báo</h2>
        <p className="text-sm text-slate-500">Mô hình AI dự báo các chỉ số quan trọng của trường</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chỉ số {i}</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+15%</div>
              <p className="text-xs text-slate-500">Dự báo quý tới</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

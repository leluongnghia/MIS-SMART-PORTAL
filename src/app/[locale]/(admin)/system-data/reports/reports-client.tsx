'use client';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Users, ClipboardList, TrendingUp, Activity, Download } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

export default function ReportsClient({ isAdmin, initialStats }: { isAdmin: boolean, initialStats: any }) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const handleExport = () => {
    // Mock export
    alert('Tính năng xuất báo cáo đang được xây dựng.');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo hệ thống</h1>
          <p className="text-muted-foreground mt-1">Tổng hợp số liệu và hoạt động hệ thống.</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Xuất báo cáo (CSV)
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Công Việc</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialStats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Công việc đang theo dõi</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Học sinh Đang học</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Hồ sơ học sinh chính thức</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cơ hội Tuyển sinh</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialStats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">Đang trong pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tình trạng hệ thống</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Ổn định</div>
            <p className="text-xs text-muted-foreground">Không có lỗi phát sinh</p>
          </CardContent>
        </Card>
      </div>

      <Tabs className="space-y-4">
        <TabsList>
          <TabsTrigger active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Tổng quan</TabsTrigger>
          {isAdmin && <TabsTrigger active={activeTab === "audit"} onClick={() => setActiveTab("audit")}>Nhật ký Hệ thống (Audit Log)</TabsTrigger>}
        </TabsList>
        <TabsContent value="overview" activeValue={activeTab} className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Biểu đồ hoạt động</CardTitle>
              <CardDescription>
                Dữ liệu đang được kết nối với module Analytics...
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2 h-[300px] flex items-center justify-center border-t border-dashed border-border mt-4">
              <span className="text-muted-foreground">Placeholder Biểu đồ (Sẽ sử dụng Recharts)</span>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="audit" activeValue={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nhật ký Hoạt động Gần đây</CardTitle>
                <CardDescription>
                  Ghi nhận các thay đổi quan trọng trên toàn hệ thống.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {initialStats.recentLogs && initialStats.recentLogs.length > 0 ? (
                    initialStats.recentLogs.map((log: any) => (
                      <div key={log.id} className="flex items-center gap-4 text-sm border-b pb-4 last:border-0 last:pb-0">
                        <div className="w-32 shrink-0 text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </div>
                        <div className="font-medium w-40 truncate" title={log.action}>{log.action}</div>
                        <div className="text-muted-foreground w-40 truncate">{log.entityType} ({log.entityId})</div>
                        <div className="flex-1 text-muted-foreground truncate text-right">
                          Tác nhân: {log.actorId || 'Hệ thống'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">Không có nhật ký nào gần đây.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

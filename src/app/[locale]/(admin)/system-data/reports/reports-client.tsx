'use client';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Users, ClipboardList, TrendingUp, Activity, Download } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function ReportsClient({ isAdmin, initialStats }: { isAdmin: boolean, initialStats: any }) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const taskChartData = React.useMemo(() => {
    return (initialStats?.tasksByStatus || []).map((t: any) => ({
      name: t.status === 'todo' ? 'Cần làm' : t.status === 'in_progress' ? 'Đang làm' : t.status === 'done' ? 'Hoàn thành' : t.status,
      value: t.count
    }));
  }, [initialStats]);

  const studentsChartData = React.useMemo(() => {
    return (initialStats?.studentsByClass || []).map((s: any) => ({
      name: s.className || 'Chưa xếp lớp',
      students: s.count
    }));
  }, [initialStats]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleExport = () => {
    const headers = ['Tham số thống kê', 'Giá trị'];
    const csvRows = [headers.join(',')];

    // Main stats
    csvRows.push([`"Tổng công việc"`, `"${initialStats.totalTasks || 0}"`].join(','));
    csvRows.push([`"Tổng học sinh chính thức"`, `"${initialStats.totalStudents || 0}"`].join(','));
    csvRows.push([`"Tổng cơ hội tuyển sinh"`, `"${initialStats.totalLeads || 0}"`].join(','));

    // Tasks breakdown
    csvRows.push('');
    csvRows.push([`"Trạng thái công việc"`, `"Số lượng"`].join(','));
    (initialStats?.tasksByStatus || []).forEach((t: any) => {
      const name = t.status === 'todo' ? 'Cần làm' : t.status === 'in_progress' ? 'Đang làm' : t.status === 'done' ? 'Hoàn thành' : t.status;
      csvRows.push([`"${name}"`, `"${t.count}"`].join(','));
    });

    // Students breakdown
    csvRows.push('');
    csvRows.push([`"Lớp học"`, `"Số học sinh"`].join(','));
    (initialStats?.studentsByClass || []).forEach((s: any) => {
      csvRows.push([`"${s.className || 'Chưa xếp lớp'}"`, `"${s.count}"`].join(','));
    });

    // Audit logs if admin
    if (isAdmin && initialStats.recentLogs && initialStats.recentLogs.length > 0) {
      csvRows.push('');
      csvRows.push([`"Thời gian nhật ký"`, `"Hành động"`, `"Loại thực thể"`, `"ID thực thể"`, `"Tác nhân"`].join(','));
      initialStats.recentLogs.forEach((log: any) => {
        csvRows.push([
          `"${new Date(log.createdAt).toLocaleString('vi-VN')}"`,
          `"${log.action}"`,
          `"${log.entityType}"`,
          `"${log.entityId}"`,
          `"${log.actorId || 'Hệ thống'}"`
        ].join(','));
      });
    }

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_cao_he_thong_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố học sinh theo lớp</CardTitle>
                <CardDescription>
                  Số lượng học sinh chính thức đang học tại các lớp.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trạng thái công việc</CardTitle>
                <CardDescription>
                  Tỷ lệ công việc phân bổ theo trạng thái hiện tại.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex flex-col justify-between">
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {taskChartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-xs font-medium">
                  {taskChartData.map((entry: any, index: number) => (
                    <span key={entry.name} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      {entry.name}: {entry.value}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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

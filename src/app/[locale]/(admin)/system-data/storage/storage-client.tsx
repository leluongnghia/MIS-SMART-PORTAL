'use client';
import * as React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Input } from '@/src/components/ui/input';
import { getFiles, getImportExportJobs, deleteFile, createSystemBackup, getStorageStats, getStorageActivityLogs, getBackupJobs, restoreBackupJob } from './actions';
import { useToast } from '@/src/components/ui/Toast';
import { HardDrive, FileText, Upload, Trash2, ShieldAlert, History, Search, Activity, FileWarning, Filter, Calendar, SaveAll, RotateCcw } from 'lucide-react';
import { StorageUploadDialog } from './StorageUploadDialog';
import { StorageFileActionsMenu } from './StorageFileActions';

export default function StorageClient({ actor }: { actor: any }) {
  const [activeTab, setActiveTab] = React.useState('files');
  const { toast } = useToast();
  const [files, setFiles] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [backupJobs, setBackupJobs] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  const [uploadOpen, setUploadOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [filesData, jobsData, statsData, logsData, backupsData] = await Promise.all([
        getFiles(true),
        getImportExportJobs(),
        getStorageStats(),
        getStorageActivityLogs(),
        getBackupJobs()
      ]);
      setFiles(filesData);
      setJobs(jobsData);
      setStats(statsData);
      setActivityLogs(logsData);
      setBackupJobs(backupsData);
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBackup = async () => {
    try {
      toast({ variant: 'info', title: 'Đang xử lý', message: 'Đang tạo bản sao lưu hệ thống...' });
      await createSystemBackup();
      toast({ variant: 'success', title: 'Thành công', message: 'Đã tạo bản sao lưu hệ thống' });
      loadData();
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    }
  };

  const isAdmin = actor.role === 'ADMIN';

  const activeFiles = files.filter(f => f.status !== 'DELETED');
  const trashFiles = files.filter(f => f.status === 'DELETED');

  const filteredFiles = activeFiles.filter(f => {
    const matchesSearch = (f.displayName || f.fileName)?.toLowerCase().includes(search.toLowerCase()) || f.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || f.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lưu trữ & Dữ liệu</h1>
          <p className="text-muted-foreground mt-1">Quản lý tệp đính kèm, sao lưu và đồng bộ dữ liệu.</p>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tổng tài liệu</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalDocuments}</div><p className="text-xs text-muted-foreground">+{stats.filesThisMonth} trong tháng này</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Dung lượng sử dụng</CardTitle><HardDrive className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatBytes(stats.usedStorage)}</div><p className="text-xs text-muted-foreground">/ {formatBytes(stats.storageLimit)}</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tài liệu toàn trường</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.schoolWideFiles}</div><p className="text-xs text-muted-foreground">Được chia sẻ chung</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Lịch sử Import/Export</CardTitle><History className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.recentImportExport}</div><p className="text-xs text-muted-foreground">Tiến trình gần đây</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Thùng rác</CardTitle><Trash2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{trashFiles.length}</div><p className="text-xs text-muted-foreground">Tài liệu đã xóa mềm</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Bản sao lưu gần nhất</CardTitle><SaveAll className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-sm mt-2">{stats.latestBackup}</div><p className="text-xs text-muted-foreground">Hệ thống an toàn</p></CardContent></Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Tabs className="space-y-4">
            <TabsList className="bg-slate-100 dark:bg-slate-800">
              <TabsTrigger active={activeTab === 'files'} onClick={() => setActiveTab('files')}><FileText className="h-4 w-4 mr-2" />Tài liệu chung</TabsTrigger>
              <TabsTrigger active={activeTab === 'trash'} onClick={() => setActiveTab('trash')}><Trash2 className="h-4 w-4 mr-2" />Thùng rác</TabsTrigger>
              <TabsTrigger active={activeTab === 'history'} onClick={() => setActiveTab('history')}><History className="h-4 w-4 mr-2" />Lịch sử Import/Export</TabsTrigger>
              {isAdmin && <TabsTrigger active={activeTab === 'backup'} onClick={() => setActiveTab('backup')}><HardDrive className="h-4 w-4 mr-2" />Sao lưu & Phục hồi</TabsTrigger>}
            </TabsList>

        <TabsContent value="files" activeValue={activeTab} className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quản lý Tệp đính kèm</CardTitle>
                <CardDescription>Tài liệu, hình ảnh được chia sẻ trong hệ thống</CardDescription>
              </div>
              <Button onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Tải lên
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                <div className="relative flex-1 w-full sm:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Tìm kiếm tài liệu..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="relative flex-1 w-full sm:max-w-xs">
                  <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                    <option value="ALL">Tất cả danh mục</option>
                    {Array.from(new Set(files.map(f => f.category).filter(Boolean))).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên tài liệu</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Kích thước</TableHead>
                    <TableHead>Phạm vi</TableHead>
                    <TableHead>Ngày tải lên</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {search ? 'Không tìm thấy tài liệu phù hợp.' : 'Chưa có tệp nào.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFiles.map((file) => (
                      <TableRow key={file.id} className={file.status === 'DELETED' ? 'opacity-50 line-through' : ''}>
                        <TableCell>
                          <div className="font-medium text-blue-600 dark:text-blue-400">
                            {file.displayName || file.fileName}
                          </div>
                          {file.status === 'ARCHIVED' && <span className="text-xs text-amber-600 font-semibold">[Lưu trữ]</span>}
                        </TableCell>
                        <TableCell>{file.category || 'Khác'}</TableCell>
                        <TableCell>{formatBytes(file.fileSize)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            file.visibility === 'SCHOOL_WIDE' || file.visibility === 'SCHOOL' ? 'bg-purple-100 text-purple-800' :
                            file.visibility === 'DEPARTMENT' ? 'bg-blue-100 text-blue-800' :
                            file.visibility === 'ADMIN_ONLY' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {file.visibility === 'SCHOOL_WIDE' || file.visibility === 'SCHOOL' ? 'Toàn trường' :
                             file.visibility === 'DEPARTMENT' ? 'Phòng ban' : 
                             file.visibility === 'ADMIN_ONLY' ? 'Quản trị' : 'Cá nhân'}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(file.createdAt).toLocaleString('vi-VN')}</TableCell>
                        <TableCell className="text-right">
                          <StorageFileActionsMenu file={file} actor={actor} onRefresh={loadData} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trash" activeValue={activeTab} className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Thùng rác</CardTitle><CardDescription>Tài liệu đã xóa mềm. Admin có thể xóa vĩnh viễn.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Tên tài liệu</TableHead><TableHead>Ngày xóa</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader>
                <TableBody>
                  {trashFiles.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center">Thùng rác trống.</TableCell></TableRow> : 
                    trashFiles.map(file => (
                      <TableRow key={file.id}>
                        <TableCell><div className="font-medium text-slate-500">{file.displayName || file.fileName}</div></TableCell>
                        <TableCell>{file.deletedAt ? new Date(file.deletedAt).toLocaleString('vi-VN') : '-'}</TableCell>
                        <TableCell className="text-right"><StorageFileActionsMenu file={file} actor={actor} onRefresh={loadData} /></TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" activeValue={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tiến trình Import/Export</CardTitle>
              <CardDescription>Nhật ký đồng bộ dữ liệu với hệ thống ngoài.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã phiên</TableHead>
                    <TableHead>Phân hệ</TableHead>
                    <TableHead>Thành công/Tổng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian hoàn thành</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Không có dữ liệu tiến trình nào.</TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.id}</TableCell>
                        <TableCell>{job.module}</TableCell>
                        <TableCell>{job.successRows} / {job.totalRows}</TableCell>
                        <TableCell>{job.status}</TableCell>
                        <TableCell>{job.completedAt ? new Date(job.completedAt).toLocaleString('vi-VN') : 'Đang xử lý'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="backup" activeValue={activeTab} className="space-y-4">
            <Card className="border-destructive/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                  <CardTitle>Sao lưu Hệ thống</CardTitle>
                </div>
                <CardDescription>Tính năng chỉ dành cho Ban Quản trị. Việc sao lưu có thể mất nhiều thời gian nếu dữ liệu lớn.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Lịch sử sao lưu</h3>
                  <Table>
                    <TableHeader><TableRow><TableHead>Mã backup</TableHead><TableHead>Thời gian</TableHead><TableHead>Loại</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {backupJobs.map(job => (
                        <TableRow key={job.id}>
                          <TableCell className="font-mono text-xs">{job.id}</TableCell>
                          <TableCell>{new Date(job.startedAt).toLocaleString('vi-VN')}</TableCell>
                          <TableCell>{job.type}</TableCell>
                          <TableCell>
                            <span className={`inline-flex px-2 py-1 rounded text-xs ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{job.status}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            {job.status === 'COMPLETED' && <Button variant="outline" size="sm" onClick={async () => {
                              if (confirm('Khôi phục dữ liệu từ bản sao lưu này? Thao tác này sẽ ghi đè dữ liệu hiện tại!')) {
                                try { await restoreBackupJob(job.id); toast({ variant: 'success', title: 'Thành công', message: 'Đã bắt đầu tiến trình khôi phục.' }); loadData(); } catch(e: any) { toast({ variant: 'error', title: 'Lỗi', message: e.message }); }
                              }
                            }}><RotateCcw className="h-4 w-4 mr-1" /> Khôi phục</Button>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
          </Tabs>
        </div>

        <div className="md:col-span-1 space-y-4">
          <Card className="h-full">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5" /> Nhật ký hoạt động</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activityLogs.map(log => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <p className="text-slate-700 dark:text-slate-300"><span className="font-medium text-slate-900 dark:text-white">{log.metadata?.actor?.name}</span> {log.action.replace(log.metadata?.actor?.name + ' ', '')}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(log.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <StorageUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onSuccess={loadData} />
    </div>
  );
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KiB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}


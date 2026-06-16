'use client';
import * as React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { getFiles, getImportJobs, uploadMockFile, deleteFile, createSystemBackup } from './actions';
import { useToast } from '@/src/components/ui/Toast';
import { HardDrive, FileText, Upload, Trash2, ShieldAlert, History } from 'lucide-react';


export default function StorageClient({ actor }: { actor: any }) {
  const [activeTab, setActiveTab] = React.useState('files');
  const { toast } = useToast();
  const [files, setFiles] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [filesData, jobsData] = await Promise.all([
        getFiles(),
        getImportJobs()
      ]);
      setFiles(filesData);
      setJobs(jobsData);
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadMock = async () => {
    try {
      await uploadMockFile({
        fileName: 'tailieu_huongdan.pdf',
        fileSize: 2048000,
        visibility: actor.role === 'ADMIN' ? 'SCHOOL' : 'DEPARTMENT',
        departmentId: actor.departmentId
      });
      toast({ variant: 'success', title: 'Thành công', message: 'Tải lên file thành công' });
      loadData();
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa file này?')) return;
    try {
      await deleteFile(id);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã xóa file' });
      loadData();
    } catch (error: any) {
      toast({ variant: 'error', title: 'Lỗi', message: error.message });
    }
  };

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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lưu trữ & Dữ liệu</h1>
          <p className="text-muted-foreground mt-1">Quản lý tệp đính kèm, sao lưu và đồng bộ dữ liệu.</p>
        </div>
      </div>

      <Tabs className="space-y-4">
        <TabsList>
          <TabsTrigger active={activeTab === "files"} onClick={() => setActiveTab("files")}>
            <FileText className="h-4 w-4 mr-2" />
            Tài liệu chung
          </TabsTrigger>
          <TabsTrigger active={activeTab === "history"} onClick={() => setActiveTab("history")}>
            <History className="h-4 w-4 mr-2" />
            Lịch sử Import/Export
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger active={activeTab === "backup"} onClick={() => setActiveTab("backup")}>
              <HardDrive className="h-4 w-4 mr-2" />
              Sao lưu & Phục hồi
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="files" activeValue={activeTab} className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quản lý Tệp đính kèm</CardTitle>
                <CardDescription>Tài liệu, hình ảnh được chia sẻ trong hệ thống</CardDescription>
              </div>
              <Button onClick={handleUploadMock}>
                <Upload className="h-4 w-4 mr-2" />
                Tải lên (Mock)
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên file</TableHead>
                    <TableHead>Kích thước</TableHead>
                    <TableHead>Phạm vi</TableHead>
                    <TableHead>Ngày tải lên</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Chưa có tệp nào.</TableCell>
                    </TableRow>
                  ) : (
                    files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                          {file.fileName}
                        </TableCell>
                        <TableCell>{formatBytes(file.fileSize)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            file.visibility === 'SCHOOL' ? 'bg-purple-100 text-purple-800' :
                            file.visibility === 'DEPARTMENT' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {file.visibility === 'SCHOOL' ? 'Toàn trường' :
                             file.visibility === 'DEPARTMENT' ? 'Phòng ban' : 'Cá nhân'}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(file.createdAt).toLocaleString('vi-VN')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(file.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
                <Button variant="destructive" onClick={handleBackup}>
                  <HardDrive className="mr-2 h-4 w-4" />
                  Tạo bản sao lưu ngay bây giờ
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
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

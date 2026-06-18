import React from 'react';
import { Button } from '@/src/components/ui/button';
import { MoreHorizontal, Download, Eye, Edit, Archive, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { downloadStorageFileAction, deleteFile, archiveStorageFile, restoreStorageFile, permanentlyDeleteStorageFile } from './actions';
import { useToast } from '@/src/components/ui/Toast';

export function StorageFileActionsMenu({
  file,
  actor,
  onRefresh
}: {
  file: any;
  actor: any;
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);

  // Simple dropdown manual implementation since ui/dropdown-menu is not confirmed
  const isDeleted = file.status === 'DELETED';
  const isArchived = file.status === 'ARCHIVED';
  
  const canDelete = actor.role === 'ADMIN' || actor.id === file.uploadedBy;
  const canArchive = canDelete; // same logic for now
  const canRestore = canDelete; // same logic for now
  const canPermanentDelete = actor.role === 'ADMIN';

  const handleDownload = async () => {
    try {
      const res = await downloadStorageFileAction(file.id);
      if (res.success && res.url) {
        window.open(res.url, '_blank');
        onRefresh();
      }
    } catch (e: any) {
      toast({ variant: 'error', title: 'Lỗi tải xuống', message: e.message });
    }
  };

  const handleArchive = async () => {
    try {
      await archiveStorageFile(file.id);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã lưu trữ file' });
      onRefresh();
    } catch (e: any) {
      toast({ variant: 'error', title: 'Lỗi', message: e.message });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa tạm file này?')) return;
    try {
      await deleteFile(file.id);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã xóa file' });
      onRefresh();
    } catch (e: any) {
      toast({ variant: 'error', title: 'Lỗi', message: e.message });
    }
  };

  const handleRestore = async () => {
    try {
      await restoreStorageFile(file.id);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã khôi phục file' });
      onRefresh();
    } catch (e: any) {
      toast({ variant: 'error', title: 'Lỗi', message: e.message });
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirm('HÀNH ĐỘNG NGUY HIỂM: Xóa vĩnh viễn không thể khôi phục. Tiếp tục?')) return;
    try {
      await permanentlyDeleteStorageFile(file.id);
      toast({ variant: 'success', title: 'Thành công', message: 'Đã xóa vĩnh viễn' });
      onRefresh();
    } catch (e: any) {
      toast({ variant: 'error', title: 'Lỗi', message: e.message });
    }
  };

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" title="Tải xuống" onClick={handleDownload}>
        <Download className="h-4 w-4 text-blue-600" />
      </Button>

      {canArchive && !isArchived && !isDeleted && (
        <Button variant="ghost" size="icon" title="Lưu trữ" onClick={handleArchive}>
          <Archive className="h-4 w-4 text-amber-600" />
        </Button>
      )}

      {isDeleted && canRestore && (
        <Button variant="ghost" size="icon" title="Khôi phục" onClick={handleRestore}>
          <RotateCcw className="h-4 w-4 text-green-600" />
        </Button>
      )}

      {canDelete && !isDeleted && (
        <Button variant="ghost" size="icon" title="Xóa" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      )}

      {isDeleted && canPermanentDelete && (
        <Button variant="ghost" size="icon" title="Xóa vĩnh viễn" onClick={handlePermanentDelete}>
          <AlertTriangle className="h-4 w-4 text-red-700" />
        </Button>
      )}
    </div>
  );
}

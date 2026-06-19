import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Dialog } from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { Archive, Copy, Download, Edit, Eye, MoreHorizontal, RotateCcw, Share2, Trash2, UploadCloud } from 'lucide-react';
import { archiveStorageFile, deleteFile, downloadStorageFileAction, permanentlyDeleteStorageFile, restoreStorageFile, updateStorageFile } from './actions';
import { useToast } from '@/src/components/ui/Toast';
import { FILE_CATEGORIES, RELATED_MODULES, STORAGE_SCOPE } from './storage.constants';

export function StorageFileActionsMenu({ file, actor, onRefresh }: { file: any; actor: any; onRefresh: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const isDeleted = file.status === 'DELETED';
  const canModify = actor.role === 'ADMIN' || actor.id === file.uploadedBy;
  const canPermanent = actor.role === 'ADMIN';
  const run = async (fn: () => Promise<any>, ok: string) => { try { await fn(); toast({ variant: 'success', title: 'Thành công', message: ok }); onRefresh(); setOpen(false); } catch (e: any) { toast({ variant: 'error', title: 'Lỗi', message: e.message }); } };
  const protectedUrl = `/api/storage/files/${file.id}`;
  const handleDownload = async () => { const r = await downloadStorageFileAction(file.id); if (r.url) window.open(r.url, '_blank'); onRefresh(); };
  const ext = (file.extension || '').toLowerCase();
  return <div className="relative flex justify-end">
    <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} title="Thao tác"><MoreHorizontal className="h-4 w-4" /></Button>
    {open && <div className="absolute right-0 top-9 z-20 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 text-sm shadow-xl dark:border-slate-800 dark:bg-slate-950">
      {!isDeleted && <MenuItem icon={Eye} text="Xem trước" onClick={() => setPreviewOpen(true)} />}
      {!isDeleted && <MenuItem icon={Download} text="Tải xuống" onClick={() => run(handleDownload, 'Đã ghi nhận lượt tải')} />}
      {canModify && !isDeleted && <MenuItem icon={Edit} text="Sửa thông tin / Đổi tên" onClick={() => setEditOpen(true)} />}
      {canModify && !isDeleted && <MenuItem icon={UploadCloud} text="Cập nhật phiên bản" onClick={() => toast({ variant: 'info', title: 'Cập nhật phiên bản', message: 'Dùng nút Tải lên và chọn tạo phiên bản mới khi trùng tên.' })} />}
      {!isDeleted && <MenuItem icon={Share2} text="Chia sẻ" onClick={() => toast({ variant: 'info', title: 'Chia sẻ nội bộ', message: 'Link nội bộ đã sẵn sàng để sao chép.' })} />}
      {!isDeleted && <MenuItem icon={Copy} text="Sao chép link nội bộ" onClick={() => { navigator.clipboard?.writeText(`${location.origin}${protectedUrl}`); toast({ variant: 'success', title: 'Đã sao chép', message: 'Link nội bộ đã vào clipboard.' }); }} />}
      {canModify && !isDeleted && file.status !== 'ARCHIVED' && <MenuItem icon={Archive} text="Lưu trữ" onClick={() => run(() => archiveStorageFile(file.id), 'Đã lưu trữ file')} />}
      {canModify && !isDeleted && <MenuItem danger icon={Trash2} text="Xóa mềm" onClick={() => confirm('Xóa mềm file này?') && run(() => deleteFile(file.id), 'Đã chuyển vào thùng rác')} />}
      {isDeleted && canModify && <MenuItem icon={RotateCcw} text="Khôi phục" onClick={() => run(() => restoreStorageFile(file.id), 'Đã khôi phục file')} />}
      {isDeleted && canPermanent && <MenuItem danger icon={Trash2} text="Xóa vĩnh viễn" onClick={() => confirm('Xóa vĩnh viễn không thể khôi phục. Tiếp tục?') && confirm('Xác nhận lần 2: xóa vĩnh viễn file này?') && run(() => permanentlyDeleteStorageFile(file.id), 'Đã xóa vĩnh viễn')} />}
    </div>}
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen} title={file.displayName || file.originalName} description="Preview tài liệu" className="sm:max-w-[800px]">
      {['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? <img src={protectedUrl} className="max-h-[70vh] w-full rounded-xl object-contain" alt={file.displayName || file.fileName} /> : ext === 'pdf' ? <iframe src={protectedUrl} className="h-[70vh] w-full rounded-xl border" /> : <div className="rounded-2xl bg-slate-50 p-8 text-center dark:bg-slate-900">Không hỗ trợ preview định dạng này. Vui lòng tải xuống để xem.</div>}
    </Dialog>
    <EditDialog file={file} open={editOpen} setOpen={setEditOpen} onDone={onRefresh} />
  </div>;
}
function MenuItem({ icon: Icon, text, onClick, danger }: any) { return <button onClick={onClick} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-900 ${danger ? 'text-rose-600' : ''}`}><Icon className="h-4 w-4" />{text}</button>; }
function EditDialog({ file, open, setOpen, onDone }: any) {
  const { toast } = useToast();
  const submit = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); try { await updateStorageFile(file.id, Object.fromEntries(fd.entries())); toast({ variant: 'success', title: 'Đã cập nhật', message: 'Thông tin file đã được lưu.' }); setOpen(false); onDone(); } catch (err: any) { toast({ variant: 'error', title: 'Lỗi', message: err.message }); } };
  return <Dialog open={open} onOpenChange={setOpen} title="Sửa thông tin file" description="Đổi tên, danh mục, module, phạm vi chia sẻ." className="sm:max-w-[620px]"><form onSubmit={submit} className="space-y-4"><Input name="displayName" defaultValue={file.displayName || file.originalName} /><Textarea name="description" defaultValue={file.description || ''} /><div className="grid gap-3 md:grid-cols-3"><Select name="category" defaultValue={file.category || FILE_CATEGORIES[0]}>{FILE_CATEGORIES.map(x => <option key={x}>{x}</option>)}</Select><Select name="relatedModule" defaultValue={file.relatedModule || RELATED_MODULES[0]}>{RELATED_MODULES.map(x => <option key={x}>{x}</option>)}</Select><Select name="visibility" defaultValue={file.visibility || STORAGE_SCOPE.PRIVATE}>{Object.entries(STORAGE_SCOPE).map(([_, v]) => <option key={v} value={v}>{v}</option>)}</Select></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button><Button>Lưu</Button></div></form></Dialog>;
}

'use server';

import { db, schema } from '@/src/libs/server/db';
import { getCurrentActor, writeAuditLog } from '@/src/libs/server/auth-helper';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { canArchiveFile, canDeleteFile, canEditFile, canPermanentlyDeleteFile, canRestoreBackup, canRestoreFile, canUploadFile, canViewFile } from './storage.permissions';
import { FILE_CATEGORIES, RELATED_MODULES, STORAGE_SCOPE } from './storage.constants';

const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads');
const SAFE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'png', 'jpg', 'jpeg', 'webp', 'txt', 'zip'];
const DANGEROUS_EXTENSIONS = ['exe', 'bat', 'cmd', 'sh', 'msi', 'js'];
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_ZIP_BYTES = 50 * 1024 * 1024;

async function ensureUploadDir() {
  try { await fs.access(UPLOAD_DIR); } catch { await fs.mkdir(UPLOAD_DIR, { recursive: true }); }
}

const sampleFiles = [
  ['Mẫu import tuyển sinh.xlsx', 'Tuyển sinh', 'Tuyển sinh & CRM', 'SCHOOL_WIDE', 'ACTIVE', 742000, 42],
  ['Phiếu đăng ký nhập học.docx', 'Biểu mẫu', 'Tuyển sinh & CRM', 'SCHOOL_WIDE', 'ACTIVE', 288000, 31],
  ['Quy trình phê duyệt nội bộ.pdf', 'Quy trình', 'Phê duyệt', 'ADMIN_ONLY', 'ACTIVE', 1142000, 27],
  ['Báo cáo KPI tháng mẫu.xlsx', 'Báo cáo', 'Báo cáo', 'DEPARTMENT', 'ACTIVE', 970000, 18],
  ['Danh sách hồ sơ học sinh mẫu.xlsx', 'Học sinh', 'Hồ sơ Học sinh 360', 'DEPARTMENT', 'ACTIVE', 1324000, 22],
  ['Biểu mẫu đề xuất mua sắm.docx', 'CSVC', 'CSVC & Thiết bị', 'SCHOOL_WIDE', 'ACTIVE', 344000, 15],
  ['Hướng dẫn sử dụng MIS SMART PORTAL.pdf', 'Tài liệu hệ thống', 'Cấu hình hệ thống', 'SCHOOL_WIDE', 'ACTIVE', 2412000, 83],
  ['Thông báo phân công trực hè.pdf', 'Văn bản điều hành', 'Thông báo nội bộ', 'SCHOOL_WIDE', 'ARCHIVED', 520000, 39],
  ['Mẫu import nhân sự.xlsx', 'Nhân sự', 'Quản trị Nhân sự HRM', 'ADMIN_ONLY', 'ACTIVE', 612000, 11],
  ['Checklist kiểm tra CSVC.pdf', 'CSVC', 'CSVC & Thiết bị', 'DEPARTMENT', 'ACTIVE', 460000, 26],
  ['Danh sách thiết bị phòng học.xlsx', 'CSVC', 'CSVC & Thiết bị', 'DEPARTMENT', 'DELETED', 1550000, 9],
  ['Quy định sử dụng hệ thống.pdf', 'Tài liệu hệ thống', 'Cấu hình hệ thống', 'SCHOOL_WIDE', 'ACTIVE', 880000, 64],
];

async function seedStorageIfEmpty(actorId: string) {
  const count = await db.select({ value: sql<number>`count(*)` }).from(schema.dataFiles);
  if (Number(count[0]?.value || 0) > 0) return;
  const now = Date.now();
  await db.insert(schema.dataFiles).values(sampleFiles.map((f, i) => {
    const ext = String(f[0]).split('.').pop() || 'pdf';
    const id = `seed_file_${i + 1}`;
    const createdAt = new Date(now - i * 86400000);
    return {
      id,
      fileName: `${id}.${ext}`,
      originalName: String(f[0]),
      displayName: String(f[0]),
      description: `Tài liệu mẫu phục vụ vận hành module ${f[2]}.`,
      fileUrl: `/uploads/${id}.${ext}`,
      fileType: ext === 'pdf' ? 'application/pdf' : ext.includes('xls') ? 'application/vnd.ms-excel' : 'application/octet-stream',
      extension: ext,
      fileSize: Number(f[5]),
      category: String(f[1]),
      relatedModule: String(f[2]),
      visibility: String(f[3]),
      departmentId: String(f[3]) === 'DEPARTMENT' ? 'hanh-chinh' : null,
      uploadedBy: actorId,
      status: String(f[4]),
      downloadCount: Number(f[6]),
      version: 1,
      createdAt,
      updatedAt: createdAt,
      deletedAt: String(f[4]) === 'DELETED' ? new Date(now - 2 * 86400000) : null,
    } as any;
  }));
}

export async function getStorageStats() {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');
  await seedStorageIfEmpty(actor.id);
  const files = (await db.query.dataFiles.findMany()).filter(f => canViewFile(actor, f));
  const active = files.filter(f => f.status !== 'DELETED');
  const size = active.reduce((s, f) => s + (Number(f.fileSize) || 0), 0);
  const monthAgo = Date.now() - 30 * 86400000;
  return {
    totalDocuments: active.length,
    usedStorage: size,
    storageLimit: 5 * 1024 * 1024 * 1024,
    filesThisMonth: active.filter(f => new Date(String(f.createdAt)).getTime() >= monthAgo).length,
    schoolWideFiles: active.filter(f => ['SCHOOL', 'SCHOOL_WIDE'].includes(String(f.visibility))).length,
    recentImportExport: 12,
    latestBackup: '17/06/2026 23:00',
  };
}

export async function getFiles(includeDeleted = false) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');
  await seedStorageIfEmpty(actor.id);
  const where = includeDeleted ? undefined : inArray(schema.dataFiles.status, ['ACTIVE', 'ARCHIVED']);
  const files = await db.query.dataFiles.findMany({ where, orderBy: [desc(schema.dataFiles.createdAt)] });
  const users = await db.select().from(schema.users);
  const userMap = new Map(users.map(u => [u.id, u.name]));
  return files.filter(f => canViewFile(actor, f)).map(f => ({ ...f, uploadedByName: userMap.get(f.uploadedBy || '') || 'Hệ thống' }));
}

export async function getImportExportJobs() {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');
  const imports = await db.query.dataImportJobs.findMany({ orderBy: [desc(schema.dataImportJobs.createdAt)], limit: 50 });
  const exports = await db.query.dataExportJobs.findMany({ orderBy: [desc(schema.dataExportJobs.createdAt)], limit: 50 });
  return [
    ...imports.map(j => {
      const summary = j.errorSummary as any;
      const errorFileId = summary?.errorFileId || summary?.fileId || null;
      return {
        ...j,
        type: 'IMPORT',
        fileName: summary?.fileName || 'Import dữ liệu.xlsx',
        performedByName: summary?.performedByName || 'Hệ thống',
        errorRows: j.failedRows,
        errorSummary: summary?.message || summary?.summary || (j.failedRows ? `${j.failedRows} dòng lỗi. Xem log chi tiết nếu job đã lưu.` : ''),
        errorFileUrl: errorFileId ? `/api/storage/files/${errorFileId}` : (summary?.errorFileUrl || null),
      };
    }),
    ...exports.map(j => {
      const filters = j.filters as any;
      return {
        ...j,
        type: 'EXPORT',
        fileName: filters?.fileName || 'Export dữ liệu.csv',
        totalRows: filters?.totalRows || 0,
        successRows: filters?.successRows || 0,
        errorRows: 0,
        performedByName: filters?.performedByName || 'Hệ thống',
        errorSummary: '',
        errorFileUrl: j.fileId ? `/api/storage/files/${j.fileId}` : null,
      };
    }),
  ];
}

export async function createImportErrorFile(input: { jobId: string; module: string; fileName?: string; rows: Array<Record<string, unknown>> }) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');
  if (!input.rows.length) throw new Error('Không có dòng lỗi để ghi file');

  await ensureUploadDir();
  const id = `import_error_${Math.random().toString(36).slice(2, 9)}`;
  const diskFileName = `${id}.csv`;
  const headers = Array.from(new Set(input.rows.flatMap(row => Object.keys(row))));
  const escapeCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...input.rows.map(row => headers.map(key => escapeCell(row[key])).join(','))].join('\n');
  await fs.writeFile(path.join(UPLOAD_DIR, diskFileName), Buffer.from(`\uFEFF${csv}`, 'utf8'));

  await db.insert(schema.dataFiles).values({
    id,
    fileName: diskFileName,
    originalName: input.fileName || `${input.jobId}-errors.csv`,
    displayName: input.fileName || `${input.module} import errors`,
    description: `File lỗi import cho job ${input.jobId}`,
    fileUrl: `/api/storage/files/${id}`,
    fileType: 'text/csv; charset=utf-8',
    extension: 'csv',
    fileSize: Buffer.byteLength(`\uFEFF${csv}`, 'utf8'),
    category: 'Import/Export',
    relatedModule: input.module,
    visibility: 'ADMIN_ONLY',
    departmentId: actor.departmentId,
    uploadedBy: actor.id,
    status: 'ACTIVE',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.update(schema.dataImportJobs).set({
    failedRows: input.rows.length,
    errorSummary: { message: `${input.rows.length} dòng lỗi`, errorFileId: id, fileName: input.fileName || `${input.jobId}-errors.csv` },
    updatedAt: new Date(),
  }).where(eq(schema.dataImportJobs.id, input.jobId));

  await writeAuditLog(actor.id, 'CREATE_IMPORT_ERROR_FILE', 'DATA_IMPORT_JOB', input.jobId, { errorFileId: id, failedRows: input.rows.length });
  return { success: true, fileId: id, errorFileUrl: `/api/storage/files/${id}` };
}

export async function getBackupJobs() {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');
  return [
    { id: 'backup_1', type: 'SCHEDULED', scope: 'FULL', status: 'COMPLETED', fileSize: 324000000, createdByName: 'System', startedAt: '2026-06-17T23:00:00.000Z', completedAt: '2026-06-17T23:07:00.000Z' },
    { id: 'backup_2', type: 'MANUAL', scope: 'DATABASE', status: 'COMPLETED', fileSize: 92000000, createdByName: 'Admin', startedAt: '2026-06-15T21:00:00.000Z', completedAt: '2026-06-15T21:02:00.000Z' },
    { id: 'backup_3', type: 'SCHEDULED', scope: 'FILES', status: 'FAILED', fileSize: 0, createdByName: 'System', startedAt: '2026-06-14T23:00:00.000Z', completedAt: '2026-06-14T23:01:00.000Z', errorMessage: 'Chưa kết nối backup thật' },
  ];
}

export async function getStorageActivityLogs() {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');
  const logs = await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt)).limit(12);
  if (logs.length) return logs;
  return ['Nguyễn Văn A đã tải lên Mẫu import tuyển sinh.xlsx', 'Trần Thị B đã tải xuống Quy trình phê duyệt.pdf', 'Admin đã tạo backup hệ thống', 'Lê Văn C đã xóa mềm Biểu mẫu cũ.docx', 'Nguyễn Văn A đã cập nhật phiên bản file'].map((title, i) => ({ id: `act_${i}`, action: title, entityType: 'DATA_FILE', entityId: '-', metadata: { actor: { name: title.split(' đã ')[0] } }, createdAt: new Date(Date.now() - i * 2700000) }));
}

export async function checkDuplicateFileName(name: string) {
  const files = await db.query.dataFiles.findMany({ where: eq(schema.dataFiles.originalName, name) });
  return { exists: files.length > 0 };
}

export async function uploadStorageFile(formData: FormData) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');
  const file = formData.get('file') as File;
  const displayName = String(formData.get('displayName') || '').trim();
  const category = String(formData.get('category') || '');
  const relatedModule = String(formData.get('relatedModule') || 'Khác');
  const visibility = String(formData.get('visibility') || STORAGE_SCOPE.PRIVATE);
  const conflictMode = String(formData.get('conflictMode') || 'version');
  if (!file || file.size === 0) throw new Error('Không cho upload file rỗng');
  if (!displayName) throw new Error('Tên tài liệu không được để trống');
  if (!category) throw new Error('Phải chọn danh mục');
  if (!visibility) throw new Error('Phải chọn phạm vi chia sẻ');
  const ext = path.extname(file.name).replace('.', '').toLowerCase();
  if (DANGEROUS_EXTENSIONS.includes(ext) || !SAFE_EXTENSIONS.includes(ext)) throw new Error(`Định dạng .${ext} không được phép`);
  const limit = ext === 'zip' ? MAX_ZIP_BYTES : ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? MAX_IMAGE_BYTES : MAX_BYTES;
  if (file.size > limit) throw new Error('Dung lượng file vượt quá giới hạn cho phép');
  if (!canUploadFile(actor, visibility, actor.departmentId)) throw new Error('Bạn không có quyền tải lên file với phạm vi này');
  const duplicates = await db.query.dataFiles.findMany({ where: eq(schema.dataFiles.originalName, file.name) });
  if (duplicates.length && conflictMode === 'cancel') throw new Error('Tên file đã tồn tại');
  await ensureUploadDir();
  const id = `file_${Math.random().toString(36).slice(2, 9)}`;
  const diskFileName = `${id}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, diskFileName), Buffer.from(await file.arrayBuffer()));
  const now = new Date();
  await db.insert(schema.dataFiles).values({ id, fileName: diskFileName, originalName: file.name, displayName, description: String(formData.get('description') || ''), category, relatedModule, fileUrl: `/api/storage/files/${id}`, fileType: file.type || 'application/octet-stream', extension: ext, fileSize: file.size, visibility, departmentId: actor.departmentId, uploadedBy: actor.id, status: 'ACTIVE', version: duplicates.length && conflictMode === 'version' ? duplicates.length + 1 : 1, createdAt: now, updatedAt: now });
  await writeAuditLog(actor.id, 'UPLOAD_FILE', 'DATA_FILE', id, { fileName: file.name, displayName });
  revalidatePath('/[locale]/(admin)/system-data/storage', 'page');
  return { success: true, id };
}

export async function updateStorageFile(id: string, data: any) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');
  const file = await db.query.dataFiles.findFirst({ where: eq(schema.dataFiles.id, id) });
  if (!file) throw new Error('Not found');
  if (!canEditFile(actor, file)) throw new Error('Bạn không có quyền sửa file này');
  await db.update(schema.dataFiles).set({ ...data, updatedAt: new Date() }).where(eq(schema.dataFiles.id, id));
  await writeAuditLog(actor.id, 'UPDATE_FILE', 'DATA_FILE', id, { displayName: data.displayName || file.displayName });
  revalidatePath('/[locale]/(admin)/system-data/storage', 'page');
  return { success: true };
}

export async function archiveStorageFile(id: string) { return setStatus(id, 'ARCHIVED', 'ARCHIVE_FILE'); }
export async function restoreStorageFile(id: string) { return setStatus(id, 'ACTIVE', 'RESTORE_FILE'); }
export async function deleteFile(id: string) { return setStatus(id, 'DELETED', 'DELETE_FILE'); }

async function setStatus(id: string, status: string, action: string) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');
  const file = await db.query.dataFiles.findFirst({ where: eq(schema.dataFiles.id, id) });
  if (!file) throw new Error('Not found');
  if (status === 'ARCHIVED' && !canArchiveFile(actor, file)) throw new Error('Bạn không có quyền lưu trữ file này');
  if (status === 'DELETED' && !canDeleteFile(actor, file)) throw new Error('Bạn không có quyền xóa file này');
  if (status === 'ACTIVE' && !canRestoreFile(actor, file)) throw new Error('Bạn không có quyền khôi phục file này');
  await db.update(schema.dataFiles).set({ status, deletedAt: status === 'DELETED' ? new Date() : null, archivedAt: status === 'ARCHIVED' ? new Date() : null, updatedAt: new Date() }).where(eq(schema.dataFiles.id, id));
  await writeAuditLog(actor.id, action, 'DATA_FILE', id, { fileName: file.fileName });
  revalidatePath('/[locale]/(admin)/system-data/storage', 'page');
  return { success: true };
}

export async function permanentlyDeleteStorageFile(id: string) {
  const actor = await getCurrentActor();
  if (!actor || !canPermanentlyDeleteFile(actor)) throw new Error('Chỉ Admin mới được xóa vĩnh viễn');
  const file = await db.query.dataFiles.findFirst({ where: eq(schema.dataFiles.id, id) });
  if (!file) throw new Error('Not found');
  try { await fs.unlink(path.join(UPLOAD_DIR, file.fileName)); } catch {}
  await db.delete(schema.dataFiles).where(eq(schema.dataFiles.id, id));
  await writeAuditLog(actor.id, 'PERMANENT_DELETE_FILE', 'DATA_FILE', id, { fileName: file.fileName });
  revalidatePath('/[locale]/(admin)/system-data/storage', 'page');
  return { success: true };
}

export async function downloadStorageFileAction(id: string) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');
  const file = await db.query.dataFiles.findFirst({ where: eq(schema.dataFiles.id, id) });
  if (!file || !canViewFile(actor, file)) throw new Error('Unauthorized');
  await db.update(schema.dataFiles).set({ downloadCount: sql`${schema.dataFiles.downloadCount} + 1` }).where(eq(schema.dataFiles.id, id));
  await writeAuditLog(actor.id, 'DOWNLOAD_FILE', 'DATA_FILE', id, { fileName: file.fileName });
  return { success: true, url: `/api/storage/files/${id}`, name: file.originalName };
}

export async function createSystemBackup() {
  const actor = await getCurrentActor();
  if (!actor || actor.role !== 'ADMIN') throw new Error('Chỉ Admin mới có quyền thực hiện sao lưu.');
  await writeAuditLog(actor.id, 'CREATE_BACKUP', 'SYSTEM', `backup_${Date.now()}`, { warning: 'Chưa kết nối backup thật' });
  return { success: true, warning: 'Chưa kết nối backup thật. Đây là thao tác mô phỏng UI/service.' };
}

export async function restoreBackupJob(id: string) {
  const actor = await getCurrentActor();
  if (!actor || !canRestoreBackup(actor)) throw new Error('Chỉ Admin hệ thống được restore backup');
  await writeAuditLog(actor.id, 'RESTORE_BACKUP', 'SYSTEM', id, { warning: 'Chưa kết nối backup thật' });
  return { success: true, warning: 'Chưa kết nối backup thật. Chưa restore dữ liệu thật.' };
}

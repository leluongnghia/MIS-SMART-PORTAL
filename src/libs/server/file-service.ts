import fs from 'fs/promises';
import path from 'path';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db, schema } from './db';
import { canArchiveFile, canDeleteFile, canEditFile, canPermanentlyDeleteFile, canRestoreFile, canUploadFile, canViewFile, getCurrentActor, writeAuditLog, type Actor } from './auth-helper';
import { createNotification } from './notification-center';

export type StorageProvider = 'LOCAL' | 'DATABASE' | 'S3' | 'R2' | 'SUPABASE' | 'MOCK';
export type FileModule = 'TASKS' | 'ADMISSIONS' | 'STUDENTS' | 'FACILITIES' | 'SETTINGS' | 'REPORTS' | 'APPROVALS' | 'SYSTEM';
export type FileVisibility = 'PRIVATE' | 'MODULE' | 'DEPARTMENT' | 'SCHOOL' | 'SCHOOL_WIDE' | 'PUBLIC' | 'ADMIN_ONLY';
export type FileStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED';

const APP_URL = process.env.APP_URL || '';
const DEFAULT_STORAGE_PROVIDER = (process.env.STORAGE_PROVIDER as StorageProvider) || 'LOCAL';

const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads');
const SAFE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'png', 'jpg', 'jpeg', 'webp', 'txt', 'zip'];
const DANGEROUS_EXTENSIONS = ['exe', 'bat', 'cmd', 'sh', 'msi', 'js', 'jsx', 'ts', 'tsx', 'php', 'asp', 'aspx', 'jar', 'ps1'];
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_ZIP_BYTES = 50 * 1024 * 1024;

export interface FileListFilters { module?: string; entityType?: string; entityId?: string; status?: string; visibility?: string; q?: string; includeDeleted?: boolean; page?: number; pageSize?: number; }
export interface AttachInput { module: FileModule; entityType?: string | null; entityId?: string | null; entityLabel?: string | null; }

function id(prefix = 'file') { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
async function ensureUploadDir() { try { await fs.access(UPLOAD_DIR); } catch { await fs.mkdir(UPLOAD_DIR, { recursive: true }); } }
function extOf(name: string) { return path.extname(name).replace('.', '').toLowerCase(); }
function normalizeModule(value?: string | null): FileModule {
  const v = String(value || '').toUpperCase();
  if (['TASKS','ADMISSIONS','STUDENTS','FACILITIES','SETTINGS','REPORTS','APPROVALS','SYSTEM'].includes(v)) return v as FileModule;
  const raw = String(value || '').toLowerCase();
  if (raw.includes('tuyển')) return 'ADMISSIONS'; if (raw.includes('học sinh')) return 'STUDENTS'; if (raw.includes('csvc') || raw.includes('thiết')) return 'FACILITIES'; if (raw.includes('báo cáo')) return 'REPORTS'; if (raw.includes('phê duyệt')) return 'APPROVALS'; if (raw.includes('cấu hình')) return 'SETTINGS'; return 'SYSTEM';
}
function validateUpload(file: File) {
  if (!file || file.size === 0) throw new Error('Không cho upload file rỗng');
  const ext = extOf(file.name);
  if (DANGEROUS_EXTENSIONS.includes(ext) || !SAFE_EXTENSIONS.includes(ext)) throw new Error(`Định dạng .${ext} không được phép`);
  const limit = ext === 'zip' ? MAX_ZIP_BYTES : ['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? MAX_IMAGE_BYTES : MAX_BYTES;
  if (file.size > limit) throw new Error('Dung lượng file vượt quá giới hạn cho phép');
  return ext;
}
function publicFile(file: any) {
  const previewUrl = `${APP_URL}/api/storage/files/${file.id}/preview`;
  const downloadUrl = `${APP_URL}/api/storage/files/${file.id}/download`;

  return { 
    ...file, 
    mimeType: file.mimeType || file.fileType, 
    storageProvider: file.storageProvider || 'LOCAL', 
    storageKey: file.storageKey || file.fileName, 
    module: file.module || normalizeModule(file.relatedModule), 
    url: previewUrl,
    previewUrl,
    downloadUrl
  };
}

export function canAccessFile(actor: Actor, file: any, action: 'view' | 'download' | 'edit' | 'delete' | 'archive' | 'restore' | 'permanentDelete') {
  if (action === 'view' || action === 'download') return canViewFile(actor, file);
  if (action === 'edit') return canEditFile(actor, file);
  if (action === 'archive') return canArchiveFile(actor, file);
  if (action === 'delete') return canDeleteFile(actor, file);
  if (action === 'restore') return canRestoreFile(actor, file);
  if (action === 'permanentDelete') return canPermanentlyDeleteFile(actor);
  return false;
}

export async function listFiles(filters: FileListFilters = {}) {
  const actor = await getCurrentActor(); if (!actor) throw new Error('Unauthorized');
  const clauses: any[] = [];
  if (!filters.includeDeleted) clauses.push(inArray(schema.dataFiles.status, ['ACTIVE', 'ARCHIVED']));
  if (filters.status && filters.status !== 'ALL') clauses.push(eq(schema.dataFiles.status, filters.status));
  if (filters.module && filters.module !== 'ALL') clauses.push(eq(schema.dataFiles.module, filters.module));
  if (filters.visibility && filters.visibility !== 'ALL') clauses.push(eq(schema.dataFiles.visibility, filters.visibility));
  if (filters.entityType) clauses.push(eq(schema.dataFiles.entityType, filters.entityType));
  if (filters.entityId) clauses.push(eq(schema.dataFiles.entityId, filters.entityId));
  const rows = await db.query.dataFiles.findMany({ where: clauses.length ? and(...clauses) : undefined, orderBy: [desc(schema.dataFiles.createdAt)] });
  let visible = rows.filter(f => canViewFile(actor, f));
  if (filters.q) { const q = filters.q.toLowerCase(); visible = visible.filter(f => `${f.displayName || ''} ${f.originalName} ${f.category || ''} ${f.entityLabel || ''}`.toLowerCase().includes(q)); }
  const page = Math.max(1, Number(filters.page || 1)); const pageSize = Math.min(100, Math.max(5, Number(filters.pageSize || 50)));
  return { items: visible.slice((page - 1) * pageSize, page * pageSize).map(publicFile), total: visible.length, page, pageSize };
}

export async function getFileById(fileId: string, actorOverride?: Actor | null) {
  const actor = actorOverride ?? await getCurrentActor(); if (!actor) throw new Error('Unauthorized');
  const file = await db.query.dataFiles.findFirst({ where: eq(schema.dataFiles.id, fileId) });
  if (!file || !canViewFile(actor, file)) throw new Error('Not found');
  return publicFile(file);
}

export async function uploadFileToStorage(formData: FormData, actorOverride?: Actor | null) {
  const actor = actorOverride ?? await getCurrentActor(); if (!actor) throw new Error('Unauthorized');
  const file = formData.get('file') as File;
  const ext = validateUpload(file);
  const displayName = String(formData.get('displayName') || formData.get('entityLabel') || file.name).trim();
  const visibility = String(formData.get('visibility') || 'PRIVATE') as FileVisibility;
  const module = normalizeModule(String(formData.get('module') || formData.get('relatedModule') || 'SYSTEM'));
  const entityType = String(formData.get('entityType') || '') || null;
  const entityId = String(formData.get('entityId') || '') || null;
  const entityLabel = String(formData.get('entityLabel') || '') || null;
  const conflictMode = String(formData.get('conflictMode') || 'version');
  if (!canUploadFile(actor, visibility, actor.departmentId)) throw new Error('Bạn không có quyền tải lên file với phạm vi này');
  const duplicates = await db.query.dataFiles.findMany({ where: eq(schema.dataFiles.originalName, file.name) });
  if (duplicates.length && conflictMode === 'cancel') throw new Error('Tên file đã tồn tại');
  await ensureUploadDir();
  const provider = DEFAULT_STORAGE_PROVIDER;
  const now = new Date();
  
  const fileId = id('file');
  let diskFileName = '';
  let fileSize = file.size;

  if (provider === 'MOCK') {
    diskFileName = `mock_${fileId}.${ext}`;
    // Log instead of actual write
    console.log(`[MOCK STORAGE] Would write ${diskFileName} to ${UPLOAD_DIR}`);
  } else {
    diskFileName = `${fileId}.${ext}`;
    await ensureUploadDir();
    await fs.writeFile(path.join(UPLOAD_DIR, diskFileName), Buffer.from(await file.arrayBuffer()));
  }

  const row = { id: fileId, fileName: diskFileName, originalName: file.name, displayName, description: String(formData.get('description') || ''), fileUrl: `${APP_URL}/api/storage/files/${fileId}/preview`, fileType: file.type || 'application/octet-stream', mimeType: file.type || 'application/octet-stream', extension: ext, fileSize, storageProvider: provider, storageKey: diskFileName, module, entityType, entityId, entityLabel, documentType: String(formData.get('documentType') || '') || null, category: String(formData.get('category') || module), relatedModule: String(formData.get('relatedModule') || module), tags: String(formData.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean), visibility, departmentId: actor.departmentId, version: duplicates.length && conflictMode === 'version' ? duplicates.length + 1 : 1, parentFileId: String(formData.get('parentFileId') || '') || null, uploadedBy: actor.id, uploadedByName: actor.name, status: 'ACTIVE', downloadCount: 0, metadata: {}, createdAt: now, updatedAt: now } as any;
  await db.insert(schema.dataFiles).values(row);
  await writeAuditLog(actor.id, 'UPLOAD_FILE', 'DATA_FILE', fileId, { fileName: file.name, module, entityType, entityId, provider });
  await createNotification({ title: 'File mới được tải lên', message: displayName, module: 'STORAGE', type: 'FILE_UPLOADED', severity: 'INFO', targetUrl: '/system-data/storage', sourceType: 'DATA_FILE', sourceId: fileId, scopeType: visibility === 'PRIVATE' ? 'USER' : visibility === 'DEPARTMENT' || visibility === 'MODULE' ? 'DEPARTMENT' : 'SCHOOL', scopeId: visibility === 'PRIVATE' ? actor.id : visibility === 'DEPARTMENT' || visibility === 'MODULE' ? actor.departmentId : null, payload: { module, entityType, entityId } }, actor).catch(() => null);
  return publicFile(row);
}

export async function updateFileMetadata(fileId: string, patch: any) {
  const actor = await getCurrentActor(); if (!actor) throw new Error('Unauthorized');
  const file = await db.query.dataFiles.findFirst({ where: eq(schema.dataFiles.id, fileId) });
  if (!file) throw new Error('Not found');
  if (!canEditFile(actor, file)) throw new Error('Bạn không có quyền sửa file này');
  const allowed = ['displayName','description','category','relatedModule','documentType','tags','visibility','module','entityType','entityId','entityLabel','metadata'];
  const data = Object.fromEntries(Object.entries(patch).filter(([k]) => allowed.includes(k)));
  if (data.module) data.module = normalizeModule(String(data.module));
  await db.update(schema.dataFiles).set({ ...data, updatedAt: new Date() }).where(eq(schema.dataFiles.id, fileId));
  await writeAuditLog(actor.id, 'UPDATE_FILE_METADATA', 'DATA_FILE', fileId, { patch: data });
  return getFileById(fileId, actor);
}

export async function attachFileToEntity(fileId: string, input: AttachInput) {
  const actor = await getCurrentActor(); if (!actor) throw new Error('Unauthorized');
  const updated = await updateFileMetadata(fileId, { module: input.module, entityType: input.entityType, entityId: input.entityId, entityLabel: input.entityLabel });
  await writeAuditLog(actor.id, 'ATTACH_FILE_TO_ENTITY', 'DATA_FILE', fileId, input as any);
  await createNotification({ title: 'File được gắn vào hồ sơ', message: updated.displayName || updated.originalName, module: 'STORAGE', type: 'FILE_SHARED', targetUrl: '/system-data/storage', sourceType: 'DATA_FILE', sourceId: fileId, scopeType: 'SCHOOL', payload: input as any }, actor).catch(() => null);
  return updated;
}

export async function setFileStatus(fileId: string, status: FileStatus, action: string) {
  const actor = await getCurrentActor(); if (!actor) throw new Error('Unauthorized');
  const file = await db.query.dataFiles.findFirst({ where: eq(schema.dataFiles.id, fileId) });
  if (!file) throw new Error('Not found');
  if (status === 'ARCHIVED' && !canArchiveFile(actor, file)) throw new Error('Bạn không có quyền lưu trữ file này');
  if (status === 'DELETED' && !canDeleteFile(actor, file)) throw new Error('Bạn không có quyền xóa file này');
  if (status === 'ACTIVE' && !canRestoreFile(actor, file)) throw new Error('Bạn không có quyền khôi phục file này');
  await db.update(schema.dataFiles).set({ status, deletedAt: status === 'DELETED' ? new Date() : null, deletedBy: status === 'DELETED' ? actor.id : null, archivedAt: status === 'ARCHIVED' ? new Date() : null, updatedAt: new Date() }).where(eq(schema.dataFiles.id, fileId));
  await writeAuditLog(actor.id, action, 'DATA_FILE', fileId, { fileName: file.fileName, status });
  return { success: true };
}
export async function archiveFile(fileId: string) { return setFileStatus(fileId, 'ARCHIVED', 'ARCHIVE_FILE'); }
export async function softDeleteFile(fileId: string) { return setFileStatus(fileId, 'DELETED', 'DELETE_FILE'); }
export async function restoreFile(fileId: string) { return setFileStatus(fileId, 'ACTIVE', 'RESTORE_FILE'); }

export async function permanentlyDeleteFile(fileId: string) {
  const actor = await getCurrentActor(); if (!actor || !canPermanentlyDeleteFile(actor)) throw new Error('Chỉ Admin mới được xóa vĩnh viễn');
  const file = await db.query.dataFiles.findFirst({ where: eq(schema.dataFiles.id, fileId) }); if (!file) throw new Error('Not found');
  try { 
    if (file.storageProvider !== 'MOCK') {
      await fs.unlink(path.join(UPLOAD_DIR, file.storageKey || file.fileName)); 
    }
  } catch {}
  await db.delete(schema.dataFiles).where(eq(schema.dataFiles.id, fileId));
  await writeAuditLog(actor.id, 'PERMANENT_DELETE_FILE', 'DATA_FILE', fileId, { fileName: file.fileName });
  return { success: true };
}

export async function recordFileDownload(fileId: string) {
  const actor = await getCurrentActor(); if (!actor) throw new Error('Unauthorized');
  const file = await db.query.dataFiles.findFirst({ where: eq(schema.dataFiles.id, fileId) });
  if (!file || file.status === 'DELETED' || !canViewFile(actor, file)) throw new Error('Not found');
  await db.update(schema.dataFiles).set({ downloadCount: sql`${schema.dataFiles.downloadCount} + 1`, updatedAt: new Date() }).where(eq(schema.dataFiles.id, fileId));
  await writeAuditLog(actor.id, 'DOWNLOAD_FILE', 'DATA_FILE', fileId, { fileName: file.fileName });
  return publicFile(file);
}

export function getProtectedUploadPath(file: any) { return path.join(UPLOAD_DIR, file.storageKey || file.fileName); }

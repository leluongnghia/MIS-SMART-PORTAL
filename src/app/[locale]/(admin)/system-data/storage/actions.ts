'use server';

import { db, schema } from '@/src/libs/server/db';
import { getCurrentActor, canViewFile, canUploadFile, canDeleteFile, canEditFile, canArchiveFile, canRestoreFile, canPermanentlyDeleteFile, writeAuditLog } from '@/src/libs/server/auth-helper';
import { eq, desc, inArray, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function getFiles() {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  const files = await db.query.dataFiles.findMany({
    where: inArray(schema.dataFiles.status, ['ACTIVE', 'ARCHIVED']),
    orderBy: [desc(schema.dataFiles.createdAt)],
  });

  // Filter based on permissions
  return files.filter(f => canViewFile(actor, f));
}

export async function getImportJobs() {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  const jobs = await db.query.dataImportJobs.findMany({
    orderBy: [desc(schema.dataImportJobs.createdAt)],
    limit: 50,
  });

  return jobs;
}

export async function uploadStorageFile(formData: FormData) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  const file = formData.get('file') as File;
  const displayName = formData.get('displayName') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const relatedModule = formData.get('relatedModule') as string;
  const visibility = formData.get('visibility') as string;

  if (!file) throw new Error('Không có file tải lên');
  if (!displayName) throw new Error('Tên tài liệu không được để trống');
  if (!category) throw new Error('Vui lòng chọn danh mục');
  if (!visibility) throw new Error('Vui lòng chọn phạm vi chia sẻ');

  const departmentId = actor.departmentId || undefined;

  if (!canUploadFile(actor, visibility, departmentId)) {
    throw new Error('Bạn không có quyền tải lên file với mức hiển thị này.');
  }

  await ensureUploadDir();

  const fileExtension = path.extname(file.name);
  const id = `file_${Math.random().toString(36).substring(2, 9)}`;
  const diskFileName = `${id}${fileExtension}`;
  const filePath = path.join(UPLOAD_DIR, diskFileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const now = new Date();

  await db.insert(schema.dataFiles).values({
    id,
    fileName: diskFileName,
    originalName: file.name,
    displayName,
    description,
    category,
    relatedModule,
    fileUrl: `/uploads/${diskFileName}`,
    fileType: file.type || 'application/octet-stream',
    extension: fileExtension.replace('.', ''),
    fileSize: file.size,
    visibility: visibility,
    departmentId: departmentId || null,
    uploadedBy: actor.id,
    status: 'ACTIVE',
    version: 1,
    createdAt: now,
    updatedAt: now,
  });

  await writeAuditLog(actor.id, 'UPLOAD_FILE', 'DATA_FILE', id, { fileName: file.name, displayName });

  revalidatePath('/[locale]/(admin)/system-data/storage', 'page');
  return { success: true, id };
}

export async function updateStorageFile(id: string, data: {
  displayName?: string;
  description?: string;
  category?: string;
  relatedModule?: string;
  visibility?: string;
}) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  const file = await db.query.dataFiles.findFirst({
    where: eq(schema.dataFiles.id, id)
  });

  if (!file) throw new Error('Not found');
  if (!canEditFile(actor, file as any)) throw new Error('Bạn không có quyền sửa file này');

  await db.update(schema.dataFiles).set({
    ...data,
    updatedAt: new Date()
  }).where(eq(schema.dataFiles.id, id));

  await writeAuditLog(actor.id, 'UPDATE_FILE', 'DATA_FILE', id, { displayName: data.displayName || file.displayName });
  revalidatePath('/[locale]/(admin)/system-data/storage', 'page');
  return { success: true };
}

export async function archiveStorageFile(id: string) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  const file = await db.query.dataFiles.findFirst({
    where: eq(schema.dataFiles.id, id)
  });

  if (!file) throw new Error('Not found');
  if (!canArchiveFile(actor, file as any)) throw new Error('Bạn không có quyền lưu trữ file này');

  await db.update(schema.dataFiles).set({
    status: 'ARCHIVED',
    archivedAt: new Date(),
    updatedAt: new Date()
  }).where(eq(schema.dataFiles.id, id));

  await writeAuditLog(actor.id, 'ARCHIVE_FILE', 'DATA_FILE', id, { fileName: file.fileName });
  revalidatePath('/[locale]/(admin)/system-data/storage', 'page');
  return { success: true };
}

export async function deleteFile(id: string) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  const file = await db.query.dataFiles.findFirst({
    where: eq(schema.dataFiles.id, id)
  });

  if (!file) throw new Error('Not found');

  if (!canDeleteFile(actor, file)) {
    throw new Error('Bạn không có quyền xóa file này.');
  }

  await db.update(schema.dataFiles).set({
    status: 'DELETED',
    deletedAt: new Date()
  }).where(eq(schema.dataFiles.id, id));

  await writeAuditLog(actor.id, 'DELETE_FILE', 'DATA_FILE', id, { fileName: file.fileName });

  revalidatePath('/[locale]/(admin)/system-data/storage', 'page');
  return { success: true };
}

export async function restoreStorageFile(id: string) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  const file = await db.query.dataFiles.findFirst({
    where: eq(schema.dataFiles.id, id)
  });

  if (!file) throw new Error('Not found');
  if (!canRestoreFile(actor, file)) throw new Error('Bạn không có quyền khôi phục file này');

  await db.update(schema.dataFiles).set({
    status: 'ACTIVE',
    deletedAt: null,
    archivedAt: null,
    updatedAt: new Date()
  }).where(eq(schema.dataFiles.id, id));

  await writeAuditLog(actor.id, 'RESTORE_FILE', 'DATA_FILE', id, { fileName: file.fileName });
  revalidatePath('/[locale]/(admin)/system-data/storage', 'page');
  return { success: true };
}

export async function permanentlyDeleteStorageFile(id: string) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  const file = await db.query.dataFiles.findFirst({
    where: eq(schema.dataFiles.id, id)
  });

  if (!file) throw new Error('Not found');
  if (!canPermanentlyDeleteFile(actor)) throw new Error('Chỉ Quản trị viên mới được xóa vĩnh viễn');

  try {
    const filePath = path.join(UPLOAD_DIR, file.fileName);
    await fs.unlink(filePath);
  } catch (err) {
    console.error('File unlink error:', err);
  }

  await db.delete(schema.dataFiles).where(eq(schema.dataFiles.id, id));

  await writeAuditLog(actor.id, 'PERMANENT_DELETE_FILE', 'DATA_FILE', id, { fileName: file.fileName });
  revalidatePath('/[locale]/(admin)/system-data/storage', 'page');
  return { success: true };
}

export async function downloadStorageFileAction(id: string) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  const file = await db.query.dataFiles.findFirst({
    where: eq(schema.dataFiles.id, id)
  });

  if (!file) throw new Error('Not found');
  if (!canViewFile(actor, file as any)) throw new Error('Unauthorized');

  await db.update(schema.dataFiles).set({
    downloadCount: sql`${schema.dataFiles.downloadCount} + 1`
  }).where(eq(schema.dataFiles.id, id));

  await writeAuditLog(actor.id, 'DOWNLOAD_FILE', 'DATA_FILE', id, { fileName: file.fileName });
  
  return { success: true, url: file.fileUrl, name: file.originalName };
}

export async function createSystemBackup() {
  const actor = await getCurrentActor();
  if (!actor || actor.role !== 'ADMIN') {
    throw new Error('Chỉ Admin mới có quyền thực hiện sao lưu.');
  }

  // Generate a mock backup record
  const id = `backup_${Math.random().toString(36).substring(2, 9)}`;
  const fileName = `MIS_DB_Backup_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.sql`;

  await db.insert(schema.dataFiles).values({
    id,
    fileName,
    originalName: fileName,
    fileUrl: `/backups/${fileName}`,
    fileType: 'application/sql',
    fileSize: Math.floor(Math.random() * 50000000) + 10000000, // 10-60MB
    visibility: 'SCHOOL',
    uploadedBy: actor.id,
    status: 'ACTIVE',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await writeAuditLog(actor.id, 'CREATE_BACKUP', 'SYSTEM', id, { fileName });

  revalidatePath('/[locale]/(admin)/system-data/storage', 'page');
  return { success: true };
}

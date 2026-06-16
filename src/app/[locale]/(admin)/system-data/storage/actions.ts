'use server';

import { db, schema } from '@/src/libs/server/db';
import { getCurrentActor, canViewFile, canUploadFile, canDeleteFile, writeAuditLog } from '@/src/libs/server/auth-helper';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getFiles() {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  const files = await db.query.dataFiles.findMany({
    where: eq(schema.dataFiles.status, 'ACTIVE'),
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

export async function uploadMockFile(data: {
  fileName: string;
  fileSize: number;
  visibility: string;
  departmentId?: string;
}) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  if (!canUploadFile(actor, data.visibility, data.departmentId)) {
    throw new Error('Bạn không có quyền tải lên file với mức hiển thị này.');
  }

  const id = `file_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();

  await db.insert(schema.dataFiles).values({
    id,
    fileName: data.fileName,
    originalName: data.fileName,
    fileUrl: `/uploads/${id}_${data.fileName}`,
    fileType: 'application/octet-stream',
    fileSize: data.fileSize,
    visibility: data.visibility,
    departmentId: data.departmentId || null,
    uploadedBy: actor.id,
    status: 'ACTIVE',
    version: 1,
    createdAt: now,
    updatedAt: now,
  });

  await writeAuditLog(actor.id, 'UPLOAD_FILE', 'DATA_FILE', id, { fileName: data.fileName });

  revalidatePath('/[locale]/(admin)/system-data/storage', 'page');
  return { success: true, id };
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

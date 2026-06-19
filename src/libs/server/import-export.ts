import { db, schema } from './db';
import { getCurrentActor, writeAuditLog } from './auth-helper';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads');

export interface ImportRowValidation {
  rowNumber: number;
  success: boolean;
  errors: string[];
  data: Record<string, any>;
}

export async function createImportJob(moduleName: string, fileName: string, totalRows: number) {
  const actor = await getCurrentActor();
  const id = `import_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();
  
  await db.insert(schema.dataImportJobs).values({
    id,
    module: moduleName,
    status: 'PROCESSING',
    totalRows,
    successRows: 0,
    failedRows: 0,
    createdBy: actor?.id || 'SYSTEM',
    errorSummary: { fileName, performedByName: actor?.name || 'Hệ thống' },
    createdAt: now,
    updatedAt: now,
  });

  if (actor) {
    await writeAuditLog(actor.id, 'START_IMPORT_JOB', 'DATA_IMPORT_JOB', id, { module: moduleName, fileName, totalRows });
  }
  return id;
}

export function validateImportRows<T>(
  rows: any[],
  schemaValidator: (row: any, idx: number) => { success: boolean; errors: string[]; parsedData?: T }
): { validRows: T[]; invalidRows: Array<Record<string, any>> } {
  const validRows: T[] = [];
  const invalidRows: Array<Record<string, any>> = [];

  rows.forEach((row, index) => {
    const res = schemaValidator(row, index);
    if (res.success && res.parsedData) {
      validRows.push(res.parsedData);
    } else {
      invalidRows.push({
        _rowNumber: index + 1,
        _errors: res.errors.join('; '),
        ...row
      });
    }
  });

  return { validRows, invalidRows };
}

export async function generateErrorFile(jobId: string, moduleName: string, fileName: string, invalidRows: Array<Record<string, any>>) {
  const actor = await getCurrentActor();
  if (!invalidRows.length) return null;

  try {
    const errorFileId = `import_err_${Math.random().toString(36).substring(2, 9)}`;
    const diskFileName = `${errorFileId}.csv`;
    const headers = Array.from(new Set(invalidRows.flatMap(row => Object.keys(row))));
    const escapeCell = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const csv = [
      headers.join(','),
      ...invalidRows.map(row => headers.map(h => escapeCell(row[h])).join(','))
    ].join('\n');

    try { await fs.access(UPLOAD_DIR); } catch { await fs.mkdir(UPLOAD_DIR, { recursive: true }); }
    await fs.writeFile(path.join(UPLOAD_DIR, diskFileName), Buffer.from(`\uFEFF${csv}`, 'utf8'));

    await db.insert(schema.dataFiles).values({
      id: errorFileId,
      fileName: diskFileName,
      originalName: `errors_${fileName}`,
      displayName: `Lỗi import - ${fileName}`,
      description: `File ghi lại các dòng lỗi khi import cho Job ${jobId}`,
      fileUrl: `/api/storage/files/${errorFileId}`,
      fileType: 'text/csv; charset=utf-8',
      extension: 'csv',
      fileSize: Buffer.byteLength(`\uFEFF${csv}`, 'utf8'),
      category: 'Import/Export',
      relatedModule: moduleName,
      visibility: 'ADMIN_ONLY',
      uploadedBy: actor?.id || 'SYSTEM',
      status: 'ACTIVE',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return errorFileId;
  } catch (error) {
    console.error('Failed to create import error file:', error);
    return null;
  }
}

export async function recordImportExportLog(
  jobId: string,
  type: 'IMPORT' | 'EXPORT',
  status: 'COMPLETED' | 'FAILED',
  stats: { totalRows: number; successRows: number; failedRows: number; errorFileId?: string | null; errorSummary?: string }
) {
  const actor = await getCurrentActor();
  const now = new Date();
  
  if (type === 'IMPORT') {
    const [job] = await db.select().from(schema.dataImportJobs).where(eq(schema.dataImportJobs.id, jobId)).limit(1);
    const existingSummary = (job?.errorSummary as any) || {};

    await db.update(schema.dataImportJobs).set({
      status,
      successRows: stats.successRows,
      failedRows: stats.failedRows,
      errorSummary: {
        ...existingSummary,
        errorFileId: stats.errorFileId || null,
        message: stats.errorSummary || (stats.failedRows > 0 ? `${stats.failedRows} dòng bị lỗi.` : 'Thành công'),
      },
      completedAt: now,
      updatedAt: now,
    }).where(eq(schema.dataImportJobs.id, jobId));
  } else {
    await db.insert(schema.dataExportJobs).values({
      id: jobId,
      module: stats.errorSummary || 'Unknown',
      fileId: stats.errorFileId || null,
      filters: {
        totalRows: stats.totalRows,
        successRows: stats.successRows,
        fileName: stats.errorSummary || 'Export dữ liệu',
        performedByName: actor?.name || 'Hệ thống',
      },
      status: 'COMPLETED',
      createdBy: actor?.id || 'SYSTEM',
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (actor) {
    await writeAuditLog(actor.id, `${type}_JOB_${status}`, 'DATA_JOB', jobId, { ...stats });
  }
}

export async function exportData<T>(
  moduleName: string,
  fileName: string,
  headers: string[],
  rows: string[][],
  filters: any = {}
) {
  const actor = await getCurrentActor();
  const jobId = `export_${Math.random().toString(36).substring(2, 9)}`;
  const fileId = `file_exp_${Math.random().toString(36).substring(2, 9)}`;
  const diskFileName = `${fileId}.csv`;
  const escapeCell = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => escapeCell(cell)).join(','))
  ].join('\n');

  try {
    try { await fs.access(UPLOAD_DIR); } catch { await fs.mkdir(UPLOAD_DIR, { recursive: true }); }
    await fs.writeFile(path.join(UPLOAD_DIR, diskFileName), Buffer.from(`\uFEFF${csv}`, 'utf8'));

    await db.insert(schema.dataFiles).values({
      id: fileId,
      fileName: diskFileName,
      originalName: fileName,
      displayName: fileName,
      description: `File kết xuất dữ liệu module ${moduleName}`,
      fileUrl: `/api/storage/files/${fileId}`,
      fileType: 'text/csv; charset=utf-8',
      extension: 'csv',
      fileSize: Buffer.byteLength(`\uFEFF${csv}`, 'utf8'),
      category: 'Import/Export',
      relatedModule: moduleName,
      visibility: 'ADMIN_ONLY',
      uploadedBy: actor?.id || 'SYSTEM',
      status: 'ACTIVE',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await recordImportExportLog(jobId, 'EXPORT', 'COMPLETED', {
      totalRows: rows.length,
      successRows: rows.length,
      failedRows: 0,
      errorFileId: fileId,
      errorSummary: fileName,
    });

    return { success: true, fileId, downloadUrl: `/api/storage/files/${fileId}` };
  } catch (error: any) {
    console.error('Failed to export data:', error);
    return { success: false, error: error.message };
  }
}

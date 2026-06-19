import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import { db, schema } from '@/src/libs/server/db';
import { getCurrentActor, writeAuditLog } from '@/src/libs/server/auth-helper';
import { canViewFile } from '@/src/app/[locale]/(admin)/system-data/storage/storage.permissions';

const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads');

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await getCurrentActor();
  if (!actor) return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const file = await db.query.dataFiles.findFirst({ where: eq(schema.dataFiles.id, id) });
  if (!file || file.status === 'DELETED' || !canViewFile(actor, file)) {
    await writeAuditLog(actor.id, 'DOWNLOAD_FILE_DENIED', 'DATA_FILE', id, { success: false });
    return NextResponse.json({ status: 'error', error: 'File not found or forbidden' }, { status: 404 });
  }

  const candidatePaths = [path.join(UPLOAD_DIR, file.fileName)];
  if (String(file.fileUrl || '').startsWith('/uploads/')) {
    candidatePaths.push(path.join(process.cwd(), 'public', String(file.fileUrl).replace(/^\/uploads\//, 'uploads/')));
  }

  for (const diskPath of candidatePaths) {
    try {
      const data = await fs.readFile(diskPath);
      await db
        .update(schema.dataFiles)
        .set({ downloadCount: (Number(file.downloadCount) || 0) + 1, updatedAt: new Date() })
        .where(eq(schema.dataFiles.id, id));
      await writeAuditLog(actor.id, 'DOWNLOAD_FILE', 'DATA_FILE', id, { fileName: file.fileName, source: diskPath.includes(`${path.sep}public${path.sep}`) ? 'legacy_public_uploads' : 'protected_uploads' });

      return new NextResponse(data, {
        headers: {
          'Content-Type': file.fileType || 'application/octet-stream',
          'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(file.originalName || file.fileName)}`,
          'Cache-Control': 'private, no-store',
        },
      });
    } catch {
      // Try next candidate path.
    }
  }

  return NextResponse.json({ status: 'error', error: 'Physical file is not available' }, { status: 404 });
}

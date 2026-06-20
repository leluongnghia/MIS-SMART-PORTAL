import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getFileById, getProtectedUploadPath, recordFileDownload } from '@/src/libs/server/file-service';
import { getCurrentActor, writeAuditLog } from '@/src/libs/server/auth-helper';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const actor = await getCurrentActor();
  if (!actor) return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  let file: any;
  try {
    file = await getFileById(id, actor);
  } catch {
    await writeAuditLog(actor.id, 'DOWNLOAD_FILE_DENIED', 'DATA_FILE', id, { success: false });
    return NextResponse.json({ status: 'error', error: 'File not found or forbidden' }, { status: 404 });
  }

  const candidatePaths = [getProtectedUploadPath(file)];
  if (String(file.fileUrl || '').startsWith('/uploads/')) {
    candidatePaths.push(path.join(process.cwd(), 'public', String(file.fileUrl).replace(/^\/uploads\//, 'uploads/')));
  }

  for (const diskPath of candidatePaths) {
    try {
      const data = await fs.readFile(diskPath);
      await recordFileDownload(id).catch(() => null);
      return new NextResponse(data, {
        headers: {
          'Content-Type': file.mimeType || file.fileType || 'application/octet-stream',
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

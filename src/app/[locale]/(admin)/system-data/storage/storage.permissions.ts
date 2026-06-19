import { Actor } from '@/src/libs/server/auth-helper';

export function canViewStorage(actor: Actor) {
  return true;
}

export function canUploadFile(actor: Actor, visibility: string, departmentId?: string | null) {
  if (actor.role === 'ADMIN') return true;
  if (visibility === 'SCHOOL' || visibility === 'SCHOOL_WIDE' || visibility === 'ADMIN_ONLY') return false;
  if (visibility === 'DEPARTMENT') return actor.departmentId === departmentId;
  return true;
}

export function canViewFile(actor: Actor, file: any) {
  if (actor.role === 'ADMIN') return true;
  if (file.visibility === 'SCHOOL' || file.visibility === 'SCHOOL_WIDE') return true;
  if (file.visibility === 'DEPARTMENT' && file.departmentId) {
    return actor.departmentId === file.departmentId;
  }
  return actor.id === file.uploadedBy;
}

export function canDownloadFile(actor: Actor, file: any) {
  return canViewFile(actor, file);
}

export function canPreviewFile(actor: Actor, file: any) {
  return canViewFile(actor, file);
}

export function canEditFile(actor: Actor, file: any) {
  if (actor.role === 'ADMIN') return true;
  if (actor.role === 'MANAGER' && file.visibility === 'DEPARTMENT' && file.departmentId === actor.departmentId) return true;
  return actor.id === file.uploadedBy;
}

export function canArchiveFile(actor: Actor, file: any) {
  return canEditFile(actor, file);
}

export function canDeleteFile(actor: Actor, file: any) {
  if (actor.role === 'ADMIN') return true;
  return actor.id === file.uploadedBy;
}

export function canRestoreFile(actor: Actor, file: any) {
  if (actor.role === 'ADMIN') return true;
  return actor.id === file.uploadedBy;
}

export function canPermanentlyDeleteFile(actor: Actor) {
  return actor.role === 'ADMIN';
}

export function canViewImportExportLogs(actor: Actor) {
  return true;
}

export function canManageBackups(actor: Actor) {
  return actor.role === 'ADMIN';
}

export function canRestoreBackup(actor: Actor) {
  return actor.role === 'ADMIN';
}

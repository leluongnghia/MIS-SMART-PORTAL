import { Actor } from '@/src/libs/server/auth-helper';
import * as auth from '@/src/libs/server/auth-helper';

function canViewStorage(actor: Actor) {
  return auth.canViewModule(actor, 'storage');
}

export function canUploadFile(actor: Actor, visibility: string, departmentId?: string | null) {
  return auth.canUploadFile(actor, visibility, departmentId);
}

export function canViewFile(actor: Actor, file: any) {
  return auth.canViewFile(actor, file);
}

function canDownloadFile(actor: Actor, file: any) {
  return auth.canViewFile(actor, file);
}

function canPreviewFile(actor: Actor, file: any) {
  return auth.canViewFile(actor, file);
}

export function canEditFile(actor: Actor, file: any) {
  return auth.canEditFile(actor, file);
}

export function canArchiveFile(actor: Actor, file: any) {
  return auth.canArchiveFile(actor, file);
}

export function canDeleteFile(actor: Actor, file: any) {
  return auth.canDeleteFile(actor, file);
}

export function canRestoreFile(actor: Actor, file: any) {
  return auth.canRestoreFile(actor, file);
}

export function canPermanentlyDeleteFile(actor: Actor) {
  return auth.canPermanentlyDeleteFile(actor);
}

function canViewImportExportLogs(actor: Actor) {
  return auth.canViewModule(actor, 'import-export');
}

function canManageBackups(actor: Actor) {
  return auth.canManageBackups(actor);
}

export function canRestoreBackup(actor: Actor) {
  return auth.canManageBackups(actor);
}

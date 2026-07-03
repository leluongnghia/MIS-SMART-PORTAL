import React from 'react';
import { getPermissionAuditLogs } from '../actions';
import AuditLogsClient from './audit-logs-client';

export default async function AuditLogsPage() {
  const logs = await getPermissionAuditLogs();
  
  return <AuditLogsClient initialLogs={logs} />;
}

import { describe, it, expect, vi } from 'vitest';
import { canActOnApproval } from '../../src/libs/server/approval-engine';
import { RoleCode, WorkspaceCode } from '../../src/utils/constants';

describe('Approval Engine - Permissions', () => {
  it('should allow ADMIN to act on any request', () => {
    const actor = { role: RoleCode.ADMIN, workspaceId: WorkspaceCode.TOAN_TIN } as any;
    const request = { approverWorkspaceId: WorkspaceCode.BGH } as any;
    
    expect(canActOnApproval(actor, request)).toBe(true);
  });

  it('should allow BGH to act on any request', () => {
    const actor = { role: RoleCode.STAFF, workspaceId: WorkspaceCode.BGH } as any;
    const request = { approverWorkspaceId: WorkspaceCode.HANH_CHINH } as any;
    
    expect(canActOnApproval(actor, request)).toBe(true);
  });

  it('should allow assigned approver to act', () => {
    const actor = { role: RoleCode.MANAGER, workspaceId: WorkspaceCode.TUYEN_SINH_PR, id: 'user-1' } as any;
    const request = { approverId: 'user-1', approverWorkspaceId: null } as any;
    
    expect(canActOnApproval(actor, request)).toBe(true);
  });

  it('should allow manager of matching workspace to act', () => {
    const actor = { role: RoleCode.MANAGER, workspaceId: WorkspaceCode.TUYEN_SINH_PR } as any;
    const request = { approverWorkspaceId: WorkspaceCode.TUYEN_SINH_PR } as any;
    
    expect(canActOnApproval(actor, request)).toBe(true);
  });

  it('should deny staff from other workspace', () => {
    const actor = { role: RoleCode.STAFF, workspaceId: WorkspaceCode.HANH_CHINH } as any;
    const request = { approverWorkspaceId: WorkspaceCode.TUYEN_SINH_PR } as any;
    
    expect(canActOnApproval(actor, request)).toBe(false);
  });
});

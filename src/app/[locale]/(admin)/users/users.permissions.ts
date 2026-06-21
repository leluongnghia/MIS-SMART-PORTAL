import { Actor } from "@/src/libs/server/auth-helper";

function canAccessUserData(currentUser: Actor & { dataScope?: string; teamId?: string | null; homeroomClassId?: string | null }, targetUser: any) {
  if (!currentUser) return false;
  if (currentUser.role === 'ADMIN') return true;
  if (currentUser.id === targetUser.id) return true;

  const currentScope = currentUser.dataScope || 'OWN';

  if (currentScope === 'SYSTEM' || currentScope === 'SCHOOL') {
    return true;
  }
  if (currentScope === 'DEPARTMENT') {
    return currentUser.departmentId && currentUser.departmentId === targetUser.departmentId;
  }
  if (currentScope === 'TEAM') {
    return currentUser.teamId && currentUser.teamId === targetUser.teamId;
  }
  if (currentScope === 'CLASS') {
    // Fallback comparison for class levels
    return currentUser.homeroomClassId && currentUser.homeroomClassId === targetUser.homeroomClassId;
  }
  return false;
}

export function canManageUser(currentUser: Actor & { dataScope?: string }, targetUser: any) {
  if (!currentUser) return false;
  if (currentUser.id === targetUser.id) return false; // Prevent self management here (deletion/locking)
  if (currentUser.role === 'ADMIN') return true;

  // CHAIRMAN and BGH are also super-roles
  if (currentUser.role === 'CHAIRMAN' || currentUser.role === 'BGH') {
    // BGH/CHAIRMAN cannot manage ADMIN, but can manage others
    return targetUser.role !== 'ADMIN';
  }

  if (currentUser.role === 'MANAGER') {
    // MANAGER can manage STAFF/TEACHER/ADMISSIONS/HRM/FACILITIES in same department
    const manageableRoles = ['STAFF', 'TEACHER', 'ADMISSIONS', 'HRM', 'FACILITIES'];
    return (
      currentUser.departmentId === targetUser.departmentId &&
      manageableRoles.includes(targetUser.role)
    );
  }

  return false;
}

export function canAssignRole(currentUser: Actor, role: string) {
  if (!currentUser) return false;
  if (currentUser.role === 'ADMIN') return true;
  if (currentUser.role === 'CHAIRMAN' || currentUser.role === 'BGH') {
    return role !== 'ADMIN'; // Can assign any role except admin
  }
  if (currentUser.role === 'MANAGER') {
    // Manager can only assign TEACHER, STAFF, admissions/hrm/facilities
    const allowed = ['TEACHER', 'STAFF', 'ADMISSIONS', 'HRM', 'FACILITIES'];
    return allowed.includes(role);
  }
  return false;
}

export function canAssignDataScope(currentUser: Actor & { dataScope?: string }, scope: string) {
  if (!currentUser) return false;
  if (currentUser.role === 'ADMIN') return true;
  if (currentUser.role === 'CHAIRMAN' || currentUser.role === 'BGH') return true;

  if (currentUser.role === 'MANAGER') {
    // Manager cannot assign SYSTEM or SCHOOL scopes
    const managerAllowedScopes = ['DEPARTMENT', 'TEAM', 'CLASS', 'OWN'];
    return managerAllowedScopes.includes(scope);
  }
  return false;
}

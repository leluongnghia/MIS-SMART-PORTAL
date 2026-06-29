import { NextResponse } from 'next/server';
import { db, schema } from '../../../libs/server/db';
import { 
  PERMISSION_MODULES, 
  PERMISSION_FEATURES, 
  PERMISSIONS, 
  SYSTEM_ROLES 
} from '../../../libs/server/permissions.constants';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    // 1. Seed Modules
    for (const mod of PERMISSION_MODULES) {
      const existing = await db.query.sysModules.findFirst({
        where: eq(schema.sysModules.code, mod.code)
      });
      if (!existing) {
        await db.insert(schema.sysModules).values({
          id: `mod_${mod.code.toLowerCase()}`,
          name: mod.name,
          code: mod.code,
          isSystem: mod.isSystem,
          sortOrder: mod.sortOrder,
        });
      }
    }

    // 2. Seed Features
    for (const feat of PERMISSION_FEATURES) {
      const existing = await db.query.sysFeatures.findFirst({
        where: eq(schema.sysFeatures.code, feat.code)
      });
      if (!existing) {
        const mod = await db.query.sysModules.findFirst({
          where: eq(schema.sysModules.code, feat.moduleCode)
        });
        if (mod) {
          await db.insert(schema.sysFeatures).values({
            id: `feat_${feat.code.toLowerCase().replace(/\./g, '_')}`,
            moduleId: mod.id,
            name: feat.name,
            code: feat.code,
          });
        }
      }
    }

    // 3. Seed Permissions
    for (const perm of PERMISSIONS) {
      const existing = await db.query.sysPermissions.findFirst({
        where: eq(schema.sysPermissions.code, perm.code)
      });
      if (!existing) {
        const feat = await db.query.sysFeatures.findFirst({
          where: eq(schema.sysFeatures.code, perm.featureCode)
        });
        if (feat) {
          await db.insert(schema.sysPermissions).values({
            id: `perm_${perm.code.toLowerCase().replace(/\./g, '_')}`,
            moduleId: feat.moduleId,
            featureId: feat.id,
            name: perm.name,
            code: perm.code,
            action: perm.action,
          });
        }
      }
    }

    // 4. Seed Roles
    for (const role of SYSTEM_ROLES) {
      const existing = await db.query.roles.findFirst({
        where: eq(schema.roles.code, role.code)
      });
      if (!existing) {
        await db.insert(schema.roles).values({
          id: `role_${role.code.toLowerCase()}`,
          name: role.name,
          code: role.code,
          level: role.level,
          isSystemRole: role.isSystemRole,
        });
      }
    }

    // 5. Seed Super Admin Permissions
    const superAdminRole = await db.query.roles.findFirst({
      where: eq(schema.roles.code, 'SUPER_ADMIN')
    });
    
    if (superAdminRole) {
      const allPerms = await db.select().from(schema.sysPermissions);
      for (const perm of allPerms) {
        const existingRP = await db.query.rolePermissions.findFirst({
          where: (rp, { and, eq }) => and(
            eq(rp.roleId, superAdminRole.id),
            eq(rp.permissionId, perm.id)
          )
        });
        
        if (!existingRP) {
          await db.insert(schema.rolePermissions).values({
            id: `rp_${superAdminRole.id}_${perm.id}`,
            roleId: superAdminRole.id,
            permissionId: perm.id,
            dataScope: 'all',
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'RBAC seeded successfully' });
  } catch (error: any) {
    console.error('Failed to seed RBAC:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

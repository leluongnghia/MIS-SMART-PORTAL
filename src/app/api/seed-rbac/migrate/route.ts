import { NextResponse } from 'next/server';
import { db, schema } from '@/src/libs/server/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    // 1. Fetch old data
    const oldModules = await db.select().from(schema.modules);
    const oldDeptModules = await db.select().from(schema.departmentModules);

    // 2. Clear new RBAC tables to avoid conflicts
    await db.delete(schema.departmentPermissions);
    await db.delete(schema.sysPermissions);
    await db.delete(schema.sysFeatures);
    await db.delete(schema.sysModules);

    // 3. Migrate Modules, Features, Permissions
    const ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE'];
    
    // Map to keep track of old Module ID -> new Module/Feature IDs
    const moduleMap = new Map<string, { modId: string, featId: string, permIds: string[] }>();

    for (const oldMod of oldModules) {
      const sysModId = randomUUID();
      const code = oldMod.slug.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
      
      // A. Insert sysModules
      await db.insert(schema.sysModules).values({
        id: sysModId,
        code: code,
        name: oldMod.name,
        description: `Migrated from ${oldMod.slug}`,
        isSystem: false,
        sortOrder: oldMod.sort,
        isEnabled: oldMod.status,
      });

      // B. Insert sysFeatures
      const sysFeatId = randomUUID();
      const featureCode = `${code}.MAIN`;
      await db.insert(schema.sysFeatures).values({
        id: sysFeatId,
        moduleId: sysModId,
        code: featureCode,
        name: `Tính năng chính (${oldMod.name})`,
        sortOrder: 1,
      });

      // C. Insert sysPermissions
      const permIds: string[] = [];
      for (const action of ACTIONS) {
        const permId = randomUUID();
        permIds.push(permId);
        
        const actionNames: Record<string, string> = {
          VIEW: 'Xem', CREATE: 'Thêm', UPDATE: 'Sửa', DELETE: 'Xóa'
        };
        
        await db.insert(schema.sysPermissions).values({
          id: permId,
          featureId: sysFeatId,
          moduleId: sysModId,
          code: `${featureCode}.${action}`,
          action: action,
          name: `${actionNames[action]} ${oldMod.name.toLowerCase()}`,
        });
      }

      moduleMap.set(oldMod.id, { modId: sysModId, featId: sysFeatId, permIds });
    }

    // 4. Migrate Department -> Modules to Department -> Permissions
    const deptPermsToInsert = [];
    for (const dm of oldDeptModules) {
      const mapped = moduleMap.get(dm.moduleId);
      if (mapped) {
        for (const pid of mapped.permIds) {
          deptPermsToInsert.push({
            id: randomUUID(),
            departmentId: dm.departmentId,
            permissionId: pid,
            dataScope: 'department', // Default scope
          });
        }
      }
    }

    if (deptPermsToInsert.length > 0) {
      // Chunk inserts because of parameter limits in Postgres (max ~65k)
      const chunkSize = 1000;
      for (let i = 0; i < deptPermsToInsert.length; i += chunkSize) {
        await db.insert(schema.departmentPermissions).values(deptPermsToInsert.slice(i, i + chunkSize));
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully!',
      stats: {
        migratedModules: oldModules.length,
        migratedDepartmentPermissions: deptPermsToInsert.length
      }
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

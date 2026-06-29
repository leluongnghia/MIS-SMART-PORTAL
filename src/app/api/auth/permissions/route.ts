import { NextResponse } from 'next/server';
import { getEffectivePermissions } from '@/src/libs/server/rbac';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const departmentId = searchParams.get('departmentId');

  if (!userId || !departmentId) {
    return NextResponse.json({ error: 'Missing userId or departmentId' }, { status: 400 });
  }

  try {
    let permissions = await getEffectivePermissions(userId);
    
    // Fallback: If no permissions found and departmentId is provided,
    // it means the user is using Mock Auth without a real user role in DB.
    // So we fetch permissions directly for the departmentId.
    if (permissions.length === 0 && departmentId) {
      const { db, schema } = await import('@/src/libs/server/db');
      const { eq } = await import('drizzle-orm');
      
      const deptPerms = await db.select({
        code: schema.sysPermissions.code,
      })
      .from(schema.departmentPermissions)
      .innerJoin(schema.departments, eq(schema.departmentPermissions.departmentId, schema.departments.id))
      .where(eq(schema.departments.code, departmentId))
      .innerJoin(schema.sysPermissions, eq(schema.departmentPermissions.permissionId, schema.sysPermissions.id));
      
      return NextResponse.json({ debug: deptPerms, permissions: Array.from(new Set(deptPerms.map(p => p.code))) });
    }

    return NextResponse.json({ permissions: Array.from(new Set(permissions.map(p => p.code))) });
  } catch (error: any) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

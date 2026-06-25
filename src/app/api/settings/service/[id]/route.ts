import { NextResponse } from 'next/server';
import { db, schema } from '@/src/libs/server/db';

export const dynamic = 'force-dynamic';
import { eq } from 'drizzle-orm';
import { getCurrentActor } from '@/src/libs/server/auth-helper';

export async function PUT(request: Request, context: any) {
  try {
    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { type, name, status, campusId, campusName, schoolYear, ...payload } = body;

    const [updatedSetting] = await db.update(schema.serviceSettings)
      .set({
        name,
        status,
        campusId,
        campusName,
        schoolYear,
        payload,
        updatedAt: new Date(),
      })
      .where(eq(schema.serviceSettings.id, id))
      .returning();

    if (!updatedSetting) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSetting);
  } catch (error: any) {
    console.error('Error updating service setting:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const [deletedSetting] = await db.delete(schema.serviceSettings)
      .where(eq(schema.serviceSettings.id, id))
      .returning();

    if (!deletedSetting) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting service setting:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

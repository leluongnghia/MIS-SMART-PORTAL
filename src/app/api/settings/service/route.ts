import { NextResponse } from 'next/server';
import { db, schema } from '@/src/libs/server/db';

export const dynamic = 'force-dynamic';
import { eq } from 'drizzle-orm';
import { getCurrentActor } from '@/src/libs/server/auth-helper';

export async function GET(request: Request) {
  try {
    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let query = db.select().from(schema.serviceSettings);
    
    if (type) {
      query = query.where(eq(schema.serviceSettings.type, type)) as any;
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching service settings:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, type, name, status, campusId, campusName, schoolYear, ...payload } = body;

    const [newSetting] = await db.insert(schema.serviceSettings).values({
      id: id || `${type}-${Date.now()}`,
      type,
      name,
      status: status || 'active',
      campusId,
      campusName,
      schoolYear,
      payload,
    }).returning();

    return NextResponse.json(newSetting);
  } catch (error: any) {
    console.error('Error creating service setting:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

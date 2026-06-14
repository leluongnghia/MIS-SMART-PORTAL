import { NextResponse } from 'next/server';
import { db, schema } from '../../../../libs/server/db';

export async function GET() {
  const rows = await db.select().from(schema.workspaces);
  return NextResponse.json({ status: 'success', workspaces: rows.map(row => row.payload), count: rows.length });
}

export async function POST(request: Request) {
  const workspace = await request.json();
  if (!workspace?.id || !workspace?.name) {
    return NextResponse.json({ status: 'error', error: 'Workspace id and name are required.' }, { status: 400 });
  }
  await db.insert(schema.workspaces).values({
    id: workspace.id,
    name: workspace.name,
    description: workspace.description || '',
    color: workspace.color || '',
    iconName: workspace.iconName || '',
    payload: workspace,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: schema.workspaces.id,
    set: {
      name: workspace.name,
      description: workspace.description || '',
      color: workspace.color || '',
      iconName: workspace.iconName || '',
      payload: workspace,
      updatedAt: new Date(),
    },
  });
  return NextResponse.json({ status: 'success', workspace });
}

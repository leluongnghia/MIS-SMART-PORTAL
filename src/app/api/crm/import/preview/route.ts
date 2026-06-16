import { or, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db, schema } from '../../../../../libs/server/db';
import { normalizeCrmLead } from '../../../../../libs/server/crm';

export async function POST(request: Request) {
  const body = await request.json();
  const rows = Array.isArray(body?.rows)
    ? body.rows
    : String(body?.text || '').split(/\r?\n/).filter(Boolean);

  const leads = rows.map((row: any) => {
    if (typeof row === 'object') return normalizeCrmLead(row);
    const cols = String(row).includes('\t') ? String(row).split('\t') : String(row).split(',');
    return normalizeCrmLead({
      studentName: cols[0],
      parentName: cols[1],
      phone: cols[2],
      email: cols[3],
      source: cols[4],
      campaign: cols[5],
      stage: cols[6],
      rawPayload: row,
    });
  });

  const duplicateChecks = await Promise.all(leads.map(async (lead: any) => {
    if (!lead.phone && !lead.email) return false;
    const where = lead.email
      ? or(eq(schema.leads.phone, lead.phone), eq(schema.leads.email, lead.email))
      : eq(schema.leads.phone, lead.phone);
    const [existing] = await db.select({ id: schema.leads.id }).from(schema.leads).where(where).limit(1);
    return Boolean(existing);
  }));

  const errors = leads
    .map((lead: any, index: number) => {
      const duplicate = duplicateChecks[index];
      const missing = !lead.studentName || !lead.parentName || !lead.phone;
      return missing || duplicate
        ? {
            row: index + 1,
            leadCode: lead.leadCode,
            errors: [
              missing ? 'Missing studentName, parentName or phone.' : '',
              duplicate ? 'Duplicate phone or email.' : '',
            ].filter(Boolean),
          }
        : null;
    })
    .filter(Boolean);

  const batch = {
    id: `import_${Date.now()}`,
    status: errors.length ? 'HAS_ERRORS' : 'READY',
    leads,
    errors,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ status: 'success', batch });
}

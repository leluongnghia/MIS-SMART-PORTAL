'use server';

import { db, schema } from '@/src/libs/server/db';
import { getCurrentActor, canManageCategories, writeAuditLog } from '@/src/libs/server/auth-helper';
import { eq, and, desc, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

function removeVietnameseTones(str: string) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  return str.toLowerCase();
}

export async function getCategories(group: string) {
  const actor = await getCurrentActor();
  if (!actor) throw new Error('Unauthorized');

  const data = await db.query.systemCategories.findMany({
    where: and(
      eq(schema.systemCategories.group, group),
      // we don't strictly filter by deletedAt here to let the client see if they are active/inactive,
      // but maybe we filter out deletedAt if we use soft delete. The schema has deletedAt.
      // We will only return non-deleted items
    ),
    orderBy: [asc(schema.systemCategories.sortOrder), desc(schema.systemCategories.createdAt)],
  });

  return data.filter(d => !d.deletedAt);
}

export async function createCategory(data: {
  group: string;
  code: string;
  name: string;
  description?: string;
  sortOrder?: number;
  status?: string;
}) {
  const actor = await getCurrentActor();
  if (!actor || !canManageCategories(actor)) throw new Error('Unauthorized');

  // Check code uniqueness
  const existingCode = await db.query.systemCategories.findFirst({
    where: and(
      eq(schema.systemCategories.group, data.group),
      eq(schema.systemCategories.code, data.code)
    )
  });
  if (existingCode && !existingCode.deletedAt) {
    throw new Error('Mã danh mục đã tồn tại trong nhóm này.');
  }

  // Check name duplicate (accent insensitive)
  const allInGroup = await db.query.systemCategories.findMany({
    where: eq(schema.systemCategories.group, data.group)
  });
  const normalizedName = removeVietnameseTones(data.name.trim());
  const nameExists = allInGroup.find(c => !c.deletedAt && removeVietnameseTones(c.name.trim()) === normalizedName);
  
  if (nameExists) {
    throw new Error('Tên danh mục đã tồn tại (trùng lặp).');
  }

  const id = `cat_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();

  await db.insert(schema.systemCategories).values({
    id,
    group: data.group,
    code: data.code,
    name: data.name.trim(),
    description: data.description,
    sortOrder: data.sortOrder || 0,
    status: data.status || 'ACTIVE',
    createdBy: actor.id,
    updatedBy: actor.id,
    createdAt: now,
    updatedAt: now,
  });

  await writeAuditLog(actor.id, 'CREATE_CATEGORY', 'SYSTEM_CATEGORY', id, {
    after: { ...data }
  });

  revalidatePath('/[locale]/(admin)/system-data/categories', 'page');
  return { success: true, id };
}

export async function updateCategory(id: string, data: {
  name: string;
  description?: string;
  sortOrder?: number;
  status?: string;
}) {
  const actor = await getCurrentActor();
  if (!actor || !canManageCategories(actor)) throw new Error('Unauthorized');

  const existing = await db.query.systemCategories.findFirst({
    where: eq(schema.systemCategories.id, id)
  });
  if (!existing) throw new Error('Not found');

  // Check name duplicate
  const allInGroup = await db.query.systemCategories.findMany({
    where: eq(schema.systemCategories.group, existing.group)
  });
  const normalizedName = removeVietnameseTones(data.name.trim());
  const nameExists = allInGroup.find(c => c.id !== id && !c.deletedAt && removeVietnameseTones(c.name.trim()) === normalizedName);
  
  if (nameExists) {
    throw new Error('Tên danh mục đã tồn tại (trùng lặp).');
  }

  await db.update(schema.systemCategories).set({
    name: data.name.trim(),
    description: data.description,
    sortOrder: data.sortOrder,
    status: data.status,
    updatedBy: actor.id,
    updatedAt: new Date()
  }).where(eq(schema.systemCategories.id, id));

  await writeAuditLog(actor.id, 'UPDATE_CATEGORY', 'SYSTEM_CATEGORY', id, {
    before: existing,
    after: { ...data }
  });

  revalidatePath('/[locale]/(admin)/system-data/categories', 'page');
  return { success: true };
}

export async function deleteCategory(id: string) {
  const actor = await getCurrentActor();
  if (!actor || !canManageCategories(actor)) throw new Error('Unauthorized');

  const existing = await db.query.systemCategories.findFirst({
    where: eq(schema.systemCategories.id, id)
  });
  if (!existing) throw new Error('Not found');

  // Soft delete
  await db.update(schema.systemCategories).set({
    deletedAt: new Date(),
    updatedBy: actor.id,
    updatedAt: new Date()
  }).where(eq(schema.systemCategories.id, id));

  await writeAuditLog(actor.id, 'DELETE_CATEGORY', 'SYSTEM_CATEGORY', id, {
    before: existing
  });

  revalidatePath('/[locale]/(admin)/system-data/categories', 'page');
  return { success: true };
}

async function importCategories(group: string, rows: any[]) {
  const actor = await getCurrentActor();
  if (!actor || !canManageCategories(actor)) throw new Error('Unauthorized');

  let imported = 0;
  let skipped = 0;

  const allInGroup = await db.query.systemCategories.findMany({
    where: eq(schema.systemCategories.group, group)
  });

  for (const row of rows) {
    if (!row.code || !row.name) {
      skipped++;
      continue;
    }

    const exists = allInGroup.find(c => !c.deletedAt && c.code === row.code);
    const normalizedName = removeVietnameseTones(row.name.trim());
    const nameExists = allInGroup.find(c => !c.deletedAt && removeVietnameseTones(c.name.trim()) === normalizedName);

    if (exists || nameExists) {
      skipped++;
      continue;
    }

    const id = `cat_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();
    const newCat = {
      id,
      group,
      code: row.code,
      name: row.name.trim(),
      description: row.description || '',
      sortOrder: row.sortOrder ? parseInt(row.sortOrder) : 0,
      status: row.status || 'ACTIVE',
      createdBy: actor.id,
      updatedBy: actor.id,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(schema.systemCategories).values(newCat);
    allInGroup.push(newCat as any);
    imported++;
  }

  await writeAuditLog(actor.id, 'IMPORT_CATEGORIES', 'SYSTEM_CATEGORY', group, {
    imported,
    skipped
  });

  revalidatePath('/[locale]/(admin)/system-data/categories', 'page');
  return { success: true, imported, skipped };
}

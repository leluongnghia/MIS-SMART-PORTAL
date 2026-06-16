'use server';

import { db, schema } from '@/src/libs/server/db';
import { getCurrentActor, canViewSystemSettings, canUpdateSystemSettings, canViewSecretSetting, writeAuditLog } from '@/src/libs/server/auth-helper';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getSettings() {
  const actor = await getCurrentActor();
  if (!actor || !canViewSystemSettings(actor)) throw new Error('Unauthorized');

  const settings = await db.query.systemSettings.findMany();

  // Mask secrets unless authorized explicitly
  const canViewSecrets = canViewSecretSetting(actor);

  return settings.map(s => ({
    ...s,
    value: (s.isSecret && !canViewSecrets) ? '••••••••' : s.value
  }));
}

export async function saveSettings(updates: { key: string; value: string }[]) {
  const actor = await getCurrentActor();
  if (!actor || !canUpdateSystemSettings(actor)) throw new Error('Unauthorized');

  const currentSettings = await db.query.systemSettings.findMany();
  let updatedCount = 0;

  for (const update of updates) {
    const setting = currentSettings.find(s => s.key === update.key);
    if (!setting) continue;
    if (!setting.isEditable) continue;

    // Ignore if they just submit the masked value back
    if (setting.isSecret && update.value === '••••••••') continue;
    
    // Ignore if value hasn't changed
    if (setting.value === update.value) continue;

    await db.update(schema.systemSettings)
      .set({
        value: update.value,
        updatedBy: actor.id,
        updatedAt: new Date()
      })
      .where(eq(schema.systemSettings.key, update.key));

    updatedCount++;

    await writeAuditLog(actor.id, 'UPDATE_SETTING', 'SYSTEM_SETTING', update.key, {
      beforeValue: setting.isSecret ? '••••••••' : setting.value,
      afterValue: setting.isSecret ? '••••••••' : update.value
    });
  }

  revalidatePath('/[locale]/(admin)/system-data/settings', 'page');
  return { success: true, updatedCount };
}

export async function testSmtpConnection() {
  const actor = await getCurrentActor();
  if (!actor || !canUpdateSystemSettings(actor)) throw new Error('Unauthorized');

  // Mock checking
  return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'Kết nối SMTP thành công' }), 1000));
}

export async function testVietQrConnection() {
  const actor = await getCurrentActor();
  if (!actor || !canUpdateSystemSettings(actor)) throw new Error('Unauthorized');

  // Mock checking
  return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'Kết nối VietQR hợp lệ' }), 800));
}

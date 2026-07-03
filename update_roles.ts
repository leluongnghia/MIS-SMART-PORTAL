import { db } from './src/libs/server/db';
import * as schema from './src/models/Schema';
import { eq, inArray } from 'drizzle-orm';

async function main() {
  console.log('Updating super admins...');
  await db.update(schema.users).set({ role: 'SUPER_ADMIN', userType: 'SUPER_ADMIN' as any }).where(inArray(schema.users.id, ['user_chutich', 'user_ceo']));
  console.log('Updating BGH to admin...');
  await db.update(schema.users).set({ role: 'ADMIN', userType: 'ADMIN' as any }).where(inArray(schema.users.id, ['user_triet', 'user_tuan', 'user_nam_anh']));
  console.log('Done.');
  process.exit(0);
}
main();

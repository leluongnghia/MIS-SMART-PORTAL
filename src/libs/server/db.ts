import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '../../models/Schema';

const globalForDb = globalThis as typeof globalThis & {
  __misPglite?: PGlite;
};

export const pgliteClient = globalForDb.__misPglite ?? new PGlite(process.env.DATABASE_URL || './local.db');

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__misPglite = pgliteClient;
}

export const db = drizzle(pgliteClient, { schema });
export { schema };

let isConfigLoaded = false;

export async function loadConfigFromDb(force = false) {
  if (isConfigLoaded && !force) return;
  try {
    const settings = await db.select().from(schema.systemSettings);
    for (const setting of settings) {
      process.env[setting.key] = setting.value;
    }
    isConfigLoaded = true;
  } catch (e) {
    console.error('Failed to load configurations from DB:', e);
  }
}

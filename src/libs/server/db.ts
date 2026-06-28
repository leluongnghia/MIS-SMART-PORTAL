import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../models/Schema';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/mis',
});

export const db = drizzle(pool, { schema });
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

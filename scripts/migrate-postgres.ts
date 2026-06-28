import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/mis',
});

const db = drizzle(pool);

async function runMigrate() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './migrations' });
  console.log('Migrations completed successfully');
  await pool.end();
}

runMigrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const dbPath = process.env.DATABASE_URL || './local.db';
const migrationsDir = path.resolve('migrations');
const client = new PGlite(dbPath);

async function migrate() {
  await client.waitReady;
  await client.query(`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id text PRIMARY KEY,
      created_at timestamp with time zone DEFAULT now() NOT NULL
    );
  `);

  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found.');
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const id = file;
    const applied = await client.query('SELECT id FROM "__drizzle_migrations" WHERE id = $1', [id]);
    if (applied.rows.length > 0) {
      console.log(`Skipping applied migration ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const statements = sql
      .split('--> statement-breakpoint')
      .map(statement => statement.trim().replace(/^CREATE TABLE\s+"/i, 'CREATE TABLE IF NOT EXISTS "'))
      .filter(Boolean);

    await client.transaction(async (tx) => {
      for (const statement of statements) {
        await tx.query(statement);
      }
      await tx.query('INSERT INTO "__drizzle_migrations" (id) VALUES ($1)', [id]);
    });
    console.log(`Applied migration ${file}`);
  }
}

migrate()
  .finally(async () => {
    await client.close();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

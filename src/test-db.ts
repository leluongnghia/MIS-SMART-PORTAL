import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import path from 'node:path';

async function test() {
  const dbPath = process.env.DATABASE_URL || './local.db';
  console.log('Using DB Path:', path.resolve(dbPath));
  const client = new PGlite(dbPath);
  await client.waitReady;
  
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log('Tables before:', tables.rows.map((r: any) => r.table_name));

  await client.close();
}
test().catch(console.error);

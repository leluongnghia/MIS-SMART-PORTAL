import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/models/Schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  driver: 'pglite',
  dbCredentials: {
    url: './local.db',
  },
});

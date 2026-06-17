import { PGlite } from '@electric-sql/pglite';
import { NodeFS } from '@electric-sql/pglite/nodefs';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '../../models/Schema';

let clientInstance: PGlite | null = null;
let closeTimeout: NodeJS.Timeout | null = null;
let activeQueries = 0;

async function getClient(): Promise<PGlite> {
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }
  
  if (!clientInstance) {
    const dbPath = process.env.DATABASE_URL || './local.db';
    let retries = 15;
    while (retries > 0) {
      try {
        clientInstance = new PGlite({
          dataDir: dbPath,
          fs: new NodeFS(dbPath)
        });
        await clientInstance.waitReady;
        break;
      } catch (err: any) {
        retries--;
        if (retries === 0) {
          console.error("PGlite lock acquire failed permanently:", err);
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 100));
      }
    }
  }
  
  return clientInstance!;
}

function releaseClient() {
  activeQueries--;
  if (activeQueries <= 0) {
    activeQueries = 0;
    if (closeTimeout) clearTimeout(closeTimeout);
    closeTimeout = setTimeout(async () => {
      if (clientInstance) {
        try {
          await clientInstance.close();
        } catch (e) {
          // Ignore close errors
        }
        clientInstance = null;
      }
    }, 100);
  }
}

const pgliteProxy = new Proxy({} as any, {
  get(target, prop) {
    if (prop === 'waitReady') {
      return getClient().then((c) => c.waitReady);
    }
    
    return async (...args: any[]) => {
      activeQueries++;
      try {
        const client = await getClient();
        const fn = (client as any)[prop];
        if (typeof fn === 'function') {
          return await fn.apply(client, args);
        }
        return fn;
      } finally {
        releaseClient();
      }
    };
  }
});

export const pgliteClient = pgliteProxy;
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

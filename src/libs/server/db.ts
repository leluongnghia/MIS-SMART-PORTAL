import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '../../models/Schema';

let clientInstance: PGlite | null = globalThis.pgliteClient || null;
let dbState: 'closed' | 'opening' | 'open' | 'closing' = clientInstance ? 'open' : 'closed';
let openPromise: Promise<PGlite> | null = null;
let closePromise: Promise<void> | null = null;
let closeTimeout: NodeJS.Timeout | null = null;
let activeQueries = 0;
const IDLE_CLOSE_DELAY_MS = 30_000;

function resetClientState() {
  clientInstance = null;
  globalThis.pgliteClient = undefined;
  dbState = 'closed';
  openPromise = null;
  closePromise = null;
}

function isPGliteClosedError(error: unknown) {
  return error instanceof Error && error.message.includes('PGlite is closed');
}

async function getClient(): Promise<PGlite> {
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }

  // If currently closing, wait for it to finish closing first
  if (dbState === 'closing' && closePromise) {
    await closePromise;
  }

  // If open and has instance, return it
  if (dbState === 'open' && clientInstance) {
    return clientInstance;
  }

  // If opening, wait for it to open
  if (dbState === 'opening' && openPromise) {
    return openPromise;
  }

  // Otherwise start opening
  dbState = 'opening';
  openPromise = (async () => {
    const dbPath = process.env.DATABASE_URL || './local.db';
    let retries = 15;
    while (retries > 0) {
      try {
        const client = new PGlite(dbPath);
        await client.waitReady;
        clientInstance = client;
        globalThis.pgliteClient = client;
        dbState = 'open';
        openPromise = null;
        return client;
      } catch (err: any) {
        retries--;
        if (retries === 0) {
          dbState = 'closed';
          openPromise = null;
          console.error("PGlite lock acquire failed permanently:", err);
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 100));
      }
    }
    throw new Error("PGlite lock acquire failed");
  })();

  return openPromise;
}

function releaseClient() {
  activeQueries--;
  if (activeQueries <= 0) {
    activeQueries = 0;

    if (process.env.NODE_ENV === 'development') {
      return;
    }

    if (closeTimeout) clearTimeout(closeTimeout);
    closeTimeout = setTimeout(() => {
      closeTimeout = null;
      if (dbState === 'open' && clientInstance) {
        dbState = 'closing';
        closePromise = (async () => {
          try {
            const client = clientInstance;
            resetClientState();
            await client!.close();
          } catch (e) {
            // Ignore close errors
          } finally {
            dbState = 'closed';
            closePromise = null;
          }
        })();
      }
    }, IDLE_CLOSE_DELAY_MS);
  }
}

const pgliteProxy = new Proxy({} as any, {
  get(target, prop) {
    if (prop === 'waitReady') {
      return getClient().then((c) => c.waitReady);
    }
    
    if (prop === 'close') {
      return async () => {
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
        if (clientInstance) {
          const client = clientInstance;
          resetClientState();
          await client.close();
        }
      };
    }
    
    return async (...args: any[]) => {
      activeQueries++;
      try {
        const client = await getClient();
        const fn = (client as any)[prop];
        if (typeof fn === 'function') {
          try {
            return await fn.apply(client, args);
          } catch (error) {
            if (isPGliteClosedError(error)) {
              resetClientState();
              const freshClient = await getClient();
              return await (freshClient as any)[prop].apply(freshClient, args);
            }
            throw error;
          }
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

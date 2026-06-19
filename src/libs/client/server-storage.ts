const memoryCache = new Map<string, string>();
const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>();

async function requestStorage(method: 'GET' | 'POST' | 'DELETE', key: string, value?: string) {
  const url = `/api/client-storage${key ? `?key=${encodeURIComponent(key)}` : ''}`;
  const response = await fetch(url, {
    method,
    headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
    body: method === 'POST' ? JSON.stringify({ key, value }) : undefined,
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(`client-storage ${method} failed`);
  return response.json();
}

export const serverStorage = {
  getItem(key: string) {
    return memoryCache.get(key) ?? null;
  },

  setItem(key: string, value: string) {
    memoryCache.set(key, value);
    return requestStorage('POST', key, value).catch(() => undefined);
  },

  removeItem(key: string) {
    memoryCache.delete(key);
    requestStorage('DELETE', key).catch(() => undefined);
  },

  async hydrate(keys: string[]) {
    await Promise.all(keys.map(async key => {
      try {
        const data = await requestStorage('GET', key);
        if (data?.value !== undefined && data?.value !== null) memoryCache.set(key, String(data.value));
      } catch {
        // Keep in-memory defaults if the server is unreachable.
      }
    }));
  },
};

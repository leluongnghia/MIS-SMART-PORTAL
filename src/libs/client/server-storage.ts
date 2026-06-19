const memoryCache = new Map<string, string>();

function readLocal(key: string) {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (private mode/quota).
  }
}

function removeLocal(key: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

async function requestStorage(method: 'GET' | 'POST' | 'DELETE', key: string, value?: string) {
  const url = `/api/client-storage${key ? `?key=${encodeURIComponent(key)}` : ''}`;
  const response = await fetch(url, {
    method,
    headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
    body: method === 'POST' ? JSON.stringify({ key, value }) : undefined,
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(`client-storage ${method} failed`);
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export const serverStorage = {
  getItem(key: string) {
    const value = memoryCache.get(key) ?? readLocal(key);
    if (value !== null) memoryCache.set(key, value);
    return value;
  },

  setItem(key: string, value: string) {
    memoryCache.set(key, value);
    writeLocal(key, value);
    return requestStorage('POST', key, value).catch(() => undefined);
  },

  removeItem(key: string) {
    memoryCache.delete(key);
    removeLocal(key);
    requestStorage('DELETE', key).catch(() => undefined);
  },

  async hydrate(keys: string[]) {
    await Promise.all(keys.map(async key => {
      const localValue = readLocal(key);
      if (localValue !== null) memoryCache.set(key, localValue);

      try {
        const data = await requestStorage('GET', key);
        if (data?.value !== undefined && data?.value !== null) {
          const value = String(data.value);
          memoryCache.set(key, value);
          writeLocal(key, value);
        }
      } catch {
        // Keep local/in-memory defaults if the server is unreachable.
      }
    }));
  },
};

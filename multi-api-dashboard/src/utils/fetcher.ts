export type FetchOpts = {
  timeoutMs?: number;
  cacheKey?: string; // sessionStorage 캐시 키
};

export async function httpGet<T>(url: string, opts: FetchOpts = {}): Promise<T> {
  const { timeoutMs = 10000, cacheKey } = opts;

  if (cacheKey) {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached) as T;
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    const msg = await safeText(res);
    throw new Error(`HTTP ${res.status} ${res.statusText}${msg ? ` – ${msg}` : ''}`);
  }

  const data = await res.json() as T;
  if (cacheKey) sessionStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
}

async function safeText(res: Response){
  try { return await res.text(); } catch { return ''; }
}

// Thin fetch wrapper around the real backend (see project doc
// claude/frontend-api-reference.md for the full contract this was built from).
// No axios dependency — native fetch only, matching the rest of this app.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const TOKEN_KEY = 'scs.tokens';

export const tokenStore = {
  get() {
    try { return JSON.parse(sessionStorage.getItem(TOKEN_KEY) || 'null'); } catch { return null; }
  },
  set(tokens) {
    try {
      tokens
        ? sessionStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
        : sessionStorage.removeItem(TOKEN_KEY);
    } catch { /* storage unavailable */ }
  },
  clear() {
    this.set(null);
  }
};

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message || code || `Request failed (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Serialized so two 401s in flight only trigger one /auth/refresh call.
let refreshInFlight = null;

async function doRefresh() {
  const tokens = tokenStore.get();
  if (!tokens?.refreshToken) throw new ApiError(401, 'UNAUTHORIZED', 'Not signed in.');
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken })
  });
  if (!res.ok) {
    tokenStore.clear();
    throw new ApiError(res.status, 'UNAUTHORIZED', 'Session expired. Please sign in again.');
  }
  const data = await res.json();
  tokenStore.set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

// path: e.g. '/applications'. opts: { method, body, query, auth = true, retry = true, raw = false }
export async function apiFetch(path, opts = {}) {
  const { method = 'GET', body, query, auth = true, retry = true, raw = false } = opts;

  let url = `${BASE_URL}${path}`;
  if (query && Object.keys(query).length) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') params.set(k, v);
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const tokens = tokenStore.get();
    if (tokens?.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (res.status === 401 && auth && retry) {
    try {
      await (refreshInFlight || (refreshInFlight = doRefresh().finally(() => { refreshInFlight = null; })));
    } catch (err) {
      tokenStore.clear();
      throw err;
    }
    return apiFetch(path, { ...opts, retry: false });
  }

  if (raw) {
    if (!res.ok) throw new ApiError(res.status, 'REQUEST_FAILED', `Request failed (${res.status})`);
    return res;
  }

  const data = await parseBody(res);
  if (!res.ok) {
    const err = data?.error || {};
    throw new ApiError(res.status, err.code, err.message || `Request failed (${res.status})`, err.details);
  }
  return data;
}

export const get = (path, opts) => apiFetch(path, { ...opts, method: 'GET' });
export const post = (path, body, opts) => apiFetch(path, { ...opts, method: 'POST', body });
export const patch = (path, body, opts) => apiFetch(path, { ...opts, method: 'PATCH', body });
export const del = (path, opts) => apiFetch(path, { ...opts, method: 'DELETE' });

export { BASE_URL };

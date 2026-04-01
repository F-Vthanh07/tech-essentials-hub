
// Use environment variable if available, otherwise fallback to deployed backend
export const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'https://accessoriesshop.onrender.com';
console.debug('[httpClient] base URL =', BASE_URL || '(relative)');

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

async function request<T>(
  path: string,
  { body, headers, ...options }: RequestOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // attach auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = res.statusText || `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      if (typeof json.message === 'string' && json.message.trim()) {
        message = json.message;
      } else if (typeof json.title === 'string' && json.title.trim()) {
        message = json.title;
      } else if (json.errors && typeof json.errors === 'object') {
        const parts: string[] = [];
        for (const [key, val] of Object.entries(json.errors as Record<string, unknown>)) {
          if (Array.isArray(val)) {
            parts.push(...val.map((v) => `${key}: ${String(v)}`));
          } else {
            parts.push(`${key}: ${String(val)}`);
          }
        }
        if (parts.length) message = parts.join('; ');
      } else if (typeof json.detail === 'string' && json.detail.trim()) {
        message = json.detail;
      }
    } catch {
      if (text?.trim()) {
        message = text.length > 400 ? `${text.slice(0, 400)}…` : text;
      }
    }
    throw new Error(message);
  }

  // assume JSON response by default
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }

  // if not JSON, return as text
  return (res.text() as unknown) as T;
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: any) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: any) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: any) => request<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

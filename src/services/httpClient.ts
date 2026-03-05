
// const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';
const BASE_URL = "https://localhost:7240";
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
    // attempt to parse error message
    let text: any;
    try {
      text = await res.text();
      const json = JSON.parse(text);
      throw new Error(json.message || res.statusText);
    } catch {
      throw new Error(res.statusText);
    }
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
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Service for CustomProduct APIs hosted on a separate backend (localhost:5253)

const CUSTOM_API_BASE_URL = 'http://localhost:5253';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

async function customRequest<T>(path: string, { body, headers, ...options }: RequestOptions = {}): Promise<T> {
  const url = `${CUSTOM_API_BASE_URL}${path}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let text: string;
    try {
      text = await res.text();
      const json = JSON.parse(text);
      throw new Error(json?.message || res.statusText);
    } catch {
      throw new Error(res.statusText);
    }
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json();
  }

  return (res.text() as unknown) as T;
}

export const customProductClient = {
  get: <T>(path: string) => customRequest<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: any) => customRequest<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: any) => customRequest<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: any) => customRequest<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string) => customRequest<T>(path, { method: 'DELETE' }),
};

export interface CustomProduct {
  id: string;
  name: string;
  description?: string;
  price?: number;
  status?: string;
  ownerId?: string;
}

export type CustomProductCreatePayload = Omit<CustomProduct, 'id'>;
export type CustomProductUpdatePayload = Partial<CustomProduct>;
export interface CustomProductStatusPatchPayload {
  status: string;
}

export interface CustomCasePayload {
  productVariantId: string;
  configurationJson: string;
  previewUrl: string;
}

export const customProductApi = {
  getMyCustomProducts: () => customProductClient.get<CustomProduct[]>('/api/CustomProduct/my'),
  getCustomProductById: (id: string) => customProductClient.get<CustomProduct>(`/api/CustomProduct/${id}`),
  createCustomProduct: (data: CustomProductCreatePayload) => customProductClient.post<CustomProduct>('/api/CustomProduct', data),
  createCustomCase: (data: CustomCasePayload) => customProductClient.post<CustomProduct>('/api/CustomProduct', data),
  updateCustomProduct: (id: string, data: CustomProductUpdatePayload) => customProductClient.put<CustomProduct>(`/api/CustomProduct/${id}`, data),
  deleteCustomProduct: (id: string) => customProductClient.del<void>(`/api/CustomProduct/${id}`),
  patchCustomProductStatus: (id: string, data: CustomProductStatusPatchPayload) =>
    customProductClient.patch<CustomProduct>(`/api/CustomProduct/${id}/status`, data),
};
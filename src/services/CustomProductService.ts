import { httpClient } from './httpClient';

export interface CreateCustomProductRequest {
  accountId: string;
  productId: string;
  productBaseId?: string;
  color: string;
  material: string;
  textContent: string;
  note: string;
  quantity: number;
  imageUrls?: string[];
  designElements?: any[];
  designSnapshot?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface UpdateCustomProductQuoteRequest {
  price: number;
  estimatedDeliveryDate: string;
  note: string;
}

export interface UpdateCustomProductStatusRequest {
  status: string;
  note?: string;
}

export interface FileAttachment {
  id: string;
  fileUrl: string;
  fileName?: string | null;
}

export interface ApiCustomProduct {
  id: string;
  accountId?: string;
  productId?: string;
  color?: string;
  material?: string;
  textContent?: string;
  note?: string;
  quantity?: number;
  imageUrls?: string[];
  files?: FileAttachment[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  designSnapshot?: string;
  designElements?: any[];
  price?: number;
  estimatedDeliveryDate?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const customProductService = {
  create: (data: CreateCustomProductRequest) =>
    httpClient.post<ApiCustomProduct>('/api/custom-order/create', data),

  updateQuote: (id: string, data: UpdateCustomProductQuoteRequest) =>
    httpClient.post<ApiCustomProduct>(`/api/custom-order/${id}/quote`, data),

  updateStatus: (id: string, data: UpdateCustomProductStatusRequest) =>
    httpClient.post<ApiCustomProduct>(`/api/custom-order/${id}/status`, data),

  getById: (id: string) =>
    httpClient.get<ApiCustomProduct>(`/api/custom-order/${id}`),

  getAll: () =>
    httpClient.get<ApiCustomProduct[]>('/api/custom-order/get-all'),

  /** Đơn custom của tài khoản (cùng pattern với order get-my) */
  getMy: (accountId: string) =>
    httpClient.post<ApiCustomProduct[]>('/api/custom-order/get-my', { accountId }),
};

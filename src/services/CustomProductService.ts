import { httpClient } from './httpClient';

export interface CreateCustomProductRequest {
  accountId: string;
  productId: string;
  color: string;
  material: string;
  textContent: string;
  note: string;
  quantity: number;
  imageUrls: string[];
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
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
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
};

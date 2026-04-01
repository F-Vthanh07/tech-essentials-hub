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
  estimatedDeliveryDate: string; // ISO 8601 full string: "2026-04-15T00:00:00.000Z"
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

/**
 * Chuyển date string từ input[type="date"] ("2026-04-15")
 * sang ISO 8601 full string ("2026-04-15T00:00:00.000Z")
 * để backend C# DateTime parse đúng.
 */
export const toISODateString = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString();
  // Nếu đã là ISO full string rồi thì giữ nguyên
  if (dateStr.includes('T')) return dateStr;
  return new Date(dateStr + 'T00:00:00.000Z').toISOString();
};

export const customProductService = {
  create: (data: CreateCustomProductRequest) =>
    httpClient.post<ApiCustomProduct>('/api/custom-order/create', data),

  updateQuote: (id: string, data: UpdateCustomProductQuoteRequest) =>
    httpClient.post<ApiCustomProduct>(`/api/custom-order/${id}/quote`, {
      ...data,
      // Đảm bảo luôn gửi đúng format ISO dù caller truyền gì
      estimatedDeliveryDate: toISODateString(data.estimatedDeliveryDate),
    }),

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
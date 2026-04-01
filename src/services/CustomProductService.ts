import { httpClient } from './httpClient';
import { rememberCustomOrderVariantId } from '@/lib/customOrderVariantStorage';

/** Khớp API `CreateCustomOrderRequest`: chỉ gửi `variantId` (biến thể đã chọn). */
export interface CreateCustomProductRequest {
  accountId: string;
  variantId: string;
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
  /** Đồng bộ với `variantId` sau normalize (BE có thể trả tên này). */
  productBaseId?: string;
  /** Biến thể (SKU) — nguồn duy nhất cho custom order. */
  variantId?: string;
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

const normalizeRawId = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed || trimmed.toLowerCase() === 'null') return undefined;
  return trimmed;
};

/**
 * Gom id biến thể dùng cho checkout / order.
 * BE đôi khi trả `productBaseId` khác `variantId` đã gửi (vd. map nhầm sang id khác);
 * khi có `fallback.variantId` (payload create), ưu tiên giữ đúng UUID đã chọn trên UI.
 */
const normalizeCustomProduct = (
  raw: ApiCustomProduct,
  fallback?: Pick<CreateCustomProductRequest, 'variantId'>
): ApiCustomProduct => {
  const variantResolved =
    normalizeRawId(raw.variantId) ??
    normalizeRawId(fallback?.variantId) ??
    normalizeRawId(raw.productBaseId);

  const { productId: _ignoreProductId, ...rest } = raw as ApiCustomProduct & {
    productId?: string;
  };

  return {
    ...rest,
    variantId: variantResolved,
    productBaseId: variantResolved,
  };
};

const normalizeCustomProductList = (items: ApiCustomProduct[] | null | undefined) =>
  Array.isArray(items) ? items.map((item) => normalizeCustomProduct(item)) : [];

export const customProductService = {
  create: (data: CreateCustomProductRequest) =>
    httpClient
      .post<ApiCustomProduct>('/api/custom-order/create', data)
      .then((res) => {
        const normalized = normalizeCustomProduct(res, data);
        if (normalized.id && data.variantId) {
          rememberCustomOrderVariantId(normalized.id, data.variantId);
        }
        return normalized;
      }),

  updateQuote: (id: string, data: UpdateCustomProductQuoteRequest) =>
    httpClient.post<ApiCustomProduct>(`/api/custom-order/${id}/quote`, {
      ...data,
      // Đảm bảo luôn gửi đúng format ISO dù caller truyền gì
      estimatedDeliveryDate: toISODateString(data.estimatedDeliveryDate),
    }),

  updateStatus: (id: string, data: UpdateCustomProductStatusRequest) =>
    httpClient.post<ApiCustomProduct>(`/api/custom-order/${id}/status`, data),

  getById: (id: string) =>
    httpClient
      .get<ApiCustomProduct>(`/api/custom-order/${id}`)
      .then((res) => normalizeCustomProduct(res)),

  getAll: () =>
    httpClient
      .get<ApiCustomProduct[]>('/api/custom-order/get-all')
      .then((res) => normalizeCustomProductList(res)),

  /** Đơn custom của tài khoản (cùng pattern với order get-my) */
  getMy: (accountId: string) =>
    httpClient
      .post<ApiCustomProduct[]>('/api/custom-order/get-my', { accountId })
      .then((res) => normalizeCustomProductList(res)),
};
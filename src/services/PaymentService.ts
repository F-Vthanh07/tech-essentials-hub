import { httpClient } from './httpClient';

// === Types ===

export interface PayOSRequest {
  orderId: string;
}

export interface PayOSResponse {
  paymentUrl?: string;
  checkoutUrl?: string;
  // The actual response format may vary;
  // PayOS typically returns a URL to redirect the user
  [key: string]: any;
}

export interface ApiPayment {
  id: string;
  orderId: string;
  amount?: number;
  currency?: string;
  status?: string;
  paymentMethod?: string;
  transactionCode?: string | null;
  transactionRef?: string | null;
  bankCode?: string | null;
  paidAt?: string | null;
  expiredAt?: string | null;
  paymentUrl?: string | null;
  responseCode?: string | null;
  responseMessage?: string | null;
  createdAt?: string;
  [key: string]: any;
}

export interface ApiPaymentByOrderResponse {
  isSuccess: boolean;
  data: ApiPayment[];
  message?: string | null;
  isNotFound?: boolean;
}

export const getLatestPaymentAttempt = (payments: ApiPayment[]) => {
  if (!payments || payments.length === 0) return null;
  return [...payments].sort((a, b) => {
    const aTime = new Date(a.paidAt || a.expiredAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.paidAt || b.expiredAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  })[0];
};

// === Service ===

export const paymentService = {
  /** Create PayOS payment link for an order */
  createPayOSPayment: (orderId: string) =>
    httpClient.post<PayOSResponse>('/api/Payments/payos/create', { orderId }),

  /** Get payment by ID */
  getPaymentById: (id: string) =>
    httpClient.get<ApiPayment>(`/api/Payments/${id}`),

  /** Get payment by order ID */
  getPaymentByOrder: (orderId: string) =>
    httpClient.get<ApiPaymentByOrderResponse>(`/api/Payments/order/${orderId}`),
};

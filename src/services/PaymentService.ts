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
  status?: string;
  paymentMethod?: string;
  createdAt?: string;
  [key: string]: any;
}

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
    httpClient.get<ApiPayment>(`/api/Payments/order/${orderId}`),
};

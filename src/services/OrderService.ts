import { httpClient } from './httpClient';

// === Types ===

export interface OrderItem {
  variantId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  accountId: string;
  receiverName: string;
  receiverPhone: string;
  addressId: string;
  orderItems: OrderItem[];
}

export interface ApiOrder {
  id: string;
  accountId: string;
  orderItems: ApiOrderItem[];
  items?: ApiOrderItem[];
  totalAmount?: number;
  status?: string;
  orderDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiOrderItem {
  id?: string;
  variantId: string;
  quantity: number;
  price?: number;
  variantName?: string;
}

// === Service ===

export const orderService = {
  /** Get all orders (admin) */
  getAll: () => httpClient.get<ApiOrder[]>('/api/order/get-all'),

  /** Get order by ID */
  getById: (id: string) =>
    httpClient.get<ApiOrder>(`/api/order/get-by-id/${id}`),

  /** Get current user's orders (POST with accountId in body) */
  getMyOrders: (accountId: string) =>
    httpClient.post<ApiOrder[]>('/api/order/get-my', { accountId }),

  /** Get current user's orders by user ID */
  getOrdersByUserId: (userId: string) =>
    httpClient.get<ApiOrder[]>(`/api/order/get-order-by-user-id?userId=${encodeURIComponent(userId)}`),

  /** Create a new order */
  create: (data: CreateOrderRequest) => {
    console.log('[OrderService.create] payload:', data);
    return httpClient.post<ApiOrder>('/api/order/create', data);
  },

  /** Create an order from cart items */
  createFromCartItems: (
    params: { receiverName: string; receiverPhone: string; addressId: string },
    cartItemIds: string[]
  ) => {
    const query = new URLSearchParams({
      ReceiverName: params.receiverName,
      ReceiverPhone: params.receiverPhone,
      AddressId: params.addressId,
    }).toString();
    return httpClient.post<ApiOrder>(
      `/api/order/Create-order-by-card-Items-id?${query}`,
      cartItemIds
    );
  },

  /** Update an order */
  update: (id: string, data: Partial<ApiOrder>) =>
    httpClient.put<ApiOrder>(`/api/order/update/${id}`, data),

  /** Delete an order */
  delete: (id: string) => httpClient.del<any>(`/api/order/delete/${id}`),
};

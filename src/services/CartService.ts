import { httpClient } from './httpClient';

export interface CreateCartResponse {
  id: string;
  accountId: string;
}

export interface CreateCartItemRequest {
  productVariantId: string;
  quantity: number;
}

export interface CartItemResponse {
  id: string;
  cartId: string;
  productVariantId: string;
  productVariantName: string;
  productVariantImageUrl: string;
  productVariantColor: string;
  productVariantSize: string;
  productVariantPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export const cartService = {
  createCart: () =>
    httpClient.post<CreateCartResponse>('/api/cart-item/create-cart'),

  createCartItem: (data: CreateCartItemRequest) =>
    httpClient.post('/api/cart-item/create', data),

  updateCartItem: (cartItemId: string, data: CreateCartItemRequest) =>
    httpClient.put(`/api/cart-item/update/${cartItemId}`, data),

  deleteCartItem: (cartItemId: string) =>
    httpClient.del(`/api/cart-item/delete/${cartItemId}`),

  getAllCartItemsByUser: () =>
    httpClient.get<CartItemResponse[]>('/api/cart-item/get-all-by-user'),
};

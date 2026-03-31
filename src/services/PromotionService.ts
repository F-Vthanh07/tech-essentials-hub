import { httpClient } from './httpClient';

export interface Promotion {
  id: string;
  productId: string;
  productName?: string;
  name: string;
  discountValue: number;
  isPercentage: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CreatePromotionPayload {
  productId: string;
  name: string;
  discountValue: number;
  isPercentage: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const promotionApi = {
  getAll: () => httpClient.get<Promotion[]>('/api/promotion/get-all'),
  getById: (id: string) => httpClient.get<Promotion>(`/api/promotion/get-by-id/${id}`),
  create: (data: CreatePromotionPayload) =>
    httpClient.post<Promotion>('/api/promotion/create', data),
  update: (id: string, data: Partial<CreatePromotionPayload>) =>
    httpClient.put<Promotion>(`/api/promotion/update/${id}`, data),
  delete: (id: string) => httpClient.del<any>(`/api/promotion/delete/${id}`),
};

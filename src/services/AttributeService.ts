import { httpClient } from './httpClient';
import { ApiAttribute } from '@/types/product';

export const attributeService = {
  getAll: () => httpClient.get<ApiAttribute[]>('/api/attributes/get-all'),

  getById: (id: string) =>
    httpClient.get<ApiAttribute>(`/api/attributes/get-by-id/${id}`),

  create: (data: { name: string; dataType: string }) =>
    httpClient.post<ApiAttribute>('/api/attributes/create', data),

  update: (id: string, data: Partial<ApiAttribute>) =>
    httpClient.put<ApiAttribute>(`/api/attributes/update/${id}`, data),

  delete: (id: string) => httpClient.del<any>(`/api/attributes/delete/${id}`),
};

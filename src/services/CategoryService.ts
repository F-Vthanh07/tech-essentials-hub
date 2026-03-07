import { httpClient } from './httpClient';
import { ApiCategory } from '@/types/product';

export const categoryService = {
  getAll: () => httpClient.get<ApiCategory[]>('/api/category/get-all'),

  getById: (id: string) =>
    httpClient.get<ApiCategory>(`/api/category/get-by-id/${id}`),

  create: (data: { parentId?: string | null; name: string; slug: string }) =>
    httpClient.post<ApiCategory>('/api/category/create', data),

  update: (id: string, data: Partial<ApiCategory>) =>
    httpClient.put<ApiCategory>(`/api/category/update/${id}`, data),

  delete: (id: string) => httpClient.del<any>(`/api/category/delete/${id}`),
};

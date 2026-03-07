import { httpClient } from './httpClient';
import { ApiDevice } from '@/types/product';

export const deviceService = {
  getAll: () => httpClient.get<ApiDevice[]>('/api/device/get-all'),

  getById: (id: string) =>
    httpClient.get<ApiDevice>(`/api/device/get-by-id/${id}`),

  create: (data: { name: string; description: string }) =>
    httpClient.post<ApiDevice>('/api/device/create', data),

  update: (id: string, data: Partial<ApiDevice>) =>
    httpClient.put<ApiDevice>(`/api/device/update/${id}`, data),

  delete: (id: string) => httpClient.del<any>(`/api/device/delete/${id}`),
};

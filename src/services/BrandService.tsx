import { httpClient } from './httpClient';

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateBrandPayload {
  name: string;
  logo?: string;
  description?: string;
}

interface UpdateBrandPayload {
  name?: string;
  logo?: string;
  description?: string;
}

export const brandService = {
  // Get all brands
  getAll: () =>
    httpClient.get<Brand[]>('/api/brand/get-all'),

  // Get brand by ID
  getById: (id: string) =>
    httpClient.get<Brand>(`/api/brand/get-by-id/${id}`),

  // Create new brand
  create: (data: CreateBrandPayload) =>
    httpClient.post<Brand>('/api/brand/create', data),

  // Update brand
  update: (id: string, data: UpdateBrandPayload) =>
    httpClient.put<Brand>(`/api/brand/update/${id}`, data),

  // Delete brand
  delete: (id: string) =>
    httpClient.del<any>(`/api/brand/delete/${id}`),
};

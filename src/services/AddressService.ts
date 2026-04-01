import { httpClient } from './httpClient';

export interface CreateAddressRequest {
  accountId: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  streetAddress: string;
}

export interface ApiAddress {
  id: string;
  accountId: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  streetAddress: string;
  isDefault: boolean;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
}

export const addressService = {
  create: (data: CreateAddressRequest) =>
    httpClient.post<ApiAddress>('/api/address/create', data),

  getByAccount: (accountId: string) =>
    httpClient.get<ApiAddress[]>(`/api/address/get-by-account/${accountId}`),

  getById: (id: string) =>
    httpClient.get<ApiAddress>(`/api/address/get-by-id/${id}`),

  update: (id: string, data: Partial<CreateAddressRequest>) =>
    httpClient.put<ApiAddress>(`/api/address/update/${id}`, data),

  delete: (id: string) =>
    httpClient.del<any>(`/api/address/delete/${id}`),
};

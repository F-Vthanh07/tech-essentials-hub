import { httpClient } from "./httpClient";

export interface Rating {
  id: string;
  productId: string;
  accountId: string;
  star: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRatingRequest {
  productId: string;
  accountId: string;
  star: number;
  comment: string;
}

export interface UpdateRatingRequest {
  star: number;
  comment: string;
}

export const ratingService = {
  /** GET /api/rating/get-all */
  getAll: () => httpClient.get<Rating[]>("/api/rating/get-all"),

  /** GET /api/rating/get-by-id/{id} */
  getById: (id: string) => httpClient.get<Rating>(`/api/rating/get-by-id/${id}`),

  /** POST /api/rating/create */
  create: (data: CreateRatingRequest) =>
    httpClient.post<Rating>("/api/rating/create", data),

  /** PUT /api/rating/update/{id} */
  update: (id: string, data: UpdateRatingRequest) =>
    httpClient.put<Rating>(`/api/rating/update/${id}`, data),

  /** DELETE /api/rating/delete/{id} */
  delete: (id: string) => httpClient.del<{ message?: string }>(`/api/rating/delete/${id}`),
};


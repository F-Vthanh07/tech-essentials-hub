import { httpClient } from './httpClient';
import {
  Product,
  ColorVariant,
  ApiProduct,
  ApiProductVariant,
  ApiProductCompatibility,
  ApiProductAttribute,
} from '@/types/product';

export interface UpdateProductPayload {
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  brandId: string;
  categoryId: string;
}

export interface VariantPayload {
  productId: string;
  sku: string;
  name: string;
  stockQuantity: number;
  imageUrl: string;
  color: string;
  size: string;
  price: number;
}

// === API calls ===

export const productApi = {
  getAll: () => httpClient.get<ApiProduct[]>('/api/product/get-all'),
  getById: (id: string) => httpClient.get<ApiProduct>(`/api/product/get-by-id/${id}`),
  create: (data: Omit<ApiProduct, 'id' | 'brandName' | 'categoryName'>) =>
    httpClient.post<ApiProduct>('/api/product/create', data),
  update: (id: string, data: UpdateProductPayload) =>
    httpClient.put<ApiProduct>(`/api/product/update/${id}`, data),
  delete: (id: string) => httpClient.del<any>(`/api/product/delete/${id}`),
};

export const variantApi = {
  getAll: () => httpClient.get<ApiProductVariant[]>('/api/product-variant/get-all'),
  getById: (id: string) =>
    httpClient.get<ApiProductVariant>(`/api/product-variant/get-by-id/${id}`),
  create: (data: VariantPayload) =>
    httpClient.post<ApiProductVariant>('/api/product-variant/create', data),
  update: (id: string, data: VariantPayload) =>
    httpClient.put<ApiProductVariant>(`/api/product-variant/update/${id}`, data),
  delete: (id: string) => httpClient.del<any>(`/api/product-variant/delete/${id}`),
};

export const compatibilityApi = {
  getAll: () =>
    httpClient.get<ApiProductCompatibility[]>('/api/product-compatibility/get-all'),
  getById: (id: string) =>
    httpClient.get<ApiProductCompatibility>(`/api/product-compatibility/get-by-id/${id}`),
  create: (data: { productId: string; deviceId: string; note?: string }) =>
    httpClient.post<ApiProductCompatibility>('/api/product-compatibility/create', data),
  update: (id: string, data: Partial<ApiProductCompatibility>) =>
    httpClient.put<ApiProductCompatibility>(`/api/product-compatibility/update/${id}`, data),
  delete: (id: string) =>
    httpClient.del<any>(`/api/product-compatibility/delete/${id}`),
};

export const productAttributeApi = {
  getAll: () =>
    httpClient.get<ApiProductAttribute[]>('/api/product-attribute/get-all'),
  getById: (id: string) =>
    httpClient.get<ApiProductAttribute>(`/api/product-attribute/get-by-id/${id}`),
  create: (data: { productId: string; attributeId: string; value: string }) =>
    httpClient.post<ApiProductAttribute>('/api/product-attribute/create', data),
  update: (id: string, data: Partial<ApiProductAttribute>) =>
    httpClient.put<ApiProductAttribute>(`/api/product-attribute/update/${id}`, data),
  delete: (id: string) =>
    httpClient.del<any>(`/api/product-attribute/delete/${id}`),
};

// === Mapper: Backend → Frontend Product ===

function mapVariantToColorVariant(v: ApiProductVariant): ColorVariant {
  return {
    id: v.id,
    name: v.name,
    colorCode: v.color,
    price: v.price,
    image: v.imageUrl,
    stockQuantity: v.stockQuantity,
  };
}

export function mapApiToProduct(apiProduct: ApiProduct): Product {
  const productVariants = apiProduct.variants ?? [];
  const firstVariant = productVariants[0];
  const compatDevices = (apiProduct.productCompatibilities ?? [])
    .map((c) => c.deviceName || '')
    .filter(Boolean);

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: apiProduct.price,
    image: firstVariant?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    brand: apiProduct.brandName,
    category: apiProduct.categoryName,
    device: compatDevices[0] || firstVariant?.size || 'Universal',
    rating: 4.5,
    reviewCount: 0,
    isNew: false,
    isBestseller: false,
    discount: 0,
    description: apiProduct.description,
    brandId: apiProduct.brandId,
    categoryId: apiProduct.categoryId,
    isActive: apiProduct.isActive,
    variantId: firstVariant?.id,
    colorVariants: productVariants.length > 0
      ? productVariants.map(mapVariantToColorVariant)
      : undefined,
  };
}

// === High-level service ===

export const productService = {
  /**
   * Fetch all products — variants & compatibilities are embedded in the response.
   */
  async getAllProducts(options?: { includeInactive?: boolean }): Promise<Product[]> {
    const apiProducts = await productApi.getAll();
    const includeInactive = options?.includeInactive ?? false;

    return apiProducts
      .filter((p) => includeInactive || p.isActive)
      .map(mapApiToProduct);
  },

  /**
   * Fetch single product by id (falls back to get-all if get-by-id not available).
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const apiProduct = await productApi.getById(id);
      return mapApiToProduct(apiProduct);
    } catch {
      // fallback: search within get-all
      try {
        const all = await productApi.getAll();
        const found = all.find((p) => p.id === id);
        return found ? mapApiToProduct(found) : null;
      } catch {
        return null;
      }
    }
  },
};

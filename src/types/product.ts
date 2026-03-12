export interface ColorVariant {
  id: string;
  name: string;
  colorCode: string;
  price: number;
  discount?: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  category: string;
  device: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
  discount?: number;
  features?: string[];
  colorVariants?: ColorVariant[];
  // API-specific fields (optional, for mapping)
  brandId?: string;
  categoryId?: string;
  description?: string;
  isActive?: boolean;
  variantId?: string; // first variant ID for ordering
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface FilterState {
  brands: string[];
  categories: string[];
  devices: string[];
  priceRange: [number, number];
}

// === Backend API Response Types ===

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  variants: ApiProductVariant[];
  productAttributes: ApiProductAttribute[];
  productCompatibilities: ApiProductCompatibility[];
}

export interface ApiProductVariant {
  id: string;
  productId: string;
  productName: string | null;
  sku: string;
  name: string;
  stockQuantity: number;
  imageUrl: string;
  color: string;
  size: string;
  price: number;
}

export interface ApiCategory {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  parentName: string | null;
}

export interface ApiDevice {
  id: string;
  name: string;
  description: string;
}

export interface ApiBrand {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
}

export interface ApiProductCompatibility {
  id: string;
  productId: string;
  productName: string | null;
  deviceId: string;
  deviceName: string | null;
  note: string;
}

export interface ApiProductAttribute {
  id: string;
  productId: string;
  productName: string | null;
  attributeId: string;
  attributeName: string | null;
  value: string;
}

export interface ApiAttribute {
  id: string;
  name: string;
  dataType: string;
}

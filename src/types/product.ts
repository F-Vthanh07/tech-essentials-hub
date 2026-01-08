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

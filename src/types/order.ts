import { Product } from "./product";

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface OrderStatus {
  id: string;
  label: string;
  description: string;
  date: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    ward: string;
  };
  paymentMethod: string;
  deliveryDate: string;
  deliveryTime: string;
  trackingNumber?: string;
}

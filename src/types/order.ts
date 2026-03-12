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
  apiOrderId?: string;
  accountId?: string;
  orderNumber: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'cod';
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
  paymentUrl?: string;
  deliveryDate: string;
  deliveryTime: string;
  trackingNumber?: string;
}

import { Order } from "@/types/order";
import { products } from "./products";

export const sampleOrders: Order[] = [
  {
    id: "1",
    orderNumber: "TS20250108001",
    createdAt: "2025-01-08T10:30:00",
    status: "shipping",
    items: [
      { product: products[0], quantity: 1, price: products[0].price },
      { product: products[2], quantity: 2, price: products[2].price },
    ],
    subtotal: 2390000,
    discount: 119500,
    shippingFee: 0,
    total: 2270500,
    shippingAddress: {
      fullName: "Nguyễn Văn A",
      phone: "0912345678",
      address: "123 Đường ABC",
      province: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
    },
    paymentMethod: "COD",
    deliveryDate: "2025-01-10",
    deliveryTime: "Sáng (8:00 - 12:00)",
    trackingNumber: "GHTK123456789",
  },
  {
    id: "2",
    orderNumber: "TS20250105002",
    createdAt: "2025-01-05T14:20:00",
    status: "delivered",
    items: [
      { product: products[1], quantity: 1, price: products[1].price },
    ],
    subtotal: 890000,
    discount: 0,
    shippingFee: 30000,
    total: 920000,
    shippingAddress: {
      fullName: "Nguyễn Văn A",
      phone: "0912345678",
      address: "123 Đường ABC",
      province: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
    },
    paymentMethod: "Banking",
    deliveryDate: "2025-01-07",
    deliveryTime: "Chiều (14:00 - 18:00)",
    trackingNumber: "GHTK987654321",
  },
  {
    id: "3",
    orderNumber: "TS20241228003",
    createdAt: "2024-12-28T09:15:00",
    status: "delivered",
    items: [
      { product: products[3], quantity: 1, price: products[3].price },
      { product: products[4], quantity: 1, price: products[4].price },
    ],
    subtotal: 3290000,
    discount: 164500,
    shippingFee: 0,
    total: 3125500,
    shippingAddress: {
      fullName: "Nguyễn Văn A",
      phone: "0912345678",
      address: "123 Đường ABC",
      province: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
    },
    paymentMethod: "MoMo",
    deliveryDate: "2024-12-30",
    deliveryTime: "Tối (18:00 - 21:00)",
    trackingNumber: "GHTK456789123",
  },
  {
    id: "4",
    orderNumber: "TS20250108004",
    createdAt: "2025-01-08T08:00:00",
    status: "confirmed",
    items: [
      { product: products[5], quantity: 1, price: products[5].price },
    ],
    subtotal: 1590000,
    discount: 0,
    shippingFee: 0,
    total: 1590000,
    shippingAddress: {
      fullName: "Nguyễn Văn A",
      phone: "0912345678",
      address: "123 Đường ABC",
      province: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
    },
    paymentMethod: "VNPay",
    deliveryDate: "2025-01-11",
    deliveryTime: "Sáng (8:00 - 12:00)",
  },
];

export const getOrderStatusSteps = (status: Order['status']) => {
  const steps = [
    { id: 'pending', label: 'Đặt hàng', description: 'Đơn hàng đã được tạo' },
    { id: 'confirmed', label: 'Xác nhận', description: 'Đơn hàng đã được xác nhận' },
    { id: 'shipping', label: 'Đang giao', description: 'Đơn hàng đang được vận chuyển' },
    { id: 'delivered', label: 'Hoàn thành', description: 'Đơn hàng đã giao thành công' },
  ];

  const statusOrder = ['pending', 'confirmed', 'shipping', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);

  return steps.map((step, index) => ({
    ...step,
    completed: index < currentIndex,
    current: index === currentIndex,
    date: index <= currentIndex ? new Date().toLocaleDateString('vi-VN') : '',
  }));
};

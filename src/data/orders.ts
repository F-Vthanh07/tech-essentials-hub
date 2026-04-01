import { Order } from "@/types/order";

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

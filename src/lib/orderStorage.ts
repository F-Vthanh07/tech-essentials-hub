import { Order } from "@/types/order";

const STORAGE_KEY = "techhub_orders";

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredOrders = (orders: Order[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const prependStoredOrder = (order: Order) => {
  const orders = getStoredOrders();
  const filtered = orders.filter((item) => item.id !== order.id);
  saveStoredOrders([order, ...filtered]);
};

export const getStoredOrderById = (orderId: string) => {
  return getStoredOrders().find((order) => order.id === orderId) || null;
};

export const updateStoredOrder = (orderId: string, updates: Partial<Order>) => {
  const orders = getStoredOrders().map((order) =>
    order.id === orderId ? { ...order, ...updates } : order
  );
  saveStoredOrders(orders);
};

export const generateOrderNumber = () => {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  return `TS${date}${time}`;
};
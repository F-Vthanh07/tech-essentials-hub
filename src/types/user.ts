export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  points: number;
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  createdAt: string;
}

export interface PointsHistory {
  id: string;
  userId: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

export const MEMBERSHIP_LEVELS = {
  bronze: { name: 'Đồng', minSpent: 0, pointsMultiplier: 1, color: 'bg-amber-600' },
  silver: { name: 'Bạc', minSpent: 5000000, pointsMultiplier: 1.5, color: 'bg-gray-400' },
  gold: { name: 'Vàng', minSpent: 15000000, pointsMultiplier: 2, color: 'bg-yellow-500' },
  platinum: { name: 'Bạch Kim', minSpent: 50000000, pointsMultiplier: 3, color: 'bg-purple-500' },
};

export const POINTS_PER_VND = 1000; // 1 điểm cho mỗi 1000đ

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, PointsHistory, SavedAddress, MEMBERSHIP_LEVELS, POINTS_PER_VND } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addPoints: (amount: number, description: string, orderId?: string) => void;
  spendPoints: (amount: number, description: string) => boolean;
  getPointsHistory: () => PointsHistory[];
  saveAddress: (address: Omit<SavedAddress, 'id'>) => void;
  deleteAddress: (addressId: string) => void;
  getSavedAddresses: () => SavedAddress[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const saveUser = (userData: User) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    // Also save to users list
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingIndex = users.findIndex((u: User) => u.id === userData.id);
    if (existingIndex >= 0) {
      users[existingIndex] = userData;
    } else {
      users.push(userData);
    }
    localStorage.setItem('users', JSON.stringify(users));
    setUser(userData);
  };

  const calculateMembershipLevel = (totalSpent: number): User['membershipLevel'] => {
    if (totalSpent >= MEMBERSHIP_LEVELS.platinum.minSpent) return 'platinum';
    if (totalSpent >= MEMBERSHIP_LEVELS.gold.minSpent) return 'gold';
    if (totalSpent >= MEMBERSHIP_LEVELS.silver.minSpent) return 'silver';
    return 'bronze';
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
    
    const foundUser = users.find((u: User) => u.email === email);
    if (foundUser && passwords[email] === password) {
      saveUser(foundUser);
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string, phone?: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find((u: User) => u.email === email);
    
    if (existingUser) {
      return false; // Email already exists
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      phone,
      points: 100, // Welcome bonus
      membershipLevel: 'bronze',
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };

    // Save password separately
    const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
    passwords[email] = password;
    localStorage.setItem('passwords', JSON.stringify(passwords));

    // Add welcome points to history
    const history = JSON.parse(localStorage.getItem('pointsHistory') || '[]');
    history.push({
      id: `ph_${Date.now()}`,
      userId: newUser.id,
      type: 'earn',
      amount: 100,
      description: 'Điểm thưởng chào mừng thành viên mới',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('pointsHistory', JSON.stringify(history));

    saveUser(newUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    saveUser(updatedUser);
  };

  const addPoints = (orderAmount: number, description: string, orderId?: string) => {
    if (!user) return;

    const multiplier = MEMBERSHIP_LEVELS[user.membershipLevel].pointsMultiplier;
    const earnedPoints = Math.floor((orderAmount / POINTS_PER_VND) * multiplier);
    const newTotalSpent = user.totalSpent + orderAmount;
    const newMembershipLevel = calculateMembershipLevel(newTotalSpent);

    const updatedUser: User = {
      ...user,
      points: user.points + earnedPoints,
      totalSpent: newTotalSpent,
      membershipLevel: newMembershipLevel,
    };

    // Add to history
    const history = JSON.parse(localStorage.getItem('pointsHistory') || '[]');
    history.push({
      id: `ph_${Date.now()}`,
      userId: user.id,
      type: 'earn',
      amount: earnedPoints,
      description,
      orderId,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('pointsHistory', JSON.stringify(history));

    saveUser(updatedUser);
  };

  const spendPoints = (amount: number, description: string): boolean => {
    if (!user || user.points < amount) return false;

    const updatedUser: User = {
      ...user,
      points: user.points - amount,
    };

    // Add to history
    const history = JSON.parse(localStorage.getItem('pointsHistory') || '[]');
    history.push({
      id: `ph_${Date.now()}`,
      userId: user.id,
      type: 'spend',
      amount,
      description,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('pointsHistory', JSON.stringify(history));

    saveUser(updatedUser);
    return true;
  };

  const getPointsHistory = (): PointsHistory[] => {
    if (!user) return [];
    const history = JSON.parse(localStorage.getItem('pointsHistory') || '[]');
    return history.filter((h: PointsHistory) => h.userId === user.id);
  };

  const saveAddress = (address: Omit<SavedAddress, 'id'>) => {
    if (!user) return;
    
    const newAddress: SavedAddress = {
      ...address,
      id: `addr_${Date.now()}`,
    };
    
    const currentAddresses = user.savedAddresses || [];
    
    // If this is set as default, remove default from others
    let updatedAddresses = currentAddresses;
    if (address.isDefault) {
      updatedAddresses = currentAddresses.map(addr => ({ ...addr, isDefault: false }));
    }
    
    // If no addresses exist, make this one default
    if (updatedAddresses.length === 0) {
      newAddress.isDefault = true;
    }
    
    updatedAddresses.push(newAddress);
    
    const updatedUser = { ...user, savedAddresses: updatedAddresses };
    saveUser(updatedUser);
  };

  const deleteAddress = (addressId: string) => {
    if (!user) return;
    
    const currentAddresses = user.savedAddresses || [];
    const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);
    
    // If deleted address was default, make first one default
    if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }
    
    const updatedUser = { ...user, savedAddresses: updatedAddresses };
    saveUser(updatedUser);
  };

  const getSavedAddresses = (): SavedAddress[] => {
    return user?.savedAddresses || [];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        addPoints,
        spendPoints,
        getPointsHistory,
        saveAddress,
        deleteAddress,
        getSavedAddresses,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User, 
  Crown, 
  Star, 
  Gift, 
  TrendingUp, 
  History, 
  Settings, 
  LogOut,
  Award,
  ShoppingBag,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check
} from 'lucide-react';
import { User as UserType, MEMBERSHIP_LEVELS, PointsHistory, SavedAddress } from '@/types/user';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, setAuth, logout: authLogout } = useAuth() as any;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(`https://accessoriesshop.onrender.com/api/account/get-by-id/${user.id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
          setEditName(data.username || user.name || '');
          setEditPhone(data.phoneNumber || user.phone || '');
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    
    fetchProfile();
  }, [user?.id, token]);
  
  const displayName = profileData?.username || user?.name || 'Người dùng';
  const displayEmail = profileData?.email || user?.email || '';
  const displayPhone = profileData?.phoneNumber || user?.phone || '';
  
  // initialize local edit fields when context user changes
  useEffect(() => {
    if (user && !profileData) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
    }
  }, [user, profileData]);

  // Helper function to update user
  const updateUser = (updates: Partial<UserType>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingIndex = users.findIndex((u: UserType) => u.id === updatedUser.id);
    if (existingIndex >= 0) {
      users[existingIndex] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    localStorage.setItem('users', JSON.stringify(users));
    setAuth(updatedUser, null);
  };

  // Helper function to logout
  const logout = () => {
    authLogout();
    navigate('/');
  };

  if (!user) {
    navigate('/');
    return null;
  }

  const handleSaveProfile = () => {
    updateUser({ name: editName, phone: editPhone });
    setIsEditing(false);
    toast.success('Cập nhật thông tin thành công!');
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Tabs defaultValue="settings" className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
          {/* Sidebar / User Profile Info */}
          <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
            <div className="bg-card rounded-2xl p-6 border shadow-sm sticky top-24">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-primary/60 text-primary-foreground flex items-center justify-center text-4xl font-bold shadow-lg mb-5 ring-4 ring-background uppercase">
                  {displayName.charAt(0)}
                </div>
                <h2 className="text-xl font-bold">{displayName}</h2>
                <p className="text-sm text-muted-foreground mb-6 truncate max-w-full">{displayEmail}</p>
                <div className="w-full border-t border-border/50 pt-6"></div>
                
                <TabsList className="flex flex-col h-auto bg-transparent w-full space-y-2 p-0">
                  <TabsTrigger 
                    value="settings" 
                    className="w-full justify-start px-4 py-3 h-auto text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-xl transition-all"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Cài đặt tài khoản
                  </TabsTrigger>
                </TabsList>

                <Button variant="ghost" onClick={handleLogout} className="w-full flex justify-start px-4 py-3 h-auto text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl mt-2 transition-all">
                  <LogOut className="w-5 h-5 mr-3" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <TabsContent value="settings" className="m-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 bg-gradient-to-r from-primary/5 to-transparent border-b">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <User className="w-6 h-6 text-primary" />
                    Thông tin cá nhân
                  </h2>
                  <p className="text-muted-foreground mt-2">Quản lý định danh và thông tin liên hệ của bạn</p>
                </div>
                <div className="p-6 sm:p-8">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Họ và tên</Label>
                          <Input 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)} 
                            className="bg-background focus-visible:ring-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Số điện thoại</Label>
                          <Input 
                            value={editPhone} 
                            onChange={(e) => setEditPhone(e.target.value)} 
                            className="bg-background focus-visible:ring-primary"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium">Email <span className="text-muted-foreground font-normal">(Không thể thay đổi)</span></Label>
                          <Input value={displayEmail} disabled className="bg-muted text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-6 border-t border-border/50">
                        <Button onClick={handleSaveProfile} className="px-8 shadow-md hover:shadow-lg transition-all rounded-full">Lưu thay đổi</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-full">Hủy bỏ</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                        <div className="space-y-1.5 p-4 rounded-xl bg-secondary/30">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Họ và tên</Label>
                          <p className="text-lg font-medium tracking-tight">{displayName}</p>
                        </div>
                        <div className="space-y-1.5 p-4 rounded-xl bg-secondary/30">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Số điện thoại</Label>
                          <p className="text-lg font-medium tracking-tight">{displayPhone || 'Chưa cập nhật'}</p>
                        </div>
                        <div className="space-y-1.5 p-4 rounded-xl bg-secondary/30">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                          <p className="text-lg font-medium tracking-tight break-all">{displayEmail}</p>
                        </div>
                        <div className="space-y-1.5 p-4 rounded-xl bg-secondary/30">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ngày tham gia</Label>
                          <p className="text-lg font-medium tracking-tight">{formatDate(user?.createdAt || new Date().toISOString())}</p>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-border/50">
                        <Button onClick={() => setIsEditing(true)} variant="secondary" className="px-6 gap-2 rounded-full h-11 transition-all hover:bg-primary hover:text-primary-foreground">
                          <Pencil className="w-4 h-4" />
                          Cập nhật thông tin
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </main>

      <Footer />

    </div>
  );
};

export default Profile;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MEMBERSHIP_LEVELS } from '@/types/user';
import { toast } from 'sonner';
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
  ShoppingBag
} from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout, getPointsHistory } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  if (!user) {
    navigate('/');
    return null;
  }

  const currentLevel = MEMBERSHIP_LEVELS[user.membershipLevel];
  const levels = Object.entries(MEMBERSHIP_LEVELS);
  const currentLevelIndex = levels.findIndex(([key]) => key === user.membershipLevel);
  const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null;
  
  const progressToNextLevel = nextLevel 
    ? ((user.totalSpent - currentLevel.minSpent) / (nextLevel[1].minSpent - currentLevel.minSpent)) * 100
    : 100;

  const pointsHistory = getPointsHistory().sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSaveProfile = () => {
    updateUser({ name: editName, phone: editPhone });
    setIsEditing(false);
    toast.success('Cập nhật thông tin thành công!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tài khoản của tôi</h1>
            <p className="text-muted-foreground">Quản lý thông tin và xem lịch sử tích điểm</p>
          </div>

          {/* Membership Card */}
          <Card className="mb-8 overflow-hidden">
            <div className={`${currentLevel.color} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Crown className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Hạng thành viên</p>
                    <h2 className="text-2xl font-bold">{currentLevel.name}</h2>
                    <p className="text-white/80 text-sm">
                      Nhân điểm x{currentLevel.pointsMultiplier}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">Điểm tích lũy</p>
                  <p className="text-4xl font-bold">{user.points.toLocaleString()}</p>
                  <p className="text-white/80 text-sm">điểm</p>
                </div>
              </div>
            </div>
            
            {nextLevel && (
              <CardContent className="pt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Tiến độ lên hạng {nextLevel[1].name}</span>
                  <span>{formatCurrency(user.totalSpent)} / {formatCurrency(nextLevel[1].minSpent)}</span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Cần thêm {formatCurrency(nextLevel[1].minSpent - user.totalSpent)} để lên hạng tiếp theo
                </p>
              </CardContent>
            )}
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Điểm hiện có</span>
                </div>
                <p className="text-2xl font-bold mt-1">{user.points.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Tổng chi tiêu</span>
                </div>
                <p className="text-2xl font-bold mt-1">{formatCurrency(user.totalSpent)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Hệ số điểm</span>
                </div>
                <p className="text-2xl font-bold mt-1">x{currentLevel.pointsMultiplier}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Quy đổi</span>
                </div>
                <p className="text-2xl font-bold mt-1">{formatCurrency(user.points * 1000)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Lịch sử điểm
              </TabsTrigger>
              <TabsTrigger value="levels" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Hạng thành viên
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Cài đặt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Lịch sử tích điểm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pointsHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Chưa có lịch sử tích điểm</p>
                      <p className="text-sm">Mua hàng để bắt đầu tích điểm!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pointsHistory.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              item.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {item.type === 'earn' ? <TrendingUp className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-medium">{item.description}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                            </div>
                          </div>
                          <Badge variant={item.type === 'earn' ? 'default' : 'destructive'}>
                            {item.type === 'earn' ? '+' : '-'}{item.amount} điểm
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="levels" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Các hạng thành viên
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {levels.map(([key, level], index) => (
                      <div 
                        key={key} 
                        className={`p-4 rounded-lg border-2 ${
                          key === user.membershipLevel ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full ${level.color} flex items-center justify-center text-white`}>
                              <Crown className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{level.name}</h3>
                                {key === user.membershipLevel && (
                                  <Badge variant="secondary">Hiện tại</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {index === 0 ? 'Mặc định' : `Chi tiêu từ ${formatCurrency(level.minSpent)}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">x{level.pointsMultiplier}</p>
                            <p className="text-sm text-muted-foreground">hệ số điểm</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Thông tin cá nhân
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label>Họ và tên</Label>
                        <Input 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user.email} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Số điện thoại</Label>
                        <Input 
                          value={editPhone} 
                          onChange={(e) => setEditPhone(e.target.value)} 
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile}>Lưu thay đổi</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Hủy</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Họ và tên</Label>
                        <p className="font-medium">{user.name}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Số điện thoại</Label>
                        <p className="font-medium">{user.phone || 'Chưa cập nhật'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Ngày tham gia</Label>
                        <p className="font-medium">{formatDate(user.createdAt)}</p>
                      </div>
                      <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
                    </>
                  )}

                  <div className="pt-6 border-t">
                    <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;

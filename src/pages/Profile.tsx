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
import { SavedAddress } from '@/types/user';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout, getPointsHistory } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  
  // Address management state
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<SavedAddress, 'id'>>({
    fullName: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    isDefault: false,
  });

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

  const resetAddressForm = () => {
    setAddressForm({
      fullName: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      province: '',
      district: '',
      ward: '',
      address: '',
      isDefault: false,
    });
    setEditingAddress(null);
  };

  const handleOpenAddAddress = () => {
    resetAddressForm();
    setIsAddressDialogOpen(true);
  };

  const handleOpenEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      email: address.email || '',
      province: address.province,
      district: address.district,
      ward: address.ward || '',
      address: address.address,
      isDefault: address.isDefault || false,
    });
    setIsAddressDialogOpen(true);
  };

  const handleSaveAddress = () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.province || !addressForm.district || !addressForm.address) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const savedAddresses = user?.savedAddresses || [];
    
    if (editingAddress) {
      // Update existing address
      const updatedAddresses = savedAddresses.map(addr => {
        if (addr.id === editingAddress.id) {
          return { ...addressForm, id: addr.id };
        }
        // If new address is default, remove default from others
        if (addressForm.isDefault && addr.isDefault) {
          return { ...addr, isDefault: false };
        }
        return addr;
      });
      updateUser({ savedAddresses: updatedAddresses });
      toast.success('Cập nhật địa chỉ thành công!');
    } else {
      // Add new address
      const newAddress: SavedAddress = {
        ...addressForm,
        id: Date.now().toString(),
      };
      
      // If new address is default, remove default from others
      const updatedAddresses = addressForm.isDefault 
        ? savedAddresses.map(addr => ({ ...addr, isDefault: false }))
        : savedAddresses;
      
      updateUser({ savedAddresses: [...updatedAddresses, newAddress] });
      toast.success('Thêm địa chỉ mới thành công!');
    }
    
    setIsAddressDialogOpen(false);
    resetAddressForm();
  };

  const handleDeleteAddress = (addressId: string) => {
    const updatedAddresses = (user?.savedAddresses || []).filter(addr => addr.id !== addressId);
    updateUser({ savedAddresses: updatedAddresses });
    toast.success('Đã xóa địa chỉ');
  };

  const handleSetDefaultAddress = (addressId: string) => {
    const updatedAddresses = (user?.savedAddresses || []).map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    updateUser({ savedAddresses: updatedAddresses });
    toast.success('Đã đặt làm địa chỉ mặc định');
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


          {/* Tabs */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Lịch sử điểm</span>
                <span className="sm:hidden">Điểm</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Địa chỉ</span>
                <span className="sm:hidden">Địa chỉ</span>
              </TabsTrigger>
              <TabsTrigger value="levels" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Hạng thành viên</span>
                <span className="sm:hidden">Hạng</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Cài đặt</span>
                <span className="sm:hidden">Cài đặt</span>
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

            <TabsContent value="addresses" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Địa chỉ giao hàng
                  </CardTitle>
                  <Button onClick={handleOpenAddAddress} size="sm" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Thêm địa chỉ
                  </Button>
                </CardHeader>
                <CardContent>
                  {(!user?.savedAddresses || user.savedAddresses.length === 0) ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Chưa có địa chỉ nào được lưu</p>
                      <p className="text-sm">Thêm địa chỉ để thuận tiện khi đặt hàng!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {user.savedAddresses.map((address) => (
                        <div 
                          key={address.id} 
                          className={`p-4 rounded-lg border-2 ${
                            address.isDefault ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">{address.fullName}</p>
                                {address.isDefault && (
                                  <Badge variant="secondary" className="text-xs">Mặc định</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{address.phone}</p>
                              {address.email && (
                                <p className="text-sm text-muted-foreground">{address.email}</p>
                              )}
                              <p className="text-sm mt-2">
                                {address.address}, {address.ward && `${address.ward}, `}{address.district}, {address.province}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              {!address.isDefault && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span className="hidden sm:inline">Đặt mặc định</span>
                                </Button>
                              )}
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleOpenEditAddress(address)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
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

      {/* Address Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Họ và tên *</Label>
              <Input 
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại *</Label>
              <Input 
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                placeholder="0901234567"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                value={addressForm.email}
                onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Tỉnh/Thành phố *</Label>
              <Input 
                value={addressForm.province}
                onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                placeholder="TP. Hồ Chí Minh"
              />
            </div>
            <div className="space-y-2">
              <Label>Quận/Huyện *</Label>
              <Input 
                value={addressForm.district}
                onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                placeholder="Quận 1"
              />
            </div>
            <div className="space-y-2">
              <Label>Phường/Xã</Label>
              <Input 
                value={addressForm.ward}
                onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                placeholder="Phường Bến Nghé"
              />
            </div>
            <div className="space-y-2">
              <Label>Địa chỉ chi tiết *</Label>
              <Input 
                value={addressForm.address}
                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                placeholder="Số nhà, tên đường..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">Đặt làm địa chỉ mặc định</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveAddress}>
              {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;

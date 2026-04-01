import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Wallet, Building2, Truck, FileText, ChevronRight, MapPin, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ColorVariant, Product } from "@/types/product";
import { SavedAddress } from "@/types/user";
import { useCart } from "@/contexts/CartContext";
import { Order } from "@/types/order";
import { generateOrderNumber, prependStoredOrder, updateStoredOrder } from "@/lib/orderStorage";
import { addressService } from "@/services/AddressService";
import { VietnamProvince, VietnamDistrict, VietnamWard, vietnamLocationService } from "@/services/VietnamLocationService";
import { AddressFormDialog } from "@/components/address/AddressFormDialog";

interface CartItem extends Product {
  quantity: number;
  selectedColor?: ColorVariant;
  variantId?: string;
}

const paymentMethods = [
  { id: "cod", name: "Thanh toán khi nhận hàng", icon: "truck", description: "Thanh toán tiền mặt khi nhận hàng" },
  { id: "bank", name: "Chuyển khoản ngân hàng", icon: "building", description: "Chuyển khoản qua tài khoản ngân hàng" },
  { id: "momo", name: "Ví MoMo", icon: "wallet", description: "Thanh toán qua ví điện tử MoMo" },
  { id: "vnpay", name: "VNPay", icon: "credit", description: "Thanh toán qua cổng VNPay" },
];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, clearCart } = useCart();
  const locationCartItems: CartItem[] | undefined = location.state?.cartItems;
  const isBuyNow = Boolean(location.state?.buyNow);
  const cartItems: CartItem[] = locationCartItems || items.map((item) => ({
    ...item.product,
    quantity: item.quantity,
    selectedColor: item.selectedColor,
    variantId: item.variantId,
  }));
  const appliedDiscount = location.state?.discount || 0;
  const { user, token, setAuth } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    province: "",
    provinceCode: "",
    district: "",
    districtCode: "",
    ward: "",
    wardCode: "",
    address: "",
    note: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isCompanyInvoice, setIsCompanyInvoice] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    companyTaxCode: "",
    companyAddress: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveThisAddress, setSaveThisAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Vietnam location data
  const [locationData, setLocationData] = useState<Record<string, VietnamProvince> | null>(null);
  const [provinces, setProvinces] = useState<VietnamProvince[]>([]);
  const [districts, setDistricts] = useState<VietnamDistrict[]>([]);
  const [wards, setWards] = useState<VietnamWard[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  // Address dialog
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  useEffect(() => {
    setIsLoadingLocations(true);
    vietnamLocationService.loadAll().then((data) => {
      setLocationData(data);
      setProvinces(vietnamLocationService.getProvinces(data));
      setIsLoadingLocations(false);
    });
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!formData.province || !locationData) {
      setDistricts([]);
      setWards([]);
      return;
    }
    setDistricts(vietnamLocationService.getDistricts(locationData, formData.province));
    setFormData(prev => ({ ...prev, district: "", ward: "" }));
    setWards([]);
  }, [formData.province, locationData]);

  // Load wards when district changes
  useEffect(() => {
    if (!formData.province || !formData.district || !locationData) {
      setWards([]);
      return;
    }
    setWards(vietnamLocationService.getWards(locationData, formData.province, formData.district));
    setFormData(prev => ({ ...prev, ward: "" }));
  }, [formData.province, formData.district, locationData]);

  // Helper functions for address management
  const getSavedAddresses = (): SavedAddress[] => {
    if (!user) return [];
    return user.savedAddresses || [];
  };

  const saveAddress = (address: Omit<SavedAddress, 'id'>) => {
    if (!user) return;

    const newAddress: SavedAddress = {
      ...address,
      id: `addr_${Date.now()}`,
    };

    const currentAddresses = user.savedAddresses || [];

    let updatedAddresses = currentAddresses;
    if (address.isDefault) {
      updatedAddresses = currentAddresses.map(addr => ({ ...addr, isDefault: false }));
    }

    if (updatedAddresses.length === 0) {
      newAddress.isDefault = true;
    }

    updatedAddresses.push(newAddress);

    const updatedUser = { ...user, savedAddresses: updatedAddresses };
    setAuth(updatedUser, token);
  };

  const deleteAddress = (addressId: string) => {
    if (!user) return;

    const currentAddresses = user.savedAddresses || [];
    const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);

    if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }

    const updatedUser = { ...user, savedAddresses: updatedAddresses };
    setAuth(updatedUser, token);
  };

  const savedAddresses = getSavedAddresses();

  // Load user from localStorage and default address on mount
  useEffect(() => {
    if (user) {
      if (user.savedAddresses && user.savedAddresses.length > 0) {
        const defaultAddress = user.savedAddresses.find((addr: SavedAddress) => addr.isDefault) || user.savedAddresses[0];
        if (defaultAddress) {
          loadAddress(defaultAddress);
          setSelectedAddressId(defaultAddress.id);
        }
      }
    }
  }, [user]);

  const loadAddress = (address: SavedAddress) => {
    const provinceName = address.province || (address.provinceCode ? getProvinceName(address.provinceCode) : "");
    const districtName = address.district || (address.provinceCode && address.districtCode ? getDistrictName(address.provinceCode, address.districtCode) : "");
    const wardName = address.ward || (address.provinceCode && address.districtCode && address.wardCode ? getWardName(address.provinceCode, address.districtCode, address.wardCode) : "");
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      email: address.email || "",
      province: provinceName,
      provinceCode: address.provinceCode || "",
      district: districtName,
      districtCode: address.districtCode || "",
      ward: wardName,
      wardCode: address.wardCode || "",
      address: address.address,
      note: "",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getItemUnitPrice = (item: CartItem) => {
    const price = item.selectedColor?.price ?? item.price;
    const discount = item.selectedColor?.discount ?? item.discount ?? 0;
    return price * (1 - discount / 100);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + getItemUnitPrice(item) * item.quantity, 0);
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal - discountAmount + shippingFee;

  const buildStoredOrder = (apiOrderId?: string, paymentUrl?: string, paymentStatus?: Order["paymentStatus"]): Order => ({
    id: apiOrderId || `local_${Date.now()}`,
    apiOrderId,
    accountId: user?.id,
    orderNumber: generateOrderNumber(),
    createdAt: new Date().toISOString(),
    status: paymentMethod === "cod" ? "confirmed" : "pending",
    paymentStatus: paymentStatus || (paymentMethod === "cod" ? "cod" : "pending"),
    items: cartItems.map((item) => ({
      product: {
        ...item,
        image: item.selectedColor?.image || item.image,
        price: item.selectedColor?.price ?? item.price,
      },
      quantity: item.quantity,
      price: getItemUnitPrice(item),
    })),
    subtotal,
    discount: discountAmount,
    shippingFee,
    total,
    shippingAddress: {
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      province: formData.province,
      district: formData.district,
      ward: formData.ward,
    },
    paymentMethod: paymentMethods.find((item) => item.id === paymentMethod)?.name || paymentMethod,
    paymentUrl,
    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN"),
    deliveryTime: "08:00 - 18:00",
    trackingNumber: paymentMethod === "cod" ? `VC${Date.now()}` : undefined,
  });

  const handleInputChange = (field: string, value: string) => {
    if (field === "province") {
      setFormData(prev => ({
        ...prev,
        provinceCode: value,
        province: locationData ? vietnamLocationService.getProvinceName(locationData, value) : value,
        districtCode: "",
        district: "",
        wardCode: "",
        ward: "",
      }));
      if (value && locationData) {
        setDistricts(vietnamLocationService.getDistricts(locationData, value));
      } else {
        setDistricts([]);
      }
      setWards([]);
      return;
    }
    if (field === "district") {
      setFormData(prev => ({
        ...prev,
        districtCode: value,
        district: locationData ? vietnamLocationService.getDistrictName(locationData, prev.provinceCode, value) : value,
        wardCode: "",
        ward: "",
      }));
      if (value && locationData) {
        setWards(vietnamLocationService.getWards(locationData, formData.provinceCode, value));
      } else {
        setWards([]);
      }
      return;
    }
    if (field === "ward") {
      setFormData(prev => ({
        ...prev,
        wardCode: value,
        ward: locationData ? vietnamLocationService.getWardName(locationData, prev.provinceCode, prev.districtCode, value) : value,
      }));
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanyInfoChange = (field: string, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressDialogOpen(true);
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setIsAddressDialogOpen(true);
  };

  const handleAddressSaved = (savedAddress: SavedAddress) => {
    const currentAddresses = user?.savedAddresses || [];
    const exists = currentAddresses.find(a => a.id === savedAddress.id);
    let updatedAddresses: SavedAddress[];
    if (exists) {
      updatedAddresses = currentAddresses.map(a => a.id === savedAddress.id ? savedAddress : a);
    } else {
      updatedAddresses = savedAddress.isDefault
        ? [...currentAddresses.map(a => ({ ...a, isDefault: false })), savedAddress]
        : [...currentAddresses, savedAddress];
    }
    if (user) {
      setAuth({ ...user, savedAddresses: updatedAddresses }, token);
    }
    loadAddress(savedAddress);
    setSelectedAddressId(savedAddress.id);
    setSaveThisAddress(false);
    toast.success(savedAddress.id === editingAddress?.id ? "Cập nhật địa chỉ thành công!" : "Đã lưu địa chỉ giao hàng");
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      toast.error("Không có sản phẩm để thanh toán");
      navigate("/cart");
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.province || !formData.address) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (isCompanyInvoice && (!companyInfo.companyName || !companyInfo.companyTaxCode)) {
      toast.error("Vui lòng điền đầy đủ thông tin xuất hóa đơn");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cartItems.map(item => ({
        variantId: (item as any).variantId || item.id,
        quantity: item.quantity,
      }));

      const accountId = user?.id || '';

      if (accountId && orderItems.length > 0) {
        const { orderService } = await import('@/services/OrderService');
        const order = await orderService.create({
          accountId,
          orderItems,
        });

        const storedOrder = buildStoredOrder(order.id);
        prependStoredOrder(storedOrder);

        if (paymentMethod === 'bank' || paymentMethod === 'vnpay' || paymentMethod === 'momo') {
          try {
            const { paymentService } = await import('@/services/PaymentService');
            const payment = await paymentService.createPayOSPayment(order.id);
            if (payment.checkoutUrl || payment.paymentUrl) {
              updateStoredOrder(storedOrder.id, {
                paymentUrl: payment.checkoutUrl || payment.paymentUrl,
                paymentStatus: 'pending',
              });
              globalThis.location.href = payment.checkoutUrl || payment.paymentUrl || '';
              return;
            }
          } catch (payErr) {
            console.warn('Payment creation failed, order still created', payErr);
            updateStoredOrder(storedOrder.id, { paymentStatus: 'failed' });
            navigate(`/payment/failed?orderId=${storedOrder.id}`);
            return;
          }
        }

        if (!isBuyNow) {
          clearCart();
        }
        toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
        navigate(`/payment/success?orderId=${storedOrder.id}`);
      } else {
        const storedOrder = buildStoredOrder(undefined, undefined, paymentMethod === 'cod' ? 'cod' : 'pending');
        prependStoredOrder(storedOrder);
        if (!isBuyNow) {
          clearCart();
        }
        toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
        navigate(`/payment/success?orderId=${storedOrder.id}`);
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      toast.error("Có lỗi khi tạo đơn hàng. Vui lòng thử lại.");
      navigate("/payment/failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAddress = (address: SavedAddress) => {
    loadAddress(address);
    setSelectedAddressId(address.id);
    setSaveThisAddress(false);
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await addressService.delete(addressId);
    } catch {
      // Continue with local removal
    }
    deleteAddress(addressId);
    if (selectedAddressId === addressId) {
      setSelectedAddressId(null);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        province: "",
        provinceCode: "",
        district: "",
        districtCode: "",
        ward: "",
        wardCode: "",
        address: "",
        note: "",
      });
    }
    toast.success("Đã xóa địa chỉ");
  };

  const getPaymentIcon = (iconType: string) => {
    switch (iconType) {
      case "truck": return <Truck className="w-5 h-5" />;
      case "building": return <Building2 className="w-5 h-5" />;
      case "wallet": return <Wallet className="w-5 h-5" />;
      case "credit": return <CreditCard className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const getProvinceName = (code: string) => {
    if (!locationData) return code;
    return vietnamLocationService.getProvinceName(locationData, code) || code;
  };

  const getDistrictName = (provinceCode: string, districtCode: string) => {
    if (!locationData) return districtCode;
    return vietnamLocationService.getDistrictName(locationData, provinceCode, districtCode) || districtCode;
  };

  const getWardName = (provinceCode: string, districtCode: string, wardCode: string) => {
    if (!locationData) return wardCode;
    return vietnamLocationService.getWardName(locationData, provinceCode, districtCode, wardCode) || wardCode;
  };

  const displayDistrictName = formData.district ? getDistrictName(formData.province, formData.district) : "";
  const displayWardName = formData.ward ? getWardName(formData.province, formData.district, formData.ward) : "";

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-6">Hãy thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
            <Link to="/">
              <Button variant="brand" size="lg">Quay lại mua sắm</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">Thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses */}
            {user && savedAddresses.length > 0 && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Địa chỉ đã lưu
                </h2>
                <div className="space-y-3">
                  {savedAddresses.map((address) => (
                    <div
                      key={address.id}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all",
                        selectedAddressId === address.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      )}
                      onClick={() => handleSelectAddress(address)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectAddress(address);
                        }
                      }}
                    >
                      <RadioGroupItem value={address.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{address.fullName}</span>
                          {address.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Mặc định</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{address.phone}</p>
                        <p className="text-sm text-muted-foreground">
                          {address.address}
                          {address.ward ? `, ${address.ward}` : ""}
                          {address.district ? `, ${address.district}` : ""}
                          {address.province ? `, ${address.province}` : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address);
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Information */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                {savedAddresses.length > 0 ? "Hoặc nhập địa chỉ mới" : "Thông tin giao hàng"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    placeholder="0912 345 678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                  <Select
                    value={formData.provinceCode}
                    onValueChange={(value) => handleInputChange("province", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingLocations ? "Đang tải..." : "Chọn tỉnh/thành phố"} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.code} value={province.code}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">Quận/Huyện *</Label>
                  <Select
                    value={formData.districtCode}
                    onValueChange={(value) => handleInputChange("district", value)}
                    disabled={!formData.province}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !formData.province
                            ? "Chọn tỉnh trước"
                            : districts.length === 0
                            ? "Đang tải..."
                            : "Chọn quận/huyện"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district.code} value={district.code}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ward">Phường/Xã</Label>
                  <Select
                    value={formData.wardCode}
                    onValueChange={(value) => handleInputChange("ward", value)}
                    disabled={!formData.district}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !formData.district
                            ? "Chọn quận trước"
                            : wards.length === 0
                            ? "Đang tải..."
                            : "Chọn phường/xã"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((ward) => (
                        <SelectItem key={ward.code} value={ward.code}>
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Địa chỉ chi tiết *</Label>
                  <Input
                    id="address"
                    placeholder="Số nhà, tên đường..."
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Textarea
                    id="note"
                    placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                    value={formData.note}
                    onChange={(e) => handleInputChange("note", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Save Address Option */}
            {user && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="saveAddress"
                    checked={saveThisAddress}
                    onCheckedChange={(checked) => setSaveThisAddress(checked as boolean)}
                  />
                  <Label htmlFor="saveAddress" className="flex items-center gap-2 cursor-pointer">
                    <Save className="w-4 h-4 text-primary" />
                    Lưu địa chỉ này cho lần mua sau
                  </Label>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Phương thức thanh toán
              </h2>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={cn(
                      "flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all",
                      paymentMethod === method.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={method.id} id={method.id} />
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                      {getPaymentIcon(method.icon)}
                    </div>
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <span className="font-medium block">{method.name}</span>
                      <span className="text-sm text-muted-foreground">{method.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Company Invoice */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Checkbox
                  id="companyInvoice"
                  checked={isCompanyInvoice}
                  onCheckedChange={(checked) => setIsCompanyInvoice(checked as boolean)}
                />
                <Label htmlFor="companyInvoice" className="text-lg font-semibold flex items-center gap-2 cursor-pointer">
                  <FileText className="w-5 h-5 text-primary" />
                  Xuất hóa đơn công ty
                </Label>
              </div>

              {isCompanyInvoice && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Tên công ty *</Label>
                    <Input
                      id="companyName"
                      placeholder="Công ty TNHH ABC"
                      value={companyInfo.companyName}
                      onChange={(e) => handleCompanyInfoChange("companyName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyTaxCode">Mã số thuế *</Label>
                    <Input
                      id="companyTaxCode"
                      placeholder="0123456789"
                      value={companyInfo.companyTaxCode}
                      onChange={(e) => handleCompanyInfoChange("companyTaxCode", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="companyAddress">Địa chỉ công ty</Label>
                    <Input
                      id="companyAddress"
                      placeholder="Địa chỉ xuất hóa đơn"
                      value={companyInfo.companyAddress}
                      onChange={(e) => handleCompanyInfoChange("companyAddress", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 border border-border sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Đơn hàng của bạn</h2>

              {/* Cart Items */}
              <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                      <p className="text-primary font-semibold text-sm">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Giảm giá ({appliedDiscount}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
                </div>
                {subtotal < 500000 && (
                  <p className="text-xs text-muted-foreground">
                    Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí vận chuyển
                  </p>
                )}
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                variant="brand"
                size="lg"
                className="w-full mt-6"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Bằng việc đặt hàng, bạn đồng ý với{" "}
                <a href="/support" className="text-primary hover:underline">Điều khoản sử dụng</a>
                {" "}và{" "}
                <a href="/support" className="text-primary hover:underline">Chính sách bảo mật</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Reusable Address Form Dialog */}
      <AddressFormDialog
        open={isAddressDialogOpen}
        onOpenChange={setIsAddressDialogOpen}
        userId={user?.id}
        initialAddress={editingAddress}
        onSaved={handleAddressSaved}
      />
    </div>
  );
};

export default Checkout;

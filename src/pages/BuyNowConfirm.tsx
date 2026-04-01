import { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, ShoppingBag, MapPin, Plus, Trash2, User, Phone, Tag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { usePromotions } from "@/contexts/PromotionContext";
import { Product, ColorVariant } from "@/types/product";
import { Order } from "@/types/order";
import { SavedAddress } from "@/types/user";
import { generateOrderNumber, prependStoredOrder, updateStoredOrder } from "@/lib/orderStorage";
import { orderService } from "@/services/OrderService";
import { paymentService } from "@/services/PaymentService";
import { addressService } from "@/services/AddressService";
import { AddressFormDialog } from "@/components/address/AddressFormDialog";

interface BuyNowItem extends Product {
  quantity: number;
  selectedColor?: ColorVariant;
  variantId?: string;
}

interface BuyNowState {
  items?: BuyNowItem[];
  fromCart?: boolean;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const getPaymentUrlFromResponse = (response: any) => {
  return (
    response?.data?.paymentUrl ||
    response?.data?.checkoutUrl ||
    response?.paymentUrl ||
    response?.checkoutUrl ||
    null
  );
};

const BuyNowConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const { clearCart } = useCart();
  const { getPromotionsByProductId, getPromotionByProductId } = usePromotions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = (location.state || {}) as BuyNowState;
  const items = state.items || [];
  const fromCart = Boolean(state.fromCart);

  const getDiscountedPrice = (basePrice: number, productId: string) => {
    const bestPromo = getPromotionByProductId(productId);
    if (!bestPromo) return basePrice;
    if (bestPromo.isPercentage) {
      return basePrice * (1 - bestPromo.discountValue / 100);
    }
    return Math.max(0, basePrice - bestPromo.discountValue);
  };

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const unitPrice = item.selectedColor?.price ?? item.price;
        return sum + unitPrice * item.quantity;
      }, 0),
    [items]
  );

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const unitPrice = item.selectedColor?.price ?? item.price;
        const discountedPrice = getDiscountedPrice(unitPrice, item.id);
        return sum + discountedPrice * item.quantity;
      }, 0),
    [items, getPromotionByProductId]
  );

  const totalDiscount = subtotal - total;

  // Recipient info fields
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // Load addresses from API
  useEffect(() => {
    if (!user?.id) return;
    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const addresses = await addressService.getByAccount(user.id);
        const mapped: SavedAddress[] = addresses.map((addr) => ({
          id: addr.id,
          fullName: "",
          phone: "",
          province: addr.provinceName || "",
          district: addr.districtName || "",
          ward: addr.wardName || "",
          address: addr.streetAddress || "",
          isDefault: addr.isDefault,
          provinceCode: addr.provinceCode,
          districtCode: addr.districtCode,
          wardCode: addr.wardCode,
        }));
        setSavedAddresses(mapped);
        // Auto-select default address
        const defaultAddr = mapped.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (mapped.length > 0) {
          setSelectedAddressId(mapped[0].id);
        }
      } catch (err) {
        console.warn("Could not load saved addresses from API:", err);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [user]);

  // Pre-fill recipient name from user profile
  useEffect(() => {
    if (user) {
      setRecipientName(user.name || "");
      setRecipientPhone(user.phone || "");
    }
  }, [user]);

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressDialogOpen(true);
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setIsAddressDialogOpen(true);
  };

  const handleAddressSaved = (savedAddress: SavedAddress) => {
    setSavedAddresses((prev) => {
      const exists = prev.find((a) => a.id === savedAddress.id);
      if (exists) {
        return prev.map((a) => (a.id === savedAddress.id ? savedAddress : a));
      }
      return [...prev, savedAddress];
    });
    setSelectedAddressId(savedAddress.id);
  };

  const getSelectedAddressDisplay = () => {
    if (!selectedAddressId) return null;
    return savedAddresses.find((a) => a.id === selectedAddressId);
  };

  const selectedAddressDisplay = getSelectedAddressDisplay();

  const handleConfirmOrder = async () => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập trước khi mua ngay");
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      toast.error("Không có sản phẩm để đặt hàng");
      navigate("/products");
      return;
    }

    if (!recipientName.trim()) {
      toast.error("Vui lòng nhập tên người nhận");
      return;
    }

    if (!recipientPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại người nhận");
      return;
    }

    const missingVariant = items.find((item) => !item.variantId);
    if (missingVariant) {
      toast.error(`Sản phẩm "${missingVariant.name}" chưa có biến thể để tạo đơn`);
      return;
    }

    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    setIsSubmitting(true);
    try {
      const requestBody: import("@/services/OrderService").CreateOrderRequest = {
        accountId: user.id,
        receiverName: recipientName,
        receiverPhone: recipientPhone,
        addressId: selectedAddressId,
        orderItems: items.map((item) => ({
          variantId: item.variantId || "",
          quantity: item.quantity,
        })),
      };

      const apiOrder = await orderService.create(requestBody);
      const storedOrderId = apiOrder.id || `local_${Date.now()}`;

      const addr = selectedAddressDisplay;
      const shippingAddress = addr
        ? {
            fullName: recipientName,
            phone: recipientPhone,
            address: addr.address,
            province: addr.province || addr.provinceCode || "",
            district: addr.district || addr.districtCode || "",
            ward: addr.ward || addr.wardCode || "",
          }
        : {
            fullName: recipientName,
            phone: recipientPhone,
            address: "Sẽ cập nhật khi xác nhận giao hàng",
            province: "",
            district: "",
            ward: "",
          };

      const createdOrder: Order = {
        id: storedOrderId,
        apiOrderId: apiOrder.id,
        accountId: user.id,
        orderNumber: generateOrderNumber(),
        createdAt: apiOrder.createdAt || new Date().toISOString(),
        status: (apiOrder.status as Order["status"]) || "pending",
        paymentStatus: "pending",
        items: items.map((item) => ({
          product: {
            ...item,
            image: item.selectedColor?.image || item.image,
            price: item.selectedColor?.price ?? item.price,
          },
          quantity: item.quantity,
          price: item.selectedColor?.price ?? item.price,
        })),
        subtotal: subtotal,
        discount: totalDiscount,
        shippingFee: 0,
        total,
        shippingAddress,
        paymentMethod: "PayOS",
        deliveryDate: "Đang cập nhật",
        deliveryTime: "Đang cập nhật",
      };

      prependStoredOrder(createdOrder);

      if (!apiOrder.id) {
        toast.error("Tạo đơn thành công nhưng thiếu mã orderId để tạo link thanh toán");
        navigate(`/orders/${createdOrder.id}/status`);
        return;
      }

      const payosResponse = await paymentService.createPayOSPayment(apiOrder.id);
      const paymentUrl = getPaymentUrlFromResponse(payosResponse);

      if (!paymentUrl) {
        updateStoredOrder(createdOrder.id, { paymentStatus: "failed" });
        toast.error("Không tạo được link thanh toán");
        navigate(`/payment/failed?orderId=${createdOrder.id}`);
        return;
      }

      updateStoredOrder(createdOrder.id, {
        paymentUrl,
        paymentStatus: "pending",
      });

      if (fromCart) {
        clearCart();
      }

      toast.success("Tạo đơn thành công, đang chuyển đến cổng thanh toán...");
      globalThis.location.href = paymentUrl;
    } catch (error: any) {
      console.error("Create order failed:", error);
      const errMsg = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || error.message || "Tạo đơn hàng thất bại. Vui lòng thử lại";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await addressService.delete(addressId);
    } catch {
      // Continue with local removal even if API fails
    }
    setSavedAddresses((prev) => prev.filter((a) => a.id !== addressId));
    if (selectedAddressId === addressId) {
      setSelectedAddressId(null);
    }
    toast.success("Đã xóa địa chỉ");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Xác nhận đơn hàng</h1>
        </div>

        {items.length === 0 ? (
          <Card className="p-10 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Không có sản phẩm mua ngay</h2>
            <p className="text-muted-foreground mb-4">Bạn hãy quay lại trang sản phẩm để tiếp tục.</p>
            <Button asChild>
              <Link to="/products">Xem tất cả sản phẩm</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Product Cards */}
              {items.map((item) => (
                <Card key={`${item.id}-${item.variantId || "no-variant"}`}>
                  <CardContent className="p-4 flex gap-4">
                    <img
                      src={item.selectedColor?.image || item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold line-clamp-2">{item.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.brand}</p>
                      {item.selectedColor && (
                        <p className="text-sm text-muted-foreground mt-1">Biến thể: {item.selectedColor.name}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">Số lượng: {item.quantity}</span>
                          {/* Promotion Badges */}
                          <div className="flex flex-wrap gap-1">
                            {getPromotionsByProductId(item.id).map(promo => (
                              <Badge key={promo.id} variant="secondary" className="text-[10px] py-0 px-1 border-primary/20 bg-primary/5 text-primary flex items-center gap-1">
                                <Tag className="w-2 h-2" />
                                {promo.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-primary">
                            {formatPrice(getDiscountedPrice(item.selectedColor?.price ?? item.price, item.id) * item.quantity)}
                          </span>
                          {getDiscountedPrice(item.selectedColor?.price ?? item.price, item.id) < (item.selectedColor?.price ?? item.price) && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice((item.selectedColor?.price ?? item.price) * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Recipient Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="w-5 h-5" />
                    Thông tin người nhận
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipientName">Tên người nhận *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="recipientName"
                          placeholder="Nguyễn Văn A"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipientPhone">Số điện thoại *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="recipientPhone"
                          placeholder="0901 234 567"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Saved Addresses Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="w-5 h-5" />
                    Địa chỉ giao hàng
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={handleOpenAddAddress} className="flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Thêm địa chỉ
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingAddresses ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">Đang tải địa chỉ...</span>
                    </div>
                  ) : savedAddresses.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Chưa có địa chỉ nào.</p>
                      <p className="text-xs">Nhấn "Thêm địa chỉ" để tạo mới.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          role="button"
                          tabIndex={0}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3 ${
                            selectedAddressId === address.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedAddressId(address.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedAddressId(address.id);
                            }
                          }}
                        >
                          <Checkbox
                            checked={selectedAddressId === address.id}
                            className="mt-1"
                            onCheckedChange={() => setSelectedAddressId(address.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                              {address.address}
                              {address.ward ? `, ${address.ward}` : ""}
                              {address.district ? `, ${address.district}` : ""}
                              {address.province ? `, ${address.province}` : ""}
                            </p>
                            {address.isDefault && (
                              <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Mặc định</span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary shrink-0"
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
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
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
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Detail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selected Address Summary */}
                  {selectedAddressDisplay && (
                    <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <p className="font-semibold text-sm">{recipientName || "—"}</p>
                      <p className="text-xs text-muted-foreground">{recipientPhone || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedAddressDisplay.address}
                        {selectedAddressDisplay.ward ? `, ${selectedAddressDisplay.ward}` : ""}
                        {selectedAddressDisplay.district ? `, ${selectedAddressDisplay.district}` : ""}
                        {selectedAddressDisplay.province ? `, ${selectedAddressDisplay.province}` : ""}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tài khoản</span>
                      <span>{user?.email || "Chưa đăng nhập"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số sản phẩm</span>
                      <span>{items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tổng số lượng</span>
                      <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-500">
                        <span>Giảm giá</span>
                        <span>-{formatPrice(totalDiscount)}</span>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng tiền</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    variant="brand"
                    onClick={handleConfirmOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Xác nhận và tạo đơn
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
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

export default BuyNowConfirm;

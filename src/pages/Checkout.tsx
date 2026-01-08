import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Wallet, Building2, Truck, Clock, Calendar, FileText, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Product } from "@/types/product";

interface CartItem extends Product {
  quantity: number;
}

const paymentMethods = [
  { id: "cod", name: "Thanh toán khi nhận hàng", icon: "truck", description: "Thanh toán tiền mặt khi nhận hàng" },
  { id: "bank", name: "Chuyển khoản ngân hàng", icon: "building", description: "Chuyển khoản qua tài khoản ngân hàng" },
  { id: "momo", name: "Ví MoMo", icon: "wallet", description: "Thanh toán qua ví điện tử MoMo" },
  { id: "vnpay", name: "VNPay", icon: "credit", description: "Thanh toán qua cổng VNPay" },
];

const deliveryTimeSlots = [
  { id: "morning", label: "Buổi sáng", time: "8:00 - 12:00" },
  { id: "afternoon", label: "Buổi chiều", time: "13:00 - 17:00" },
  { id: "evening", label: "Buổi tối", time: "18:00 - 21:00" },
];

const provinces = [
  "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu"
];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems: CartItem[] = location.state?.cartItems || [];
  const appliedDiscount = location.state?.discount || 0;

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    province: "",
    district: "",
    ward: "",
    address: "",
    note: "",
  });
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();
  const [deliveryTime, setDeliveryTime] = useState("morning");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isCompanyInvoice, setIsCompanyInvoice] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    companyTaxCode: "",
    companyAddress: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal - discountAmount + shippingFee;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanyInfoChange = (field: string, value: string) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.fullName || !formData.phone || !formData.province || !formData.address) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (!deliveryDate) {
      toast.error("Vui lòng chọn ngày giao hàng");
      return;
    }

    if (isCompanyInvoice && (!companyInfo.companyName || !companyInfo.companyTaxCode)) {
      toast.error("Vui lòng điền đầy đủ thông tin xuất hóa đơn");
      return;
    }

    setIsSubmitting(true);

    // Simulate order submission
    setTimeout(() => {
      toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
      navigate("/");
    }, 1500);
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartCount={0} onCartClick={() => {}} />
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
      <Header cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} onCartClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Thanh toán</span>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">Thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Thông tin giao hàng
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
                  <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tỉnh/thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province} value={province}>{province}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">Quận/Huyện *</Label>
                  <Input
                    id="district"
                    placeholder="Nhập quận/huyện"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ward">Phường/Xã</Label>
                  <Input
                    id="ward"
                    placeholder="Nhập phường/xã"
                    value={formData.ward}
                    onChange={(e) => handleInputChange("ward", e.target.value)}
                  />
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

            {/* Delivery Time */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Thời gian giao hàng
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chọn ngày giao hàng *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deliveryDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        disabled={(date) => date < new Date() || date > new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Chọn khung giờ</Label>
                  <RadioGroup value={deliveryTime} onValueChange={setDeliveryTime} className="space-y-2">
                    {deliveryTimeSlots.map((slot) => (
                      <div key={slot.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                        <RadioGroupItem value={slot.id} id={slot.id} />
                        <Label htmlFor={slot.id} className="flex-1 cursor-pointer">
                          <span className="font-medium">{slot.label}</span>
                          <span className="text-muted-foreground ml-2">({slot.time})</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>

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
                <a href="#" className="text-primary hover:underline">Điều khoản sử dụng</a>
                {" "}và{" "}
                <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;

import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Product, ColorVariant } from "@/types/product";
import { Order } from "@/types/order";
import { generateOrderNumber, prependStoredOrder, updateStoredOrder } from "@/lib/orderStorage";
import { orderService } from "@/services/OrderService";
import { paymentService } from "@/services/PaymentService";

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
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = (location.state || {}) as BuyNowState;
  const items = state.items || [];
  const fromCart = Boolean(state.fromCart);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const unitPrice = item.selectedColor?.price ?? item.price;
        return sum + unitPrice * item.quantity;
      }, 0),
    [items]
  );

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

    const missingVariant = items.find((item) => !item.variantId);
    if (missingVariant) {
      toast.error(`Sản phẩm "${missingVariant.name}" chưa có biến thể để tạo đơn`);
      return;
    }

    setIsSubmitting(true);
    try {
      const requestBody = {
        accountId: user.id,
        orderItems: items.map((item) => ({
          variantId: item.variantId || "",
          quantity: item.quantity,
        })),
      };

      const apiOrder = await orderService.create(requestBody);
      const storedOrderId = apiOrder.id || `local_${Date.now()}`;

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
        subtotal: total,
        discount: 0,
        shippingFee: 0,
        total,
        shippingAddress: {
          fullName: user.name || "Khách hàng",
          phone: user.phone || "",
          address: "Sẽ cập nhật khi xác nhận giao hàng",
          province: "",
          district: "",
          ward: "",
        },
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
    } catch (error) {
      console.error("Create order failed:", error);
      toast.error("Tạo đơn hàng thất bại. Vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
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
                        <span className="text-sm">Số lượng: {item.quantity}</span>
                        <span className="font-bold text-primary">{formatPrice((item.selectedColor?.price ?? item.price) * item.quantity)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Detail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Xác nhận và tạo đơn
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BuyNowConfirm;
import { useState, useEffect } from "react";
import { FileText, Printer, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStoredOrderById } from "@/lib/orderStorage";
import { useAuth } from "@/contexts/AuthContext";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const parseShippingDetail = (raw?: string) => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const OrderBill = () => {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const localOrder = getStoredOrderById(id);
      if (localOrder) {
        setOrder(localOrder);
        setLoading(false);
        return;
      }

      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { orderService } = await import("@/services/OrderService");
        const { variantApi } = await import("@/services/ProductService");
        
        const apiOrder: any = await orderService.getById(id);
        if (apiOrder) {
          const allVariants = await variantApi.getAll().catch(() => []);
          const variantsMap: Record<string, any> = {};
          allVariants.forEach((v: any) => { variantsMap[v.id] = v; });

          const sd = parseShippingDetail(apiOrder.shippingDetail);
          const mappedOrder = {
            id: apiOrder.id,
            orderNumber: apiOrder.id.slice(0, 8),
            status: apiOrder.status,
            createdAt: apiOrder.createdAt || apiOrder.orderDate || new Date().toISOString(),
            paymentMethod: "Thanh toán online",
            shippingAddress: {
              fullName: sd.ReceiverName || user.name || "N/A",
              phone: sd.ReceiverPhone || user.phone || "N/A",
              address: sd.StreetAddress || "N/A",
              province: sd.ProvinceName || "",
              district: sd.DistrictName || "",
              ward: sd.WardName || "",
            },
            items: (apiOrder.orderItems || apiOrder.items || []).map((item: any) => {
              const variant = variantsMap[item.variantId];
              return {
                product: {
                  id: item.variantId,
                  name: variant ? `${variant.productName || variant.name} - Phân loại: ${variant.name}` : (item.variantName || `Sản phẩm #${item.variantId?.slice(0, 8)}`),
                },
                quantity: item.quantity || 1,
                price: item.price || 0,
              };
            }),
            total: apiOrder.totalAmount || 0,
            subtotal: apiOrder.totalAmount || 0,
            shippingFee: 0,
            discount: 0,
          };
          setOrder(mappedOrder);
        }
      } catch (err) {
        console.warn("Bill fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container py-32 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy hóa đơn</h1>
          <Button asChild>
            <Link to="/orders">Quay lại đơn hàng</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Hóa đơn đơn hàng</h1>
            <p className="text-muted-foreground mt-1">{order.orderNumber}</p>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            In hóa đơn
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Chi tiết thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Thông tin người nhận</p>
                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Thông tin đơn hàng</p>
                <p>Ngày tạo: <strong>{new Date(order.createdAt).toLocaleString("vi-VN")}</strong></p>
                <p>Phương thức: <strong>{order.paymentMethod}</strong></p>
                <p>Trạng thái: <strong>{order.status}</strong></p>
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 bg-muted font-medium text-sm">
                <span>Sản phẩm</span>
                <span>Số lượng</span>
                <span>Thành tiền</span>
              </div>
              {order.items.map((item, index) => (
                <div key={`${item.product.id}-${index}`} className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-4 border-t items-center">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(item.price)} / sản phẩm</p>
                  </div>
                  <span>{item.quantity}</span>
                  <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="ml-auto max-w-sm space-y-3">
              <div className="flex justify-between"><span>Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Giảm giá</span><span>-{formatPrice(order.discount)}</span></div>
              <div className="flex justify-between"><span>Vận chuyển</span><span>{order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}</span></div>
              <div className="flex justify-between text-lg font-bold border-t pt-3"><span>Tổng cộng</span><span className="text-primary">{formatPrice(order.total)}</span></div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OrderBill;
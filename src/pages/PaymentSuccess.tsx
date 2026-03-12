import { CheckCircle2, FileText, Package, ShoppingBag } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStoredOrderById } from "@/lib/orderStorage";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const order = orderId ? getStoredOrderById(orderId) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container py-12 max-w-3xl">
        <Card className="border-green-500/20">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Thanh toán thành công</h1>
            <p className="text-muted-foreground mb-6">
              Đơn hàng của bạn đã được ghi nhận. Bạn có thể xem hóa đơn và theo dõi trạng thái đơn hàng ngay bây giờ.
            </p>

            {order && (
              <div className="grid sm:grid-cols-3 gap-4 text-left mb-8">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
                  <p className="font-semibold">{order.orderNumber}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground mb-1">Tổng thanh toán</p>
                  <p className="font-semibold text-primary">{formatPrice(order.total)}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground mb-1">Phương thức</p>
                  <p className="font-semibold">{order.paymentMethod}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to={order ? `/orders/${order.id}/status` : "/orders"}>
                  <Package className="w-4 h-4 mr-2" />
                  Theo dõi đơn hàng
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={order ? `/orders/${order.id}/bill` : "/orders"}>
                  <FileText className="w-4 h-4 mr-2" />
                  Xem hóa đơn
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/products">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Tiếp tục mua sắm
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
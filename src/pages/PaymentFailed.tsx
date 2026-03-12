import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStoredOrderById } from "@/lib/orderStorage";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const order = orderId ? getStoredOrderById(orderId) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container py-12 max-w-3xl">
        <Card className="border-destructive/20">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Thanh toán thất bại</h1>
            <p className="text-muted-foreground mb-6">
              Hệ thống chưa thể hoàn tất thanh toán cho đơn hàng của bạn. Bạn có thể thử lại hoặc quay lại giỏ hàng.
            </p>

            {order && (
              <div className="rounded-xl border p-4 text-left max-w-md mx-auto mb-8">
                <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
                <p className="font-semibold">{order.orderNumber}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/cart")}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử thanh toán lại
              </Button>
              <Button asChild variant="outline">
                <Link to={order ? `/orders/${order.id}/status` : "/orders"}>Xem trạng thái đơn</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/cart">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Về giỏ hàng
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

export default PaymentFailed;
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileText, Package, ShoppingBag } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getStoredOrderById } from "@/lib/orderStorage";
import { getLatestPaymentAttempt, paymentService, ApiPayment } from "@/services/PaymentService";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const order = orderId ? getStoredOrderById(orderId) : null;
  const [latestPayment, setLatestPayment] = useState<ApiPayment | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  const apiOrderId = useMemo(() => {
    if (order?.apiOrderId) return order.apiOrderId;
    return orderId || order?.id || "";
  }, [order?.apiOrderId, order?.id, orderId]);

  useEffect(() => {
    const fetchPaymentByOrder = async () => {
      if (!apiOrderId) return;
      setIsCheckingPayment(true);
      try {
        const paymentResp = await paymentService.getPaymentByOrder(apiOrderId);
        if (paymentResp?.isSuccess && paymentResp.data?.length > 0) {
          setLatestPayment(getLatestPaymentAttempt(paymentResp.data));
        }
      } catch (err) {
        console.warn("Cannot fetch payment by orderId", err);
      } finally {
        setIsCheckingPayment(false);
      }
    };

    fetchPaymentByOrder();
  }, [apiOrderId]);

  const paymentStatus = (latestPayment?.status || "pending").toLowerCase();
  const isPaid = paymentStatus === "paid" || paymentStatus === "success";

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

            {latestPayment && (
              <div className="mb-6 p-4 rounded-xl border bg-secondary/30 text-left">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Trạng thái thanh toán</p>
                  <Badge variant={isPaid ? "default" : "secondary"} className="gap-1">
                    {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock3 className="w-3 h-3" />}
                    {latestPayment.status || "Pending"}
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">Mã giao dịch:</span>{" "}
                    <span className="font-medium">{latestPayment.transactionRef || "N/A"}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Số tiền:</span>{" "}
                    <span className="font-medium">{formatPrice(latestPayment.amount || order?.total || 0)}</span>
                  </p>
                </div>
              </div>
            )}

            {isCheckingPayment && (
              <p className="text-sm text-muted-foreground mb-4">Đang kiểm tra trạng thái thanh toán từ hệ thống...</p>
            )}

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
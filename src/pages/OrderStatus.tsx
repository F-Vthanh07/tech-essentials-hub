import { CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStoredOrderById } from "@/lib/orderStorage";
import { getOrderStatusSteps } from "@/data/orders";
import { Order } from "@/types/order";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Chờ xác nhận", variant: "secondary" as const, icon: Clock },
  confirmed: { label: "Đã xác nhận", variant: "default" as const, icon: CheckCircle2 },
  shipping: { label: "Đang giao hàng", variant: "default" as const, icon: Truck },
  delivered: { label: "Đã giao", variant: "default" as const, icon: CheckCircle2 },
  cancelled: { label: "Đã hủy", variant: "destructive" as const, icon: XCircle },
};

const OrderStatus = () => {
  const { id = "" } = useParams();
  const order = getStoredOrderById(id);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h1>
          <Button asChild>
            <Link to="/orders">Quay lại danh sách đơn hàng</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const config = statusConfig[order.status as Order["status"]];
  const steps = getOrderStatusSteps(order.status);
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container py-10 max-w-4xl">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Trạng thái đơn hàng</h1>
            <p className="text-muted-foreground mt-1">{order.orderNumber}</p>
          </div>
          <Badge variant={config.variant} className="gap-2 text-sm px-3 py-1">
            <StatusIcon className="w-4 h-4" />
            {config.label}
          </Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tiến trình đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-4">
              <div className="flex items-center justify-between relative gap-2">
                <div className="absolute top-5 left-0 right-0 h-1 bg-muted mx-12">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(steps.filter((step) => step.completed || step.current).length - 1) / (steps.length - 1) * 100}%` }}
                  />
                </div>
                {steps.map((step, index) => {
                  const Icon = index === 0 ? Package : index === 1 ? CheckCircle2 : index === 2 ? Truck : CheckCircle2;
                  return (
                    <div key={step.id} className="flex flex-col items-center relative z-10 text-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                          step.completed || step.current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium mt-2">{step.label}</span>
                      {step.date && <span className="text-xs text-muted-foreground">{step.date}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div>
              <p className="font-medium">Người nhận: {order.shippingAddress.fullName}</p>
              <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to={`/orders/${order.id}/bill`}>Xem hóa đơn</Link>
              </Button>
              <Button asChild>
                <Link to="/orders">Tất cả đơn hàng</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default OrderStatus;
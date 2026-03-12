import { FileText, Printer } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStoredOrderById } from "@/lib/orderStorage";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const OrderBill = () => {
  const { id = "" } = useParams();
  const order = getStoredOrderById(id);

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
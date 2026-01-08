import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ChevronDown, 
  ChevronUp,
  Search,
  Calendar,
  CreditCard,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { sampleOrders, getOrderStatusSteps } from "@/data/orders";
import { Order } from "@/types/order";
import { cn } from "@/lib/utils";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status: Order['status']) => {
  const statusConfig = {
    pending: { label: 'Chờ xác nhận', variant: 'secondary' as const, icon: Clock },
    confirmed: { label: 'Đã xác nhận', variant: 'default' as const, icon: CheckCircle2 },
    shipping: { label: 'Đang giao hàng', variant: 'default' as const, icon: Truck },
    delivered: { label: 'Đã giao', variant: 'default' as const, icon: CheckCircle2 },
    cancelled: { label: 'Đã hủy', variant: 'destructive' as const, icon: XCircle },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={cn(
        "gap-1",
        status === 'delivered' && "bg-green-600 hover:bg-green-700",
        status === 'shipping' && "bg-blue-600 hover:bg-blue-700"
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

const OrderStatusTimeline = ({ status }: { status: Order['status'] }) => {
  const steps = getOrderStatusSteps(status);

  if (status === 'cancelled') {
    return (
      <div className="flex items-center justify-center py-8 text-destructive">
        <XCircle className="w-8 h-8 mr-2" />
        <span className="font-medium">Đơn hàng đã bị hủy</span>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-muted mx-12">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ 
              width: `${(steps.filter(s => s.completed || s.current).length - 1) / (steps.length - 1) * 100}%` 
            }}
          />
        </div>

        {steps.map((step, index) => {
          const Icon = index === 0 ? Package : 
                       index === 1 ? CheckCircle2 : 
                       index === 2 ? Truck : CheckCircle2;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  step.completed || step.current 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-sm font-medium mt-2",
                step.completed || step.current ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
              {step.date && (
                <span className="text-xs text-muted-foreground">{step.date}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderCard = ({ order, isExpanded, onToggle }: { 
  order: Order; 
  isExpanded: boolean; 
  onToggle: () => void;
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">#{order.orderNumber}</CardTitle>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              Đặt ngày: {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-lg text-primary">{formatPrice(order.total)}</p>
              <p className="text-sm text-muted-foreground">{order.items.length} sản phẩm</p>
            </div>
            <Button variant="ghost" size="icon">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-6" />
          
          {/* Order Status Timeline */}
          <OrderStatusTimeline status={order.status} />
          
          <Separator className="my-6" />

          {/* Order Items */}
          <div className="space-y-4">
            <h4 className="font-semibold">Sản phẩm đã đặt</h4>
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/product/${item.product.id}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Số lượng: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Order Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Địa chỉ giao hàng
              </h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {order.shippingAddress.phone}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Thông tin thanh toán
              </h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phương thức:</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span>{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Ngày giao dự kiến: <strong>{order.deliveryDate}</strong></span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Khung giờ: <strong>{order.deliveryTime}</strong></span>
              </div>
              {order.trackingNumber && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span>Mã vận đơn: <strong>{order.trackingNumber}</strong></span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const OrderTracking = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(sampleOrders[0]?.id || null);
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = sampleOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pending") return matchesSearch && (order.status === "pending" || order.status === "confirmed");
    if (activeTab === "shipping") return matchesSearch && order.status === "shipping";
    if (activeTab === "delivered") return matchesSearch && order.status === "delivered";
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartCount={0} onCartClick={() => {}} />
      
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Theo dõi đơn hàng</h1>
            <p className="text-muted-foreground">
              Xem trạng thái và lịch sử các đơn hàng của bạn
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã đơn hàng hoặc mã vận đơn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
              <TabsTrigger value="shipping">Đang giao</TabsTrigger>
              <TabsTrigger value="delivered">Đã giao</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy đơn hàng</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Không có đơn hàng nào khớp với tìm kiếm của bạn"
                    : "Bạn chưa có đơn hàng nào trong mục này"
                  }
                </p>
                <Button asChild>
                  <Link to="/">Tiếp tục mua sắm</Link>
                </Button>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrderId === order.id}
                  onToggle={() => setExpandedOrderId(
                    expandedOrderId === order.id ? null : order.id
                  )}
                />
              ))
            )}
          </div>

          {/* Quick Stats */}
          {filteredOrders.length > 0 && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{sampleOrders.length}</p>
                <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {sampleOrders.filter(o => o.status === 'shipping').length}
                </p>
                <p className="text-sm text-muted-foreground">Đang giao</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {sampleOrders.filter(o => o.status === 'delivered').length}
                </p>
                <p className="text-sm text-muted-foreground">Đã giao</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">
                  {formatPrice(sampleOrders.reduce((sum, o) => sum + o.total, 0))}
                </p>
                <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;

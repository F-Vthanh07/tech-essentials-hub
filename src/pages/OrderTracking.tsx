import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  XCircle,
  PenTool,
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getOrderStatusSteps } from "@/data/orders";
import { Order } from "@/types/order";
import { cn } from "@/lib/utils";
import { getStoredOrders } from "@/lib/orderStorage";
import {
  customProductService,
  ApiCustomProduct,
} from "@/services/CustomProductService";
import { getRememberedCustomOrderVariantId } from "@/lib/customOrderVariantStorage";
import { toast } from "@/hooks/use-toast";

// ─────────────────────────────────────────────
// Helpers cho Custom Order
// ─────────────────────────────────────────────

const getQuotedPrice = (order: ApiCustomProduct): number | null => {
  const finalPrice = (order as any).finalPrice;
  if (typeof finalPrice === "number" && finalPrice > 0) return finalPrice;
  if (typeof order.price === "number" && order.price > 0) return order.price;
  return null;
};

const FINALIZED_STATUSES = new Set([
  "approved",
  "rejected",
  "processing",
  "completed",
  "cancelled",
  "quoteaccepted",
  "quoterejected",
  "delivered",
]);

const isCustomQuoteFinalized = (status?: string) => {
  const s = (status || "").toLowerCase().replace(/[\s_-]+/g, "");
  return FINALIZED_STATUSES.has(s);
};

const canRespondToCustomQuote = (order: ApiCustomProduct): boolean => {
  const price = getQuotedPrice(order);
  if (!price) return false;
  const s = (order.status || "").toLowerCase().replace(/[\s_-]+/g, "");
  return s === "quoted";
};

const getCustomStatusLabel = (status?: string): string => {
  const map: Record<string, string> = {
    pending: "Chờ xử lý",
    quoted: "Đã báo giá — chờ phản hồi",
    approved: "Đã chấp nhận",
    rejected: "Đã từ chối",
    processing: "Đang sản xuất",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  const key = (status || "").toLowerCase();
  return map[key] ?? status ?? "Đang xử lý";
};

const getCustomStatusBadgeClass = (status?: string): string => {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "bg-yellow-500/15 text-yellow-700 border-yellow-400/30";
  if (s === "quoted") return "bg-blue-500/15 text-blue-700 border-blue-400/30";
  if (s === "approved" || s === "completed") return "bg-green-500/15 text-green-700 border-green-400/30";
  if (s === "rejected" || s === "cancelled") return "bg-red-500/15 text-red-700 border-red-400/30";
  if (s === "processing") return "bg-purple-500/15 text-purple-700 border-purple-400/30";
  return "bg-muted text-muted-foreground";
};

// ─────────────────────────────────────────────
// UserCustomOrdersSection - ĐÃ SỬA
// ─────────────────────────────────────────────

const UserCustomOrdersSection = ({ accountId }: { accountId: string }) => {
  const navigate = useNavigate();                    // ← Thêm để chuyển sang BuyNowConfirm
  const [items, setItems] = useState<ApiCustomProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);   // ← Loading cho nút thanh toán

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        let myCustomOrders: ApiCustomProduct[] = [];
        try {
          myCustomOrders = await customProductService.getMy(accountId);
        } catch (e) {
          console.warn("custom-order get-my failed, fallback to get-all", e);
          const allCustom = await customProductService.getAll();
          myCustomOrders = Array.isArray(allCustom)
            ? allCustom.filter((item) => item.accountId === accountId)
            : [];
        }
        if (!cancelled) {
          setItems(Array.isArray(myCustomOrders) ? myCustomOrders : []);
        }
      } catch (e) {
        console.warn("custom-order failed", e);
        if (!cancelled) {
          setItems([]);
          toast({
            title: "Không tải được đơn custom",
            description: "Kiểm tra kết nối hoặc đăng nhập lại.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [accountId]);

  const handleQuoteResponse = async (order: ApiCustomProduct, accept: boolean) => {
    setActingId(order.id);
    try {
      const newStatus = accept ? "Approved" : "Rejected";
      await customProductService.updateStatus(order.id, {
        status: newStatus,
        note: accept
          ? "Khách hàng chấp nhận báo giá"
          : "Khách hàng từ chối báo giá",
      });
      setItems((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
      toast({
        title: accept ? "Đã chấp nhận báo giá" : "Đã từ chối báo giá",
        description: accept
          ? "Bạn có thể thanh toán ngay."
          : "Bạn có thể tạo yêu cầu custom mới nếu muốn thương lượng lại.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Lỗi",
        description: "Không cập nhật được phản hồi. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setActingId(null);
    }
  };

  // Hàm chuyển sang BuyNowConfirm khi thanh toán custom
  const handlePayCustomOrder = (customOrder: ApiCustomProduct) => {
    const quotedPrice = getQuotedPrice(customOrder);
    if (!quotedPrice) {
      toast({
        title: "Chưa có báo giá",
        description: "Vui lòng chờ shop báo giá chính thức.",
        variant: "destructive",
      });
      return;
    }

    const variantIdForShopOrder =
      getRememberedCustomOrderVariantId(customOrder.id) ||
      customOrder.variantId?.trim() ||
      customOrder.productBaseId?.trim() ||
      "";

    if (!variantIdForShopOrder) {
      toast({
        title: "Không thanh toán được",
        description:
          "Đơn thiếu mã biến thể (variantId). Hãy tạo đơn custom mới từ trang thiết kế hoặc liên hệ shop.",
        variant: "destructive",
      });
      return;
    }

    setPayingId(customOrder.id);

    const checkoutItem = {
      id: variantIdForShopOrder,
      name: `Ốp lưng Custom #${String(customOrder.id).slice(-6).toUpperCase()}`,
      price: quotedPrice,
      image: customOrder.designSnapshot || "",
      quantity: customOrder.quantity ?? 1,
      variantId: variantIdForShopOrder,
      isCustom: true,
      customProductId: customOrder.id,
      designSnapshot: customOrder.designSnapshot,
      color: customOrder.color,
      material: customOrder.material,
      textContent: customOrder.textContent,
    };

    navigate("/order-detail/confirm", {
      state: {
        items: [checkoutItem],
        fromCustom: true,
        customOrderId: customOrder.id,
      },
    });

    setPayingId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-10 text-center">
        <PenTool className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Bạn chưa có đơn custom</h3>
        <p className="text-muted-foreground mb-4">
          Mọi yêu cầu thiết kế ốp lưng của bạn sẽ được lưu tại đây.
        </p>
        <Button asChild>
          <Link to="/custom-case">Tạo đơn custom ngay</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((order, index) => {
        const code = `CUST-${String(index + 1).padStart(3, "0")}`;
        const quotedPrice = getQuotedPrice(order);
        const estimatedPrice = (order as any).estimatedPrice as number | undefined;
        const canRespond = canRespondToCustomQuote(order);
        const finalized = isCustomQuoteFinalized(order.status);
        const isApproved = (order.status || "").toLowerCase() === "approved";

        return (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PenTool className="h-5 w-5" />
                    #{code}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Đặt lúc: {order.createdAt ? formatDate(order.createdAt) : "—"}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                    getCustomStatusBadgeClass(order.status)
                  )}
                >
                  {getCustomStatusLabel(order.status)}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Thông tin sản phẩm */}
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Màu nền:</span>{" "}
                  <span className="font-medium">{order.color || "—"}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Chất liệu:</span>{" "}
                  <span className="font-medium">{order.material || "—"}</span>
                </p>
                {order.textContent && (
                  <p>
                    <span className="text-muted-foreground">Nội dung in:</span>{" "}
                    {order.textContent}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Số lượng:</span>{" "}
                  <span className="font-medium">{order.quantity ?? 1}</span>
                </p>
              </div>

              {/* Ảnh thiết kế */}
              {(order.designSnapshot ||
                (Array.isArray(order.files) && order.files.length > 0) ||
                (Array.isArray(order.imageUrls) && order.imageUrls.length > 0)) && (
                <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                  <p className="text-sm font-semibold">Thiết kế của bạn</p>
                  {order.designSnapshot && (
                    <div className="overflow-hidden rounded-lg border bg-background">
                      <img
                        src={order.designSnapshot}
                        alt="Thiết kế custom"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  {order.files && order.files.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {order.files.map((file, idx) => (
                        <div
                          key={file.id || idx}
                          className="overflow-hidden rounded-lg border bg-background"
                        >
                          <img
                            src={file.fileUrl}
                            alt={file.fileName || `Ảnh ${idx + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {(!order.files || order.files.length === 0) &&
                    order.imageUrls &&
                    order.imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {order.imageUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className="overflow-hidden rounded-lg border bg-background"
                          >
                            <img
                              src={url}
                              alt={`Ảnh ${idx + 1}`}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {/* Giá ước tính */}
              {!quotedPrice && estimatedPrice && estimatedPrice > 0 && (
                <div className="rounded-lg border border-dashed bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    Giá ước tính:{" "}
                    <span className="font-medium text-foreground">
                      {formatPrice(estimatedPrice)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shop chưa gửi báo giá chính thức. Bạn sẽ nhận thông báo khi có cập nhật.
                  </p>
                </div>
              )}

              {!quotedPrice && !estimatedPrice && (
                <div className="rounded-lg border border-dashed bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    Shop đang xem xét yêu cầu. Báo giá sẽ hiển thị tại đây.
                  </p>
                </div>
              )}

              {/* Báo giá chính thức */}
              {quotedPrice && (
                <div className="rounded-lg border bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">Báo giá từ cửa hàng</p>
                    {estimatedPrice && estimatedPrice !== quotedPrice && (
                      <p className="text-xs text-muted-foreground line-through">
                        Ước tính: {formatPrice(estimatedPrice)}
                      </p>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(quotedPrice)}
                  </p>
                  {order.estimatedDeliveryDate && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Dự kiến giao: </span>
                      <span className="font-medium">
                        {new Date(order.estimatedDeliveryDate).toLocaleDateString("vi-VN")}
                      </span>
                    </p>
                  )}
                  {order.note && (
                    <p className="text-sm text-muted-foreground border-t pt-2 mt-2">
                      Ghi chú: {order.note}
                    </p>
                  )}
                </div>
              )}

              {/* Nút phản hồi báo giá */}
              {canRespond && (
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button
                    size="sm"
                    className="gap-2"
                    disabled={actingId === order.id}
                    onClick={() => handleQuoteResponse(order, true)}
                  >
                    {actingId === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsUp className="h-4 w-4" />
                    )}
                    Chấp nhận báo giá
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-destructive border-destructive/50 hover:bg-destructive/10"
                    disabled={actingId === order.id}
                    onClick={() => handleQuoteResponse(order, false)}
                  >
                    {actingId === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsDown className="h-4 w-4" />
                    )}
                    Từ chối báo giá
                  </Button>
                </div>
              )}

              {/* NÚT THANH TOÁN - CHỈ HIỆN KHI ĐÃ APPROVED VÀ CÓ GIÁ */}
              {isApproved && quotedPrice && (
                <Button
                  size="lg"
                  className="w-full gap-2 text-lg font-semibold"
                  disabled={payingId === order.id}
                  onClick={() => handlePayCustomOrder(order)}
                >
                  {payingId === order.id ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Đang chuyển đến thanh toán...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Thanh toán ngay - {formatPrice(quotedPrice)}
                    </>
                  )}
                </Button>
              )}

              {/* Đã phản hồi rồi */}
              {quotedPrice && finalized && !canRespond && (
                <p className="text-sm text-muted-foreground">
                  {(order.status || "").toLowerCase() === "approved"
                    ? "✓ Bạn đã chấp nhận báo giá. Shop đang tiến hành sản xuất."
                    : (order.status || "").toLowerCase() === "rejected"
                    ? "✗ Bạn đã từ chối báo giá này."
                    : "Đơn hàng đang được xử lý."}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// Helpers chung (Giữ nguyên hoàn toàn)
// ─────────────────────────────────────────────

const parseShippingDetail = (raw?: string) => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const normalizeStatus = (status?: string): Order["status"] => {
  const value = (status || "pending").toLowerCase();
  if (
    value === "pending" ||
    value === "confirmed" ||
    value === "shipping" ||
    value === "delivered" ||
    value === "cancelled"
  ) {
    return value;
  }
  return "pending";
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusBadge = (status: Order["status"] | string) => {
  const statusConfig = {
    pending: { label: "Chờ xác nhận", variant: "secondary" as const, icon: Clock },
    confirmed: { label: "Đã xác nhận", variant: "default" as const, icon: CheckCircle2 },
    shipping: { label: "Đang giao hàng", variant: "default" as const, icon: Truck },
    delivered: { label: "Đã giao", variant: "default" as const, icon: CheckCircle2 },
    cancelled: { label: "Đã hủy", variant: "destructive" as const, icon: XCircle },
  };
  const normalizedStatus = normalizeStatus(status);
  const config = statusConfig[normalizedStatus];
  const Icon = config.icon;
  return (
    <Badge
      variant={config.variant}
      className={cn(
        "gap-1",
        normalizedStatus === "delivered" && "bg-green-600 hover:bg-green-700",
        normalizedStatus === "shipping" && "bg-blue-600 hover:bg-blue-700"
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

// ─────────────────────────────────────────────
// OrderStatusTimeline (Giữ nguyên)
// ─────────────────────────────────────────────

const OrderStatusTimeline = ({ status }: { status: Order["status"] | string }) => {
  const normalizedStatus = normalizeStatus(status);
  const steps = getOrderStatusSteps(normalizedStatus);
  const getStepIcon = (index: number) => {
    if (index === 0) return Package;
    if (index === 1) return CheckCircle2;
    if (index === 2) return Truck;
    return CheckCircle2;
  };

  if (normalizedStatus === "cancelled") {
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
        <div className="absolute top-5 left-0 right-0 h-1 bg-muted mx-12">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${
                ((steps.filter((s) => s.completed || s.current).length - 1) /
                  (steps.length - 1)) *
                100
              }%`,
            }}
          />
        </div>
        {steps.map((step, index) => {
          const Icon = getStepIcon(index);
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
              <span
                className={cn(
                  "text-sm font-medium mt-2",
                  step.completed || step.current
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
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

// ─────────────────────────────────────────────
// OrderCard (Giữ nguyên)
// ─────────────────────────────────────────────

const OrderCard = ({
  order,
  isExpanded,
  onToggle,
}: {
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
              <p className="font-bold text-lg text-primary">
                {formatPrice(order.total)}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.items.length} sản phẩm
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              {isExpanded ? (
                <>Đóng chi tiết <ChevronUp className="ml-1 w-4 h-4" /></>
              ) : (
                <>Xem order detail <ChevronDown className="ml-1 w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <Separator className="mb-6" />
          <OrderStatusTimeline status={order.status} />
          <Separator className="my-6" />

          <div className="space-y-4">
            <h4 className="font-semibold">Sản phẩm đã đặt</h4>
            {order.items.map((item) => (
              <div
                key={`${order.id}-${item.product.id}-${item.quantity}`}
                className="flex items-center gap-4"
              >
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
                <p className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

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
                  {order.shippingAddress.address}, {order.shippingAddress.ward},{" "}
                  {order.shippingAddress.district}, {order.shippingAddress.province}
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
                  <span>
                    {order.shippingFee === 0
                      ? "Miễn phí"
                      : formatPrice(order.shippingFee)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  Ngày giao dự kiến: <strong>{order.deliveryDate}</strong>
                </span>
              </div>
              {order.trackingNumber && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Mã vận đơn: <strong>{order.trackingNumber}</strong>
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <Button asChild size="sm" variant="outline">
                <Link to={`/orders/${order.id}/status`}>Trang trạng thái</Link>
              </Button>
              <Button asChild size="sm">
                <Link to={`/orders/${order.id}/bill`}>Xem hóa đơn</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────────
// OrderTracking (main page) - Giữ nguyên
// ─────────────────────────────────────────────

const OrderTracking = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [pageTab, setPageTab] = useState<"shop" | "custom">("shop");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [variantsMap, setVariantsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const { variantApi } = await import("@/services/ProductService");
        const allVariants = await variantApi.getAll();
        const map: Record<string, any> = {};
        allVariants.forEach(v => { map[v.id] = v; });
        setVariantsMap(map);
      } catch (err) {
        console.warn('Failed to fetch variants', err);
      }
    };
    fetchVariants();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setPageTab(params.get("tab") === "custom" ? "custom" : "shop");
  }, [location.search]);

  useEffect(() => {
    const fetchOrders = async () => {
      const localOrders = getStoredOrders();
      if (localOrders.length > 0) {
        const normalizedLocalOrders = localOrders.map((order) => ({
          ...order,
          status: normalizeStatus((order as any).status),
        }));
        setOrders(normalizedLocalOrders);
        setExpandedOrderId(normalizedLocalOrders[0].id);
      }

      if (!user?.id) {
        if (localOrders.length === 0) {
          setOrders([]);
          setExpandedOrderId(null);
        }
        return;
      }
      try {
        const { orderService } = await import("@/services/OrderService");
        let apiOrders: any[] = [];
        try {
          apiOrders = await orderService.getOrdersByUserId(user.id);
        } catch (error) {
          console.warn("Failed to fetch orders by user ID", error);
          apiOrders = [];
        }

        if (apiOrders && apiOrders.length > 0) {
          const mapped: Order[] = apiOrders.map((o: any, index: number) => ({
            id: o.id,
            orderNumber: `ORD-${String(index + 1).padStart(3, "0")}`,
            status: normalizeStatus(o.status),
            createdAt: o.createdAt || o.orderDate || new Date().toISOString(),
            items: (
              (o.orderItems && o.orderItems.length > 0 ? o.orderItems : o.items) || []
            ).map((item: any) => {
              const variant = variantsMap[item.variantId];
              return {
                product: {
                  id: item.variantId,
                  name: variant ? `${variant.productName || variant.name} - Phân loại: ${variant.name}` : (item.variantName || `Sản phẩm #${item.variantId?.slice(0, 8)}`),
                  image: variant?.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
                  price: item.price || 0,
                },
                quantity: item.quantity || 1,
                price: item.price || 0,
              };
            }),
            total: o.totalAmount || 0,
            subtotal: o.totalAmount || 0,
            shippingFee: 0,
            discount: 0,
            paymentMethod: "Thanh toán online",
            shippingAddress: (() => {
              const sd = parseShippingDetail(o.shippingDetail);
              return {
                fullName: sd.ReceiverName || user.name || "N/A",
                phone: sd.ReceiverPhone || user.phone || "N/A",
                address: sd.StreetAddress || "N/A",
                province: sd.ProvinceName || "",
                district: sd.DistrictName || "",
                ward: sd.WardName || "",
              };
            })(),
            deliveryDate: "Đang xử lý",
            deliveryTime: "N/A",
          }));
          const merged = [
            ...localOrders,
            ...mapped.filter(
              (order) => !localOrders.some((lo) => lo.id === order.id)
            ),
          ];
          setOrders(merged);
          if (merged.length > 0) setExpandedOrderId(merged[0].id);
        } else {
          if (localOrders.length === 0) {
            setOrders([]);
            setExpandedOrderId(null);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch orders from API", err);
        if (localOrders.length === 0) {
          setOrders([]);
          setExpandedOrderId(null);
        }
      }
    };
    fetchOrders();
  }, [user, variantsMap]);

  const filteredOrders = orders.filter((order) => {
    const normalizedStatus = normalizeStatus((order as any).status);
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch && normalizedStatus === "confirmed";
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Theo dõi đơn hàng</h1>
            <p className="text-muted-foreground">
              Đơn mua tại shop và đơn thiết kế ốp lưng custom của bạn
            </p>
          </div>

          <Tabs
            value={pageTab}
            onValueChange={(v) => setPageTab(v as "shop" | "custom")}
            className="w-full"
          >
            <TabsList className="mb-6 grid h-auto w-full max-w-md grid-cols-2 p-1">
              <TabsTrigger value="shop">Đơn mua sắm</TabsTrigger>
              <TabsTrigger value="custom">Đơn custom ốp lưng</TabsTrigger>
            </TabsList>

            <TabsContent value="shop" className="mt-0 space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo mã đơn hàng hoặc mã vận đơn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>



              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Không tìm thấy đơn hàng
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? "Không có đơn hàng nào khớp với tìm kiếm của bạn"
                        : "Bạn chưa có đơn hàng nào trong mục này"}
                    </p>
                    <Button asChild>
                      <Link to="/products">Tiếp tục mua sắm</Link>
                    </Button>
                  </Card>
                ) : (
                  filteredOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isExpanded={expandedOrderId === order.id}
                      onToggle={() =>
                        setExpandedOrderId(
                          expandedOrderId === order.id ? null : order.id
                        )
                      }
                    />
                  ))
                )}
              </div>

              {filteredOrders.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{filteredOrders.length}</p>
                    <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <p className="text-2xl font-bold">
                      {formatPrice(filteredOrders.reduce((sum, o) => sum + o.total, 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom" className="mt-0">
              {!user?.id ? (
                <Card className="p-10 text-center">
                  <PenTool className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Đăng nhập để xem đơn custom
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Các yêu cầu thiết kế ốp lưng và báo giá từ shop được quản lý theo
                    tài khoản của bạn.
                  </p>
                  <Button asChild>
                    <Link to="/auth">Đăng nhập</Link>
                  </Button>
                </Card>
              ) : (
                <UserCustomOrdersSection accountId={user.id} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;
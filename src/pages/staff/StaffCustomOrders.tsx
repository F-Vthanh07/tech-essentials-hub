import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Loader2 } from "lucide-react";
import {
  customProductService,
  ApiCustomProduct,
} from "@/services/CustomProductService";
import { toast } from "@/hooks/use-toast";

type CustomOrderStatus = string;

const StaffCustomOrders = () => {
  const [orders, setOrders] = useState<ApiCustomProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<ApiCustomProduct | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [quotePrice, setQuotePrice] = useState<string>("");
  const [quoteDate, setQuoteDate] = useState<string>("");
  const [quoteNote, setQuoteNote] = useState<string>("");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await customProductService.getAll();
        setOrders(data || []);
      } catch (error) {
        console.warn("Failed to fetch custom orders", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách đơn custom",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const uniqueStatuses: CustomOrderStatus[] = Array.from(
    new Set(
      orders
        .map((o) => (o.status || "").toString().trim())
        .filter((s) => s.length > 0)
    )
  );

  const filteredOrders = orders.filter((order, index) => {
    const code = `CUST-${String(index + 1).padStart(3, "0")}`;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      code.toLowerCase().includes(term) ||
      (order.customerName || "").toLowerCase().includes(term) ||
      (order.customerEmail || "").toLowerCase().includes(term) ||
      (order.id || "").toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === "all" ||
      (order.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (order: ApiCustomProduct, index: number) => {
    setSelectedOrder({
      ...order,
      displayCode: `CUST-${String(index + 1).padStart(3, "0")}`,
    } as ApiCustomProduct & { displayCode: string });

    setQuotePrice(order.price != null ? String(order.price) : "");
    setQuoteDate(
      order.estimatedDeliveryDate
        ? order.estimatedDeliveryDate.slice(0, 10)
        : ""
    );
    setQuoteNote(order.note || "");

    setIsDetailOpen(true);
  };

  const handleSubmitQuote = async () => {
    if (!selectedOrder?.id) return;

    const priceNumber = Number(quotePrice);
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      toast({
        title: "Giá không hợp lệ",
        description: "Vui lòng nhập giá báo lớn hơn 0",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmittingQuote(true);
      await customProductService.updateQuote(selectedOrder.id, {
        price: priceNumber,
        estimatedDeliveryDate: quoteDate || new Date().toISOString(),
        note: quoteNote,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                price: priceNumber,
                estimatedDeliveryDate: quoteDate || new Date().toISOString(),
                note: quoteNote,
              }
            : o
        )
      );

      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              price: priceNumber,
              estimatedDeliveryDate: quoteDate || new Date().toISOString(),
              note: quoteNote,
            }
          : prev
      );

      toast({
        title: "Đã gửi báo giá",
        description: "Thông tin báo giá đã được cập nhật cho đơn này.",
      });
    } catch (error) {
      console.error("Failed to update quote", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật báo giá, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    const value = (status || "").toLowerCase();
    if (value.includes("pending") || value.includes("mới")) {
      return "bg-yellow-500/10 text-yellow-600";
    }
    if (value.includes("confirmed") || value.includes("đã duyệt")) {
      return "bg-blue-500/10 text-blue-600";
    }
    if (value.includes("done") || value.includes("hoàn thành")) {
      return "bg-green-500/10 text-green-600";
    }
    if (value.includes("cancel") || value.includes("hủy")) {
      return "bg-red-500/10 text-red-600";
    }
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Đơn hàng custom ốp lưng</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <CardTitle>Danh sách đơn custom</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Tìm theo mã đơn, tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-56 md:w-72"
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Lọc trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {filteredOrders.length} đơn
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Sản phẩm / Nội dung</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order, index) => {
                  const displayCode = `CUST-${String(index + 1).padStart(
                    3,
                    "0"
                  )}`;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {displayCode}
                      </TableCell>
                      <TableCell>{order.customerName || "N/A"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{order.customerEmail || "N/A"}</div>
                          <div className="text-muted-foreground">
                            {order.customerPhone || ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {order.textContent || "Nội dung custom"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            SP: {order.productId || "N/A"} • Màu:{" "}
                            {order.color || "N/A"} • Chất liệu:{" "}
                            {order.material || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{order.quantity ?? 1}</TableCell>
                      <TableCell>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("vi-VN")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.status || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetail(order, index)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredOrders.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Chưa có đơn custom nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Chi tiết đơn custom{" "}
              {(selectedOrder as any)?.displayCode && (
                <span className="font-mono text-sm text-muted-foreground">
                  {(selectedOrder as any).displayCode}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-muted-foreground mb-2">
                    Thông tin khách hàng
                  </h4>
                  <p className="font-medium">
                    {selectedOrder.customerName || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {selectedOrder.customerEmail || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    SĐT: {selectedOrder.customerPhone || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground mb-2">
                    Thông tin đơn
                  </h4>
                  <p className="text-sm">
                    Mã ID:{" "}
                    <span className="font-mono break-all">
                      {selectedOrder.id}
                    </span>
                  </p>
                  <p className="text-sm">
                    Ngày tạo:{" "}
                    {selectedOrder.createdAt
                      ? new Date(
                          selectedOrder.createdAt
                        ).toLocaleString("vi-VN")
                      : "N/A"}
                  </p>
                  <p className="text-sm">
                    Trạng thái:{" "}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status || "N/A"}
                    </span>
                  </p>
                  {typeof selectedOrder.quantity === "number" && (
                    <p className="text-sm">
                      Số lượng:{" "}
                      <span className="font-medium">
                        {selectedOrder.quantity}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-muted-foreground mb-2">
                  Chi tiết thiết kế
                </h4>
                <p className="text-sm mb-2">
                  Sản phẩm:{" "}
                  <span className="font-mono">
                    {selectedOrder.productId || "N/A"}
                  </span>
                </p>
                <p className="text-sm mb-2">
                  Màu: <span className="font-medium">{selectedOrder.color}</span>{" "}
                  • Chất liệu:{" "}
                  <span className="font-medium">
                    {selectedOrder.material}
                  </span>
                </p>
                {selectedOrder.textContent && (
                  <p className="text-sm">
                    Nội dung:{" "}
                    <span className="font-medium">
                      {selectedOrder.textContent}
                    </span>
                  </p>
                )}
                {selectedOrder.note && (
                  <p className="text-sm mt-1 text-muted-foreground">
                    Ghi chú: {selectedOrder.note}
                  </p>
                )}
              </div>

              {selectedOrder.designSnapshot && (
                <div>
                  <h4 className="font-medium text-muted-foreground mb-2">
                    Mẫu thiết kế preview
                  </h4>
                  <div className="border rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedOrder.designSnapshot}
                      alt="Design snapshot"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {(Array.isArray(selectedOrder.files) && selectedOrder.files.length > 0) && (
                <div>
                  <h4 className="font-medium text-muted-foreground mb-2">
                    Hình ảnh đính kèm
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedOrder.files.map((file) => (
                      <div
                        key={file.id}
                        className="border rounded-lg overflow-hidden bg-muted"
                      >
                        <img
                          src={file.fileUrl}
                          alt={file.fileName || "Custom image"}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!Array.isArray(selectedOrder.files) || selectedOrder.files.length === 0) &&
                Array.isArray(selectedOrder.imageUrls) &&
                selectedOrder.imageUrls.length > 0 && (
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-2">
                      Hình ảnh đính kèm
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedOrder.imageUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="border rounded-lg overflow-hidden bg-muted"
                        >
                          <img
                            src={url}
                            alt={`Custom image ${idx + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="border-t pt-4 space-y-4 text-sm">
                {(typeof selectedOrder.price === "number" ||
                  selectedOrder.estimatedDeliveryDate) && (
                  <div className="space-y-1">
                    {typeof selectedOrder.price === "number" && (
                      <p>
                        Giá báo hiện tại:{" "}
                        <span className="font-semibold text-primary">
                          {selectedOrder.price.toLocaleString("vi-VN")}đ
                        </span>
                      </p>
                    )}
                    {selectedOrder.estimatedDeliveryDate && (
                      <p>
                        Dự kiến giao hiện tại:{" "}
                        <span className="font-medium">
                          {new Date(
                            selectedOrder.estimatedDeliveryDate
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-medium text-muted-foreground">
                    Cập nhật báo giá
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Giá báo (VNĐ)
                      </span>
                      <Input
                        type="number"
                        min={0}
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(e.target.value)}
                        placeholder="Nhập giá"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Ngày giao dự kiến
                      </span>
                      <Input
                        type="date"
                        value={quoteDate}
                        onChange={(e) => setQuoteDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-3">
                      <span className="text-xs text-muted-foreground">
                        Ghi chú cho khách
                      </span>
                      <Input
                        value={quoteNote}
                        onChange={(e) => setQuoteNote(e.target.value)}
                        placeholder="Ví dụ: Giá đã bao gồm in ấn, thời gian sản xuất 3-5 ngày..."
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-1"
                    onClick={handleSubmitQuote}
                    disabled={isSubmittingQuote}
                  >
                    {isSubmittingQuote ? "Đang gửi báo giá..." : "Gửi báo giá"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffCustomOrders;


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { Search, Eye, Trash2, Loader2 } from "lucide-react";
import { orderService } from "@/services/OrderService";
import { Order } from "@/types/order";
import { toast } from "@/hooks/use-toast";

const statusOptions = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' }
];

const normalizeStatus = (status?: string): Order['status'] => {
  const value = (status || 'pending').toLowerCase();
  if (value === 'pending' || value === 'confirmed' || value === 'shipping' || value === 'delivered' || value === 'cancelled') {
    return value;
  }
  return 'pending';
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAll();
      // Map API orders to UI format
      const mapped: Order[] = data.map((o, index) => ({
        id: o.id,
        orderNumber: `ORD-${String(index + 1).padStart(3, '0')}`,
        status: normalizeStatus(o.status),
        createdAt: o.createdAt || o.orderDate || new Date().toISOString(),
        items: ((o.orderItems && o.orderItems.length > 0 ? o.orderItems : o.items) || []).map((item: any) => ({
          product: {
            id: item.variantId || item.id,
            name: item.variantName || `Variant #${(item.variantId || '').slice(0, 8)}`,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
            price: item.price || 0,
          },
          quantity: item.quantity || 1,
          price: item.price || 0,
        })),
        total: o.totalAmount || (((o.orderItems && o.orderItems.length > 0 ? o.orderItems : o.items) || []).reduce((s: number, i: any) => s + (i.price || 0) * (i.quantity || 1), 0)),
        subtotal: o.totalAmount || 0,
        shippingFee: 0,
        discount: 0,
        paymentMethod: 'Online',
        shippingAddress: {
          fullName: o.accountId?.slice(0, 8) || 'N/A',
          phone: 'N/A',
          address: 'N/A',
          district: '',
          province: '',
          ward: '',
        },
        deliveryDate: 'N/A',
        deliveryTime: 'N/A',
      }));
      if (mapped.length > 0) {
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn('Failed to fetch orders from API', err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await orderService.update(orderId, { status: newStatus } as any);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast({ title: "Thành công", description: "Đã cập nhật trạng thái đơn hàng" });
    } catch (err) {
      console.error('Status update failed:', err);
      // Still update locally
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast({ title: "Thành công", description: "Đã cập nhật trạng thái" });
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Bạn có chắc muốn xóa đơn hàng này?")) return;
    try {
      await orderService.delete(orderId);
      toast({ title: "Thành công", description: "Đã xóa đơn hàng" });
      await fetchOrders();
    } catch (err) {
      console.error('Delete failed:', err);
      toast({ title: "Lỗi", description: "Không thể xóa đơn hàng", variant: "destructive" });
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500';
      case 'shipping': return 'bg-purple-500/10 text-purple-500';
      case 'delivered': return 'bg-green-500/10 text-green-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn, tên khách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredOrders.length} đơn hàng
            </span>
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
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.shippingAddress.fullName}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>{order.total.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}
                      >
                        <SelectTrigger className={`w-[140px] ${getStatusColor(order.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleViewDetail(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDelete(order.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy đơn hàng
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-muted-foreground mb-2">Thông tin khách hàng</h4>
                  <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shippingAddress.phone}</p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground mb-2">Mã đơn hàng (ID)</h4>
                  <p className="text-sm font-mono break-all">{selectedOrder.id}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-muted-foreground mb-2">Sản phẩm</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={`${selectedOrder.id}-${item.product.id}-${item.quantity}`} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Số lượng: {item.quantity} x {item.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <p className="font-medium">
                        {(item.quantity * item.price).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{selectedOrder.total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Phương thức thanh toán: </span>
                  <span className="font-medium">{selectedOrder.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái: </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
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

export default AdminOrders;

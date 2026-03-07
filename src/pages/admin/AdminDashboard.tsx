import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { productService } from "@/services/ProductService";
import { orderService, ApiOrder } from "@/services/OrderService";
import { Product } from "@/types/product";

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsData, ordersData] = await Promise.all([
          productService.getAllProducts().catch(() => []),
          orderService.getAll().catch(() => []),
        ]);
        setProducts(productsData);
        setOrders(ordersData);
      } catch (err) {
        console.warn('Failed to fetch dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

  const stats = [
    {
      title: "Tổng sản phẩm",
      value: isLoading ? '...' : totalProducts,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Tổng đơn hàng",
      value: isLoading ? '...' : totalOrders,
      icon: ShoppingCart,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Doanh thu",
      value: isLoading ? '...' : `${totalRevenue.toLocaleString('vi-VN')}đ`,
      icon: DollarSign,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Đơn chờ xử lý",
      value: isLoading ? '...' : pendingOrders,
      icon: TrendingUp,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    }
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">ORD-{String(index + 1).padStart(3, '0')}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(order.totalAmount || 0).toLocaleString('vi-VN')}đ</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                      order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {order.status === 'pending' ? 'Chờ xử lý' :
                       order.status === 'confirmed' ? 'Đã xác nhận' :
                       order.status === 'shipping' ? 'Đang giao' :
                       order.status === 'delivered' ? 'Đã giao' : order.status || 'Chờ xử lý'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Chưa có đơn hàng</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

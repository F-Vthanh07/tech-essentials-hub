import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { products } from "@/data/products";
import { sampleOrders } from "@/data/orders";

const AdminDashboard = () => {
  const totalProducts = products.length;
  const totalOrders = sampleOrders.length;
  const totalRevenue = sampleOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = sampleOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;

  const stats = [
    {
      title: "Tổng sản phẩm",
      value: totalProducts,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Tổng đơn hàng",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Doanh thu",
      value: `${totalRevenue.toLocaleString('vi-VN')}đ`,
      icon: DollarSign,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Đơn chờ xử lý",
      value: pendingOrders,
      icon: TrendingUp,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    }
  ];

  const recentOrders = sampleOrders.slice(0, 5);

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
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{order.total.toLocaleString('vi-VN')}đ</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                    order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {order.status === 'pending' ? 'Chờ xử lý' :
                     order.status === 'confirmed' ? 'Đã xác nhận' :
                     order.status === 'shipping' ? 'Đang giao' :
                     order.status === 'delivered' ? 'Đã giao' : 'Đã hủy'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { sampleOrders } from "@/data/orders";
import { products } from "@/data/products";

const AdminReports = () => {
  // Revenue by month (mock data)
  const revenueData = [
    { month: 'T1', revenue: 15000000 },
    { month: 'T2', revenue: 22000000 },
    { month: 'T3', revenue: 18000000 },
    { month: 'T4', revenue: 28000000 },
    { month: 'T5', revenue: 32000000 },
    { month: 'T6', revenue: 25000000 },
  ];

  // Orders by status
  const ordersByStatus = [
    { name: 'Chờ xử lý', value: sampleOrders.filter(o => o.status === 'pending').length, color: '#eab308' },
    { name: 'Đã xác nhận', value: sampleOrders.filter(o => o.status === 'confirmed').length, color: '#3b82f6' },
    { name: 'Đang giao', value: sampleOrders.filter(o => o.status === 'shipping').length, color: '#8b5cf6' },
    { name: 'Đã giao', value: sampleOrders.filter(o => o.status === 'delivered').length, color: '#22c55e' },
    { name: 'Đã hủy', value: sampleOrders.filter(o => o.status === 'cancelled').length, color: '#ef4444' },
  ].filter(s => s.value > 0);

  // Products by category
  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find(c => c.category === product.category);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ category: product.category, count: 1 });
    }
    return acc;
  }, [] as { category: string; count: number }[]);

  // Top selling products (mock data)
  const topProducts = [
    { name: 'Ốp lưng iPhone 15 Pro', sold: 150 },
    { name: 'Sạc nhanh 20W', sold: 120 },
    { name: 'Cường lực Samsung S24', sold: 98 },
    { name: 'Tai nghe Bluetooth', sold: 85 },
    { name: 'Cáp Type-C', sold: 75 },
  ];

  const totalRevenue = sampleOrders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = totalRevenue / sampleOrders.length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Báo cáo</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalRevenue.toLocaleString('vi-VN')}đ
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Giá trị đơn trung bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(avgOrderValue).toLocaleString('vi-VN')}đ
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Products by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <div className="h-2 bg-muted rounded-full mt-1">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(product.sold / topProducts[0].sold) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{product.sold} đã bán</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;

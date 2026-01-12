import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Package, Truck, Shield, Phone, Mail, MapPin, CheckCircle, Users, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";

const wholesalePricing = [
  { quantity: "10-49", discount: "10%", priceRange: "90.000đ - 135.000đ/cái" },
  { quantity: "50-99", discount: "15%", priceRange: "85.000đ - 127.500đ/cái" },
  { quantity: "100-299", discount: "20%", priceRange: "80.000đ - 120.000đ/cái" },
  { quantity: "300-499", discount: "25%", priceRange: "75.000đ - 112.500đ/cái" },
  { quantity: "500+", discount: "30%+", priceRange: "Liên hệ trực tiếp" },
];

const productCategories = [
  { name: "Ốp lưng Silicon", basePrice: 100000, stock: "Có sẵn" },
  { name: "Ốp lưng nhựa cứng", basePrice: 120000, stock: "Có sẵn" },
  { name: "Ốp lưng da PU", basePrice: 150000, stock: "Có sẵn" },
  { name: "Kính cường lực", basePrice: 80000, stock: "Có sẵn" },
  { name: "Cáp sạc", basePrice: 60000, stock: "Có sẵn" },
  { name: "Củ sạc nhanh", basePrice: 150000, stock: "Đặt hàng" },
  { name: "Tai nghe Bluetooth", basePrice: 300000, stock: "Có sẵn" },
  { name: "Sạc dự phòng", basePrice: 250000, stock: "Có sẵn" },
];

const benefits = [
  { icon: Package, title: "Giá sỉ ưu đãi", desc: "Chiết khấu lên đến 30% cho đơn hàng lớn" },
  { icon: Truck, title: "Miễn phí vận chuyển", desc: "Đơn hàng từ 5 triệu được miễn phí ship" },
  { icon: Shield, title: "Bảo hành đổi trả", desc: "Đổi trả 1-1 nếu sản phẩm lỗi" },
  { icon: Users, title: "Hỗ trợ 24/7", desc: "Đội ngũ CSKH chuyên nghiệp" },
];

const Wholesale = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    businessType: "",
    monthlyVolume: "",
    productInterest: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.phone || !formData.email) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    toast.success("Đăng ký thành công!", {
      description: "Chúng tôi sẽ liên hệ bạn trong 24h làm việc"
    });

    setFormData({
      businessName: "",
      contactName: "",
      phone: "",
      email: "",
      address: "",
      businessType: "",
      monthlyVolume: "",
      productInterest: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl">
          <Badge className="mb-4 bg-primary text-primary-foreground">
            <TrendingUp className="w-4 h-4 mr-1" />
            Đối tác kinh doanh
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Chương Trình Mua Sỉ</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Hợp tác cùng CellphoneS - Chiết khấu hấp dẫn, hàng chính hãng, giao hàng toàn quốc
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <a href="#register">Đăng ký ngay</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#pricing">Xem bảng giá</a>
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { value: "500+", label: "Đại lý toàn quốc" },
            { value: "10,000+", label: "Sản phẩm đa dạng" },
            { value: "98%", label: "Khách hàng hài lòng" },
            { value: "24h", label: "Phản hồi nhanh" },
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-muted/50">
              <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="pricing" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pricing" id="pricing">Bảng giá sỉ</TabsTrigger>
            <TabsTrigger value="products">Danh mục sản phẩm</TabsTrigger>
            <TabsTrigger value="policy">Chính sách</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Bảng Chiết Khấu Theo Số Lượng
                </CardTitle>
                <CardDescription>
                  Càng mua nhiều - Càng tiết kiệm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Số lượng (cái)</TableHead>
                      <TableHead>Chiết khấu</TableHead>
                      <TableHead>Giá tham khảo</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wholesalePricing.map((tier, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{tier.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={index >= 3 ? "default" : "secondary"}>
                            {tier.discount}
                          </Badge>
                        </TableCell>
                        <TableCell>{tier.priceRange}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {index === 0 && "Đơn hàng nhỏ"}
                          {index === 1 && "Phổ biến"}
                          {index === 2 && "Đại lý nhỏ"}
                          {index === 3 && "Đại lý lớn"}
                          {index === 4 && "VIP Partner"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-sm text-muted-foreground mt-4">
                  * Giá có thể thay đổi tùy theo sản phẩm và thời điểm. Liên hệ để nhận báo giá chính xác.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Danh Mục Sản Phẩm Sỉ</CardTitle>
                <CardDescription>
                  Đa dạng sản phẩm phụ kiện điện thoại chính hãng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Giá lẻ</TableHead>
                      <TableHead>Giá sỉ (từ 100 cái)</TableHead>
                      <TableHead>Tình trạng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productCategories.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.basePrice.toLocaleString()}đ</TableCell>
                        <TableCell className="text-primary font-semibold">
                          {(product.basePrice * 0.8).toLocaleString()}đ
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.stock === "Có sẵn" ? "default" : "secondary"}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Chính Sách Dành Cho Đại Lý</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="order">
                    <AccordionTrigger>Quy trình đặt hàng</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Đăng ký tài khoản đại lý và chờ duyệt (1-2 ngày làm việc)</li>
                        <li>Nhận báo giá chính thức qua email hoặc Zalo</li>
                        <li>Đặt hàng qua hotline, Zalo hoặc form đặt hàng</li>
                        <li>Thanh toán theo phương thức đã thỏa thuận</li>
                        <li>Nhận hàng trong 2-5 ngày tùy khu vực</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="payment">
                    <AccordionTrigger>Phương thức thanh toán</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Chuyển khoản ngân hàng (ưu tiên)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          COD (Thanh toán khi nhận hàng) - Đơn dưới 10 triệu
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Công nợ (Đại lý VIP, xét duyệt riêng)
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="shipping">
                    <AccordionTrigger>Chính sách vận chuyển</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Miễn phí vận chuyển đơn hàng từ 5.000.000đ</li>
                        <li>• Đơn dưới 5 triệu: Phí ship theo bảng giá vận chuyển</li>
                        <li>• Giao hàng toàn quốc qua GHTK, GHN, Viettel Post</li>
                        <li>• Thời gian giao hàng: 2-5 ngày tùy khu vực</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="return">
                    <AccordionTrigger>Chính sách đổi trả</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Đổi 1-1 sản phẩm lỗi trong 7 ngày</li>
                        <li>• Hoàn tiền 100% nếu hàng không đúng mẫu</li>
                        <li>• Bảo hành theo chính sách từng loại sản phẩm</li>
                        <li>• Hỗ trợ giải quyết khiếu nại trong 24h</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Registration Form */}
        <Card id="register" className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Đăng Ký Làm Đại Lý</CardTitle>
            <CardDescription>
              Điền thông tin để nhận báo giá sỉ và chính sách ưu đãi dành riêng cho bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Tên cửa hàng / Doanh nghiệp *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    placeholder="VD: Shop ABC"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Người liên hệ</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    placeholder="Họ và tên"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="0xxx xxx xxx"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loại hình kinh doanh</Label>
                  <Select 
                    value={formData.businessType} 
                    onValueChange={(value) => setFormData({...formData, businessType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại hình" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Cửa hàng bán lẻ</SelectItem>
                      <SelectItem value="online">Kinh doanh online</SelectItem>
                      <SelectItem value="wholesale">Đại lý / Nhà phân phối</SelectItem>
                      <SelectItem value="corporate">Doanh nghiệp / Công ty</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nhu cầu hàng tháng</Label>
                  <Select 
                    value={formData.monthlyVolume} 
                    onValueChange={(value) => setFormData({...formData, monthlyVolume: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ước tính số lượng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10-50">10 - 50 sản phẩm</SelectItem>
                      <SelectItem value="50-100">50 - 100 sản phẩm</SelectItem>
                      <SelectItem value="100-300">100 - 300 sản phẩm</SelectItem>
                      <SelectItem value="300-500">300 - 500 sản phẩm</SelectItem>
                      <SelectItem value="500+">Trên 500 sản phẩm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sản phẩm quan tâm</Label>
                <Select 
                  value={formData.productInterest} 
                  onValueChange={(value) => setFormData({...formData, productInterest: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhóm sản phẩm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cases">Ốp lưng các loại</SelectItem>
                    <SelectItem value="screen">Kính cường lực</SelectItem>
                    <SelectItem value="chargers">Sạc, cáp, pin dự phòng</SelectItem>
                    <SelectItem value="audio">Tai nghe, loa</SelectItem>
                    <SelectItem value="all">Tất cả sản phẩm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Ghi chú thêm</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Yêu cầu đặc biệt, câu hỏi, hoặc thông tin bổ sung..."
                  rows={4}
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Gửi Đăng Ký
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-6">Liên Hệ Trực Tiếp</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="tel:1800123456" className="flex items-center gap-2 text-primary hover:underline">
              <Phone className="w-5 h-5" />
              Hotline: 1800 123 456
            </a>
            <a href="mailto:wholesale@cellphones.vn" className="flex items-center gap-2 text-primary hover:underline">
              <Mail className="w-5 h-5" />
              wholesale@cellphones.vn
            </a>
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5" />
              123 Nguyễn Văn Linh, Q.7, TP.HCM
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wholesale;

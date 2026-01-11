import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Clock, 
  ChevronDown,
  Package,
  CreditCard,
  Truck,
  RefreshCw,
  Shield,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const Support = () => {
  const [cartCount] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã gửi yêu cầu hỗ trợ! Chúng tôi sẽ phản hồi trong 24h.");
    setContactForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const quickLinks = [
    { icon: Package, title: "Theo dõi đơn hàng", description: "Kiểm tra trạng thái đơn hàng", link: "/orders" },
    { icon: RefreshCw, title: "Đổi trả hàng", description: "Chính sách đổi trả 30 ngày", link: "#" },
    { icon: Truck, title: "Vận chuyển", description: "Thông tin giao hàng", link: "#" },
    { icon: CreditCard, title: "Thanh toán", description: "Các phương thức thanh toán", link: "#" },
    { icon: Shield, title: "Bảo hành", description: "Chính sách bảo hành", link: "#" },
    { icon: FileText, title: "Hướng dẫn sử dụng", description: "Tài liệu hướng dẫn", link: "#" },
  ];

  const faqs = [
    {
      question: "Làm thế nào để theo dõi đơn hàng?",
      answer: "Bạn có thể theo dõi đơn hàng bằng cách đăng nhập vào tài khoản và vào mục 'Đơn hàng của tôi'. Hoặc sử dụng mã đơn hàng trong email xác nhận để tra cứu tại trang Theo dõi đơn hàng."
    },
    {
      question: "Thời gian giao hàng là bao lâu?",
      answer: "Thời gian giao hàng phụ thuộc vào khu vực: Nội thành TP.HCM/Hà Nội: 1-2 ngày. Các tỉnh thành khác: 3-5 ngày. Khu vực vùng sâu vùng xa: 5-7 ngày."
    },
    {
      question: "Tôi có thể đổi/trả hàng trong bao lâu?",
      answer: "Bạn có thể đổi trả hàng trong vòng 30 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng và có đầy đủ hóa đơn."
    },
    {
      question: "Các hình thức thanh toán được chấp nhận?",
      answer: "Chúng tôi chấp nhận: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng, Thẻ tín dụng/ghi nợ Visa/Mastercard, Ví điện tử (Momo, ZaloPay, VNPay)."
    },
    {
      question: "Sản phẩm được bảo hành như thế nào?",
      answer: "Tất cả sản phẩm đều được bảo hành chính hãng. Thời gian bảo hành tùy thuộc vào từng sản phẩm (thường từ 12-24 tháng). Bạn có thể mang sản phẩm đến cửa hàng hoặc các trung tâm bảo hành ủy quyền."
    },
    {
      question: "Làm sao để nhận ưu đãi và khuyến mãi?",
      answer: "Đăng ký tài khoản thành viên để nhận điểm thưởng và ưu đãi độc quyền. Theo dõi trang Khuyến mãi Hot để cập nhật các deal hấp dẫn. Đăng ký nhận email để không bỏ lỡ chương trình giảm giá."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cartCount} />
      
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span>/</span>
          <span className="text-foreground">Hỗ trợ</span>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Trung Tâm Hỗ Trợ</h1>
          <p className="text-muted-foreground">Chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
        </div>

        {/* Quick Links */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Truy Cập Nhanh</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((item) => (
              <Link key={item.title} to={item.link}>
                <Card className="hover:shadow-md transition-shadow hover:border-primary h-full">
                  <CardContent className="p-4 text-center">
                    <item.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Câu Hỏi Thường Gặp</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Contact Form */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Liên Hệ Với Chúng Tôi</h2>
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Họ tên</label>
                      <Input 
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Số điện thoại</label>
                      <Input 
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="0901234567"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input 
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tiêu đề</label>
                    <Input 
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="Vấn đề bạn cần hỗ trợ"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nội dung</label>
                    <Textarea 
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Mô tả chi tiết vấn đề..."
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Gửi yêu cầu hỗ trợ
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="mt-4">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Thông Tin Liên Hệ</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Hotline</p>
                      <p className="text-sm text-muted-foreground">1900 1234 (8:00 - 22:00)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">support@techstore.vn</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Địa chỉ</p>
                      <p className="text-sm text-muted-foreground">123 Nguyễn Huệ, Q.1, TP.HCM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Giờ làm việc</p>
                      <p className="text-sm text-muted-foreground">8:00 - 22:00 (Tất cả các ngày)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;

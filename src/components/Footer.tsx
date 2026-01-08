import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter */}
      <div className="border-b border-background/10">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Đăng ký nhận tin</h3>
              <p className="text-background/70">
                Nhận thông tin khuyến mãi & sản phẩm mới
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Email của bạn"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 w-full md:w-64"
              />
              <Button variant="brand" className="shrink-0">
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">T</span>
              </div>
              <span className="text-xl font-bold">TechStore</span>
            </div>
            <p className="text-background/70 text-sm mb-4">
              Cửa hàng phụ kiện công nghệ cao cấp hàng đầu Việt Nam. Phân phối chính hãng UAG, Anker, Spigen, Tomtoc.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">Hướng dẫn mua hàng</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Chính sách bảo hành</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Phương thức thanh toán</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Vận chuyển & giao nhận</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Danh mục</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">Ốp lưng điện thoại</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sạc & Cáp</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Túi & Balo laptop</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Dán màn hình</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Phụ kiện Apple Watch</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 shrink-0" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0" />
                <span>support@techstore.vn</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                <span>8:00 - 21:00 (Thứ 2 - CN)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
            <p>© 2026 TechStore. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-background transition-colors">Điều khoản sử dụng</a>
              <a href="#" className="hover:text-background transition-colors">Chính sách bảo mật</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

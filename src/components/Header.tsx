import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Crown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categories } from "@/data/products";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import { MEMBERSHIP_LEVELS } from "@/types/user";
import { toast } from "sonner";

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
}

const Header = ({ cartCount = 0, onCartClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-foreground text-background py-2">
        <div className="container flex items-center justify-between text-xs md:text-sm">
          <span className="hidden md:block">🚚 Giao hàng miễn phí đơn từ 500K</span>
          <span className="md:hidden">🚚 Miễn phí ship từ 500K</span>
          <div className="flex items-center gap-4">
            <span>Hotline: <strong>1900 1234</strong></span>
            <span className="hidden md:inline">|</span>
            <Link to="/orders" className="hidden md:inline hover:underline">Theo dõi đơn hàng</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">T</span>
            </div>
            <span className="text-xl font-bold hidden sm:block">TechStore</span>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 bg-secondary border-0 rounded-full focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="relative" onClick={onCartClick}>
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${MEMBERSHIP_LEVELS[user.membershipLevel].color} flex items-center justify-center`}>
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm">{user.name.split(' ')[0]}</span>
                    <Badge variant="secondary" className="text-xs">
                      {user.points} điểm
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Tài khoản
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')} className="cursor-pointer">
                    Đơn hàng của tôi
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setAuthModalOpen(true)}>
                <User className="w-5 h-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden md:block border-t border-border bg-card">
        <div className="container">
          <ul className="flex items-center gap-1">
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1 font-medium">
                    Danh mục
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat.id} className="cursor-pointer" onClick={() => navigate(`/?category=${cat.id}`)}>
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li>
              <Button variant="ghost" className="font-medium text-primary" onClick={() => navigate('/promotions')}>
                Khuyến mãi Hot 🔥
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="font-medium" onClick={() => navigate('/brands')}>
                Thương hiệu
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="font-medium" onClick={() => navigate('/tech-news')}>
                Bản tin công nghệ
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="font-medium" onClick={() => navigate('/support')}>
                Hỗ trợ
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="font-medium text-purple-500" onClick={() => navigate('/custom-case')}>
                ✨ Custom ốp lưng
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="font-medium text-orange-500" onClick={() => navigate('/wholesale')}>
                🏪 Mua sỉ
              </Button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border animate-slide-in-right">
          <div className="container py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 h-11 bg-secondary border-0 rounded-full"
              />
            </div>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Button variant="ghost" className="w-full justify-start font-medium" onClick={() => { navigate(`/?category=${cat.id}`); setIsMenuOpen(false); }}>
                    {cat.name}
                  </Button>
                </li>
              ))}
              <li>
                <Button variant="ghost" className="w-full justify-start font-medium text-primary" onClick={() => { navigate('/promotions'); setIsMenuOpen(false); }}>
                  Khuyến mãi Hot 🔥
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start font-medium" onClick={() => { navigate('/brands'); setIsMenuOpen(false); }}>
                  Thương hiệu
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start font-medium" onClick={() => { navigate('/tech-news'); setIsMenuOpen(false); }}>
                  Bản tin công nghệ
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start font-medium" onClick={() => { navigate('/support'); setIsMenuOpen(false); }}>
                  Hỗ trợ
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start font-medium text-purple-500" onClick={() => { navigate('/custom-case'); setIsMenuOpen(false); }}>
                  ✨ Custom ốp lưng
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start font-medium text-orange-500" onClick={() => { navigate('/wholesale'); setIsMenuOpen(false); }}>
                  🏪 Mua sỉ
                </Button>
              </li>
            </ul>
          </div>
        </div>
      )}

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </header>
  );
};

export default Header;

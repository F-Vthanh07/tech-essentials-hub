import { useState } from "react";
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categories } from "@/data/products";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

const Header = ({ cartCount, onCartClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
            <span className="hidden md:inline">Theo dõi đơn hàng</span>
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

            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="w-5 h-5" />
            </Button>

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
                    <DropdownMenuItem key={cat.id} className="cursor-pointer">
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li>
              <Button variant="ghost" className="font-medium text-primary">
                Khuyến mãi Hot 🔥
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="font-medium">
                Thương hiệu
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="font-medium">
                Bản tin công nghệ
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="font-medium">
                Hỗ trợ
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
                  <Button variant="ghost" className="w-full justify-start font-medium">
                    {cat.name}
                  </Button>
                </li>
              ))}
              <li>
                <Button variant="ghost" className="w-full justify-start font-medium text-primary">
                  Khuyến mãi Hot 🔥
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start font-medium">
                  Bản tin công nghệ
                </Button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

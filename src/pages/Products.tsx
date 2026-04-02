import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { cartService } from "@/services/CartService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Products = () => {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const handleAddToCart = async (product: Product) => {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) {
      toast.error("Chưa có giỏ hàng cho tài khoản, vui lòng đăng nhập lại");
      return;
    }

    const productVariantId = product.variantId || product.colorVariants?.[0]?.id;

    if (!productVariantId) {
      toast.error("Sản phẩm chưa có biến thể để thêm vào giỏ");
      return;
    }

    try {
      await cartService.createCartItem({
        productVariantId,
        quantity: 1,
      });

      addToCart(product);
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
    } catch (err) {
      console.warn("add cart item failed", err);
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      setSearchParams({ search: trimmed });
    } else {
      searchParams.delete("search");
      setSearchParams(searchParams);
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Tất cả sản phẩm</h1>
              <p className="text-muted-foreground mt-1">Khám phá toàn bộ phụ kiện công nghệ chính hãng</p>
            </div>
            <form onSubmit={handleSearch} className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-10 h-10 bg-secondary border-0 rounded-full focus-visible:ring-primary"
              />
              {searchInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={handleClearSearch}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </form>
          </div>
        </div>

        <ProductGrid onAddToCart={handleAddToCart} />
      </main>

      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Products;

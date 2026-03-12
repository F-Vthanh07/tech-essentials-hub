import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import BrandShowcase from "@/components/BrandShowcase";
import ProductGrid from "@/components/ProductGrid";
import TechNews from "@/components/TechNews";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroBanner />
        <BrandShowcase />

        {/* Featured products section */}
        <section className="py-6 md:py-10">
          <div className="container">
            <div className="text-center mb-4">
              <h2 className="text-2xl md:text-3xl font-bold">Sản phẩm nổi bật</h2>
              <p className="text-muted-foreground mt-1">Phụ kiện công nghệ chính hãng, chất lượng cao</p>
            </div>
            <div className="flex justify-end mb-4">
              <Button asChild variant="outline" className="hidden sm:flex items-center gap-2">
                <Link to="/products">
                  Xem tất cả
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          <ProductGrid onAddToCart={handleAddToCart} featuredMode />

          <div className="container mt-6 flex justify-center sm:hidden">
            <Button asChild variant="outline" className="w-full max-w-xs gap-2">
              <Link to="/products">
                Xem tất cả sản phẩm
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        <TechNews />
      </main>

      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Index;

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

        {/* Section title for product grid with background alternation */}
        <section className="py-2 md:py-4">
          <div className="container">
            <div className="text-center mb-2">
              <h2 className="text-2xl md:text-3xl font-bold">Sản phẩm nổi bật</h2>
              <p className="text-muted-foreground mt-2">Phụ kiện công nghệ chính hãng, chất lượng cao</p>
            </div>
          </div>
        </section>

        <ProductGrid onAddToCart={handleAddToCart} />

        <TechNews />
      </main>

      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Index;

import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Product } from "@/types/product";

const Products = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <div className="container py-6">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">Tất cả sản phẩm</h1>
            <p className="text-muted-foreground mt-1">Khám phá toàn bộ phụ kiện công nghệ chính hãng</p>
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

import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { cartService } from "@/services/CartService";

const Products = () => {
  const { addToCart } = useCart();

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

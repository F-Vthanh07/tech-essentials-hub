import { useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import BrandShowcase from "@/components/BrandShowcase";
import ProductGrid from "@/components/ProductGrid";
import TechNews from "@/components/TechNews";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import CartDrawer from "@/components/CartDrawer";
import { Product } from "@/types/product";

interface CartItem extends Product {
  quantity: number;
}

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />
      
      <main>
        <HeroBanner />
        <BrandShowcase />
        <ProductGrid onAddToCart={addToCart} />
        <TechNews />
      </main>

      <Footer />
      <FloatingContact />
      
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />
    </div>
  );
};

export default Index;

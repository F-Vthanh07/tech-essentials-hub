import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Minus, Plus, X, Trash2, Tag, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { discountCodes } from "@/data/products";

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart } = useCart();
  
  const [promoCode, setPromoCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getItemPrice = (item: typeof items[0]) => {
    return item.selectedColor?.price ?? item.product.price;
  };

  const getItemDiscount = (item: typeof items[0]) => {
    return item.selectedColor?.discount ?? item.product.discount ?? 0;
  };

  const getItemFinalPrice = (item: typeof items[0]) => {
    const price = getItemPrice(item);
    const discount = getItemDiscount(item);
    return price * (1 - discount / 100);
  };

  const subtotal = items.reduce((sum, item) => sum + getItemFinalPrice(item) * item.quantity, 0);

  const appliedDiscount = discountCodes.find(
    (code) => code.code === appliedCode && subtotal >= code.minOrder
  );

  const discountAmount = appliedDiscount
    ? (subtotal * appliedDiscount.discount) / 100
    : 0;

  const total = subtotal - discountAmount;

  const applyPromoCode = () => {
    const code = discountCodes.find((c) => c.code === promoCode.toUpperCase());
    if (!code) {
      setPromoError("Mã không hợp lệ");
      return;
    }
    if (subtotal < code.minOrder) {
      setPromoError(`Đơn hàng tối thiểu ${formatPrice(code.minOrder)}`);
      return;
    }
    setAppliedCode(code.code);
    setPromoError("");
    setPromoCode("");
  };

  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        discount: appliedDiscount?.discount || 0,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Giỏ hàng ({items.length} sản phẩm)</h1>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-2">Giỏ hàng trống</p>
              <p className="text-muted-foreground mb-6">
                Hãy thêm sản phẩm vào giỏ hàng
              </p>
              <Button onClick={() => navigate("/")}>Tiếp tục mua sắm</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.selectedColor?.image || item.product.image}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product.id}`} className="font-medium hover:text-primary line-clamp-2">
                          {item.product.name}
                        </Link>
                        <p className="text-muted-foreground text-sm mt-1">{item.product.brand}</p>
                        {item.selectedColor && (
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: item.selectedColor.colorCode }}
                            />
                            <span className="text-sm text-muted-foreground">{item.selectedColor.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-primary font-semibold">
                            {formatPrice(getItemFinalPrice(item))}
                          </p>
                          {getItemDiscount(item) > 0 && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(getItemPrice(item))}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-secondary transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-secondary transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-semibold">
                          {formatPrice(getItemFinalPrice(item) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Promo code */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Mã giảm giá"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value);
                            setPromoError("");
                          }}
                          className="pl-10"
                        />
                      </div>
                      <Button variant="outline" onClick={applyPromoCode}>
                        Áp dụng
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-destructive text-sm">{promoError}</p>
                    )}
                    {appliedCode && (
                      <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
                        <span className="text-sm font-medium text-primary">
                          Mã {appliedCode} đã áp dụng (-{appliedDiscount?.discount}%)
                        </span>
                        <button
                          onClick={() => setAppliedCode(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Mã: BRO5, BRO10, BRO20 (theo giá trị đơn hàng)
                    </p>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tạm tính</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-primary">
                        <span>Giảm giá</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button variant="brand" size="lg" className="w-full" onClick={handleCheckout}>
                    Tiến hành thanh toán
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                    Tiếp tục mua sắm
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;

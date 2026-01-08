import { Minus, Plus, X, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Product } from "@/types/product";
import { discountCodes } from "@/data/products";
import { useState } from "react";

interface CartItem extends Product {
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const CartDrawer = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) => {
  const [promoCode, setPromoCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            Giỏ hàng ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">Giỏ hàng trống</p>
            <p className="text-muted-foreground mb-6">
              Hãy thêm sản phẩm vào giỏ hàng
            </p>
            <Button onClick={onClose}>Tiếp tục mua sắm</Button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-secondary/50 rounded-lg"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2 mb-1">
                        {item.name}
                      </p>
                      <p className="text-primary font-semibold">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            className="p-1.5 hover:bg-secondary transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-secondary transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo code */}
            <div className="py-4 border-t border-border">
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
                <p className="text-destructive text-sm mt-2">{promoError}</p>
              )}
              {appliedCode && (
                <div className="flex items-center justify-between mt-2 p-2 bg-primary/10 rounded-lg">
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
              <p className="text-xs text-muted-foreground mt-2">
                Mã: BRO5, BRO10, BRO20 (theo giá trị đơn hàng)
              </p>
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-border space-y-2">
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
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout */}
            <div className="pt-4 space-y-2">
              <Button variant="brand" size="lg" className="w-full">
                Thanh toán
              </Button>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Tiếp tục mua sắm
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;

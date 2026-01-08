import { X, Star, ShoppingCart, Heart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/types/product";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const QuickViewModal = ({ product, onClose, onAddToCart }: QuickViewModalProps) => {
  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <Badge className="bg-primary text-primary-foreground">Mới</Badge>
              )}
              {product.isBestseller && (
                <Badge className="bg-foreground text-background">Bán chạy</Badge>
              )}
              {product.discount && (
                <Badge variant="destructive">-{product.discount}%</Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {product.brand}
            </span>
            <h2 className="text-2xl font-bold mt-2 mb-4">{product.name}</h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">
                ({product.reviewCount} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Features */}
            {product.features && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Tính năng nổi bật:</h4>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Device compatibility */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Tương thích:</h4>
              <Badge variant="secondary">{product.device}</Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="brand"
                size="lg"
                className="flex-1"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Additional info */}
            <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground space-y-2">
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Giao hàng miễn phí cho đơn từ 500K
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Đổi trả 30 ngày
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Bảo hành chính hãng 12 tháng
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;

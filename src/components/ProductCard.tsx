import { useState } from "react";
import { Eye, ShoppingCart, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onQuickView, onAddToCart }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div
      className="group relative bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
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

      {/* Wishlist button */}
      <button
        onClick={() => setIsWishlisted(!isWishlisted)}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isWishlisted ? "fill-primary text-primary" : "text-muted-foreground"
          }`}
        />
      </button>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Quick actions */}
        <div
          className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex gap-2">
            <Button
              variant="quick-view"
              size="sm"
              className="flex-1"
              onClick={() => onQuickView(product)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Xem nhanh
            </Button>
            <Button
              variant="brand"
              size="sm"
              className="flex-1"
              onClick={() => onAddToCart(product)}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Thêm
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {product.brand}
        </span>
        <h3 className="font-medium mt-1 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Features */}
        {product.features && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.features.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

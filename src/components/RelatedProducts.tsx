import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";

interface RelatedProductsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const RelatedProducts = ({ products, onAddToCart }: RelatedProductsProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (products.length === 0) return null;

  return (
    <section className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group"
            >
              <div className="bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300">
                {/* Badges */}
                <div className="relative">
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {product.isNew && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        Mới
                      </Badge>
                    )}
                    {product.discount && (
                      <Badge variant="destructive" className="text-xs">
                        -{product.discount}%
                      </Badge>
                    )}
                  </div>

                  {/* Image */}
                  <div className="aspect-square overflow-hidden bg-secondary">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {product.brand}
                  </span>
                  <h3 className="font-medium text-sm mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{product.rating}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.preventDefault();
                      onAddToCart(product);
                    }}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Thêm vào giỏ
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;

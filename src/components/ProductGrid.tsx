import { useState, useMemo } from "react";
import { Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "./ProductCard";
import ProductFilter from "./ProductFilter";
import QuickViewModal from "./QuickViewModal";
import { products } from "@/data/products";
import { Product, FilterState } from "@/types/product";

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

const ProductGrid = ({ onAddToCart }: ProductGridProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    categories: [],
    devices: [],
    priceRange: [0, 10000000],
  });

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply brand filter
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand));
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    // Apply device filter
    if (filters.devices.length > 0) {
      result = result.filter((p) => filters.devices.includes(p.device));
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result = result.filter((p) => p.isNew).concat(result.filter((p) => !p.isNew));
        break;
      default:
        // Featured - show bestsellers first
        result = result.filter((p) => p.isBestseller).concat(result.filter((p) => !p.isBestseller));
    }

    return result;
  }, [filters, sortBy]);

  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter sidebar */}
          <ProductFilter filters={filters} onFilterChange={setFilters} />

          {/* Product grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">
                  Sản phẩm ({filteredProducts.length})
                </h2>
                <div className="lg:hidden">
                  <ProductFilter filters={filters} onFilterChange={setFilters} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Nổi bật</SelectItem>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="price-low">Giá thấp → cao</SelectItem>
                    <SelectItem value="price-high">Giá cao → thấp</SelectItem>
                    <SelectItem value="rating">Đánh giá cao</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden sm:flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div
              className={`grid gap-4 md:gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard
                    product={product}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={onAddToCart}
                  />
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  Không tìm thấy sản phẩm phù hợp
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    setFilters({
                      brands: [],
                      categories: [],
                      devices: [],
                      priceRange: [0, 10000000],
                    })
                  }
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={onAddToCart}
      />
    </section>
  );
};

export default ProductGrid;

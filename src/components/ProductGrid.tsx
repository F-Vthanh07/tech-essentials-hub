import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Grid3X3, List, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
import { products as mockProducts } from "@/data/products";
import { productService } from "@/services/ProductService";
import { Product, FilterState } from "@/types/product";

const ITEMS_PER_PAGE = 12;

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  /** When true: shows only 4 products, no filters, no toolbar, no pagination */
  featuredMode?: boolean;
}

const ProductGrid = ({ onAddToCart, featuredMode = false }: ProductGridProps) => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    categories: [],
    devices: [],
    priceRange: [0, 10000000],
  });

  // Sync category from URL param into filters
  useEffect(() => {
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryParam],
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        categories: [],
      }));
    }
  }, [categoryParam]);

  // Reset page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, searchQuery]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const apiProducts = await productService.getAllProducts();
        if (apiProducts.length > 0) {
          setAllProducts(apiProducts);
        } else {
          setAllProducts(mockProducts);
        }
      } catch (err) {
        console.warn('Failed to fetch products from API, using mock data', err);
        setAllProducts(mockProducts);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // In featured mode just return first 4 active products
    if (featuredMode) return result.slice(0, 4);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Apply brand filter
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand));
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) => {
        const catName = p.category?.toLowerCase() || '';
        const catId = p.categoryId?.toLowerCase() || '';
        return filters.categories.some(fc => {
          const fcLower = fc.toLowerCase();
          return catName === fcLower || catId === fcLower ||
                 catName.includes(fcLower) || fcLower.includes(catName);
        });
      });
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
        result = result.filter((p) => p.isBestseller).concat(result.filter((p) => !p.isBestseller));
    }

    return result;
  }, [allProducts, filters, sortBy, searchQuery, featuredMode]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (featuredMode) {
    return (
      <section className="py-4">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <ProductCard product={product} onQuickView={setQuickViewProduct} onAddToCart={onAddToCart} />
                </div>
              ))}
            </div>
          )}
          <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddToCart={onAddToCart} />
        </div>
      </section>
    );
  }

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
                  {searchQuery ? (
                    <>Kết quả tìm kiếm "{searchQuery}" ({filteredProducts.length})</>
                  ) : (
                    <>Sản phẩm ({filteredProducts.length})</>
                  )}
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

            {/* Loading */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Grid */}
                <div
                  className={`grid gap-4 md:gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {paginatedProducts.map((product, index) => (
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

                {/* Empty state */}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground text-lg mb-2">
                      {searchQuery
                        ? `Không tìm thấy sản phẩm cho "${searchQuery}"`
                        : "Không tìm thấy sản phẩm phù hợp"}
                    </p>
                    <p className="text-muted-foreground text-sm mb-4">
                      Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc
                    </p>
                    <Button
                      variant="outline"
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((p) => p - 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Trước
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "ghost"}
                          size="sm"
                          className="w-9 h-9 p-0"
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((p) => p + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Sau
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
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

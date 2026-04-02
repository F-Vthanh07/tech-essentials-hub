import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { products as mockProducts } from "@/data/products";
import { brandService, Brand } from "@/services/BrandService";
import { productService } from "@/services/ProductService";
import { Product } from "@/types/product";

const Brands = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [apiBrands, setApiBrands] = useState<Brand[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [brandsData, productsData] = await Promise.all([
          brandService.getAll(),
          productService.getAllProducts().catch(() => []),
        ]);
        if (brandsData.length > 0) setApiBrands(brandsData);
        if (productsData.length > 0) setAllProducts(productsData);
      } catch (err) {
        console.warn('Failed to fetch brands from API', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build brand data from API or mock products
  const brandData = apiBrands.length > 0
    ? apiBrands.map(brand => ({
      id: brand.id,
      name: brand.name || '',
      productCount: allProducts.filter(p => p.brand === brand.name).length,
      logo: brand.logoUrl || brand.logo || `/placeholder.svg`,
      description: brand.description || '',
    }))
    : [...new Set(mockProducts.map(p => p.brand))].filter(Boolean).map(brand => ({
      id: brand,
      name: brand,
      productCount: mockProducts.filter(p => p.brand === brand).length,
      logo: `/placeholder.svg`,
      description: '',
    }));

  const filteredBrands = brandData.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedBrands = [...brandData].sort((a, b) => b.productCount - a.productCount);
  const featuredBrands = sortedBrands.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/60 to-background">
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.35),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.25),transparent_40%)]" />
          <div className="container relative py-10 md:py-14">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Trang chủ</Link>
              <span>/</span>
              <span className="text-foreground">Thương hiệu</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Đối tác chính hãng toàn cầu
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                  Khám phá hệ sinh thái
                  {" "}
                  <span className="text-primary">thương hiệu phụ kiện</span>
                  {" "}
                  hàng đầu
                </h1>
                <p className="text-muted-foreground mt-4 text-base md:text-lg">
                  Chọn theo thương hiệu bạn tin dùng, đối chiếu số lượng sản phẩm theo thời gian thực và đi thẳng đến danh mục tương ứng.
                </p>
              </div>

              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm thương hiệu bạn quan tâm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="container py-10 md:py-12 space-y-10">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold">Top thương hiệu nổi bật</h2>
                <Badge variant="secondary">{featuredBrands.length} thương hiệu</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {featuredBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/?brand=${brand.name.toLowerCase()}`}
                    className="block"
                  >
                    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 border-border/70">
                      <CardContent className="p-5">
                        <div className="w-14 h-14 mb-3 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                          {brand.logo && brand.logo !== "/placeholder.svg" ? (
                            <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain" />
                          ) : (
                            <span className="text-xl font-bold text-primary">{brand.name.charAt(0)}</span>
                          )}
                        </div>
                        <h3 className="font-semibold line-clamp-1">{brand.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {brand.description || "Thương hiệu phụ kiện công nghệ chính hãng"}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold">Tất cả thương hiệu ({filteredBrands.length})</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    to={`/?brand=${brand.name.toLowerCase()}`}
                    className="group block"
                  >
                    <Card className="h-full hover:shadow-md transition-all hover:border-primary border-border/60">
                      <CardContent className="p-5 h-full flex flex-col">
                        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden mb-3">
                          {brand.logo && brand.logo !== "/placeholder.svg" ? (
                            <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <span className="text-lg font-bold text-primary">{brand.name.charAt(0)}</span>
                          )}
                        </div>
                        <h3 className="font-semibold">{brand.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">
                          {brand.description || "Danh mục phụ kiện đa dạng, bảo hành chính hãng."}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {brand.productCount} sản phẩm
                          </span>
                          <span className="inline-flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            Xem ngay
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {filteredBrands.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Không tìm thấy thương hiệu phù hợp
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Brands;


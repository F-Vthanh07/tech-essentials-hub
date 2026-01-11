import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { products } from "@/data/products";

const Brands = () => {
  const [cartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Extract unique brands from products
  const brands = [...new Set(products.map(p => p.brand))].filter(Boolean);
  
  // Count products per brand
  const brandData = brands.map(brand => ({
    name: brand,
    productCount: products.filter(p => p.brand === brand).length,
    logo: `/placeholder.svg`, // Placeholder logo
  }));

  const filteredBrands = brandData.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Featured brands
  const featuredBrands = [
    { name: "Apple", description: "Think Different", color: "bg-gray-100" },
    { name: "Samsung", description: "Do What You Can't", color: "bg-blue-50" },
    { name: "Sony", description: "Be Moved", color: "bg-purple-50" },
    { name: "Dell", description: "Technologies", color: "bg-cyan-50" },
    { name: "Asus", description: "In Search of Incredible", color: "bg-red-50" },
    { name: "Logitech", description: "For Those Who Dare", color: "bg-green-50" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cartCount} />
      
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span>/</span>
          <span className="text-foreground">Thương hiệu</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Thương Hiệu</h1>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm thương hiệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Featured Brands */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Thương Hiệu Nổi Bật</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredBrands.map((brand) => (
              <Link 
                key={brand.name} 
                to={`/?brand=${brand.name.toLowerCase()}`}
                className="block"
              >
                <Card className={`${brand.color} hover:shadow-lg transition-all hover:-translate-y-1`}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-xl font-bold text-foreground">{brand.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-semibold">{brand.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{brand.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* All Brands Grid */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Tất Cả Thương Hiệu ({filteredBrands.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredBrands.map((brand) => (
              <Link 
                key={brand.name} 
                to={`/?brand=${brand.name.toLowerCase()}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow hover:border-primary">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-secondary rounded-lg flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{brand.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-medium text-sm">{brand.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {brand.productCount} sản phẩm
                    </p>
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
      </main>

      <Footer />
    </div>
  );
};

export default Brands;

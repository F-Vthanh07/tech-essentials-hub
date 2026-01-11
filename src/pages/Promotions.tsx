import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Clock, Percent, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { products } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Promotions = () => {
  const [cartCount] = useState(0);
  
  // Filter products with discounts
  const discountedProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price);
  
  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cartCount} />
      
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span>/</span>
          <span className="text-foreground">Khuyến mãi Hot</span>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-primary to-orange-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">Khuyến Mãi Hot</h1>
          </div>
          <p className="text-lg opacity-90 mb-4">
            Săn deal khủng - Giảm giá lên đến 50% cho các sản phẩm công nghệ hàng đầu!
          </p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Kết thúc sau: 2 ngày 14:30:25</span>
            </div>
          </div>
        </div>

        {/* Flash Sale Section */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Flash Sale</h2>
            <Badge variant="destructive" className="animate-pulse">HOT</Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {discountedProducts.slice(0, 8).map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0 relative">
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    {product.originalPrice && (
                      <Badge className="absolute top-2 left-2 bg-destructive">
                        -{calculateDiscount(product.originalPrice, product.price)}%
                      </Badge>
                    )}
                  </Link>
                </CardContent>
                <CardFooter className="flex-col items-start p-4 gap-2">
                  <Link to={`/product/${product.id}`} className="hover:text-primary">
                    <h3 className="font-medium line-clamp-2 text-sm">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {product.price.toLocaleString('vi-VN')}đ
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Vouchers Section */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Percent className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Mã Giảm Giá</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { code: "NEWUSER", discount: "100K", minOrder: "500K", expiry: "31/01/2026" },
              { code: "TECH50", discount: "50K", minOrder: "300K", expiry: "15/02/2026" },
              { code: "FREESHIP", discount: "Free Ship", minOrder: "200K", expiry: "28/02/2026" },
            ].map((voucher) => (
              <Card key={voucher.code} className="border-dashed border-2 border-primary/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-primary">{voucher.discount}</p>
                    <p className="text-sm text-muted-foreground">Đơn tối thiểu {voucher.minOrder}</p>
                    <p className="text-xs text-muted-foreground">HSD: {voucher.expiry}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                    {voucher.code}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Discounted Products */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Tất Cả Sản Phẩm Giảm Giá</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {discountedProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0 relative">
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    {product.originalPrice && (
                      <Badge className="absolute top-2 left-2 bg-destructive">
                        -{calculateDiscount(product.originalPrice, product.price)}%
                      </Badge>
                    )}
                  </Link>
                </CardContent>
                <CardFooter className="flex-col items-start p-4 gap-2">
                  <Link to={`/product/${product.id}`} className="hover:text-primary">
                    <h3 className="font-medium line-clamp-2 text-sm">{product.name}</h3>
                  </Link>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-primary">
                      {product.price.toLocaleString('vi-VN')}đ
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Promotions;

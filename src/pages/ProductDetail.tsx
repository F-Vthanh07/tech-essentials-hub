import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import ProductGallery from "@/components/ProductGallery";
import RelatedProducts from "@/components/RelatedProducts";
import CartDrawer from "@/components/CartDrawer";
import { products } from "@/data/products";
import { Product } from "@/types/product";
import { toast } from "@/hooks/use-toast";

interface CartItem extends Product {
  quantity: number;
}

// Extended product data with gallery and description
const getProductDetails = (product: Product) => {
  const galleryImages = [
    product.image,
    product.image.replace("w=400", "w=401"),
    product.image.replace("w=400", "w=402"),
    product.image.replace("w=400", "w=403"),
  ];

  const descriptions: Record<string, string> = {
    cases: `Ốp lưng cao cấp được thiết kế đặc biệt để bảo vệ tối đa cho thiết bị của bạn. 
    
Với công nghệ chống sốc tiên tiến, sản phẩm có khả năng hấp thụ lực va đập hiệu quả, bảo vệ điện thoại khỏi những cú rơi từ độ cao lên đến 4 mét. Thiết kế tinh tế với các đường nét góc cạnh tạo nên vẻ ngoài mạnh mẽ nhưng không kém phần sang trọng.

**Đặc điểm nổi bật:**
• Chất liệu cao cấp, bền bỉ theo thời gian
• Thiết kế vừa vặn hoàn hảo với thiết bị
• Các nút bấm có phản hồi tốt, dễ sử dụng
• Hỗ trợ sạc không dây và MagSafe
• Lỗ khoét camera chính xác, không che phủ flash

Sản phẩm được bảo hành chính hãng 12 tháng với chính sách đổi trả dễ dàng trong 30 ngày đầu tiên.`,

    chargers: `Bộ sạc công nghệ GaN thế hệ mới nhất mang đến hiệu suất sạc vượt trội với kích thước nhỏ gọn đáng kinh ngạc.

Công nghệ Gallium Nitride (GaN) giúp giảm nhiệt độ hoạt động, tăng hiệu suất chuyển đổi năng lượng lên đến 93%, đồng thời giảm kích thước đến 40% so với bộ sạc truyền thống cùng công suất.

**Đặc điểm nổi bật:**
• Công suất đầu ra tối đa, sạc nhanh cho mọi thiết bị
• Nhiều cổng sạc, hỗ trợ sạc đồng thời nhiều thiết bị
• Công nghệ PowerIQ tự động nhận diện thiết bị
• Thiết kế gập gọn, tiện lợi mang theo
• Bảo vệ quá nhiệt, quá dòng, quá áp

Bảo hành chính hãng 18 tháng cùng chế độ đổi trả 30 ngày.`,

    bags: `Túi đựng laptop cao cấp với khả năng bảo vệ toàn diện 360 độ cho thiết bị của bạn.

Được chế tạo từ vật liệu chống nước cao cấp với lớp lót nhung mềm mại bên trong, túi mang đến sự bảo vệ tối ưu cho laptop khỏi va đập, trầy xước và ẩm ướt.

**Đặc điểm nổi bật:**
• Chất liệu ngoài chống nước, chống bám bẩn
• Lớp đệm EVA chống sốc ở tất cả các mặt
• Khóa kéo YKK bền bỉ, mượt mà
• Ngăn phụ tiện lợi cho phụ kiện
• Thiết kế thanh lịch, phù hợp môi trường công sở

Bảo hành 24 tháng với chính sách đổi mới nếu lỗi sản xuất.`,

    audio: `Tai nghe không dây cao cấp với công nghệ chống ồn chủ động (ANC) thế hệ mới.

Trải nghiệm âm thanh Hi-Res Audio với codec LDAC, mang đến chất lượng âm thanh studio ngay trong tai bạn. Công nghệ ANC 2.0 loại bỏ đến 98% tiếng ồn môi trường.

**Đặc điểm nổi bật:**
• Chống ồn chủ động ANC thích ứng
• Driver dynamic cao cấp cho âm bass sâu
• Thời lượng pin lên đến 50 giờ
• Kết nối đa điểm với 2 thiết bị cùng lúc
• Điều khiển cảm ứng thông minh
• Chống nước IPX4

Bảo hành 12 tháng chính hãng.`,

    screen: `Kính cường lực bảo vệ màn hình với độ cứng 9H chống trầy xước tuyệt đối.

Được sản xuất bằng công nghệ Nhật Bản, kính có độ trong suốt 99.9%, không ảnh hưởng đến chất lượng hiển thị và độ nhạy cảm ứng của màn hình.

**Đặc điểm nổi bật:**
• Độ cứng 9H chống trầy xước
• Lớp phủ oleophobic chống bám vân tay
• Dụng cụ dán EZ Fit, tự dán trong 30 giây
• Viền đen che khuyết điểm hoàn hảo
• Bộ sản phẩm gồm 2 miếng dán

Bảo hành vỡ miễn phí trong 6 tháng đầu tiên.`,

    stands: `Giá đỡ thiết bị đa năng với thiết kế tinh tế, phù hợp mọi không gian làm việc.

Được chế tạo từ hợp kim nhôm cao cấp, giá đỡ có khả năng điều chỉnh góc nghiêng linh hoạt, giúp bạn có tư thế làm việc thoải mái nhất.

**Đặc điểm nổi bật:**
• Chất liệu hợp kim nhôm nguyên khối
• Điều chỉnh góc nghiêng 0-60 độ
• Đế cao su chống trượt
• Hỗ trợ thiết bị từ 4-13 inch
• Gấp gọn, tiện mang theo

Bảo hành 12 tháng chính hãng.`,
  };

  return {
    ...product,
    images: galleryImages,
    description:
      descriptions[product.category] ||
      `Sản phẩm chính hãng ${product.brand} với chất lượng cao cấp và thiết kế tinh tế.`,
  };
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setIsCartOpen(true)}
        />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
          <Link to="/">
            <Button>Quay về trang chủ</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const productDetails = getProductDetails(product);

  // Get related products (same category or brand, excluding current product)
  const relatedProducts = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.brand === product.brand)
    )
    .slice(0, 4);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddToCart = (productToAdd: Product, qty: number = 1) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === productToAdd.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === productToAdd.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { ...productToAdd, quantity: qty }];
    });
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${qty}x ${productToAdd.name}`,
    });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Đã sao chép liên kết",
        description: "Liên kết sản phẩm đã được sao chép vào clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="hover:text-primary transition-colors cursor-pointer">
              {product.brand}
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>

        {/* Product Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            <ProductGallery
              images={productDetails.images}
              productName={product.name}
            />

            {/* Product Info */}
            <div className="space-y-6">
              {/* Brand & Badges */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {product.brand}
                </span>
                {product.isNew && (
                  <Badge className="bg-primary text-primary-foreground">Mới</Badge>
                )}
                {product.isBestseller && (
                  <Badge className="bg-foreground text-background">Bán chạy</Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
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
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge variant="destructive" className="text-sm">
                      -{product.discount}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Device */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tương thích:</span>
                <Badge variant="secondary">{product.device}</Badge>
              </div>

              {/* Features */}
              {product.features && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Tính năng nổi bật:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-sm"
                      >
                        <Check className="w-3 h-3 text-primary" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="brand"
                  size="lg"
                  className="flex-1"
                  onClick={() => handleAddToCart(product, quantity)}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Thêm vào giỏ hàng
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={isWishlisted ? "text-primary border-primary" : ""}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${
                      isWishlisted ? "fill-primary" : ""
                    }`}
                  />
                  {isWishlisted ? "Đã yêu thích" : "Yêu thích"}
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Miễn phí vận chuyển</p>
                    <p className="text-xs text-muted-foreground">Đơn từ 500K</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Bảo hành chính hãng</p>
                    <p className="text-xs text-muted-foreground">12-24 tháng</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Đổi trả dễ dàng</p>
                    <p className="text-xs text-muted-foreground">Trong 30 ngày</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Description Tabs */}
        <section className="container mx-auto px-4 py-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Mô tả sản phẩm
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Thông số kỹ thuật
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Đánh giá ({product.reviewCount})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {productDetails.description}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="specs" className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Thương hiệu</span>
                  <span className="font-medium">{product.brand}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Danh mục</span>
                  <span className="font-medium capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Tương thích</span>
                  <span className="font-medium">{product.device}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Bảo hành</span>
                  <span className="font-medium">12 tháng chính hãng</span>
                </div>
                {product.features?.map((feature, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-3 border-b border-border"
                  >
                    <span className="text-muted-foreground">Tính năng {index + 1}</span>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                <Button variant="outline" className="mt-4">
                  Viết đánh giá đầu tiên
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} onAddToCart={handleAddToCart} />
      </main>

      <Footer />
      <FloatingContact />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
};

export default ProductDetail;

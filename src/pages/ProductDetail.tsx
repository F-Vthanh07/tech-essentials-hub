import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import ProductGallery from "@/components/ProductGallery";
import RelatedProducts from "@/components/RelatedProducts";
import { products } from "@/data/products";
import { productService } from "@/services/ProductService";
import { cartService } from "@/services/CartService";
import { Product, ColorVariant } from "@/types/product";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

// Extended product data with gallery and description
const getProductDetails = (product: Product) => {
  const galleryImages = product.colorVariants && product.colorVariants.length > 0
    ? product.colorVariants
        .filter(v => v.image)
        .map((variant) => variant.image)
        .filter((img, idx, arr) => arr.indexOf(img) === idx) // unique
    : [
        product.image,
        product.image.replace("w=400", "w=401"),
        product.image.replace("w=400", "w=402"),
        product.image.replace("w=400", "w=403"),
      ];

  // If we only have one image, add some duplicates for gallery
  if (galleryImages.length < 2) {
    galleryImages.push(product.image, product.image.replace("w=400", "w=401"));
  }

  return {
    ...product,
    images: galleryImages,
    description:
      product.description ||
      `Sản phẩm chính hãng ${product.brand} với chất lượng cao cấp và thiết kế tinh tế.`,
  };
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        // Try API first
        if (!id) {
          setProduct(null);
          return;
        }
        const apiProduct = await productService.getProductById(id);
        if (apiProduct) {
          setProduct(apiProduct);
          // Also fetch all products for related products
          const allApiProducts = await productService.getAllProducts();
          if (allApiProducts.length > 0) setAllProducts(allApiProducts);
        } else {
          // Fallback to mock data
          const mockProduct = products.find((p) => p.id === id) || null;
          setProduct(mockProduct);
        }
      } catch (err) {
        console.warn('Failed to fetch product from API, using mock data', err);
        const mockProduct = products.find((p) => p.id === id) || null;
        setProduct(mockProduct);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Reset selected color when product changes
    if (product?.colorVariants && product.colorVariants.length > 0) {
      setSelectedColor(product.colorVariants[0]);
    } else {
      setSelectedColor(null);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
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
  const relatedProducts = allProducts
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

  // Get current display price based on selected color
  const displayPrice = selectedColor?.price ?? product.price;
  const displayDiscount = selectedColor?.discount ?? product.discount ?? 0;
  const originalDisplayPrice = displayDiscount > 0 ? displayPrice : product.originalPrice;
  const finalPrice = displayDiscount > 0 ? displayPrice * (1 - displayDiscount / 100) : displayPrice;

  const handleAddToCart = async () => {
    const productVariantId = selectedColor?.id || product.variantId;

    if (!productVariantId) {
      toast({
        title: "Lỗi",
        description: "Sản phẩm chưa có biến thể để thêm vào giỏ",
        variant: "destructive",
      });
      return;
    }

    try {
      await cartService.createCartItem({
        productVariantId,
        quantity,
      });

      const colorLabel = selectedColor ? ` - ${selectedColor.name}` : "";
      addToCart(product, quantity, selectedColor || undefined);
      toast({
        title: "Đã thêm vào giỏ hàng",
        description: `${quantity}x ${product.name}${colorLabel}`,
      });
    } catch (err) {
      console.warn("add to cart failed", err);
      toast({
        title: "Lỗi",
        description: "Không thể thêm vào giỏ hàng",
        variant: "destructive",
      });
    }
  };

  const handleBuyNow = () => {
    navigate("/order-detail/confirm", {
      state: {
        items: [
          {
            ...product,
            image: selectedColor?.image || product.image,
            price: selectedColor?.price ?? product.price,
            quantity,
            selectedColor: selectedColor || undefined,
            variantId: selectedColor?.id || product.variantId,
          },
        ],
      },
    });
  };

  const handleAddRelatedToCart = async (productToAdd: Product) => {
    const productVariantId = productToAdd.variantId;

    if (!productVariantId) {
      toast({
        title: "Lỗi",
        description: "Sản phẩm chưa có biến thể để thêm vào giỏ",
        variant: "destructive",
      });
      return;
    }

    try {
      await cartService.createCartItem({
        productVariantId,
        quantity: 1,
      });

      addToCart(productToAdd, 1);
      toast({
        title: "Đã thêm vào giỏ hàng",
        description: `1x ${productToAdd.name}`,
      });
    } catch (err) {
      console.warn("add related product to cart failed", err);
      toast({
        title: "Lỗi",
        description: "Không thể thêm vào giỏ hàng",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        url: globalThis.location.href,
      });
    } else {
      navigator.clipboard.writeText(globalThis.location.href);
      toast({
        title: "Đã sao chép liên kết",
        description: "Liên kết sản phẩm đã được sao chép vào clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
                  {formatPrice(finalPrice)}
                </span>
                {(displayDiscount > 0 || originalDisplayPrice) && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(displayPrice)}
                    </span>
                    {displayDiscount > 0 && (
                      <Badge variant="destructive" className="text-sm">
                        -{displayDiscount}%
                      </Badge>
                    )}
                  </>
                )}
              </div>

              {/* Color Variants */}
              {product.colorVariants && product.colorVariants.length > 0 && (
                <div className="space-y-3">
                  <span className="text-sm font-medium">Chọn màu sắc:</span>
                  <div className="flex flex-wrap gap-3">
                    {product.colorVariants.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                          selectedColor?.id === color.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div 
                          className="w-6 h-6 rounded-full border border-border"
                          style={{ backgroundColor: color.colorCode }}
                        />
                        <div className="text-left">
                          <p className="text-sm font-medium">{color.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(color.discount ? color.price * (1 - color.discount / 100) : color.price)}
                            {color.discount ? ` (-${color.discount}%)` : ''}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Quantity & Buy Actions */}
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
                  size="lg"
                  variant="brand"
                  className="flex-1 shadow-[0_8px_30px_rgba(239,68,68,0.35)]"
                  onClick={handleBuyNow}
                >
                  Mua ngay
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="sm:min-w-[220px]"
                  onClick={handleAddToCart}
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
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Chưa có đánh giá nào</h3>
                <p className="text-muted-foreground mb-1">Hãy là người đầu tiên chia sẻ trải nghiệm của bạn</p>
                <p className="text-muted-foreground text-sm mb-6">Đánh giá của bạn giúp người mua khác đưa ra quyết định tốt hơn</p>
                <Button variant="outline" className="gap-2">
                  <Star className="w-4 h-4" />
                  Viết đánh giá đầu tiên
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} onAddToCart={handleAddRelatedToCart} />
      </main>

      <Footer />
      <FloatingContact />
    </div>
  );
};

export default ProductDetail;

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
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
import { usePromotions } from "@/contexts/PromotionContext";
import { ratingService, Rating } from "@/services/RatingService";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

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
  const { getPromotionsByProductId, getPromotionByProductId } = usePromotions();
  const { user, token } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [isLoading, setIsLoading] = useState(true);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isRatingsLoading, setIsRatingsLoading] = useState(false);
  const [newStar, setNewStar] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [editingRatingId, setEditingRatingId] = useState<string | null>(null);
  const [editStar, setEditStar] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>("");
  const [isUpdatingRating, setIsUpdatingRating] = useState(false);

  const promotions = product ? getPromotionsByProductId(product.id) : [];
  const bestPromotion = product ? getPromotionByProductId(product.id) : undefined;

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

  useEffect(() => {
    const fetchRatings = async () => {
      if (!id) return;
      setIsRatingsLoading(true);
      try {
        const all = await ratingService.getAll();
        setRatings((all || []).filter((r) => r.productId === id));
      } catch (err) {
        console.warn("Failed to fetch ratings", err);
        setRatings([]);
      } finally {
        setIsRatingsLoading(false);
      }
    };
    void fetchRatings();
  }, [id]);

  const handleSubmitRating = async () => {
    if (!id) return;
    if (!user?.id || !token) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để gửi đánh giá.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const star = Math.max(1, Math.min(5, Number(newStar) || 0));
    const comment = newComment.trim();
    if (!comment) {
      toast({ title: "Thiếu nội dung", description: "Vui lòng nhập nhận xét." });
      return;
    }

    setIsSubmittingRating(true);
    try {
      const created = await ratingService.create({
        productId: id,
        accountId: user.id,
        star,
        comment,
      });
      setRatings((prev) => [created, ...prev]);
      setNewStar(5);
      setNewComment("");
      toast({ title: "Thành công", description: "Đã gửi đánh giá của bạn." });
    } catch (err) {
      console.warn("Create rating failed", err);
      toast({
        title: "Lỗi",
        description: "Không thể gửi đánh giá. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const startEditRating = (rating: Rating) => {
    if (!user?.id || rating.accountId !== user.id) return;
    setEditingRatingId(rating.id);
    setEditStar(Math.max(1, Math.min(5, rating.star || 5)));
    setEditComment(rating.comment || "");
  };

  const cancelEditRating = () => {
    setEditingRatingId(null);
    setEditStar(5);
    setEditComment("");
  };

  const handleUpdateRating = async (rating: Rating) => {
    if (!user?.id || !token) {
      navigate("/auth");
      return;
    }
    if (rating.accountId !== user.id) {
      toast({
        title: "Không hợp lệ",
        description: "Bạn chỉ có thể sửa đánh giá của chính mình.",
        variant: "destructive",
      });
      return;
    }

    const star = Math.max(1, Math.min(5, Number(editStar) || 0));
    const comment = editComment.trim();
    if (!comment) {
      toast({ title: "Thiếu nội dung", description: "Vui lòng nhập nhận xét." });
      return;
    }

    setIsUpdatingRating(true);
    try {
      const updated = await ratingService.update(rating.id, { star, comment });
      setRatings((prev) => prev.map((r) => (r.id === rating.id ? { ...r, ...updated } : r)));
      cancelEditRating();
      toast({ title: "Thành công", description: "Đã cập nhật đánh giá." });
    } catch (err) {
      console.warn("Update rating failed", err);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật đánh giá.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRating(false);
    }
  };

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

  // Calculate promotion price
  const calculatePromotionPrice = (basePrice: number) => {
    if (!bestPromotion) return basePrice;
    if (bestPromotion.isPercentage) {
      return basePrice * (1 - bestPromotion.discountValue / 100);
    }
    return Math.max(0, basePrice - bestPromotion.discountValue);
  };

  const promotionPrice = calculatePromotionPrice(displayPrice);
  const hasActivePromotion = !!bestPromotion && (bestPromotion.isPercentage ? bestPromotion.discountValue < 100 : bestPromotion.discountValue < displayPrice);
  const originalDisplayPrice = hasActivePromotion ? displayPrice : (displayDiscount > 0 ? displayPrice : product.originalPrice);
  const finalPrice = hasActivePromotion ? promotionPrice : (displayDiscount > 0 ? displayPrice * (1 - displayDiscount / 100) : displayPrice);

  const isOutOfStock = selectedColor?.stockQuantity !== undefined && selectedColor.stockQuantity <= 0;

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
    } catch (err: any) {
      console.warn("add to cart failed", err);
      const errMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || err.message || "Không thể thêm vào giỏ hàng";

      toast({
        title: "Lỗi",
        description: errMsg,
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
    } catch (err: any) {
      console.warn("add related product to cart failed", err);
      const errMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || err.message || "Không thể thêm vào giỏ hàng";

      toast({
        title: "Lỗi",
        description: errMsg,
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
                      className={`w-5 h-5 ${i < Math.floor(product.rating)
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
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(finalPrice)}
                </span>
                {hasActivePromotion && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(displayPrice)}
                    </span>
                    <Badge variant="destructive" className="text-sm flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      -{bestPromotion.isPercentage ? `${bestPromotion.discountValue}%` : bestPromotion.discountValue.toLocaleString("vi-VN") + "đ"}
                    </Badge>
                  </>
                )}
                {!hasActivePromotion && (displayDiscount > 0 || originalDisplayPrice) && (
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

              {/* Promotion Banners */}
              {promotions.length > 0 && (
                <div className="space-y-3">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-all hover:bg-red-500/15">
                      <div className="flex items-start gap-3">
                        <Tag className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-red-600 dark:text-red-400">{promo.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Giảm {promo.isPercentage ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString("vi-VN")}đ`}
                            {" "}khi mua sản phẩm này
                          </p>
                          {promo.endDate && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              ⏰ Hiệu lực đến: {new Date(promo.endDate).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          )}
                        </div>
                        {promo.id === bestPromotion?.id && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 uppercase tracking-tighter shadow-sm animate-pulse">
                            Tốt nhất
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Color Variants */}
              {product.colorVariants && product.colorVariants.length > 0 && (
                <div className="space-y-3">
                  <span className="text-sm font-medium">Chọn màu sắc:</span>
                  <div className="flex flex-wrap gap-3">
                    {product.colorVariants.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${selectedColor?.id === color.id
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
                            {bestPromotion && (
                              <span className="text-primary ml-1">
                                → {formatPrice(calculatePromotionPrice(color.price))}
                              </span>
                            )}
                          </p>
                          {color.stockQuantity !== undefined && (
                            <p className={`text-[10px] mt-0.5 ${color.stockQuantity > 0 ? 'text-green-600' : 'text-destructive font-semibold'}`}>
                              {color.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                            </p>
                          )}
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

              {/* Promo Price Breakdown - Small helper for selected color */}
              {bestPromotion && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-xs">
                  <span className="text-muted-foreground">Giá sau ưu đãi cho các biến thể:</span>
                  {product.colorVariants?.slice(0, 3).map(cv => (
                    <span key={cv.id} className="font-bold underline decoration-primary/30">
                      {formatPrice(cv.price * (bestPromotion.isPercentage ? (1 - bestPromotion.discountValue / 100) : 1) - (bestPromotion.isPercentage ? 0 : bestPromotion.discountValue))}
                    </span>
                  ))}
                  {(product.colorVariants?.length || 0) > 3 && <span className="text-muted-foreground">...</span>}
                </div>
              )}

              {/* Quantity & Buy Actions */}
              {isOutOfStock ? (
                <div className="pt-4">
                  <Button size="lg" disabled variant="secondary" className="w-full text-lg cursor-not-allowed">
                    Sản phẩm tạm hết hàng
                  </Button>
                </div>
              ) : (
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
                      onClick={() => setQuantity(selectedColor?.stockQuantity ? Math.min(selectedColor.stockQuantity, quantity + 1) : quantity + 1)}
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
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={isWishlisted ? "text-primary border-primary" : ""}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${isWishlisted ? "fill-primary" : ""
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
                Chi tiết sản phẩm
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Đánh giá ({ratings.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-6">
              {/* Mô tả */}
              <div className="prose prose-gray max-w-none mb-10">
                <h3 className="text-xl font-bold mb-4">Mô tả sản phẩm</h3>
                <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {productDetails.description}
                </div>
              </div>

              {/* Thông số kỹ thuật */}
              <div>
                <h3 className="text-xl font-bold mb-4">Thông số kỹ thuật</h3>
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
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
                <div className="space-y-4">
                  {isRatingsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : ratings.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                        <Star className="w-10 h-10 text-amber-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Chưa có đánh giá nào</h3>
                      <p className="text-muted-foreground mb-1">
                        Hãy là người đầu tiên chia sẻ trải nghiệm của bạn
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Đánh giá của bạn giúp người mua khác đưa ra quyết định tốt hơn
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ratings.map((r) => (
                        <div key={r.id} className="rounded-xl border border-border p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">
                              {r.accountId?.slice(0, 8) || "Người dùng"}
                            </p>
                            {editingRatingId === r.id ? (
                              <Input
                                type="number"
                                min={1}
                                max={5}
                                value={editStar}
                                onChange={(e) => setEditStar(Number(e.target.value))}
                                className="w-20"
                                disabled={isUpdatingRating}
                              />
                            ) : (
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < (r.star || 0)
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-muted-foreground"
                                      }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {editingRatingId === r.id ? (
                            <div className="mt-2 space-y-2">
                              <Textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                disabled={isUpdatingRating}
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={cancelEditRating}
                                  disabled={isUpdatingRating}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => void handleUpdateRating(r)}
                                  disabled={isUpdatingRating}
                                >
                                  {isUpdatingRating ? "Đang lưu..." : "Lưu"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-muted-foreground mt-2 whitespace-pre-line">
                                {r.comment}
                              </p>
                              {user?.id === r.accountId && (
                                <div className="mt-3 flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startEditRating(r)}
                                  >
                                    Sửa đánh giá
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border p-5 space-y-4 h-fit">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Viết đánh giá</h3>
                    {!token && (
                      <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                        Đăng nhập
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Số sao (1-5)</label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={newStar}
                      onChange={(e) => setNewStar(Number(e.target.value))}
                      disabled={!token || isSubmittingRating}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Nhận xét</label>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                      disabled={!token || isSubmittingRating}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => void handleSubmitRating()}
                    disabled={!token || isSubmittingRating}
                  >
                    {isSubmittingRating ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang gửi...
                      </span>
                    ) : (
                      "Gửi đánh giá"
                    )}
                  </Button>
                </div>
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

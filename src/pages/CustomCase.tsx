import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
 import { Palette, Smartphone, ShoppingCart, Sparkles, RotateCcw, PenTool } from "lucide-react";
 import CaseDesignEditor from "@/components/CaseDesignEditor";
import { productService } from "@/services/ProductService";
import { customProductService } from "@/services/CustomProductService";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types/product";
import { toast } from "sonner";

// Phone models with specific designs
const phoneModels: Record<string, {
  name: string;
  aspectRatio: string;
  cameraStyle: "triple-vertical" | "triple-square" | "dual-vertical" | "single" | "island";
  cameraPosition: "top-left" | "top-center" | "center";
  notchStyle: "dynamic-island" | "notch" | "pill" | "none";
  borderRadius: string;
}> = {
  "iPhone 16 Pro Max": {
    name: "iPhone 16 Pro Max",
    aspectRatio: "aspect-[9/19]",
    cameraStyle: "triple-vertical",
    cameraPosition: "top-left",
    notchStyle: "dynamic-island",
    borderRadius: "rounded-[2.5rem]",
  },
  "iPhone 16 Pro": {
    name: "iPhone 16 Pro",
    aspectRatio: "aspect-[9/19]",
    cameraStyle: "triple-vertical",
    cameraPosition: "top-left",
    notchStyle: "dynamic-island",
    borderRadius: "rounded-[2.5rem]",
  },
  "iPhone 16": {
    name: "iPhone 16",
    aspectRatio: "aspect-[9/19]",
    cameraStyle: "dual-vertical",
    cameraPosition: "top-left",
    notchStyle: "dynamic-island",
    borderRadius: "rounded-[2.5rem]",
  },
  "iPhone 15 Pro Max": {
    name: "iPhone 15 Pro Max",
    aspectRatio: "aspect-[9/19]",
    cameraStyle: "triple-vertical",
    cameraPosition: "top-left",
    notchStyle: "dynamic-island",
    borderRadius: "rounded-[2.5rem]",
  },
  "iPhone 15 Pro": {
    name: "iPhone 15 Pro",
    aspectRatio: "aspect-[9/19]",
    cameraStyle: "triple-vertical",
    cameraPosition: "top-left",
    notchStyle: "dynamic-island",
    borderRadius: "rounded-[2.5rem]",
  },
  "Samsung Galaxy S24 Ultra": {
    name: "Samsung Galaxy S24 Ultra",
    aspectRatio: "aspect-[9/20]",
    cameraStyle: "triple-vertical",
    cameraPosition: "top-left",
    notchStyle: "pill",
    borderRadius: "rounded-[2rem]",
  },
  "Samsung Galaxy S24+": {
    name: "Samsung Galaxy S24+",
    aspectRatio: "aspect-[9/20]",
    cameraStyle: "triple-vertical",
    cameraPosition: "top-left",
    notchStyle: "pill",
    borderRadius: "rounded-[2rem]",
  },
  "Samsung Galaxy S24": {
    name: "Samsung Galaxy S24",
    aspectRatio: "aspect-[9/20]",
    cameraStyle: "triple-vertical",
    cameraPosition: "top-left",
    notchStyle: "pill",
    borderRadius: "rounded-[2rem]",
  },
  "Xiaomi 14 Ultra": {
    name: "Xiaomi 14 Ultra",
    aspectRatio: "aspect-[9/20]",
    cameraStyle: "island",
    cameraPosition: "top-center",
    notchStyle: "pill",
    borderRadius: "rounded-[2rem]",
  },
  "OPPO Find X7 Ultra": {
    name: "OPPO Find X7 Ultra",
    aspectRatio: "aspect-[9/20]",
    cameraStyle: "island",
    cameraPosition: "top-center",
    notchStyle: "pill",
    borderRadius: "rounded-[2rem]",
  },
};

const defaultAvailableDevices = Object.keys(phoneModels);

const caseColors = [
  { id: "transparent", name: "Trong suốt", color: "bg-gray-100 border-2 border-dashed" },
  { id: "black", name: "Đen", color: "bg-gray-900" },
  { id: "white", name: "Trắng", color: "bg-white border" },
  { id: "red", name: "Đỏ", color: "bg-red-500" },
  { id: "blue", name: "Xanh dương", color: "bg-blue-500" },
  { id: "green", name: "Xanh lá", color: "bg-green-500" },
  { id: "pink", name: "Hồng", color: "bg-pink-400" },
  { id: "purple", name: "Tím", color: "bg-purple-500" },
  { id: "yellow", name: "Vàng", color: "bg-yellow-400" },
  { id: "orange", name: "Cam", color: "bg-orange-500" },
];

const caseMaterials = [
  { id: "soft", name: "Silicone mềm", price: 0, description: "Mềm dẻo, chống sốc tốt" },
  { id: "hard", name: "Nhựa cứng", price: 20000, description: "Cứng cáp, bảo vệ tối đa" },
  { id: "leather", name: "Da PU", price: 50000, description: "Sang trọng, cao cấp" },
  { id: "glass", name: "Kính cường lực", price: 80000, description: "Trong suốt, chống trầy" },
];

const basePrice = 150000;

// Camera component based on phone style
const CameraModule = ({ style, position }: { style: string; position: string }) => {
  const positionClasses = position === "top-center" ? "top-6 left-1/2 -translate-x-1/2" : "top-6 left-6";
  
  if (style === "triple-vertical") {
    return (
      <div className={`absolute ${positionClasses} bg-gray-800 rounded-3xl p-2 flex flex-col gap-2`}>
        <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-600" />
        <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-600" />
        <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-600" />
      </div>
    );
  }
  
  if (style === "dual-vertical") {
    return (
      <div className={`absolute ${positionClasses} bg-gray-800 rounded-3xl p-2 flex flex-col gap-2`}>
        <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-600" />
        <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-600" />
      </div>
    );
  }
  
  if (style === "island") {
    return (
      <div className={`absolute ${positionClasses} bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center`}>
        <div className="w-14 h-14 bg-gray-700 rounded-full border-2 border-gray-600 flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-600 rounded-full" />
        </div>
      </div>
    );
  }
  
  if (style === "triple-square") {
    return (
      <div className={`absolute ${positionClasses} bg-gray-800 rounded-2xl p-2 grid grid-cols-2 gap-1`}>
        <div className="w-6 h-6 bg-gray-700 rounded-full border-2 border-gray-600" />
        <div className="w-6 h-6 bg-gray-700 rounded-full border-2 border-gray-600" />
        <div className="w-6 h-6 bg-gray-700 rounded-full border-2 border-gray-600" />
        <div className="w-6 h-6 bg-gray-600 rounded-full" />
      </div>
    );
  }
  
  return (
    <div className={`absolute ${positionClasses} bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center`}>
      <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-gray-600" />
    </div>
  );
};

// Notch component based on phone style
const NotchModule = ({ style }: { style: string }) => {
  if (style === "dynamic-island") {
    return null;
  }
  
  if (style === "notch") {
    return (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl" />
    );
  }
  
  if (style === "pill") {
    return (
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 rounded-full" />
    );
  }
  
  return null;
};

 interface DesignElement {
   id: string;
   type: "image" | "text";
   x: number;
   y: number;
   width: number;
   height: number;
   rotation: number;
   scaleX: number;
   scaleY: number;
   content: string;
   color?: string;
   fontSize?: number;
   fontFamily?: string;
   zIndex: number;
 }
 
 const CustomCase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedColor, setSelectedColor] = useState("transparent");
  const [selectedMaterial, setSelectedMaterial] = useState("soft");
    const [products, setProducts] = useState<Product[]>([]);
    const [isProductLoading, setIsProductLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [designElements, setDesignElements] = useState<DesignElement[]>([]);
  const [isSubmittingCustomOrder, setIsSubmittingCustomOrder] = useState(false);
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedProductName = selectedProduct?.name ?? "";
  const availableProductList = products.length > 0
    ? products
    : defaultAvailableDevices.map((name) => ({ id: name, name } as Product));

    useEffect(() => {
      const fetchProducts = async () => {
        setIsProductLoading(true);
        try {
          const fetchedProducts = await productService.getAllProducts({ includeInactive: false });
          if (fetchedProducts.length > 0) {
            setProducts(fetchedProducts);
          }
        } catch (error) {
          console.warn("Failed to fetch products for custom case page", error);
        } finally {
          setIsProductLoading(false);
        }
      };

      fetchProducts();
    }, []);

  const selectedMaterialData = caseMaterials.find(m => m.id === selectedMaterial);
  
  // Quantity discount tiers
  const getQuantityDiscount = (qty: number) => {
    if (qty >= 50) return 25;
    if (qty >= 20) return 15;
    if (qty >= 10) return 10;
    if (qty >= 5) return 5;
    return 0;
  };
  
  const quantityDiscount = getQuantityDiscount(quantity);
  const baseItemPrice = basePrice + (selectedMaterialData?.price || 0);
  const discountedItemPrice = baseItemPrice * (1 - quantityDiscount / 100);
  const totalPrice = discountedItemPrice * quantity;
  
  // Get current phone model config or default
  const defaultPhone = phoneModels["iPhone 16 Pro Max"];
  const currentPhone = selectedProductName ? phoneModels[selectedProductName] || defaultPhone : defaultPhone;

  const handleDesignChange = useCallback((elements: DesignElement[]) => {
    setDesignElements(elements);
  }, []);

  const buildCustomOrderPayload = () => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để tạo đơn custom");
      return null;
    }

    if (!selectedProductId) {
      toast.error("Vui lòng chọn sản phẩm");
      return null;
    }

    const textContent = designElements
      .filter((element) => element.type === "text")
      .map((element) => element.content?.trim())
      .filter(Boolean)
      .join(" | ");

    const imageUrls = designElements
      .filter((element) => element.type === "image")
      .map((element) => element.content)
      .filter(Boolean);

    return {
      accountId: user.id,
      productId: selectedProductId,
      color: selectedColor,
      material: selectedMaterial,
      textContent,
      note: `Custom case for ${selectedProductName || "selected product"}`,
      quantity,
      imageUrls,
      customerName: user.name ?? "",
      customerEmail: user.email ?? "",
      customerPhone: user.phone ?? "",
    };
  };

  const buildCustomCartProduct = (customOrderId?: string): Product | null => {
    if (!selectedProduct) return null;

    return {
      ...selectedProduct,
      // Use a distinct id so custom items do not merge with normal product items.
      id: customOrderId ? `custom-${customOrderId}` : `custom-${selectedProduct.id}-${Date.now()}`,
      name: `Custom - ${selectedProduct.name}`,
      price: discountedItemPrice,
      image:
        designElements.find((element) => element.type === "image")?.content ||
        selectedProduct.image,
      description: `Custom case | Color: ${selectedColor} | Material: ${selectedMaterial}`,
      variantId: selectedProduct.variantId || selectedProduct.id,
    };
  };

  const handleReset = () => {
    setSelectedProductId("");
    setSelectedColor("transparent");
    setSelectedMaterial("soft");
    setQuantity(1);
    toast.info("Đã reset thiết kế");
  };

  const handleAddToCart = async () => {
    if (!selectedProductId) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }

    const payload = buildCustomOrderPayload();
    if (!payload) return;

    setIsSubmittingCustomOrder(true);
    try {
      const createdCustomOrder = await customProductService.create(payload);
      const customCartProduct = buildCustomCartProduct(createdCustomOrder?.id);
      if (customCartProduct) {
        addToCart(customCartProduct, quantity);
      }
      toast.success(`Đã tạo đơn custom thành công!`, {
        description: `Đã thêm vào giỏ: ${selectedProductName || "Sản phẩm đã chọn"} - ${quantity} cái - ${totalPrice.toLocaleString()}đ`,
      });
    } catch (error) {
      toast.error("Tạo đơn custom thất bại", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau",
      });
    } finally {
      setIsSubmittingCustomOrder(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedProductId) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }

    const payload = buildCustomOrderPayload();
    if (!payload) return;

    setIsSubmittingCustomOrder(true);
    try {
      await customProductService.create(payload);
      toast.success("Đã tạo đơn custom. Đang chuyển đến trang thanh toán...");
      navigate("/checkout");
    } catch (error) {
      toast.error("Tạo đơn custom thất bại", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau",
      });
    } finally {
      setIsSubmittingCustomOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Sparkles className="w-4 h-4 mr-1" />
            Thiết kế độc quyền
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Tự Thiết Kế Ốp Lưng</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tạo chiếc ốp lưng độc nhất vô nhị với hình ảnh, chữ viết và màu sắc theo ý bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <Card className="lg:sticky lg:top-24 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <PenTool className="w-5 h-5" />
                 Thiết kế ốp lưng
              </CardTitle>
            </CardHeader>
            <CardContent>
               <CaseDesignEditor
                 caseColor={selectedColor}
                 caseColorClass={caseColors.find(c => c.id === selectedColor)?.color || 'bg-gray-100'}
                 aspectRatio={currentPhone.aspectRatio}
                 borderRadius={currentPhone.borderRadius}
                 cameraModule={<CameraModule style={currentPhone.cameraStyle} position={currentPhone.cameraPosition} />}
                 notchModule={<NotchModule style={currentPhone.notchStyle} />}
                 onDesignChange={handleDesignChange}
               />
               
               {/* Device Name Badge */}
               <div className="text-center mt-4">
                 <Badge variant="secondary">
                  {selectedProductName || "Chọn sản phẩm"}
                 </Badge>
               </div>
               
               <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()}đ</p>
                <p className="text-muted-foreground text-sm">
                  {selectedProductName || "Chưa chọn sản phẩm"} • {selectedMaterialData?.name}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <div className="space-y-6">
            {/* Device Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="w-5 h-5" />
                  Chọn sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder={isProductLoading ? "Đang tải danh sách sản phẩm..." : "Chọn sản phẩm của bạn"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProductList.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Material Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chọn chất liệu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {caseMaterials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => setSelectedMaterial(material.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedMaterial === material.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium">{material.name}</p>
                      <p className="text-sm text-muted-foreground">{material.description}</p>
                      {material.price > 0 && (
                        <p className="text-sm text-primary mt-1">+{material.price.toLocaleString()}đ</p>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Color Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="w-5 h-5" />
                  Màu nền ốp lưng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {caseColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-10 h-10 rounded-full ${color.color} transition-all ${
                        selectedColor === color.id
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:scale-110"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quantity & Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-4">
                    <Label>Số lượng:</Label>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quantity Discounts */}
                  <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-medium">Ưu đãi mua số lượng lớn:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`p-2 rounded ${quantity >= 5 && quantity < 10 ? 'bg-primary/20 border border-primary' : 'bg-background'}`}>
                        5-9 cái: <span className="font-bold text-primary">Giảm 5%</span>
                      </div>
                      <div className={`p-2 rounded ${quantity >= 10 && quantity < 20 ? 'bg-primary/20 border border-primary' : 'bg-background'}`}>
                        10-19 cái: <span className="font-bold text-primary">Giảm 10%</span>
                      </div>
                      <div className={`p-2 rounded ${quantity >= 20 && quantity < 50 ? 'bg-primary/20 border border-primary' : 'bg-background'}`}>
                        20-49 cái: <span className="font-bold text-primary">Giảm 15%</span>
                      </div>
                      <div className={`p-2 rounded ${quantity >= 50 ? 'bg-primary/20 border border-primary' : 'bg-background'}`}>
                        50+ cái: <span className="font-bold text-primary">Giảm 25%</span>
                      </div>
                    </div>
                    {quantityDiscount > 0 && (
                      <Badge className="bg-green-500">Bạn đang được giảm {quantityDiscount}%!</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={isSubmittingCustomOrder}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isSubmittingCustomOrder ? "Đang gửi..." : "Thêm giỏ hàng"}
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleBuyNow}
                    disabled={isSubmittingCustomOrder}
                  >
                    {isSubmittingCustomOrder ? "Đang gửi..." : "Mua ngay"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <section className="mt-20">
          <div className="mb-7 flex items-end justify-between gap-4 border-b border-border/60 pb-4">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Cam kết dịch vụ</h2>
            <p className="text-base text-muted-foreground md:text-lg">Đơn giản, rõ ràng, đáng tin cậy</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Thiết kế theo yêu cầu",
                desc: "Tùy chỉnh nội dung linh hoạt theo nhu cầu cá nhân hoặc doanh nghiệp.",
              },
              {
                title: "Thời gian xử lý nhanh",
                desc: "Hoàn thiện và bàn giao trong 3-5 ngày làm việc.",
              },
              {
                title: "Tiêu chuẩn in chất lượng",
                desc: "Mực in bền màu, chi tiết rõ nét, kiểm tra kỹ trước khi giao.",
              },
              {
                title: "Hỗ trợ đổi trả",
                desc: "Hỗ trợ đổi trả trong vòng 7 ngày theo chính sách hiện hành.",
              },
            ].map((feature, index) => (
              <article
                key={feature.title}
                className="transform-gpu rounded-2xl border border-border/70 bg-card/80 p-7 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/50 hover:shadow-[0_18px_38px_-18px_rgba(56,189,248,0.55)] md:p-8"
              >
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground/90">
                  {`0${index + 1}`}
                </p>
                <h3 className="mb-3 text-xl font-semibold leading-snug md:text-2xl">{feature.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CustomCase;

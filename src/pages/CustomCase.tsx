import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Palette, Type, Smartphone, ShoppingCart, Sparkles, ImageIcon, RotateCcw } from "lucide-react";
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

const availableDevices = Object.keys(phoneModels);

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
    return (
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-gray-900 rounded-full" />
    );
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

const CustomCase = () => {
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedColor, setSelectedColor] = useState("transparent");
  const [selectedMaterial, setSelectedMaterial] = useState("soft");
  const [customText, setCustomText] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

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
  const currentPhone = selectedDevice ? phoneModels[selectedDevice] || defaultPhone : defaultPhone;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file tối đa 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        toast.success("Đã tải ảnh lên thành công!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setSelectedDevice("");
    setSelectedColor("transparent");
    setSelectedMaterial("soft");
    setCustomText("");
    setTextColor("#000000");
    setUploadedImage(null);
    setQuantity(1);
    toast.info("Đã reset thiết kế");
  };

  const handleAddToCart = () => {
    if (!selectedDevice) {
      toast.error("Vui lòng chọn thiết bị");
      return;
    }
    toast.success(`Đã thêm ốp lưng custom vào giỏ hàng!`, {
      description: `${selectedDevice} - ${quantity} cái - ${totalPrice.toLocaleString()}đ`
    });
  };

  const handleBuyNow = () => {
    if (!selectedDevice) {
      toast.error("Vui lòng chọn thiết bị");
      return;
    }
    toast.success("Đang chuyển đến trang thanh toán...");
    navigate("/checkout");
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
                <Smartphone className="w-5 h-5" />
                Xem trước thiết kế
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Phone Preview Container */}
              <div className="flex flex-col items-center">
                <div className={`relative w-48 ${currentPhone.aspectRatio} ${currentPhone.borderRadius} overflow-hidden shadow-2xl border-4 border-gray-800`}>
                  {/* Case Background */}
                  <div className={`absolute inset-0 ${caseColors.find(c => c.id === selectedColor)?.color || 'bg-gray-100'}`} />
                  
                  {/* Uploaded Image */}
                  {uploadedImage && (
                    <div className="absolute inset-4 flex items-center justify-center">
                      <img 
                        src={uploadedImage} 
                        alt="Custom design" 
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  )}
                  
                  {/* Custom Text */}
                  {customText && (
                    <div 
                      className="absolute bottom-12 left-0 right-0 text-center px-4"
                      style={{ color: textColor }}
                    >
                      <p className="text-lg font-bold break-words drop-shadow-lg">{customText}</p>
                    </div>
                  )}
                  
                  {/* Camera Module */}
                  <CameraModule style={currentPhone.cameraStyle} position={currentPhone.cameraPosition} />
                  
                  {/* Notch/Dynamic Island */}
                  <NotchModule style={currentPhone.notchStyle} />
                </div>
                
                {/* Device Name Badge */}
                <Badge variant="secondary" className="mt-4">
                  {selectedDevice || "Chọn thiết bị"}
                </Badge>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()}đ</p>
                <p className="text-muted-foreground text-sm">
                  {selectedDevice || "Chưa chọn thiết bị"} • {selectedMaterialData?.name}
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
                  Chọn thiết bị
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn model điện thoại của bạn" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDevices.map((device) => (
                      <SelectItem key={device} value={device}>
                        {device}
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

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="w-5 h-5" />
                  Tải ảnh lên
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">Click để tải ảnh lên (tối đa 5MB)</p>
                      <p className="text-sm text-muted-foreground mt-1">PNG, JPG, JPEG</p>
                    </div>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploadedImage && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Đã tải ảnh</Badge>
                      <Button variant="ghost" size="sm" onClick={() => setUploadedImage(null)}>
                        Xóa ảnh
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Custom Text */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Type className="w-5 h-5" />
                  Thêm chữ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="custom-text">Nội dung (tối đa 50 ký tự)</Label>
                  <Textarea
                    id="custom-text"
                    placeholder="Nhập tên, slogan hoặc thông điệp của bạn..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value.slice(0, 50))}
                    maxLength={50}
                  />
                  <p className="text-sm text-muted-foreground mt-1">{customText.length}/50 ký tự</p>
                </div>
                <div>
                  <Label htmlFor="text-color">Màu chữ</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="text-color"
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <span className="text-muted-foreground">{textColor}</span>
                  </div>
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
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Thêm giỏ hàng
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleBuyNow}
                  >
                    Mua ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          {[
            { icon: "🎨", title: "Thiết kế tự do", desc: "Tùy chỉnh mọi thứ theo ý bạn" },
            { icon: "🚀", title: "Giao hàng nhanh", desc: "3-5 ngày làm việc" },
            { icon: "💎", title: "Chất lượng cao", desc: "In UV sắc nét, bền màu" },
            { icon: "🔄", title: "Đổi trả dễ dàng", desc: "Đổi trả trong 7 ngày" },
          ].map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-muted/50">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomCase;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Palette, X } from "lucide-react";
import { products as initialProducts, brands, categories } from "@/data/products";
import { Product, ColorVariant } from "@/types/product";
import { toast } from "@/hooks/use-toast";

const PRESET_COLORS = [
  { name: "Đen", code: "#000000" },
  { name: "Trắng", code: "#FFFFFF" },
  { name: "Đỏ", code: "#EF4444" },
  { name: "Xanh dương", code: "#3B82F6" },
  { name: "Xanh lá", code: "#22C55E" },
  { name: "Vàng", code: "#EAB308" },
  { name: "Tím", code: "#A855F7" },
  { name: "Hồng", code: "#EC4899" },
  { name: "Cam", code: "#F97316" },
  { name: "Xám", code: "#6B7280" },
  { name: "Nâu", code: "#92400E" },
  { name: "Xanh ngọc", code: "#14B8A6" },
];

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    image: "",
    brand: "",
    category: "",
    device: "",
    rating: 5,
    reviewCount: 0,
    isNew: false,
    discount: 0,
    isBestseller: false
  });
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      image: "",
      brand: "",
      category: "",
      device: "",
      rating: 5,
      reviewCount: 0,
      isNew: false,
      discount: 0,
      isBestseller: false
    });
    setColorVariants([]);
    setEditingProduct(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand,
      category: product.category,
      device: product.device || "",
      rating: product.rating,
      reviewCount: product.reviewCount,
      isNew: product.isNew || false,
      discount: product.discount || 0,
      isBestseller: product.isBestseller || false
    });
    setColorVariants(product.colorVariants || []);
    setIsDialogOpen(true);
  };

  const handleAddColorVariant = () => {
    const newVariant: ColorVariant = {
      id: `color_${Date.now()}`,
      name: "",
      colorCode: "#000000",
      price: formData.price,
      discount: 0
    };
    setColorVariants([...colorVariants, newVariant]);
  };

  const handleUpdateColorVariant = (id: string, field: keyof ColorVariant, value: string | number) => {
    setColorVariants(colorVariants.map(cv => 
      cv.id === id ? { ...cv, [field]: value } : cv
    ));
  };

  const handleRemoveColorVariant = (id: string) => {
    setColorVariants(colorVariants.filter(cv => cv.id !== id));
  };

  const handleSelectPresetColor = (variantId: string, preset: { name: string; code: string }) => {
    setColorVariants(colorVariants.map(cv => 
      cv.id === variantId ? { ...cv, name: preset.name, colorCode: preset.code } : cv
    ));
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.brand || !formData.category) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive"
      });
      return;
    }

    // Validate color variants
    for (const cv of colorVariants) {
      if (!cv.name) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập tên màu cho tất cả biến thể",
          variant: "destructive"
        });
        return;
      }
    }

    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...formData, colorVariants: colorVariants.length > 0 ? colorVariants : undefined }
          : p
      ));
      toast({
        title: "Thành công",
        description: "Đã cập nhật sản phẩm"
      });
    } else {
      const newProduct: Product = {
        id: `prod_${Date.now()}`,
        ...formData,
        colorVariants: colorVariants.length > 0 ? colorVariants : undefined
      };
      setProducts([...products, newProduct]);
      toast({
        title: "Thành công",
        description: "Đã thêm sản phẩm mới"
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (productId: string) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: "Thành công",
        description: "Đã xóa sản phẩm"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
        <Button onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hình ảnh</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Thương hiệu</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Màu sắc</TableHead>
                <TableHead>Giảm giá</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price.toLocaleString('vi-VN')}đ</TableCell>
                  <TableCell>
                    {product.colorVariants && product.colorVariants.length > 0 ? (
                      <div className="flex gap-1">
                        {product.colorVariants.slice(0, 4).map((cv) => (
                          <div
                            key={cv.id}
                            className="w-5 h-5 rounded-full border border-border"
                            style={{ backgroundColor: cv.colorCode }}
                            title={`${cv.name}: ${cv.price.toLocaleString('vi-VN')}đ`}
                          />
                        ))}
                        {product.colorVariants.length > 4 && (
                          <span className="text-xs text-muted-foreground">+{product.colorVariants.length - 4}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.discount ? `${product.discount}%` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleOpenEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Giá mặc định *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Giảm giá mặc định (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">URL hình ảnh</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Thương hiệu *</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) => setFormData({...formData, brand: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.name}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Danh mục *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="device">Thiết bị tương thích</Label>
              <Input
                id="device"
                value={formData.device}
                onChange={(e) => setFormData({...formData, device: e.target.value})}
                placeholder="VD: iPhone 15, Samsung S24..."
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({...formData, isNew: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm">Sản phẩm mới</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) => setFormData({...formData, isBestseller: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm">Bán chạy</span>
              </label>
            </div>

            {/* Color Variants Section */}
            <div className="border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">Biến thể màu sắc</Label>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddColorVariant}>
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm màu
                </Button>
              </div>

              {colorVariants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/50 rounded-lg">
                  Chưa có biến thể màu nào. Thêm biến thể để thiết lập giá riêng cho từng màu.
                </p>
              ) : (
                <div className="space-y-4">
                  {colorVariants.map((variant, index) => (
                    <Card key={variant.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="col-span-2 md:col-span-1">
                            <Label className="text-xs">Màu sắc</Label>
                            <div className="flex gap-2 mt-1">
                              <div
                                className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer flex-shrink-0"
                                style={{ backgroundColor: variant.colorCode }}
                              />
                              <Select
                                value={variant.name}
                                onValueChange={(value) => {
                                  const preset = PRESET_COLORS.find(c => c.name === value);
                                  if (preset) {
                                    handleSelectPresetColor(variant.id, preset);
                                  }
                                }}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Chọn màu" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRESET_COLORS.map((color) => (
                                    <SelectItem key={color.code} value={color.name}>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full border"
                                          style={{ backgroundColor: color.code }}
                                        />
                                        {color.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Mã màu</Label>
                            <Input
                              type="color"
                              value={variant.colorCode}
                              onChange={(e) => handleUpdateColorVariant(variant.id, "colorCode", e.target.value)}
                              className="mt-1 h-10 p-1 cursor-pointer"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Giá (VNĐ)</Label>
                            <Input
                              type="number"
                              value={variant.price}
                              onChange={(e) => handleUpdateColorVariant(variant.id, "price", Number(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Giảm giá (%)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={variant.discount || 0}
                              onChange={(e) => handleUpdateColorVariant(variant.id, "discount", Number(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive flex-shrink-0"
                          onClick={() => handleRemoveColorVariant(variant.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {variant.price !== formData.price && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Giá {variant.name}: {variant.price.toLocaleString('vi-VN')}đ 
                          {variant.discount ? ` (Giảm ${variant.discount}%)` : ""}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingProduct ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;

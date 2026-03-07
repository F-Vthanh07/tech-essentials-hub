import { useState, useEffect } from "react";
import { brandService } from "@/services/BrandService";
import { Brand } from "@/services/BrandService";
import { categoryService } from "@/services/CategoryService";
import { productApi, variantApi, productService } from "@/services/ProductService";
import { ApiCategory } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Search, Palette, X, Loader2 } from "lucide-react";
import { Product, ColorVariant, ApiProductVariant } from "@/types/product";
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
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
    brandId: "",
    brandName: "",
    categoryId: "",
    categoryName: "",
    isActive: true,
  });
  const [colorVariants, setColorVariants] = useState<(ColorVariant & { sku?: string; stockQuantity?: number; size?: string })[]>([]);

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchMeta();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.warn('Failed to fetch products', err);
      toast({ title: "Lỗi", description: "Không thể tải danh sách sản phẩm", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [brandsData, catsData] = await Promise.all([
        brandService.getAll(),
        categoryService.getAll(),
      ]);
      setBrands(brandsData);
      setCategories(catsData);
    } catch (err) {
      console.warn('Failed to fetch meta', err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      image: "",
      brandId: "",
      brandName: "",
      categoryId: "",
      categoryName: "",
      isActive: true,
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
      description: product.description || "",
      price: product.price,
      image: product.image,
      brandId: product.brandId || "",
      brandName: product.brand,
      categoryId: product.categoryId || "",
      categoryName: product.category,
      isActive: product.isActive ?? true,
    });
    setColorVariants(
      (product.colorVariants || []).map(cv => ({
        ...cv,
        sku: '',
        stockQuantity: 10,
        size: 'Default',
      }))
    );
    setIsDialogOpen(true);
  };

  const handleAddColorVariant = () => {
    const newVariant = {
      id: `temp_${Date.now()}`,
      name: "",
      colorCode: "#000000",
      price: formData.price,
      discount: 0,
      image: "",
      sku: "",
      stockQuantity: 10,
      size: "Default",
    };
    setColorVariants([...colorVariants, newVariant]);
  };

  const handleUpdateColorVariant = (id: string, field: string, value: string | number) => {
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

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.brandId || !formData.categoryId) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin bắt buộc", variant: "destructive" });
      return;
    }

    for (const cv of colorVariants) {
      if (!cv.name) {
        toast({ title: "Lỗi", description: "Vui lòng nhập tên màu cho tất cả biến thể", variant: "destructive" });
        return;
      }
    }

    setIsSaving(true);

    try {
      if (editingProduct) {
        // UPDATE product via API
        await productApi.update(editingProduct.id, {
          id: editingProduct.id,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          isActive: formData.isActive,
          brandId: formData.brandId,
          brandName: formData.brandName,
          categoryId: formData.categoryId,
          categoryName: formData.categoryName,
        });

        // Create new variants (temp ones)
        for (const cv of colorVariants) {
          if (cv.id.startsWith('temp_')) {
            await variantApi.create({
              productId: editingProduct.id,
              sku: cv.sku || `${formData.name.substring(0, 3).toUpperCase()}-${cv.name.substring(0, 3).toUpperCase()}-${Date.now()}`,
              name: cv.name,
              stockQuantity: cv.stockQuantity || 10,
              imageUrl: cv.image || formData.image,
              color: cv.colorCode,
              size: cv.size || 'Default',
              price: cv.price,
              productName: null,
            });
          }
        }

        toast({ title: "Thành công", description: "Đã cập nhật sản phẩm" });
      } else {
        // CREATE product via API
        const created = await productApi.create({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          isActive: formData.isActive,
          brandId: formData.brandId,
          brandName: formData.brandName,
          categoryId: formData.categoryId,
          categoryName: formData.categoryName,
        });

        // Create variants for the new product
        for (const cv of colorVariants) {
          await variantApi.create({
            productId: created.id,
            sku: cv.sku || `${formData.name.substring(0, 3).toUpperCase()}-${cv.name.substring(0, 3).toUpperCase()}-${Date.now()}`,
            name: cv.name,
            stockQuantity: cv.stockQuantity || 10,
            imageUrl: cv.image || formData.image,
            color: cv.colorCode,
            size: cv.size || 'Default',
            price: cv.price,
            productName: null,
          });
        }

        toast({ title: "Thành công", description: "Đã thêm sản phẩm mới" });
      }

      setIsDialogOpen(false);
      resetForm();
      // Refresh products from API
      await fetchProducts();
    } catch (err) {
      console.error('Save failed:', err);
      toast({ title: "Lỗi", description: "Không thể lưu sản phẩm. Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      await productApi.delete(productId);
      toast({ title: "Thành công", description: "Đã xóa sản phẩm" });
      await fetchProducts();
    } catch (err) {
      console.error('Delete failed:', err);
      toast({ title: "Lỗi", description: "Không thể xóa sản phẩm", variant: "destructive" });
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
            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} sản phẩm
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Thương hiệu</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead>Trạng thái</TableHead>
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
                        onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop')}
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>
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
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${product.isActive !== false ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {product.isActive !== false ? 'Đang bán' : 'Ẩn'}
                      </span>
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
                {filteredProducts.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy sản phẩm
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
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

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Giá (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">URL hình ảnh</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Thương hiệu *</Label>
                <Select
                  value={formData.brandId}
                  onValueChange={(value) => {
                    const brand = brands.find(b => b.id === value);
                    setFormData({...formData, brandId: value, brandName: brand?.name || ''});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Danh mục *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => {
                    const cat = categories.find(c => c.id === value);
                    setFormData({...formData, categoryId: value, categoryName: cat?.name || ''});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm">Đang bán</span>
              </label>
            </div>

            {/* Color Variants Section */}
            <div className="border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">Biến thể (Product Variants)</Label>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddColorVariant}>
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm biến thể
                </Button>
              </div>

              {colorVariants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/50 rounded-lg">
                  Chưa có biến thể nào. Thêm biến thể để tạo variant với hình ảnh, màu và giá riêng.
                </p>
              ) : (
                <div className="space-y-4">
                  {colorVariants.map((variant) => (
                    <Card key={variant.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <Label className="text-xs">Tên *</Label>
                            <Select
                              value={variant.name}
                              onValueChange={(value) => {
                                const preset = PRESET_COLORS.find(c => c.name === value);
                                if (preset) handleSelectPresetColor(variant.id, preset);
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Chọn màu" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRESET_COLORS.map((color) => (
                                  <SelectItem key={color.code} value={color.name}>
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.code }} />
                                      {color.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                            <Label className="text-xs">Tồn kho</Label>
                            <Input
                              type="number"
                              value={variant.stockQuantity || 10}
                              onChange={(e) => handleUpdateColorVariant(variant.id, "stockQuantity", Number(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">URL hình ảnh</Label>
                            <Input
                              type="text"
                              placeholder="URL"
                              value={variant.image || ""}
                              onChange={(e) => handleUpdateColorVariant(variant.id, "image", e.target.value)}
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
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProduct ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;

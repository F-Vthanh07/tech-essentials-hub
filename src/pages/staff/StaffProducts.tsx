import { useState, useEffect, useCallback } from "react";
import { brandService, Brand } from "@/services/BrandService";
import { categoryService } from "@/services/CategoryService";
import { deviceService } from "@/services/DeviceService";
import { attributeService } from "@/services/AttributeService";
import { productApi, variantApi, productService, compatibilityApi, productAttributeApi, type UpdateProductPayload, type VariantPayload } from "@/services/ProductService";
import {
  ApiCategory, ApiDevice, ApiAttribute, ApiProduct,
  ApiProductVariant, ApiProductCompatibility, ApiProductAttribute,
  Product,
} from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, Loader2, X, Palette, Eye, Check, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

// ======================================
// Categories Tab (with dynamic parent options)
// ======================================
function CategoriesTab() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', parentId: '' });

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.warn('Failed to fetch categories', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.slug && c.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get parent options (exclude current editing category)
  const parentOptions = [
    { value: '__none__', label: '-- Không có --' },
    ...categories
      .filter(c => !editingCategory || c.id !== editingCategory.id)
      .map(c => ({ value: c.id, label: c.name }))
  ];

  const handleOpenAdd = () => {
    setFormData({ name: '', slug: '', parentId: '__none__' });
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (cat: ApiCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      parentId: cat.parentId || '__none__'
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin", variant: "destructive" });
      return;
    }

    const parentId = formData.parentId === '__none__' || !formData.parentId ? null : formData.parentId;

    setIsSaving(true);
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          parentId: parentId
        });
        toast({ title: "Thành công", description: "Đã cập nhật danh mục" });
      } else {
        await categoryService.create({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          parentId: parentId
        });
        toast({ title: "Thành công", description: "Đã thêm danh mục mới" });
      }
      setIsDialogOpen(false);
      await loadCategories();
    } catch (err: any) {
      console.error('Save category failed:', err);
      toast({ title: "Lỗi", description: err?.message || "Không thể lưu", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await categoryService.delete(id);
      toast({ title: "Thành công", description: "Đã xóa danh mục" });
      await loadCategories();
    } catch (err) {
      console.error('Delete category failed:', err);
      toast({ title: "Lỗi", description: "Không thể xóa danh mục", variant: "destructive" });
    }
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return '-';
    const parent = categories.find(c => c.id === parentId);
    return parent?.name || '-';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{filteredCategories.length} bản ghi</span>
          <Button onClick={handleOpenAdd} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Thêm
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Danh mục cha</TableHead>
                <TableHead className="text-right w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug || '-'}</TableCell>
                  <TableCell>{getParentName(cat.parentId)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(cat)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Không có danh mục nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên danh mục *</Label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  // Auto-generate slug if editing
                  if (!editingCategory && !formData.slug) {
                    const slug = e.target.value
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '');
                    setFormData(prev => ({ ...prev, slug }));
                  }
                }}
                placeholder="VD: Ốp lưng iPhone"
              />
            </div>
            <div className="grid gap-2">
              <Label>Slug *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="vd: op-lung-iphone"
              />
            </div>
            <div className="grid gap-2">
              <Label>Danh mục cha</Label>
              <Select value={formData.parentId || '__none__'} onValueChange={(v) => setFormData({ ...formData, parentId: v === '__none__' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Chọn danh mục cha..." /></SelectTrigger>
                <SelectContent>
                  {parentOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Chọn danh mục cha để tạo danh mục con. Để trống nếu là danh mục gốc.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCategory ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======================================
// ProductCompatibility Tab (with dynamic product/device options)
// ======================================
function ProductCompatibilityTab({
  products,
  devices,
  allCompatibilities,
}: {
  products: ApiProduct[];
  devices: ApiDevice[];
  allCompatibilities: ApiProductCompatibility[];
}) {
  const [compatibilities, setCompatibilities] = useState<ApiProductCompatibility[]>(allCompatibilities);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApiProductCompatibility | null>(null);
  const [formData, setFormData] = useState({ productId: '', deviceId: '', note: '' });

  // Sync với props khi props thay đổi
  useEffect(() => {
    setCompatibilities(allCompatibilities);
  }, [allCompatibilities]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await compatibilityApi.getAll().catch(() => []);
      setCompatibilities(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = allCompatibilities.filter(c =>
    (c.productName || products.find(p => p.id === c.productId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({ productId: '', deviceId: '', note: '' });
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: ApiProductCompatibility) => {
    setEditingItem(item);
    setFormData({
      productId: item.productId || '',
      deviceId: item.deviceId || '',
      note: item.note || ''
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.productId || !formData.deviceId) {
      toast({ title: "Lỗi", description: "Vui lòng chọn sản phẩm và thiết bị", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      if (editingItem) {
        await compatibilityApi.update(editingItem.id, {
          productId: formData.productId,
          deviceId: formData.deviceId,
          note: formData.note
        });
        toast({ title: "Thành công", description: "Đã cập nhật" });
      } else {
        await compatibilityApi.create({
          productId: formData.productId,
          deviceId: formData.deviceId,
          note: formData.note
        });
        toast({ title: "Thành công", description: "Đã thêm mới" });
      }
      setIsDialogOpen(false);
      await loadData();
    } catch (err: any) {
      toast({ title: "Lỗi", description: err?.message || "Không thể lưu", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bản ghi này?")) return;
    try {
      await compatibilityApi.delete(id);
      toast({ title: "Thành công", description: "Đã xóa" });
      await loadData();
    } catch {
      toast({ title: "Lỗi", description: "Không thể xóa", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{filtered.length} bản ghi</span>
          <Button onClick={handleOpenAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Thêm</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Thiết bị</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productName || products.find(p => p.id === item.productId)?.name || '-'}</TableCell>
                  <TableCell>{item.deviceName || devices.find(d => d.id === item.deviceId)?.name || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{item.note || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Sửa tương thích" : "Thêm tương thích"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Sản phẩm *</Label>
              <Select value={formData.productId} onValueChange={(v) => setFormData({ ...formData, productId: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn sản phẩm..." /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Thiết bị *</Label>
              <Select value={formData.deviceId} onValueChange={(v) => setFormData({ ...formData, deviceId: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn thiết bị..." /></SelectTrigger>
                <SelectContent>
                  {devices.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Ghi chú</Label>
              <Input value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="VD: Fit hoàn hảo, Hỗ trợ sạc nhanh..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======================================
// ProductAttributes Tab (with dynamic product/attribute options)
// ======================================
function ProductAttributesTab({
  products,
  attributes,
  allAttributes,
}: {
  products: ApiProduct[];
  attributes: ApiAttribute[];
  allAttributes: ApiProductAttribute[];
}) {
  const [productAttributes, setProductAttributes] = useState<ApiProductAttribute[]>(allAttributes);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApiProductAttribute | null>(null);
  const [formData, setFormData] = useState({ productId: '', attributeId: '', value: '' });

  // Sync với props khi props thay đổi
  useEffect(() => {
    setProductAttributes(allAttributes);
  }, [allAttributes]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await productAttributeApi.getAll().catch(() => []);
      setProductAttributes(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = productAttributes.filter(a =>
    (a.value || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.productName || products.find(p => p.id === a.productId)?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({ productId: '', attributeId: '', value: '' });
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: ApiProductAttribute) => {
    setEditingItem(item);
    setFormData({
      productId: item.productId || '',
      attributeId: item.attributeId || '',
      value: item.value || ''
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.productId || !formData.attributeId || !formData.value) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      if (editingItem) {
        await productAttributeApi.update(editingItem.id, {
          productId: formData.productId,
          attributeId: formData.attributeId,
          value: formData.value
        });
        toast({ title: "Thành công", description: "Đã cập nhật" });
      } else {
        await productAttributeApi.create({
          productId: formData.productId,
          attributeId: formData.attributeId,
          value: formData.value
        });
        toast({ title: "Thành công", description: "Đã thêm mới" });
      }
      setIsDialogOpen(false);
      await loadData();
    } catch (err: any) {
      toast({ title: "Lỗi", description: err?.message || "Không thể lưu", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bản ghi này?")) return;
    try {
      await productAttributeApi.delete(id);
      toast({ title: "Thành công", description: "Đã xóa" });
      await loadData();
    } catch {
      toast({ title: "Lỗi", description: "Không thể xóa", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{filtered.length} bản ghi</span>
          <Button onClick={handleOpenAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Thêm</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Thuộc tính</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead className="text-right w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productName || products.find(p => p.id === item.productId)?.name || '-'}</TableCell>
                  <TableCell>{item.attributeName || attributes.find(a => a.id === item.attributeId)?.name || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{item.value || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Sửa thuộc tính SP" : "Thêm thuộc tính SP"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Sản phẩm *</Label>
              <Select value={formData.productId} onValueChange={(v) => setFormData({ ...formData, productId: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn sản phẩm..." /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Thuộc tính *</Label>
              <Select value={formData.attributeId} onValueChange={(v) => setFormData({ ...formData, attributeId: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn thuộc tính..." /></SelectTrigger>
                <SelectContent>
                  {attributes.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Giá trị *</Label>
              <Input value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder="VD: 8GB, Silicone, 6.7 inch..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======================================
// Generic CRUD Table Component
// ======================================
interface CrudColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface CrudField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

function GenericCrudTab<T extends { id: string }>({
  title,
  columns,
  fields,
  fetchAll,
  onCreate,
  onUpdate,
  onDelete,
  getFormDefaults,
  searchField,
}: {
  title: string;
  columns: CrudColumn<T>[];
  fields: CrudField[];
  fetchAll: () => Promise<T[]>;
  onCreate: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  getFormDefaults: () => Record<string, any>;
  searchField?: string;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>(getFormDefaults());

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAll();
      setItems(data);
    } catch (err) {
      console.warn(`Failed to fetch ${title}`, err);
      toast({ title: "Lỗi", description: `Không thể tải ${title}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [fetchAll, title]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const filteredItems = searchField
    ? items.filter((item: any) =>
      String(item[searchField] || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    : items;

  const handleOpenAdd = () => {
    setFormData(getFormDefaults());
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: T) => {
    setEditingItem(item);
    const data: Record<string, any> = {};
    fields.forEach((f) => { data[f.key] = (item as any)[f.key] ?? getFormDefaults()[f.key]; });
    setFormData(data);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    // Check required fields
    for (const f of fields) {
      if (f.required && !formData[f.key] && formData[f.key] !== 0 && formData[f.key] !== false) {
        toast({ title: "Lỗi", description: `Vui lòng điền ${f.label}`, variant: "destructive" });
        return;
      }
    }
    setIsSaving(true);
    try {
      if (editingItem) {
        await onUpdate(editingItem.id, { id: editingItem.id, ...formData });
        toast({ title: "Thành công", description: `Đã cập nhật` });
      } else {
        await onCreate(formData);
        toast({ title: "Thành công", description: `Đã thêm mới` });
      }
      setIsDialogOpen(false);
      await loadItems();
    } catch (err: any) {
      console.error('Save failed:', err);
      toast({ title: "Lỗi", description: err?.message || "Không thể lưu", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;
    try {
      await onDelete(id);
      toast({ title: "Thành công", description: "Đã xóa" });
      await loadItems();
    } catch (err) {
      console.error('Delete failed:', err);
      toast({ title: "Lỗi", description: "Không thể xóa", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{filteredItems.length} bản ghi</span>
          <Button onClick={handleOpenAdd} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Thêm
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
                <TableHead className="text-right w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? "-")}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? `Sửa ${title}` : `Thêm ${title}`}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {fields.map((field) => (
              <div key={field.key} className="grid gap-2">
                <Label>{field.label}{field.required ? ' *' : ''}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={formData[field.key] || ''}
                    onValueChange={(v) => setFormData({ ...formData, [field.key]: v })}
                  >
                    <SelectTrigger><SelectValue placeholder={field.placeholder || `Chọn...`} /></SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'checkbox' ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!formData[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">{field.placeholder || field.label}</span>
                  </label>
                ) : (
                  <Input
                    type={field.type}
                    value={formData[field.key] ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                    })}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======================================
// Products Tab (custom, with variants, attributes, compatibilities)
// ======================================
function ProductsTab({
  brands,
  categories,
  devices,
  attributes,
}: {
  brands: Brand[];
  categories: ApiCategory[];
  devices: ApiDevice[];
  attributes: ApiAttribute[];
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", description: "", price: 0, image: "", brandId: "", categoryId: "", isActive: true,
  });
  const [colorVariants, setColorVariants] = useState<any[]>([]);
  const [editAttributes, setEditAttributes] = useState<any[]>([]);
  const [editCompatibilities, setEditCompatibilities] = useState<any[]>([]);

  // View Detail state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ApiProduct | null>(null);
  const [detailVariants, setDetailVariants] = useState<ApiProductVariant[]>([]);
  const [detailAttributes, setDetailAttributes] = useState<ApiProductAttribute[]>([]);
  const [detailCompatibilities, setDetailCompatibilities] = useState<ApiProductCompatibility[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const PRESET_COLORS = [
    { name: "Đen", code: "#000000" }, { name: "Trắng", code: "#FFFFFF" },
    { name: "Đỏ", code: "#EF4444" }, { name: "Xanh dương", code: "#3B82F6" },
    { name: "Xanh lá", code: "#22C55E" }, { name: "Vàng", code: "#EAB308" },
    { name: "Tím", code: "#A855F7" }, { name: "Hồng", code: "#EC4899" },
    { name: "Cam", code: "#F97316" }, { name: "Xám", code: "#6B7280" },
  ];

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try { setProducts(await productService.getAllProducts({ includeInactive: true })); }
    catch { toast({ title: "Lỗi", description: "Không thể tải sản phẩm", variant: "destructive" }); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: "", description: "", price: 0, image: "", brandId: "", categoryId: "", isActive: true });
    setColorVariants([]);
    setEditAttributes([]);
    setEditCompatibilities([]);
    setEditingProduct(null);
  };

  const handleOpenAdd = () => { resetForm(); setIsDialogOpen(true); };

  const handleViewDetail = async (productId: string) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetailProduct(null);
    setDetailVariants([]);
    setDetailAttributes([]);
    setDetailCompatibilities([]);
    try {
      const [apiProduct, allVariants, allAttrs, allComps] = await Promise.all([
        productApi.getById(productId),
        variantApi.getAll().catch(() => []),
        productAttributeApi.getAll().catch(() => []),
        compatibilityApi.getAll().catch(() => []),
      ]);
      setDetailProduct(apiProduct);
      setDetailVariants(allVariants.filter(v => v.productId === productId));
      setDetailAttributes(allAttrs.filter(a => a.productId === productId));
      setDetailCompatibilities(allComps.filter(c => c.productId === productId));
    } catch (err) {
      console.error('Failed to fetch product detail:', err);
      toast({ title: "Lỗi", description: "Không thể tải chi tiết sản phẩm", variant: "destructive" });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleOpenEdit = async (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name, description: p.description || "", price: p.price, image: p.image,
      brandId: p.brandId || "", categoryId: p.categoryId || "", isActive: p.isActive ?? true,
    });
    // Load full variant, attribute, and compatibility data from API
    try {
      const [allVariants, allAttrs, allComps] = await Promise.all([
        variantApi.getAll().catch(() => []),
        productAttributeApi.getAll().catch(() => []),
        compatibilityApi.getAll().catch(() => []),
      ]);
      const productVariants = allVariants.filter(v => v.productId === p.id);
      setColorVariants(productVariants.map(v => ({
        id: v.id, name: v.name, colorCode: v.color, price: v.price, image: v.imageUrl,
        sku: v.sku, stockQuantity: v.stockQuantity, size: v.size, _saved: true,
      })));

      const prodAttrs = allAttrs.filter(a => a.productId === p.id);
      setEditAttributes(prodAttrs.map(a => ({ ...a, _saved: true })));

      const prodComps = allComps.filter(c => c.productId === p.id);
      setEditCompatibilities(prodComps.map(c => ({ ...c, _saved: true })));
    } catch {
      setColorVariants((p.colorVariants || []).map(cv => ({ ...cv, sku: '', stockQuantity: 10, size: 'Default' })));
      setEditAttributes([]);
      setEditCompatibilities([]);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.brandId || !formData.categoryId) {
      toast({ title: "Lỗi", description: "Điền đầy đủ thông tin bắt buộc", variant: "destructive" });
      return;
    }

    const hasConfiguredVariant = colorVariants.some((v) => {
      if (!String(v.id || '').startsWith('temp_')) return true;
      return String(v.name || '').trim().length > 0;
    });

    if (formData.isActive && !hasConfiguredVariant) {
      toast({
        title: "Không thể bật sản phẩm",
        description: "Sản phẩm cần có ít nhất 1 biến thể trước khi đặt trạng thái Đang bán.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const brand = brands.find(b => b.id === formData.brandId);
      const cat = categories.find(c => c.id === formData.categoryId);
      const payload = { ...formData, brandName: brand?.name || '', categoryName: cat?.name || '' };
      const updatePayload: UpdateProductPayload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        price: Number(formData.price),
        isActive: !!formData.isActive,
        brandId: formData.brandId,
        categoryId: formData.categoryId,
      };

      if (editingProduct) {
        await productApi.update(editingProduct.id, updatePayload);
        for (const cv of colorVariants.filter(v => v.id.startsWith('temp_'))) {
          await variantApi.create({
            productId: editingProduct.id,
            sku: cv.sku || `${formData.name.substring(0, 3).toUpperCase()}-${Date.now()}`,
            name: cv.name,
            stockQuantity: cv.stockQuantity || 10,
            imageUrl: cv.image || formData.image,
            color: cv.colorCode || cv.color,
            size: cv.size || 'Default',
            price: cv.price,
          });
        }
        for (const a of editAttributes.filter(a => a.id.startsWith('temp_'))) {
          if (a.attributeId && a.value) await productAttributeApi.create({ productId: editingProduct.id, attributeId: a.attributeId, value: a.value });
        }
        for (const c of editCompatibilities.filter(c => c.id.startsWith('temp_'))) {
          if (c.deviceId) await compatibilityApi.create({ productId: editingProduct.id, deviceId: c.deviceId, note: c.note || '' });
        }
        toast({ title: "Thành công", description: "Đã cập nhật sản phẩm" });
      } else {
        const created = await productApi.create(payload as any);
        for (const cv of colorVariants) {
          await variantApi.create({
            productId: created.id,
            sku: cv.sku || `${formData.name.substring(0, 3).toUpperCase()}-${Date.now()}`,
            name: cv.name,
            stockQuantity: cv.stockQuantity || 10,
            imageUrl: cv.image || formData.image,
            color: cv.colorCode || cv.color,
            size: cv.size || 'Default',
            price: cv.price,
          });
        }
        for (const a of editAttributes) {
          if (a.attributeId && a.value) await productAttributeApi.create({ productId: created.id, attributeId: a.attributeId, value: a.value });
        }
        for (const c of editCompatibilities) {
          if (c.deviceId) await compatibilityApi.create({ productId: created.id, deviceId: c.deviceId, note: c.note || '' });
        }
        toast({ title: "Thành công", description: "Đã thêm sản phẩm mới" });
      }
      setIsDialogOpen(false);
      resetForm();
      await fetchProducts();
    } catch (err) {
      console.error(err);
      toast({ title: "Lỗi", description: "Không thể lưu sản phẩm", variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handleToggleProductActive = async (product: Product) => {
    setTogglingProductId(product.id);
    try {
      const apiProduct = await productApi.getById(product.id);
      const nextIsActive = !apiProduct.isActive;

      if (nextIsActive && (!apiProduct.variants || apiProduct.variants.length === 0)) {
        toast({
          title: "Không thể bật sản phẩm",
          description: "Sản phẩm chưa có biến thể. Hãy thêm biến thể trước khi bật.",
          variant: "destructive",
        });
        return;
      }

      await productApi.update(product.id, {
        name: apiProduct.name,
        description: apiProduct.description || "",
        price: apiProduct.price,
        isActive: nextIsActive,
        brandId: apiProduct.brandId,
        categoryId: apiProduct.categoryId,
      });

      toast({
        title: "Thành công",
        description: nextIsActive ? "Đã bật sản phẩm" : "Đã tắt sản phẩm",
      });
      await fetchProducts();
    } catch (err) {
      console.error('Toggle product status failed:', err);
      toast({ title: "Lỗi", description: "Không thể cập nhật trạng thái sản phẩm", variant: "destructive" });
    } finally {
      setTogglingProductId(null);
    }
  };

  const handleUpdateVariant = async (v: any) => {
    try {
      await variantApi.update(v.id, {
        productId: editingProduct?.id || v.productId,
        sku: v.sku,
        name: v.name,
        stockQuantity: v.stockQuantity,
        imageUrl: v.image || v.imageUrl,
        color: v.colorCode || v.color,
        size: v.size || 'Default',
        price: v.price,
      });
      setColorVariants(colorVariants.map(cv => cv.id === v.id ? { ...cv, _saved: true } : cv));
      toast({ title: "Thành công", description: "Đã lưu biến thể" });
    } catch (err) {
      console.error('Update variant failed:', err);
      toast({ title: "Lỗi", description: "Không thể lưu biến thể", variant: "destructive" });
    }
  };

  const handleUpdateAttribute = async (a: any) => {
    try {
      if (!a.attributeId || !a.value) {
        toast({ title: "Lỗi", description: "Vui lòng nhập đủ thông tin thuộc tính", variant: "destructive" });
        return;
      }
      await productAttributeApi.update(a.id, {
        id: a.id, productId: editingProduct!.id, attributeId: a.attributeId, value: a.value
      });
      setEditAttributes(editAttributes.map(ea => ea.id === a.id ? { ...ea, _saved: true } : ea));
      toast({ title: "Thành công", description: "Đã lưu thuộc tính" });
    } catch (err) {
      console.error('Update attribute failed:', err);
      toast({ title: "Lỗi", description: "Không thể lưu thuộc tính", variant: "destructive" });
    }
  };

  const handleUpdateCompatibility = async (c: any) => {
    try {
      if (!c.deviceId) {
        toast({ title: "Lỗi", description: "Vui lòng chọn thiết bị", variant: "destructive" });
        return;
      }
      await compatibilityApi.update(c.id, {
        id: c.id, productId: editingProduct!.id, deviceId: c.deviceId, note: c.note || ''
      });
      setEditCompatibilities(editCompatibilities.map(ec => ec.id === c.id ? { ...ec, _saved: true } : ec));
      toast({ title: "Thành công", description: "Đã lưu thiết bị tương thích" });
    } catch (err) {
      console.error('Update compatibility failed:', err);
      toast({ title: "Lỗi", description: "Không thể lưu", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try { await productApi.delete(id); toast({ title: "Đã xóa" }); await fetchProducts(); }
    catch { toast({ title: "Lỗi", description: "Không thể xóa", variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{filtered.length} sản phẩm</span>
          <Button onClick={handleOpenAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Thêm SP</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right w-[120px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => {
                const isProductActive = p.isActive ?? true;
                const isToggling = togglingProductId === p.id;

                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <img src={p.image} alt="" className="w-10 h-10 rounded object-cover"
                        onError={e => (e.currentTarget.src = 'https://placehold.co/40')} />
                    </TableCell>
                    <TableCell className="font-medium max-w-[180px] truncate">{p.name}</TableCell>
                    <TableCell>{p.brand}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{p.price.toLocaleString('vi-VN')}đ</TableCell>
                    <TableCell>
                      {p.colorVariants && p.colorVariants.length > 0 ? (
                        <div className="flex gap-1">
                          {p.colorVariants.slice(0, 3).map(cv => (
                            <div key={cv.id} className="w-4 h-4 rounded-full border" style={{ backgroundColor: cv.colorCode }} title={cv.name} />
                          ))}
                          {p.colorVariants.length > 3 && <span className="text-xs text-muted-foreground">+{p.colorVariants.length - 3}</span>}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-between gap-3 rounded-xl border bg-card/70 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${isProductActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span className={`text-xs font-medium ${isProductActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                            {isProductActive ? 'Đang bán' : 'Đã ẩn'}
                          </span>
                        </div>
                        {isToggling ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Switch
                            checked={isProductActive}
                            onCheckedChange={() => handleToggleProductActive(p)}
                            aria-label={isProductActive ? "Tắt sản phẩm" : "Bật sản phẩm"}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleViewDetail(p.id)} title="Xem chi tiết">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(p)} title="Chỉnh sửa">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)} title="Xóa">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Không có sản phẩm</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên sản phẩm *</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Mô tả</Label>
              <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Giá (VNĐ) *</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label>URL hình ảnh</Label>
                <Input value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Thương hiệu *</Label>
                <Select value={formData.brandId} onValueChange={v => setFormData({ ...formData, brandId: v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                  <SelectContent>
                    {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Danh mục *</Label>
                <Select value={formData.categoryId} onValueChange={v => setFormData({ ...formData, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-xl border bg-card/70 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Trạng thái bán</p>
                  <p className="text-xs text-muted-foreground">
                    Chỉ có thể bật khi sản phẩm có ít nhất 1 biến thể.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${formData.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    {formData.isActive ? 'Đang bán' : 'Đã ẩn'}
                  </span>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => {
                      if (checked && colorVariants.length === 0) {
                        toast({
                          title: "Không thể bật sản phẩm",
                          description: "Thêm ít nhất 1 biến thể trước khi chuyển sang Đang bán.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setFormData({ ...formData, isActive: checked });
                    }}
                    aria-label="Chuyển trạng thái sản phẩm"
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-semibold">Biến thể</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setColorVariants([...colorVariants, { id: `temp_${Date.now()}`, name: '', colorCode: '#000000', price: formData.price, image: '', stockQuantity: 10, size: 'Default' }])}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Thêm
                </Button>
              </div>
              {colorVariants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3 bg-secondary/30 rounded">Chưa có biến thể</p>
              ) : (
                <div className="space-y-3">
                  {colorVariants.map(v => {
                    const isExisting = !v.id.startsWith('temp_');
                    return (
                      <div key={v.id} className={`p-3 border rounded-lg space-y-2 ${isExisting ? 'border-primary/20 bg-primary/5' : ''}`}>
                        {isExisting && (
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground font-mono">ID: {v.id.slice(0, 12)}...</span>
                            <Badge variant="outline" className="text-xs">Đã lưu</Badge>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Select value={v.name} onValueChange={val => {
                            const preset = PRESET_COLORS.find(c => c.name === val);
                            if (preset) setColorVariants(colorVariants.map(cv => cv.id === v.id ? { ...cv, name: preset.name, colorCode: preset.code, _saved: false } : cv));
                          }}>
                            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Màu" /></SelectTrigger>
                            <SelectContent>
                              {PRESET_COLORS.map(c => (
                                <SelectItem key={c.code} value={c.name}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: c.code }} />
                                    {c.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input type="number" className="w-[100px]" placeholder="Giá" value={v.price} onChange={e => setColorVariants(colorVariants.map(cv => cv.id === v.id ? { ...cv, price: Number(e.target.value), _saved: false } : cv))} />
                          <Input className="flex-1" placeholder="URL ảnh" value={v.image || ''} onChange={e => setColorVariants(colorVariants.map(cv => cv.id === v.id ? { ...cv, image: e.target.value, _saved: false } : cv))} />
                          {isExisting && (
                            <Button
                              variant={v._saved ? "outline" : "default"}
                              size="sm"
                              className="flex-shrink-0"
                              onClick={() => handleUpdateVariant(v)}
                            >
                              Lưu
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive flex-shrink-0" onClick={async () => {
                            if (isExisting) {
                              if (!confirm(`Xóa biến thể "${v.name}" khỏi sản phẩm?`)) return;
                              try {
                                await variantApi.delete(v.id);
                                toast({ title: "Thành công", description: `Đã xóa biến thể "${v.name}"` });
                              } catch (err) {
                                console.error('Delete variant failed:', err);
                                toast({ title: "Lỗi", description: "Không thể xóa biến thể", variant: "destructive" });
                                return;
                              }
                            }
                            setColorVariants(colorVariants.filter(cv => cv.id !== v.id));
                          }}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {isExisting && (
                          <div className="flex items-center gap-2 pl-1">
                            <div className="grid grid-cols-3 gap-2 flex-1">
                              <div>
                                <Label className="text-xs text-muted-foreground">SKU</Label>
                                <Input className="h-7 text-xs" value={v.sku || ''} onChange={e => setColorVariants(colorVariants.map(cv => cv.id === v.id ? { ...cv, sku: e.target.value, _saved: false } : cv))} />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Tồn kho</Label>
                                <Input type="number" className="h-7 text-xs" value={v.stockQuantity ?? 0} onChange={e => setColorVariants(colorVariants.map(cv => cv.id === v.id ? { ...cv, stockQuantity: Number(e.target.value), _saved: false } : cv))} />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Size</Label>
                                <Input className="h-7 text-xs" value={v.size || ''} onChange={e => setColorVariants(colorVariants.map(cv => cv.id === v.id ? { ...cv, size: e.target.value, _saved: false } : cv))} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Attributes */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-semibold">Thuộc tính kỹ thuật</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditAttributes([...editAttributes, { id: `temp_${Date.now()}`, attributeId: '', value: '' }])}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Thêm
                </Button>
              </div>
              {editAttributes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3 bg-secondary/30 rounded">Chưa có thuộc tính</p>
              ) : (
                <div className="space-y-2">
                  {editAttributes.map(a => {
                    const isExisting = !a.id.startsWith('temp_');
                    return (
                      <div key={a.id} className={`flex items-center gap-2 p-2 border rounded-lg ${isExisting ? 'border-primary/20 bg-primary/5' : ''}`}>
                        <Select value={a.attributeId} onValueChange={val => setEditAttributes(editAttributes.map(ea => ea.id === a.id ? { ...ea, attributeId: val, _saved: false } : ea))}>
                          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Chọn thuộc tính" /></SelectTrigger>
                          <SelectContent>
                            {attributes.map(attr => <SelectItem key={attr.id} value={attr.id}>{attr.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input className="flex-1" placeholder="Giá trị (VD: 8GB, Silicone, v.v...)" value={a.value} onChange={e => setEditAttributes(editAttributes.map(ea => ea.id === a.id ? { ...ea, value: e.target.value, _saved: false } : ea))} />

                        {isExisting && (
                          <Button variant={a._saved ? "outline" : "default"} size="sm" className="flex-shrink-0" onClick={() => handleUpdateAttribute(a)}>
                            Lưu
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive flex-shrink-0" onClick={async () => {
                          if (isExisting) {
                            if (!confirm("Xóa thuộc tính này?")) return;
                            try { await productAttributeApi.delete(a.id); toast({ title: "Thành công", description: "Đã xóa thuộc tính" }); }
                            catch { toast({ title: "Lỗi", description: "Không thể xóa", variant: "destructive" }); return; }
                          }
                          setEditAttributes(editAttributes.filter(ea => ea.id !== a.id));
                        }}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Compatibilities */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-semibold">Tương thích thiết bị</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditCompatibilities([...editCompatibilities, { id: `temp_${Date.now()}`, deviceId: '', note: '' }])}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Thêm
                </Button>
              </div>
              {editCompatibilities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3 bg-secondary/30 rounded">Chưa có tương thích</p>
              ) : (
                <div className="space-y-2">
                  {editCompatibilities.map(c => {
                    const isExisting = !c.id.startsWith('temp_');
                    return (
                      <div key={c.id} className={`flex items-center gap-2 p-2 border rounded-lg ${isExisting ? 'border-primary/20 bg-primary/5' : ''}`}>
                        <Select value={c.deviceId} onValueChange={val => setEditCompatibilities(editCompatibilities.map(ec => ec.id === c.id ? { ...ec, deviceId: val, _saved: false } : ec))}>
                          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Chọn thiết bị" /></SelectTrigger>
                          <SelectContent>
                            {devices.map(dev => <SelectItem key={dev.id} value={dev.id}>{dev.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input className="flex-1" placeholder="Ghi chú (VD: Fit hoàn hảo, Hỗ trợ sạc nhanh...)" value={c.note || ''} onChange={e => setEditCompatibilities(editCompatibilities.map(ec => ec.id === c.id ? { ...ec, note: e.target.value, _saved: false } : ec))} />

                        {isExisting && (
                          <Button variant={c._saved ? "outline" : "default"} size="sm" className="flex-shrink-0" onClick={() => handleUpdateCompatibility(c)}>
                            Lưu
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive flex-shrink-0" onClick={async () => {
                          if (isExisting) {
                            if (!confirm("Xóa thiết bị tương thích này?")) return;
                            try { await compatibilityApi.delete(c.id); toast({ title: "Thành công", description: "Đã xóa thiết bị tương thích" }); }
                            catch { toast({ title: "Lỗi", description: "Không thể xóa", variant: "destructive" }); return; }
                          }
                          setEditCompatibilities(editCompatibilities.filter(ec => ec.id !== c.id));
                        }}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProduct ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : detailProduct ? (
            <div className="space-y-6">
              {/* Product image + basic info */}
              <div className="flex gap-6">
                <img
                  src={detailVariants[0]?.imageUrl || 'https://placehold.co/200'}
                  alt={detailProduct.name}
                  className="w-32 h-32 rounded-lg object-cover border"
                  onError={e => (e.currentTarget.src = 'https://placehold.co/200')}
                />
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold">{detailProduct.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{detailProduct.brandName}</Badge>
                    <Badge variant="outline">{detailProduct.categoryName}</Badge>
                    <Badge className={detailProduct.isActive ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-red-500/10 text-red-600 border-red-200'}>
                      {detailProduct.isActive ? 'Đang bán' : 'Đã ẩn'}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {detailProduct.price.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Mô tả</Label>
                <p className="mt-1 text-sm">{detailProduct.description || 'Chưa có mô tả'}</p>
              </div>

              {/* Variants */}
              <div className="border-t pt-4">
                <Label className="font-semibold mb-3 block">Biến thể ({detailVariants.length})</Label>
                {detailVariants.length > 0 ? (
                  <div className="space-y-3">
                    {detailVariants.map(v => (
                      <div key={v.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <img
                          src={v.imageUrl || 'https://placehold.co/60'}
                          alt={v.name}
                          className="w-14 h-14 rounded object-cover border"
                          onError={e => (e.currentTarget.src = 'https://placehold.co/60')}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-border flex-shrink-0"
                          style={{ backgroundColor: v.color }}
                          title={v.color}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{v.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {v.sku} &middot; Size: {v.size}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{v.price.toLocaleString('vi-VN')}đ</p>
                          <p className="text-xs text-muted-foreground">Kho: {v.stockQuantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/30 rounded">Chưa có biến thể</p>
                )}
              </div>

              {/* Attributes & Compatibilities Grid */}
              <div className="grid grid-cols-2 gap-6 border-t pt-4">
                {/* Attributes */}
                <div>
                  <Label className="font-semibold mb-3 block">Thuộc tính kỹ thuật</Label>
                  {detailAttributes.length > 0 ? (
                    <div className="space-y-2">
                      {detailAttributes.map(a => {
                        const attrName = attributes.find(attr => attr.id === a.attributeId)?.name || a.attributeId;
                        return (
                          <div key={a.id} className="flex justify-between items-center bg-muted/30 p-2 rounded text-sm">
                            <span className="text-muted-foreground">{attrName}:</span>
                            <span className="font-medium">{a.value}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2 bg-secondary/30 rounded">Chưa có thuộc tính</p>
                  )}
                </div>

                {/* Compatibilities */}
                <div>
                  <Label className="font-semibold mb-3 block">Tương thích thiết bị</Label>
                  {detailCompatibilities.length > 0 ? (
                    <div className="space-y-2">
                      {detailCompatibilities.map(c => {
                        const devName = devices.find(d => d.id === c.deviceId)?.name || c.deviceId;
                        return (
                          <div key={c.id} className="bg-muted/30 p-2 rounded text-sm space-y-1">
                            <p className="font-medium">{devName}</p>
                            {c.note && <p className="text-xs text-muted-foreground italic">{c.note}</p>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2 bg-secondary/30 rounded">Chưa có thiết bị tương thích</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Không tìm thấy sản phẩm</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======================================
// Main Admin Products Page with Tabs
// ======================================
const StaffProducts = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [devices, setDevices] = useState<ApiDevice[]>([]);
  const [attributes, setAttributes] = useState<ApiAttribute[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [compatibilities, setCompatibilities] = useState<ApiProductCompatibility[]>([]);
  const [productAttributes, setProductAttributes] = useState<ApiProductAttribute[]>([]);

  // Fetch reference data for FK dropdowns
  useEffect(() => {
    const load = async () => {
      const [b, c, d, a, p, comp, prodAttr] = await Promise.all([
        brandService.getAll().catch(() => []),
        categoryService.getAll().catch(() => []),
        deviceService.getAll().catch(() => []),
        attributeService.getAll().catch(() => []),
        productApi.getAll().catch(() => []),
        compatibilityApi.getAll().catch(() => []),
        productAttributeApi.getAll().catch(() => []),
      ]);
      setBrands(b); setCategories(c); setDevices(d); setAttributes(a); setProducts(p); setCompatibilities(comp); setProductAttributes(prodAttr);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2 h-auto mb-6">
          <TabsTrigger value="products" className="py-2 font-medium">Sản phẩm</TabsTrigger>
          <TabsTrigger value="details" className="py-2 font-medium">Thông tin chi tiết</TabsTrigger>
        </TabsList>

        {/* === Products === */}
        <TabsContent value="products">
          <Card>
            <CardContent className="pt-6">
              <ProductsTab brands={brands} categories={categories} devices={devices} attributes={attributes} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Details === */}
        <TabsContent value="details">
          <Tabs defaultValue="brands" className="w-full">
            <TabsList className="grid w-full grid-cols-6 h-auto mb-6">
              <TabsTrigger value="brands" className="text-xs py-2">Thương hiệu</TabsTrigger>
              <TabsTrigger value="categories" className="text-xs py-2">Danh mục</TabsTrigger>
              <TabsTrigger value="devices" className="text-xs py-2">Thiết bị</TabsTrigger>
              <TabsTrigger value="attributes" className="text-xs py-2">Thuộc tính</TabsTrigger>
              <TabsTrigger value="compatibility" className="text-xs py-2">Tương thích</TabsTrigger>
              <TabsTrigger value="prodAttributes" className="text-xs py-2">Thuộc tính SP</TabsTrigger>
            </TabsList>

            {/* === Brands === */}
            <TabsContent value="brands">
              <Card>
                <CardContent className="pt-6">
                  <GenericCrudTab<Brand>
                    title="Thương hiệu"
                    searchField="name"
                    columns={[
                      { key: 'name', label: 'Tên' },
                      { key: 'description', label: 'Mô tả' },
                      { key: 'logoUrl', label: 'Logo URL', render: (b) => b.logoUrl ? <img src={b.logoUrl} className="w-8 h-8 rounded" onError={e => (e.currentTarget.style.display = 'none')} /> : '-' },
                    ]}
                    fields={[
                      { key: 'name', label: 'Tên thương hiệu', type: 'text', required: true },
                      { key: 'description', label: 'Mô tả', type: 'textarea' },
                      { key: 'logoUrl', label: 'URL Logo', type: 'text', placeholder: 'https://...' },
                    ]}
                    fetchAll={() => brandService.getAll()}
                    onCreate={(data) => brandService.create(data)}
                    onUpdate={(id, data) => brandService.update(id, data)}
                    onDelete={(id) => brandService.delete(id)}
                    getFormDefaults={() => ({ name: '', description: '', logoUrl: '' })}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* === Categories === */}
            <TabsContent value="categories">
              <Card>
                <CardContent className="pt-6">
                  <CategoriesTab />
                </CardContent>
              </Card>
            </TabsContent>

            {/* === Devices === */}
            <TabsContent value="devices">
              <Card>
                <CardContent className="pt-6">
                  <GenericCrudTab<ApiDevice>
                    title="Thiết bị"
                    searchField="name"
                    columns={[
                      { key: 'name', label: 'Tên' },
                      { key: 'description', label: 'Mô tả' },
                    ]}
                    fields={[
                      { key: 'name', label: 'Tên thiết bị', type: 'text', required: true },
                      { key: 'description', label: 'Mô tả', type: 'textarea', required: true },
                    ]}
                    fetchAll={() => deviceService.getAll()}
                    onCreate={(data) => deviceService.create(data)}
                    onUpdate={(id, data) => deviceService.update(id, data)}
                    onDelete={(id) => deviceService.delete(id)}
                    getFormDefaults={() => ({ name: '', description: '' })}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* === Attributes === */}
            <TabsContent value="attributes">
              <Card>
                <CardContent className="pt-6">
                  <GenericCrudTab<ApiAttribute>
                    title="Thuộc tính"
                    searchField="name"
                    columns={[
                      { key: 'name', label: 'Tên' },
                      { key: 'dataType', label: 'Đơn vị' },
                    ]}
                    fields={[
                      { key: 'name', label: 'Tên thuộc tính', type: 'text', required: true },
                      { key: 'dataType', label: 'Đơn vị', type: 'text', required: true, placeholder: 'VD: inch, mm, mAh, gram...' },
                    ]}
                    fetchAll={() => attributeService.getAll()}
                    onCreate={(data) => attributeService.create(data)}
                    onUpdate={(id, data) => attributeService.update(id, data)}
                    onDelete={(id) => attributeService.delete(id)}
                    getFormDefaults={() => ({ name: '', dataType: '' })}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* === ProductCompatibility === */}
            <TabsContent value="compatibility">
              <Card>
                <CardContent className="pt-6">
                  <ProductCompatibilityTab
                    products={products}
                    devices={devices}
                    allCompatibilities={compatibilities}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* === ProductAttributes === */}
            <TabsContent value="prodAttributes">
              <Card>
                <CardContent className="pt-6">
                  <ProductAttributesTab
                    products={products}
                    attributes={attributes}
                    allAttributes={productAttributes}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffProducts;

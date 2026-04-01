import { useState, useEffect, useCallback } from "react";
import { promotionApi, Promotion, CreatePromotionPayload } from "@/services/PromotionService";
import { productApi, ApiProduct } from "@/services/ProductService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
import { Plus, Pencil, Trash2, Search, Loader2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const StaffPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<CreatePromotionPayload>({
    productId: "",
    name: "",
    discountValue: 0,
    isPercentage: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  });

  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await promotionApi.getAll();
      setPromotions(data);
    } catch (err) {
      console.error("Failed to fetch promotions:", err);
      toast({ title: "Lỗi", description: "Không thể tải khuyến mãi", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productApi.getAll();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
  }, [fetchPromotions, fetchProducts]);

  const filteredPromotions = promotions.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || productId.slice(0, 8);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenAdd = () => {
    setEditingPromotion(null);
    setFormData({
      productId: "",
      name: "",
      discountValue: 0,
      isPercentage: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      productId: promotion.productId,
      name: promotion.name,
      discountValue: promotion.discountValue,
      isPercentage: promotion.isPercentage,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      isActive: promotion.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.productId || !formData.name || formData.discountValue <= 0) {
      toast({ title: "Lỗi", description: "Điền đầy đủ thông tin bắt buộc", variant: "destructive" });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({ title: "Lỗi", description: "Vui lòng chọn ngày bắt đầu và kết thúc", variant: "destructive" });
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast({ title: "Lỗi", description: "Ngày kết thúc phải sau ngày bắt đầu", variant: "destructive" });
      return;
    }

    if (formData.isPercentage && (formData.discountValue > 100 || formData.discountValue < 0)) {
      toast({ title: "Lỗi", description: "Phần trăm giảm giá phải từ 0 đến 100", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (editingPromotion) {
        await promotionApi.update(editingPromotion.id, formData);
        toast({ title: "Thành công", description: "Đã cập nhật khuyến mãi" });
      } else {
        await promotionApi.create(formData);
        toast({ title: "Thành công", description: "Đã tạo khuyến mãi mới" });
      }
      setIsDialogOpen(false);
      await fetchPromotions();
    } catch (err: any) {
      console.error("Save promotion failed:", err);
      toast({ title: "Lỗi", description: err?.message || "Không thể lưu khuyến mãi", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa khuyến mãi này?")) return;
    try {
      await promotionApi.delete(id);
      toast({ title: "Thành công", description: "Đã xóa khuyến mãi" });
      await fetchPromotions();
    } catch (err) {
      console.error("Delete promotion failed:", err);
      toast({ title: "Lỗi", description: "Không thể xóa khuyến mãi", variant: "destructive" });
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      await promotionApi.update(promotion.id, { ...promotion, isActive: !promotion.isActive });
      toast({ title: "Thành công", description: `Đã ${promotion.isActive ? "tắt" : "bật"} khuyến mãi` });
      await fetchPromotions();
    } catch (err) {
      console.error("Toggle promotion failed:", err);
      toast({ title: "Lỗi", description: "Không thể cập nhật trạng thái", variant: "destructive" });
    }
  };

  const isPromotionExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Quản lý Khuyến mãi</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khuyến mãi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{filteredPromotions.length} khuyến mãi</span>
              <Button onClick={handleOpenAdd} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Thêm khuyến mãi
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
                    <TableHead>Tên khuyến mãi</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Mức giảm</TableHead>
                    <TableHead>Ngày bắt đầu</TableHead>
                    <TableHead>Ngày kết thúc</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right w-[140px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.map((promotion) => {
                    const expired = isPromotionExpired(promotion.endDate);
                    const isCurrentlyActive = promotion.isActive && !expired;

                    return (
                      <TableRow key={promotion.id}>
                        <TableCell className="font-medium">{promotion.name}</TableCell>
                        <TableCell>{getProductName(promotion.productId)}</TableCell>
                        <TableCell>
                          <Badge variant={promotion.isPercentage ? "default" : "secondary"}>
                            {promotion.isPercentage
                              ? `${promotion.discountValue}%`
                              : `${promotion.discountValue.toLocaleString("vi-VN")}đ`}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(promotion.startDate)}</TableCell>
                        <TableCell className="text-sm">
                          <span className={expired ? "text-red-500" : ""}>
                            {formatDate(promotion.endDate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-between gap-3 rounded-xl border bg-card/70 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${
                                isCurrentlyActive ? "bg-emerald-500" : expired ? "bg-red-500" : "bg-slate-400"
                              }`} />
                              <span className={`text-xs font-medium ${
                                isCurrentlyActive ? "text-emerald-600" : expired ? "text-red-600" : "text-muted-foreground"
                              }`}>
                                {isCurrentlyActive ? "Đang áp dụng" : expired ? "Đã hết hạn" : "Tạm dừng"}
                              </span>
                            </div>
                            <Switch
                              checked={promotion.isActive}
                              onCheckedChange={() => handleToggleActive(promotion)}
                              aria-label="Chuyển trạng thái khuyến mãi"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenEdit(promotion)}
                              title="Chỉnh sửa"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(promotion.id)}
                              title="Xóa"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredPromotions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Chưa có khuyến mãi nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Promotion Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? "Sửa khuyến mãi" : "Tạo khuyến mãi mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Product Selection */}
            <div className="grid gap-2">
              <Label>Sản phẩm áp dụng *</Label>
              <Select
                value={formData.productId}
                onValueChange={(v) => setFormData({ ...formData, productId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sản phẩm..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Promotion Name */}
            <div className="grid gap-2">
              <Label>Tên khuyến mãi *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Giảm giá 30% nhân dịp 8/3"
              />
            </div>

            {/* Discount Type and Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Loại giảm giá</Label>
                <Select
                  value={formData.isPercentage ? "percentage" : "fixed"}
                  onValueChange={(v) => setFormData({ ...formData, isPercentage: v === "percentage" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định (đ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>
                  Giá trị giảm {formData.isPercentage ? "(%)" : "(VNĐ)"} *
                </Label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: Number(e.target.value) })
                  }
                  min={0}
                  max={formData.isPercentage ? 100 : undefined}
                  placeholder={formData.isPercentage ? "0 - 100" : "VD: 50000"}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ngày bắt đầu *</Label>
                <Input
                  type="datetime-local"
                  value={formData.startDate.slice(0, 16)}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: new Date(e.target.value).toISOString() })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Ngày kết thúc *</Label>
                <Input
                  type="datetime-local"
                  value={formData.endDate.slice(0, 16)}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: new Date(e.target.value).toISOString() })
                  }
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="rounded-xl border bg-card/70 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Trạng thái hoạt động</p>
                  <p className="text-xs text-muted-foreground">
                    Bật để kích hoạt khuyến mãi ngay lập tức
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  aria-label="Kích hoạt khuyến mãi"
                />
              </div>
            </div>

            {/* Preview */}
            {formData.discountValue > 0 && (
              <div className="rounded-lg border bg-primary/5 px-4 py-3">
                <p className="text-sm text-muted-foreground">Preview:</p>
                <p className="font-medium">
                  Giảm{" "}
                  {formData.isPercentage
                    ? `${formData.discountValue}%`
                    : `${formData.discountValue.toLocaleString("vi-VN")}đ`}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPromotion ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffPromotions;

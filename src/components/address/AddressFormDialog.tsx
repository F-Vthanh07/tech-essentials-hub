import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  VietnamProvince,
  VietnamDistrict,
  VietnamWard,
  vietnamLocationService,
} from "@/services/VietnamLocationService";
import { addressService, CreateAddressRequest, ApiAddress } from "@/services/AddressService";
import { SavedAddress } from "@/types/user";

interface AddressFormState {
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  streetAddress: string;
}

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (address: SavedAddress) => void;
  userId?: string;
  initialAddress?: SavedAddress | null;
}

const buildEmptyForm = (): AddressFormState => ({
  provinceCode: "",
  districtCode: "",
  wardCode: "",
  streetAddress: "",
});

export const AddressFormDialog = ({
  open,
  onOpenChange,
  onSaved,
  userId,
  initialAddress,
}: AddressFormDialogProps) => {
  const [form, setForm] = useState<AddressFormState>(buildEmptyForm());
  const [locationData, setLocationData] = useState<Record<string, VietnamProvince> | null>(null);
  const [provinces, setProvinces] = useState<VietnamProvince[]>([]);
  const [districts, setDistricts] = useState<VietnamDistrict[]>([]);
  const [wards, setWards] = useState<VietnamWard[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loadedInitialRef = useRef(false);

  useEffect(() => {
    if (open && !locationData) {
      setIsLoadingLocations(true);
      vietnamLocationService.loadAll().then((data) => {
        setLocationData(data);
        setProvinces(vietnamLocationService.getProvinces(data));
        setIsLoadingLocations(false);
      });
    }
  }, [open, locationData]);

  useEffect(() => {
    if (!open) return;
    if (initialAddress) {
      setForm({
        provinceCode: initialAddress.provinceCode || "",
        districtCode: initialAddress.districtCode || "",
        wardCode: initialAddress.wardCode || "",
        streetAddress: initialAddress.address || "",
      });

      if (initialAddress.provinceCode && locationData) {
        setDistricts(
          vietnamLocationService.getDistricts(locationData, initialAddress.provinceCode)
        );
      }
      if (initialAddress.provinceCode && initialAddress.districtCode && locationData) {
        setWards(
          vietnamLocationService.getWards(
            locationData,
            initialAddress.provinceCode,
            initialAddress.districtCode
          )
        );
      }
    } else {
      setForm(buildEmptyForm());
      setDistricts([]);
      setWards([]);
    }
    loadedInitialRef.current = !!initialAddress;
  }, [open, initialAddress, locationData]);

  useEffect(() => {
    if (!form.provinceCode || !locationData || loadedInitialRef.current) {
      loadedInitialRef.current = false;
      setDistricts([]);
      setForm((prev) => ({ ...prev, districtCode: "", wardCode: "" }));
      return;
    }
    setDistricts(vietnamLocationService.getDistricts(locationData, form.provinceCode));
    setForm((prev) => ({ ...prev, districtCode: "", wardCode: "" }));
    setWards([]);
  }, [form.provinceCode, locationData]);

  useEffect(() => {
    if (!form.provinceCode || !form.districtCode || !locationData) {
      setWards([]);
      setForm((prev) => ({ ...prev, wardCode: "" }));
      return;
    }
    setWards(
      vietnamLocationService.getWards(locationData, form.provinceCode, form.districtCode)
    );
    setForm((prev) => ({ ...prev, wardCode: "" }));
  }, [form.districtCode, form.provinceCode, locationData]);

  const handleProvinceChange = (value: string) => {
    setForm((prev) => ({ ...prev, provinceCode: value }));
  };

  const handleDistrictChange = (value: string) => {
    setForm((prev) => ({ ...prev, districtCode: value }));
  };

  const handleWardChange = (value: string) => {
    setForm((prev) => ({ ...prev, wardCode: value }));
  };

  const getProvinceName = useCallback(
    (code: string) => {
      if (!locationData) return "";
      return vietnamLocationService.getProvinceName(locationData, code);
    },
    [locationData]
  );

  const getDistrictName = useCallback(
    (provinceCode: string, districtCode: string) => {
      if (!locationData) return "";
      return vietnamLocationService.getDistrictName(locationData, provinceCode, districtCode);
    },
    [locationData]
  );

  const getWardName = useCallback(
    (provinceCode: string, districtCode: string, wardCode: string) => {
      if (!locationData) return "";
      return vietnamLocationService.getWardName(locationData, provinceCode, districtCode, wardCode);
    },
    [locationData]
  );

  const handleSave = async () => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập trước");
      return;
    }

    if (!form.provinceCode || !form.districtCode || !form.wardCode) {
      toast.error("Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã");
      return;
    }
    if (!form.streetAddress) {
      toast.error("Vui lòng nhập địa chỉ chi tiết");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateAddressRequest = {
        accountId: userId,
        provinceCode: form.provinceCode,
        districtCode: form.districtCode,
        wardCode: form.wardCode,
        streetAddress: form.streetAddress,
      };

      let result: ApiAddress;
      if (initialAddress?.id) {
        result = await addressService.update(initialAddress.id, payload);
      } else {
        result = await addressService.create(payload);
      }

      const savedAddress: SavedAddress = {
        id: result.id,
        fullName: "",
        phone: "",
        province: getProvinceName(form.provinceCode),
        district: getDistrictName(form.provinceCode, form.districtCode),
        ward: getWardName(form.provinceCode, form.districtCode, form.wardCode),
        address: form.streetAddress,
        isDefault: result.isDefault ?? false,
        provinceCode: form.provinceCode,
        districtCode: form.districtCode,
        wardCode: form.wardCode,
      };

      toast.success(initialAddress?.id ? "Cập nhật địa chỉ thành công!" : "Tạo địa chỉ thành công!");
      onSaved?.(savedAddress);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Lưu địa chỉ thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {initialAddress?.id ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
          </DialogTitle>
        </DialogHeader>

        {isLoadingLocations ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4">

            <div className="space-y-2">
              <Label>Tỉnh/Thành phố *</Label>
              <Select value={form.provinceCode} onValueChange={handleProvinceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quận/Huyện *</Label>
              <Select
                value={form.districtCode}
                onValueChange={handleDistrictChange}
                disabled={!form.provinceCode}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !form.provinceCode
                        ? "Chọn tỉnh trước"
                        : districts.length === 0
                        ? "Đang tải..."
                        : "Chọn quận/huyện"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.code} value={d.code}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Phường/Xã *</Label>
              <Select
                value={form.wardCode}
                onValueChange={handleWardChange}
                disabled={!form.districtCode}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !form.districtCode
                        ? "Chọn quận trước"
                        : wards.length === 0
                        ? "Đang tải..."
                        : "Chọn phường/xã"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((w) => (
                    <SelectItem key={w.code} value={w.code}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Địa chỉ chi tiết *</Label>
              <Input
                value={form.streetAddress}
                onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                placeholder="Số nhà, tên đường..."
              />
            </div>


          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="brand" onClick={handleSave} disabled={isSubmitting || isLoadingLocations}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialAddress?.id ? "Cập nhật" : "Tạo địa chỉ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

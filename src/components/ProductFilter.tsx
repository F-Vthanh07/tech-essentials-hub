import { useState, useEffect } from "react";
import { brandService } from "@/services/BrandService";
import { Brand } from "@/services/BrandService";
import { categoryService } from "@/services/CategoryService";
import { deviceService } from "@/services/DeviceService";
import { ApiCategory, ApiDevice } from "@/types/product";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { brands, categories, devices } from "@/data/products";
import { FilterState } from "@/types/product";

interface ProductFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const ProductFilter = ({ filters, onFilterChange }: ProductFilterProps) => {
  const [openSections, setOpenSections] = useState<string[]>(["brands", "categories"]);
  const [apiBrands, setApiBrands] = useState<Brand[]>([]);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [apiDevices, setApiDevices] = useState<ApiDevice[]>([]);

  const displayBrands = apiBrands.length > 0
    ? apiBrands.filter((brand, index, arr) => arr.findIndex(b => b.name === brand.name) === index)
    : brands;
  const displayCategories = apiCategories.length > 0
    ? apiCategories
        .map(c => ({ id: c.id, name: c.name, icon: 'Smartphone' }))
        .filter((cat, index, arr) => arr.findIndex(c => c.name === cat.name) === index)
    : categories;
  const displayDevices = apiDevices.length > 0
    ? apiDevices.map(d => d.name)
    : devices;

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [brandsData, categoriesData, devicesData] = await Promise.all([
          brandService.getAll(),
          categoryService.getAll(),
          deviceService.getAll(),
        ]);
        if (brandsData.length > 0) setApiBrands(brandsData);
        if (categoriesData.length > 0) setApiCategories(categoriesData);
        if (devicesData.length > 0) setApiDevices(devicesData);
      } catch (err) {
        console.warn('Failed to fetch filter data from API', err);
      }
    };
    fetchFilters();
  }, []);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const toggleBrand = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: newBrands });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const toggleDevice = (device: string) => {
    const newDevices = filters.devices.includes(device)
      ? filters.devices.filter((d) => d !== device)
      : [...filters.devices, device];
    onFilterChange({ ...filters, devices: newDevices });
  };

  const clearFilters = () => {
    onFilterChange({
      brands: [],
      categories: [],
      devices: [],
      priceRange: [0, 10000000],
    });
  };

  const activeFiltersCount =
    filters.brands.length + filters.categories.length + filters.devices.length;

  const FilterContent = () => (
    <div className="space-y-6">
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Đang lọc ({activeFiltersCount})
          </span>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Xóa tất cả
          </Button>
        </div>
      )}

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.brands.map((brand) => (
            <Badge key={brand} variant="secondary" className="gap-1">
              {brand}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleBrand(brand)}
              />
            </Badge>
          ))}
          {filters.categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1">
              {displayCategories.find((c) => c.id === cat)?.name || cat}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleCategory(cat)}
              />
            </Badge>
          ))}
          {filters.devices.map((device) => (
            <Badge key={device} variant="secondary" className="gap-1">
              {device}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => toggleDevice(device)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Brands */}
      <Collapsible
        open={openSections.includes("brands")}
        onOpenChange={() => toggleSection("brands")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
          Thương hiệu
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              openSections.includes("brands") ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {displayBrands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
            >
              <Checkbox
                checked={filters.brands.includes(brand.name || '')}
                onCheckedChange={() => toggleBrand(brand.name || '')}
              />
              <span className="text-sm">{brand.name}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Categories */}
      <Collapsible
        open={openSections.includes("categories")}
        onOpenChange={() => toggleSection("categories")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
          Loại sản phẩm
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              openSections.includes("categories") ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {displayCategories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
            >
              <Checkbox
                checked={filters.categories.includes(cat.id) || filters.categories.includes(cat.name)}
                onCheckedChange={() => toggleCategory(cat.name)}
              />
              <span className="text-sm">{cat.name}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Devices */}
      <Collapsible
        open={openSections.includes("devices")}
        onOpenChange={() => toggleSection("devices")}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
          Thiết bị
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              openSections.includes("devices") ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2 max-h-48 overflow-y-auto">
          {displayDevices.map((device) => (
            <label
              key={device}
              className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
            >
              <Checkbox
                checked={filters.devices.includes(device)}
                onCheckedChange={() => toggleDevice(device)}
              />
              <span className="text-sm">{device}</span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <>
      {/* Desktop filter */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-32 bg-card rounded-xl p-6 card-shadow">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Bộ lọc
          </h3>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile filter */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Lọc
            {activeFiltersCount > 0 && (
              <Badge className="ml-1">{activeFiltersCount}</Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Bộ lọc sản phẩm
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProductFilter;

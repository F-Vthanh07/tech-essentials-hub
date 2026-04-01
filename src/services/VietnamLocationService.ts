export interface VietnamWard {
  code: string;
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  parent_code: string;
}

export interface VietnamDistrict {
  code: string;
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  parent_code: string;
  "xa-phuong": Record<string, VietnamWard>;
}

export interface VietnamProvince {
  code: string;
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  "quan-huyen": Record<string, VietnamDistrict>;
}

type TreeData = Record<string, VietnamProvince>;

let cachedData: TreeData | null = null;

export const vietnamLocationService = {
  async loadAll(): Promise<TreeData> {
    if (cachedData) return cachedData;
    const res = await fetch("/data/tree.json");
    const raw = await res.json();
    cachedData = raw;
    return cachedData!;
  },

  getProvinces(data: TreeData | null): VietnamProvince[] {
    if (!data) return [];
    return Object.values(data).sort((a, b) => a.name.localeCompare(b.name));
  },

  getDistricts(data: TreeData | null, provinceCode: string): VietnamDistrict[] {
    if (!data || !provinceCode) return [];
    const province = data[provinceCode];
    if (!province) return [];
    const districts = province["quan-huyen"];
    if (!districts) return [];
    return Object.values(districts).sort((a, b) => a.name.localeCompare(b.name));
  },

  getWards(data: TreeData | null, provinceCode: string, districtCode: string): VietnamWard[] {
    if (!data || !provinceCode || !districtCode) return [];
    const province = data[provinceCode];
    if (!province) return [];
    const districts = province["quan-huyen"];
    if (!districts) return [];
    const district = districts[districtCode];
    if (!district) return [];
    const wards = district["xa-phuong"];
    if (!wards) return [];
    return Object.values(wards).sort((a, b) => a.name.localeCompare(b.name));
  },

  getProvinceName(data: TreeData | null, provinceCode: string): string {
    if (!data || !provinceCode) return "";
    return data[provinceCode]?.name || "";
  },

  getDistrictName(data: TreeData | null, provinceCode: string, districtCode: string): string {
    if (!data || !provinceCode || !districtCode) return "";
    return data[provinceCode]?.["quan-huyen"]?.[districtCode]?.name || "";
  },

  getWardName(data: TreeData | null, provinceCode: string, districtCode: string, wardCode: string): string {
    if (!data || !provinceCode || !districtCode || !wardCode) return "";
    return data[provinceCode]?.["quan-huyen"]?.[districtCode]?.["xa-phuong"]?.[wardCode]?.name || "";
  },
};

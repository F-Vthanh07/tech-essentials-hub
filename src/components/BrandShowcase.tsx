import { useState, useEffect } from "react";
import { brandService } from "@/services/BrandService";
import { Brand } from "@/services/BrandService";

const BrandShowcase = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandService.getAll();
        setBrands(data);
      } catch (err) {
        console.warn('Failed to fetch brands', err);
        // Fallback: set empty or default brands
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrands();
  }, []);

  if (isLoading) return null;

  return (
    <section className="py-8 border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between flex-wrap gap-6 md:gap-8">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Thương hiệu nổi bật
          </span>
          <div className="flex items-center gap-8 md:gap-12 flex-wrap">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="text-xl md:text-2xl font-bold text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              >
                {brand.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;

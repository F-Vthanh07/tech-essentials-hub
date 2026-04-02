import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { brandService, Brand } from "@/services/BrandService";
import { Loader2 } from "lucide-react";

const BrandShowcase = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    brandService
      .getAll()
      .then((data) => {
        if (data && data.length > 0) {
          setBrands(data);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch brands", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <section className="py-10 md:py-14 border-b border-border">
        <div className="container flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (brands.length === 0) return null;

  return (
    <section className="py-10 md:py-14 border-b border-border">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Thương hiệu nổi bật</h2>
          <p className="text-muted-foreground mt-1">
            Các thương hiệu phụ kiện công nghệ hàng đầu thế giới
          </p>
        </div>
        <div className="flex items-center justify-center flex-wrap gap-10 md:gap-16">
          {brands.map((brand) => {
            const logoSrc = brand.logoUrl || brand.logo || "";
            return (
              <Link
                key={brand.id}
                to="/brands"
                className="flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-secondary flex items-center justify-center p-3 transition-all group-hover:bg-primary/10 group-hover:scale-110 overflow-hidden">
                  {logoSrc ? (
                    <img
                      src={logoSrc}
                      alt={brand.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector("span")) {
                          const span = document.createElement("span");
                          span.className = "text-2xl font-bold text-primary";
                          span.textContent = (brand.name || "?").charAt(0);
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {(brand.name || "?").charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  {brand.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;

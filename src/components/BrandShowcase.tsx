import { brands } from "@/data/products";

const BrandShowcase = () => {
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

const FEATURED_BRANDS = [
  {
    name: "Apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  },
  {
    name: "Samsung",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
  },
  {
    name: "Anker",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Anker_company_logo.svg",
  },
  {
    name: "Spigen",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/14/Spigen_logo.svg",
  },
  {
    name: "UAG",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/UAG_Logo.svg/1200px-UAG_Logo.svg.png",
  },
  {
    name: "Belkin",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Belkin_logo.svg/1200px-Belkin_logo.svg.png",
  },
];

const BrandShowcase = () => {
  return (
    <section className="py-10 md:py-14 border-b border-border">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Thương hiệu nổi bật</h2>
          <p className="text-muted-foreground mt-1">Các thương hiệu phụ kiện công nghệ hàng đầu thế giới</p>
        </div>
        <div className="flex items-center justify-center flex-wrap gap-10 md:gap-16">
          {FEATURED_BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-secondary flex items-center justify-center p-3 transition-all group-hover:bg-primary/10 group-hover:scale-110">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-contain dark:invert"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;

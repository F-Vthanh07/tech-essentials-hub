import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    title: "UAG Monarch Pro",
    subtitle: "Bảo vệ tối thượng cho iPhone 16",
    description: "Chống sốc chuẩn quân đội MIL-STD 810G. Thiết kế cao cấp với sợi carbon thật.",
    cta: "Khám phá ngay",
    bgColor: "from-zinc-900 to-zinc-800",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=600&fit=crop",
    brand: "UAG",
  },
  {
    id: 2,
    title: "Anker GaN Technology",
    subtitle: "Sạc nhanh - Sạc thông minh",
    description: "Công nghệ GaN tiên tiến. Nhỏ gọn hơn 50%, mạnh mẽ hơn 2 lần.",
    cta: "Mua ngay",
    bgColor: "from-blue-900 to-blue-800",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop",
    brand: "Anker",
  },
  {
    id: 3,
    title: "Tomtoc Defender Series",
    subtitle: "Balo & Túi chống sốc",
    description: "Bảo vệ 360° cho laptop và phụ kiện. Chất liệu cao cấp, thiết kế hiện đại.",
    cta: "Xem bộ sưu tập",
    bgColor: "from-emerald-900 to-emerald-800",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop",
    brand: "Tomtoc",
  },
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl mx-4 mt-4 md:mx-0 md:mt-0">
      <div className="relative h-[400px] md:h-[500px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor}`} />
            <div className="absolute inset-0 bg-black/20" />
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full object-cover opacity-40 md:opacity-60"
            />
            <div className="relative h-full container flex items-center">
              <div className="max-w-lg text-primary-foreground">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-sm font-medium mb-4">
                  {slide.brand}
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mb-2 animate-fade-in-up">
                  {slide.title}
                </h2>
                <p className="text-xl md:text-2xl font-medium mb-4 opacity-90">
                  {slide.subtitle}
                </p>
                <p className="text-sm md:text-base opacity-80 mb-6 max-w-md">
                  {slide.description}
                </p>
                <Button variant="hero" size="lg">
                  {slide.cta}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-background/40 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-background/40 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-primary-foreground w-8"
                : "bg-primary-foreground/50 hover:bg-primary-foreground/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;

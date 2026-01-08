import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const articles = [
  {
    id: 1,
    title: "Review UAG Monarch Pro: Ốp lưng chống sốc cao cấp nhất cho iPhone 16",
    excerpt: "Trải nghiệm thực tế với ốp lưng UAG Monarch Pro, sản phẩm cao cấp nhất trong dòng bảo vệ điện thoại...",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=400&fit=crop",
    date: "08/01/2026",
    readTime: "5 phút",
    category: "Review",
  },
  {
    id: 2,
    title: "So sánh Anker vs Belkin: Đâu là sự lựa chọn sạc tốt nhất?",
    excerpt: "Hai ông lớn trong ngành phụ kiện sạc, đâu là sự lựa chọn phù hợp cho bạn?...",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop",
    date: "07/01/2026",
    readTime: "8 phút",
    category: "So sánh",
  },
  {
    id: 3,
    title: "Top 5 phụ kiện must-have cho Apple Watch Ultra 2",
    excerpt: "Những phụ kiện không thể thiếu để tận dụng tối đa chiếc Apple Watch Ultra 2 của bạn...",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=400&fit=crop",
    date: "06/01/2026",
    readTime: "4 phút",
    category: "Gợi ý",
  },
];

const TechNews = () => {
  return (
    <section className="py-12 md:py-16 bg-secondary/50">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Bản tin công nghệ</h2>
            <p className="text-muted-foreground mt-1">
              Đánh giá chi tiết, so sánh & gợi ý sản phẩm
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex gap-2">
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <article
              key={article.id}
              className="group bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover transition-all cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {article.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{article.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Button variant="outline" className="gap-2">
            Xem tất cả bài viết
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TechNews;

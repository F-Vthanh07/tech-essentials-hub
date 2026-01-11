import { useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, Calendar, ArrowRight, Clock, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TechNewsPage = () => {
  const [cartCount] = useState(0);

  const newsArticles = [
    {
      id: 1,
      title: "Apple ra mắt iPhone 16 với chip A18 mạnh mẽ nhất",
      excerpt: "Apple vừa chính thức công bố dòng iPhone 16 với nhiều cải tiến đột phá về hiệu năng và camera...",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
      category: "Smartphone",
      date: "10/01/2026",
      author: "Tech Editor",
      views: 15420,
      readTime: "5 phút",
    },
    {
      id: 2,
      title: "Samsung Galaxy S25 Ultra: Camera 200MP ấn tượng",
      excerpt: "Samsung giới thiệu Galaxy S25 Ultra với cảm biến camera 200MP và khả năng zoom quang học 10x...",
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
      category: "Smartphone",
      date: "09/01/2026",
      author: "Mobile Expert",
      views: 12350,
      readTime: "4 phút",
    },
    {
      id: 3,
      title: "Laptop Gaming 2026: Xu hướng và lựa chọn tốt nhất",
      excerpt: "Tổng hợp các laptop gaming đáng mua nhất năm 2026 với RTX 50 series và màn hình 240Hz...",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
      category: "Laptop",
      date: "08/01/2026",
      author: "Gaming Writer",
      views: 8900,
      readTime: "8 phút",
    },
    {
      id: 4,
      title: "Tai nghe không dây: Sony WH-1000XM6 vs Bose 800",
      excerpt: "So sánh chi tiết hai tai nghe chống ồn hàng đầu năm 2026, giúp bạn đưa ra lựa chọn phù hợp...",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      category: "Phụ kiện",
      date: "07/01/2026",
      author: "Audio Expert",
      views: 6540,
      readTime: "6 phút",
    },
    {
      id: 5,
      title: "Smart Home 2026: Tự động hóa ngôi nhà thông minh",
      excerpt: "Hướng dẫn thiết lập hệ thống smart home hoàn chỉnh với các thiết bị thông minh mới nhất...",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
      category: "Smart Home",
      date: "06/01/2026",
      author: "Smart Tech",
      views: 5200,
      readTime: "10 phút",
    },
    {
      id: 6,
      title: "Review iPad Pro M4: Sức mạnh của Mac trong tablet",
      excerpt: "iPad Pro M4 mang đến hiệu năng desktop với thiết kế mỏng nhẹ và màn hình OLED tuyệt đẹp...",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
      category: "Tablet",
      date: "05/01/2026",
      author: "Apple Expert",
      views: 7800,
      readTime: "7 phút",
    },
  ];

  const categories = ["Tất cả", "Smartphone", "Laptop", "Phụ kiện", "Smart Home", "Tablet"];

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={cartCount} />
      
      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span>/</span>
          <span className="text-foreground">Bản tin công nghệ</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Bản Tin Công Nghệ</h1>
        </div>

        {/* Featured Article */}
        <section className="mb-10">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="aspect-video md:aspect-auto">
                <img 
                  src={newsArticles[0].image} 
                  alt={newsArticles[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6 flex flex-col justify-center">
                <Badge className="w-fit mb-3">{newsArticles[0].category}</Badge>
                <h2 className="text-2xl font-bold mb-3">{newsArticles[0].title}</h2>
                <p className="text-muted-foreground mb-4">{newsArticles[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {newsArticles[0].date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {newsArticles[0].readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {newsArticles[0].views.toLocaleString()}
                  </span>
                </div>
                <Button className="w-fit">
                  Đọc tiếp <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>
        </section>

        {/* Category Tabs */}
        <Tabs defaultValue="Tất cả" className="mb-8">
          <TabsList className="mb-6">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsArticles
                  .filter(article => category === "Tất cả" || article.category === category)
                  .map((article) => (
                    <Card key={article.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <CardContent className="p-4">
                        <Badge variant="secondary" className="mb-2">{article.category}</Badge>
                        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                      </CardContent>
                      <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {article.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views.toLocaleString()}
                        </span>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default TechNewsPage;

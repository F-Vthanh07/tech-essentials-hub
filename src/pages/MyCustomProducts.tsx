import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { customProductApi, CustomProduct } from "@/services/CustomeProductService";
import { Loader2, Sparkles } from "lucide-react";

type ParsedDesignConfig = {
  selectedDevice?: string;
  color?: string;
  material?: string;
  quantity?: number;
  designElements?: Array<{ type?: string; content?: string }>;
  totalPrice?: number;
};

function safeJsonParse<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

const MyCustomProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CustomProduct[]>([]);
  // UI pagination: the backend expects `page` query param (1..10)
  const [page, setPage] = useState(1);

  const load = async (p: number) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(true);
    try {
      const data = await customProductApi.getMyCustomProducts(p);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải thiết kế của bạn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page]);

  const hasItems = items.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Thiết kế của tôi
            </h1>
            <p className="text-muted-foreground mt-1">
              Xem các thiết kế bạn đã tạo và trạng thái xử lý.
            </p>
          </div>

          <Button variant="outline" onClick={() => load(page)} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tải...
              </span>
            ) : (
              "Làm mới"
            )}
          </Button>
        </div>

        {!hasItems && !loading ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="font-medium">Bạn chưa có thiết kế nào.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Hãy tạo thiết kế ở trang "Custom ốp lưng".
              </p>
              <Button className="mt-6" onClick={() => navigate("/custom-case")}>
                Tạo thiết kế ngay
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const parsed = safeJsonParse<ParsedDesignConfig>(item.configurationJson);
            const designElementsCount = parsed?.designElements?.length ?? 0;
            const totalPrice = parsed?.totalPrice ?? item.price ?? undefined;

            return (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base line-clamp-2">{item.name || item.id}</CardTitle>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {item.status ? (
                          <Badge variant="secondary">{item.status}</Badge>
                        ) : (
                          <Badge variant="outline">Chưa có trạng thái</Badge>
                        )}
                        {totalPrice !== undefined ? (
                          <Badge variant="default">{Number(totalPrice).toLocaleString("vi-VN")}đ</Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {item.previewUrl ? (
                  <div className="px-4">
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg border bg-muted/30"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.style.display = "none";
                      }}
                    />
                  </div>
                ) : null}

                <CardContent className="pt-3 space-y-3">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium text-foreground">Thiết bị:</span>{" "}
                      {parsed?.selectedDevice || "—"}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Chất liệu:</span>{" "}
                      {parsed?.material || "—"}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Màu:</span>{" "}
                      {parsed?.color || "—"}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Số lượng:</span>{" "}
                      {parsed?.quantity ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Thành phần design:</span>{" "}
                      {designElementsCount}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // Không có trang chi tiết riêng trong scope hiện tại.
                        toast.info("Hiện chưa có màn hình xem chi tiết thiết kế.");
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <Button
                key={n}
                variant={n === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(n)}
                disabled={loading}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyCustomProducts;


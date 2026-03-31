import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { promotionApi, Promotion } from "@/services/PromotionService";

interface PromotionContextType {
  promotions: Promotion[];
  getPromotionByProductId: (productId: string) => Promotion | undefined;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const PromotionContext = createContext<PromotionContextType | undefined>(undefined);

export const usePromotions = () => {
  const context = useContext(PromotionContext);
  if (!context) {
    throw new Error("usePromotions must be used within PromotionProvider");
  }
  return context;
};

export const PromotionProvider = ({ children }: { children: ReactNode }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPromotions = async () => {
    try {
      const data = await promotionApi.getAll();
      setPromotions(data);
    } catch (err) {
      console.warn("Failed to fetch promotions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const getPromotionByProductId = (productId: string): Promotion | undefined => {
    const now = new Date();
    return promotions.find(
      (p) =>
        p.productId === productId &&
        p.isActive &&
        new Date(p.startDate) <= now &&
        new Date(p.endDate) >= now
    );
  };

  const activePromotions = promotions.filter((p) => {
    const now = new Date();
    return p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now;
  });

  return (
    <PromotionContext.Provider
      value={{
        promotions: activePromotions,
        getPromotionByProductId,
        isLoading,
        refetch: fetchPromotions,
      }}
    >
      {children}
    </PromotionContext.Provider>
  );
};

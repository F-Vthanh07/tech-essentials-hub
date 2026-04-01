import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { promotionApi, Promotion } from "@/services/PromotionService";

interface PromotionContextType {
  promotions: Promotion[];
  getPromotionByProductId: (productId: string) => Promotion | undefined;
  getPromotionsByProductId: (productId: string) => Promotion[];
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

  const getPromotionsByProductId = (productId: string): Promotion[] => {
    const now = new Date();
    return promotions.filter(
      (p) =>
        p.productId === productId &&
        p.isActive &&
        new Date(p.startDate) <= now &&
        new Date(p.endDate) >= now
    );
  };

  const getPromotionByProductId = (productId: string): Promotion | undefined => {
    const activeForProduct = getPromotionsByProductId(productId);
    if (activeForProduct.length === 0) return undefined;
    
    // Return the one with the highest discount value if multiple exist
    return activeForProduct.sort((a, b) => b.discountValue - a.discountValue)[0];
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
        getPromotionsByProductId,
        isLoading,
        refetch: fetchPromotions,
      }}
    >
      {children}
    </PromotionContext.Provider>
  );
};

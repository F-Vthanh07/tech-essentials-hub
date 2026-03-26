import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Product, ColorVariant } from '@/types/product';
import { CartItemResponse, cartService } from '@/services/CartService';
import { variantApi } from '@/services/ProductService';

export interface CartItem {
  id: string;
  product: Product;
  selectedColor?: ColorVariant;
  quantity: number;
  variantId?: string;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  selectedItemIds: Set<string>;
  addToCart: (product: Product, quantity?: number, selectedColor?: ColorVariant) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  loadCartFromBackend: () => Promise<void>;
  selectItem: (itemId: string) => void;
  unselectItem: (itemId: string) => void;
  selectAllItems: () => void;
  unselectAllItems: () => void;
  getSelectedItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const addToCart = useCallback((product: Product, quantity: number = 1, selectedColor?: ColorVariant) => {
    setItems((prev) => {
      const itemId = selectedColor 
        ? `${product.id}_${selectedColor.id}` 
        : product.id;
      
      const existingItem = prev.find((item) => item.id === itemId);
      
      if (existingItem) {
        return prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      const variantId = selectedColor?.id || product.variantId;
      return [...prev, { id: itemId, product, selectedColor, quantity, variantId }];
    });
  }, []);

  const removeFromCart = useCallback(async (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setSelectedItemIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });

    const isBackendCartItemId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId);
    if (!isBackendCartItemId) {
      return;
    }

    try {
      await cartService.deleteCartItem(itemId);
    } catch (err) {
      console.warn('Failed to delete cart item', err);
      setItems((prev) => {
        const deletedItem = items.find((item) => item.id === itemId);
        return deletedItem ? [...prev, deletedItem] : prev;
      });
    }
  }, [items]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    const targetItem = items.find((item) => item.id === itemId);
    if (!targetItem) {
      return;
    }

    const previousQuantity = targetItem.quantity;
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );

    const isBackendCartItemId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId);
    const productVariantId = targetItem.variantId || targetItem.selectedColor?.id || targetItem.product.variantId;

    if (!isBackendCartItemId || !productVariantId) {
      return;
    }

    try {
      await cartService.updateCartItem(itemId, {
        productVariantId,
        quantity,
      });
    } catch (err) {
      console.warn('Failed to update cart item quantity', err);
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: previousQuantity } : item
        )
      );
    }
  }, [items, removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    setSelectedItemIds(new Set());
  }, []);

  const selectItem = useCallback((itemId: string) => {
    setSelectedItemIds((prev) => new Set([...prev, itemId]));
  }, []);

  const unselectItem = useCallback((itemId: string) => {
    setSelectedItemIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  const selectAllItems = useCallback(() => {
    setSelectedItemIds(new Set(items.map((item) => item.id)));
  }, [items]);

  const unselectAllItems = useCallback(() => {
    setSelectedItemIds(new Set());
  }, []);

  const getSelectedItems = useCallback(() => {
    return items.filter((item) => selectedItemIds.has(item.id));
  }, [items, selectedItemIds]);

  const getCartCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    return items.reduce((sum, item) => {
      const price = item.selectedColor?.price ?? item.product.price;
      const discount = item.selectedColor?.discount ?? item.product.discount ?? 0;
      const finalPrice = price * (1 - discount / 100);
      return sum + finalPrice * item.quantity;
    }, 0);
  };

  const loadCartFromBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const cartItems = await cartService.getAllCartItemsByUser();
      let variantById = new Map<string, Awaited<ReturnType<typeof variantApi.getById>>>();

      try {
        const variants = await variantApi.getAll();
        variantById = new Map(variants.map((variant) => [variant.id, variant]));
      } catch (variantErr) {
        console.warn('Failed to load variants for cart mapping', variantErr);
      }

      const mappedItems = cartItems.map((response: CartItemResponse): CartItem => {
        const matchedVariant = variantById.get(response.productVariantId);
        const productName = matchedVariant?.productName?.trim() || response.productVariantName;
        const variantName = matchedVariant?.name?.trim() || response.productVariantName;

        const product: Product = {
          id: matchedVariant?.productId || response.productVariantId,
          name: productName,
          price: response.productVariantPrice,
          image: response.productVariantImageUrl,
          brand: '',
          category: '',
          device: matchedVariant?.size || response.productVariantSize,
          rating: 4.5,
          reviewCount: 0,
          variantId: response.productVariantId,
        };

        const colorVariant: ColorVariant = {
          id: response.productVariantId,
          name: variantName,
          colorCode: response.productVariantColor,
          price: response.productVariantPrice,
          image: response.productVariantImageUrl,
        };

        return {
          id: response.id,
          product,
          selectedColor: colorVariant,
          quantity: response.quantity,
          variantId: response.productVariantId,
        };
      });
      setItems(mappedItems);
    } catch (err) {
      console.warn('Failed to load cart from backend', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      items,
      isLoading,
      selectedItemIds,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartCount,
      getCartTotal,
      loadCartFromBackend,
      selectItem,
      unselectItem,
      selectAllItems,
      unselectAllItems,
      getSelectedItems,
    }),
    [items, isLoading, selectedItemIds, addToCart, removeFromCart, updateQuantity, clearCart, selectItem, unselectItem, selectAllItems, unselectAllItems, getSelectedItems, loadCartFromBackend]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

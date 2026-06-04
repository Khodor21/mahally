"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

// ── Types ──────────────────────────────────────────
export interface Product {
  id: string;
  title: string;
  image?: string;
  price?: number;
  rating?: number;
  badge?: string;
  [key: string]: any;
}

export interface CartItem {
  product: Product;
  qty: number;
}

interface ShopContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  favorites: Product[];
  favCount: number;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

const ShopContext = createContext<ShopContextType | null>(null);

const CART_STORAGE_KEY = "shop_cart";
const FAV_STORAGE_KEY = "shop_favorites";

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // ── Hydrate from localStorage ──────────────────────
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const savedFavs = localStorage.getItem(FAV_STORAGE_KEY);

      if (savedCart) setCartItems(JSON.parse(savedCart));
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // ── Persist cart to localStorage ──────────────────────
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    }
  }, [cartItems, isHydrated]);

  // ── Persist favorites to localStorage ──────────────────────
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }
    }
  }, [favorites, isHydrated]);

  // ── Cart Actions ──────────────────────────────────────────
  const addToCart = useCallback((product: Product, qty: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + qty } : i,
        );
      }
      return [...prev, { product, qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateCartQty = useCallback(
    (productId: string, qty: number) => {
      if (qty <= 0) {
        removeFromCart(productId);
        return;
      }
      setCartItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, qty } : i)),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const cartTotal = cartItems.reduce(
    (sum, i) => sum + (i.product.price ?? 0) * i.qty,
    0,
  );

  // ── Favorites Actions ─────────────────────────────────────
  const toggleFavorite = useCallback((product: Product) => {
    setFavorites((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      return exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];
    });
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.some((p) => p.id === productId),
    [favorites],
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const favCount = favorites.length;

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        favorites,
        favCount,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}

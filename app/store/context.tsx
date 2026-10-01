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
  discount_price?: number;
  rating?: number;
  badge?: string;
  variantDescription?: string;
  gift?: boolean;
  review?: any;
  [key: string]: any;
}

export interface VariantSelection {
  id: string;
  value: string;
  stock?: number;
}

export interface CartItem {
  product: Product;
  qty: number;
  variantSelections?: Record<string, VariantSelection>;
}

// NEW: Gift Order Type
export interface GiftOrder {
  items: CartItem[];
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  giftMessage: string;
  giftOccasion: string;
  deliveryDate?: string;
}

interface ShopContextType {
  // Cart
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (
    product: Product,
    qty?: number,
    variantSelections?: Record<string, VariantSelection>,
  ) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  buyNowItem: CartItem | null;
  setBuyNowItem: (
    product: Product,
    qty?: number,
    variantSelections?: Record<string, VariantSelection>,
  ) => void;
  clearBuyNowItem: () => void;
  checkoutItems: CartItem[];
  isBuyNowMode: boolean;

  // NEW: Gift Order
  giftOrder: GiftOrder | null;
  setGiftOrder: (giftOrder: GiftOrder) => void;
  clearGiftOrder: () => void;

  favorites: Product[];
  favCount: number;
  toggleFavorite: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  // Store Configuration
  currencySymbol: string;
  deliveryCost: number;
  paymentMethods: string[];
  orderTotal: number;
  isConfigLoading: boolean;
}

const ShopContext = createContext<ShopContextType | null>(null);
const CART_STORAGE_KEY = "shop_cart";
const FAV_STORAGE_KEY = "shop_favorites";
const BUY_NOW_STORAGE_KEY = "shop_buy_now";
const GIFT_ORDER_STORAGE_KEY = "shop_gift_order"; // NEW

export function ShopProvider({ children }: { children: React.ReactNode }) {
  // ── State ────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [buyNowItem, setBuyNowItemState] = useState<CartItem | null>(null);
  const [giftOrder, setGiftOrderState] = useState<GiftOrder | null>(null); // NEW
  const [isHydrated, setIsHydrated] = useState(false);

  // Store Config State
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [deliveryCost, setDeliveryCost] = useState<number>(0);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([
    "cash_on_delivery",
  ]);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  useEffect(() => {
    async function fetchStoreConfig() {
      try {
        const res = await fetch("/api/storefront/config");
        if (res.ok) {
          const body = await res.json();
          setCurrencySymbol(body.store?.currency_symbol || "$");
          setDeliveryCost(Number(body.store?.delivery_cost) || 0);
          setPaymentMethods(
            body.store?.payment_methods || ["cash_on_delivery"],
          );
        } else {
          console.error("Failed to fetch store config:", res.status);
        }
      } catch (error) {
        console.error("Failed to fetch store configuration:", error);
      } finally {
        setIsConfigLoading(false);
      }
    }
    fetchStoreConfig();
  }, []);

  // ── Hydrate from localStorage ────────────────────────────
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const savedFavs = localStorage.getItem(FAV_STORAGE_KEY);
      if (savedCart) setCartItems(JSON.parse(savedCart));
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      const savedBuyNow = sessionStorage.getItem(BUY_NOW_STORAGE_KEY);
      if (savedBuyNow) setBuyNowItemState(JSON.parse(savedBuyNow));

      // NEW: Load gift order
      const savedGiftOrder = sessionStorage.getItem(GIFT_ORDER_STORAGE_KEY);
      if (savedGiftOrder) setGiftOrderState(JSON.parse(savedGiftOrder));
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // ── Persist to localStorage ──────────────────────────────
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    }
  }, [cartItems, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }
    }
  }, [favorites, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (buyNowItem) {
        sessionStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(buyNowItem));
      } else {
        sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save buy-now item:", error);
    }
  }, [buyNowItem, isHydrated]);

  // NEW: Persist gift order
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (giftOrder) {
        sessionStorage.setItem(
          GIFT_ORDER_STORAGE_KEY,
          JSON.stringify(giftOrder),
        );
      } else {
        sessionStorage.removeItem(GIFT_ORDER_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save gift order:", error);
    }
  }, [giftOrder, isHydrated]);

  // ── Cart Actions ──────────────────────────────────────────
  const addToCart = useCallback(
    (
      product: Product,
      qty: number = 1,
      variantSelections?: Record<string, VariantSelection>,
    ) => {
      setCartItems((prev) => {
        const existing = prev.find((i) => {
          if (i.product.id !== product.id) return false;

          if (
            !variantSelections ||
            Object.keys(variantSelections).length === 0
          ) {
            return (
              !i.variantSelections ||
              Object.keys(i.variantSelections).length === 0
            );
          }

          return (
            JSON.stringify(i.variantSelections) ===
            JSON.stringify(variantSelections)
          );
        });

        if (existing) {
          return prev.map((i) =>
            i === existing ? { ...i, qty: i.qty + qty } : i,
          );
        }

        return [...prev, { product, qty, variantSelections }];
      });
    },
    [],
  );

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

  // ── Buy Now Actions ────────────────────────────────────────
  const setBuyNowItem = useCallback(
    (
      product: Product,
      qty: number = 1,
      variantSelections?: Record<string, VariantSelection>,
    ) => {
      setBuyNowItemState({ product, qty, variantSelections });
    },
    [],
  );

  const clearBuyNowItem = useCallback(() => {
    setBuyNowItemState(null);
  }, []);

  // NEW: Gift Order Actions
  const setGiftOrder = useCallback((giftOrder: GiftOrder) => {
    setGiftOrderState(giftOrder);
  }, []);

  const clearGiftOrder = useCallback(() => {
    setGiftOrderState(null);
  }, []);

  // ── Derived Cart Math ───────
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const cartTotal = cartItems.reduce((sum, i) => {
    const basePrice = Number(i.product.price || 0);
    const discountPrice = Number(i.product.discount_price || 0);
    const hasDiscount = discountPrice > 0 && discountPrice < basePrice;
    const activePrice = hasDiscount ? discountPrice : basePrice;

    return sum + activePrice * i.qty;
  }, 0);

  const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;
  const isBuyNowMode = buyNowItem !== null;

  const orderTotal = cartTotal + deliveryCost;

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

  const removeFromFavorites = useCallback((productId: string) => {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const favCount = favorites.length;

  return (
    <ShopContext.Provider
      value={{
        // Cart
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        // Buy Now
        buyNowItem,
        setBuyNowItem,
        clearBuyNowItem,
        checkoutItems,
        isBuyNowMode,
        // NEW: Gift Order
        giftOrder,
        setGiftOrder,
        clearGiftOrder,
        // Favorites
        favorites,
        favCount,
        toggleFavorite,
        isFavorite,
        removeFromFavorites,
        clearFavorites,
        // Store Config
        currencySymbol,
        deliveryCost,
        paymentMethods,
        orderTotal,
        isConfigLoading,
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

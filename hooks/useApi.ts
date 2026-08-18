"use client";
import { useCallback, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getProducts,
  getOrders,
  getCustomers,
  getCoupons,
  getCategories,
  getStore,
  getHeroBanners,
  createProduct,
  updateProduct,
  deleteProduct,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  updateOrderStatus,
  createCategory,
  updateCategory,
  deleteCategory,
  updateStore,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  toggleHeroBanner,
  reorderHeroBanners,
} from "@/lib/api";

import type {
  Product,
  ProductFormData,
  Order,
  Customer,
  Coupon,
  Category,
  StoreData,
  HeroBanner,
  CouponFormData,
  CategoryFormData,
  HeroBannerFormData,
} from "@/types/api";

export interface VisitorCount {
  id: string;
  store_id: string;
  count_date: string;
  visitor_count: number;
  updated_at: string;
}

// ============================================
// GENERIC FETCH HOOK
// ============================================

export interface UseFetchOptions<T> {
  /** Callback when fetch succeeds */
  onSuccess?: (data: T) => void;
  /** Callback when fetch fails */
  onError?: (error: Error) => void;
  /** Auto-fetch on mount (default: true) */
  skip?: boolean;
}

export interface UseFetchResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
  retry: () => Promise<void>;
}

/**
 * Generic fetch hook - wraps any async function
 * @param fetcher Async function that returns data
 * @param options Configuration
 * @returns { data, loading, error, execute, retry }
 */

export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions<T> = {},
): UseFetchResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const execute = useCallback(async () => {
    if (options.skip) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current();
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [options.skip, options.onSuccess, options.onError]);

  useEffect(() => {
    execute();
  }, [execute]);

  const retry = useCallback(() => execute(), [execute]);

  return { data, loading, error, execute, retry };
}

// ============================================
// PRODUCTS
// ============================================

export function useProducts(options: UseFetchOptions<Product[]> = {}) {
  return useFetch(() => getProducts(), options);
}

export function useProductCreate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (form: ProductFormData) => {
    setLoading(true);
    setError(null);
    try {
      return await createProduct(form);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create product");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

export function useProductUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (id: string, form: ProductFormData) => {
    setLoading(true);
    setError(null);
    try {
      return await updateProduct(id, form);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update product");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

export function useProductDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await deleteProduct(id);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete product");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

// ============================================
// ORDERS (WITH SUPABASE REALTIME WEBSOCKETS & SAFE UNIQUE CHANNELS)
// ============================================

export function useOrders(
  storeId: string,
  options: UseFetchOptions<Order[]> = {},
) {
  return useOrdersRealtime(storeId, options);
}

function useOrdersRealtime(
  storeId: string,
  options: UseFetchOptions<Order[]> = {},
) {
  const [data, setData] = useState<Order[] | undefined>(undefined);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(() => getOrders(storeId));

  useEffect(() => {
    fetcherRef.current = () => getOrders(storeId);
  }, [storeId]);

  const execute = useCallback(async () => {
    if (!storeId || options.skip) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current();
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [storeId, options.skip, options.onSuccess, options.onError]);

  useEffect(() => {
    execute();
  }, [execute]);

  // Setup Supabase Realtime subscription with unique channel naming to prevent duplicate collisions
  useEffect(() => {
    if (!storeId || options.skip) return;

    const uniqueChannelName = `orders-realtime-${storeId}-${Math.random().toString(36).substring(2, 9)}`;
    console.log(
      `[Orders Realtime] Subscribing via channel: ${uniqueChannelName}`,
    );

    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `store_id=eq.${storeId}`,
        },
        async (payload) => {
          console.log("[Orders Realtime] Event payload received:", payload);

          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order;
            try {
              const freshOrders = await getOrders(storeId);
              setData(freshOrders);
            } catch {
              setData((prev) => [newOrder, ...(prev || [])]);
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedOrder = payload.new as Order;
            setData((prev) =>
              (prev || []).map((o) =>
                o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            const deletedOrder = payload.old as { id: string };
            setData((prev) =>
              (prev || []).filter((o) => o.id !== deletedOrder.id),
            );
          }
        },
      )
      .subscribe((status, err) => {
        console.log(`[Orders Realtime] Status: ${status}`, err || "");
      });

    const backupInterval = setInterval(() => {
      fetcherRef
        .current()
        .then((res) => setData(res))
        .catch(() => {});
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(backupInterval);
    };
  }, [storeId, options.skip]);

  const retry = useCallback(() => execute(), [execute]);

  return { data, loading, error, execute, retry };
}

export function useOrderStatusUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (orderId: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      return await updateOrderStatus(orderId, status);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update order");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

// ============================================
// CUSTOMERS
// ============================================

export function useCustomers(options: UseFetchOptions<Customer[]> = {}) {
  return useFetch(() => getCustomers(), options);
}

// ============================================
// COUPONS
// ============================================

export function useCoupons(options: UseFetchOptions<Coupon[]> = {}) {
  return useFetch(() => getCoupons(), options);
}

export const useCouponCreate = () => {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (payload: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const json = await response.json();
      return json.data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading };
};

export const useCouponUpdate = () => {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (couponId: string, payload: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponId,
          ...payload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const json = await response.json();
      return json.data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading };
};

export const useCouponDelete = () => {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (couponId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/coupons?couponId=${encodeURIComponent(couponId)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      return await response.json();
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading };
};

export const useCouponToggle = () => {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (couponId: string, isActive: boolean) => {
    setLoading(true);
    try {
      const response = await fetch("/api/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponId,
          isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const json = await response.json();
      return json.data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading };
};

// ============================================
// CATEGORIES
// ============================================

export function useCategories(
  storeId: string,
  options: UseFetchOptions<Category[]> = {},
) {
  return useFetch(() => getCategories(storeId), options);
}

export function useCategoryCreate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (storeId: string, form: CategoryFormData) => {
      setLoading(true);
      setError(null);
      try {
        return await createCategory(storeId, form);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create category");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { execute, loading, error };
}

export function useCategoryUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (categoryId: string, form: CategoryFormData) => {
      setLoading(true);
      setError(null);
      try {
        return await updateCategory(categoryId, form);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update category");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { execute, loading, error };
}

export function useCategoryDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (categoryId: string, storeId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCategory(categoryId, storeId);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete category");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

// ============================================
// STORE
// ============================================

export function useStore(options: UseFetchOptions<StoreData> = {}) {
  return useFetch(() => getStore(), options);
}

export function useStoreUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (updates: Partial<StoreData>) => {
    setLoading(true);
    setError(null);
    try {
      return await updateStore(updates);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update store");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

// ============================================
// HERO BANNERS
// ============================================

export function useHeroBanners(
  storeId: string,
  options: UseFetchOptions<HeroBanner[]> = {},
) {
  return useFetch(() => getHeroBanners(storeId), {
    ...options,
    skip: !storeId || options.skip,
  });
}
export function useHeroBannerCreate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (storeId: string, form: HeroBannerFormData) => {
      setLoading(true);
      setError(null);
      try {
        const payload = { ...form, image: form.image ?? "" };
        return await createHeroBanner(storeId, payload);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create banner");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { execute, loading, error };
}

export function useHeroBannerUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (bannerId: string, form: HeroBannerFormData) => {
      setLoading(true);
      setError(null);
      try {
        const payload = { ...form, image: form.image ?? "" };
        return await updateHeroBanner(bannerId, payload);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update banner");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { execute, loading, error };
}

export function useVisitors(
  storeId: string,
  options: UseFetchOptions<VisitorCount[]> = {},
) {
  return useFetch(async () => {
    if (!storeId) return [];

    const response = await fetch(`/api/track-visitor?storeId=${storeId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch visitors");
    }

    const result = await response.json();
    return result.data || [];
  }, options);
}

export function useHeroBannerDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (bannerId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteHeroBanner(bannerId);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete banner");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

export function useHeroBannerToggle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (bannerId: string, active: boolean) => {
    setLoading(true);
    setError(null);

    try {
      return await updateHeroBanner(bannerId, {
        active,
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to toggle banner");

      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

export function useHeroBannerReorder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (banners: Array<{ id: string; order: number }>) => {
      setLoading(true);
      setError(null);
      try {
        await reorderHeroBanners(banners);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to reorder banners");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { execute, loading, error };
}

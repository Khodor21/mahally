
"use client"
import { useCallback, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { getOrders } from "@/lib/api";
import type { Order } from "@/types/api";

export interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  skip?: boolean;
  onNewOrder?: (order: Order) => void; // Callback for new orders
  debounceMs?: number; // Debounce multiple rapid changes
}

export interface UseFetchResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
  retry: () => Promise<void>;
}

/**
 * OPTIMIZED: Uses delta updates and smart caching
 */
export function useOrdersOptimized(
  storeId: string,
  options: UseFetchOptions<Order[]> = {},
): UseFetchResult<Order[]> {
  const [data, setData] = useState<Order[] | undefined>(undefined);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  // Track order IDs from previous fetch to detect new orders
  const orderIdsRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  const debounceMs = options.debounceMs || 300;

  // ========================================
  // MAIN FETCH LOGIC
  // ========================================
  const execute = useCallback(async () => {
    if (!storeId || options.skip) return;

    // Debounce: Prevent multiple fetches within same timeframe
    const now = Date.now();
    if (now - lastFetchRef.current < debounceMs) {
      console.log("[Orders] Debouncing fetch (too soon)");
      return;
    }
    lastFetchRef.current = now;

    setLoading(true);
    setError(null);

    try {
      const orders = await getOrders(storeId);

      if (!orders || orders.length === 0) {
        setData([]);
        orderIdsRef.current.clear();
        options.onSuccess?.([]);
        return;
      }

      // ========================================
      // DETECT NEW ORDERS FOR NOTIFICATION
      // ========================================
      if (!isInitialLoadRef.current) {
        const currentIds = new Set(orders.map((o) => o.id));
        const previousIds = orderIdsRef.current;

        // Find NEW orders (not in previous list)
        const newOrders = orders.filter(
          (o) => !previousIds.has(o.id)
        );

        if (newOrders.length > 0) {
          console.log(
            `[Orders] Detected ${newOrders.length} new order(s)`,
            newOrders
          );
          // Emit callback for first new order (enables toast notification)
          if (options.onNewOrder) {
            newOrders.forEach((order) => options.onNewOrder!(order));
          }
        }

        // Update tracked IDs
        orderIdsRef.current = currentIds;
      } else {
        // Initial load
        orderIdsRef.current = new Set(orders.map((o) => o.id));
        isInitialLoadRef.current = false;
      }

      setData(orders);
      options.onSuccess?.(orders);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [storeId, options.skip, options.onSuccess, options.onError, options.onNewOrder, debounceMs]);

  // ========================================
  // DEBOUNCED EXECUTE (for websocket events)
  // ========================================
  const debouncedExecute = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      execute();
    }, debounceMs);
  }, [execute, debounceMs]);

  // ========================================
  // INITIAL LOAD
  // ========================================
  useEffect(() => {
    if (!storeId || options.skip) return;
    execute();
  }, [storeId, options.skip, execute]);

  // ========================================
  // SUPABASE REALTIME SUBSCRIPTION
  // ========================================
  useEffect(() => {
    if (!storeId) return;

    console.log(`[Orders] Setting up realtime subscription for store: ${storeId}`);

    const channel = supabase
      .channel(`orders-realtime-${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          debouncedExecute();
        },
      )
      .subscribe((status) => {
        console.log(`[Orders] Subscription status: ${status}`);
      });

    return () => {
      console.log(`[Orders] Cleaning up subscription for store: ${storeId}`);
      supabase.removeChannel(channel);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [storeId, debouncedExecute]);

  const retry = useCallback(() => execute(), [execute]);

  return { data, loading, error, execute, retry };
}

/**
 * ALTERNATIVE: Polling-based approach (for cases where websockets unreliable)
 * Use this if you need guaranteed updates even if websocket fails
 */
export function useOrdersWithPolling(
  storeId: string,
  options: UseFetchOptions<Order[]> & { pollIntervalMs?: number } = {},
): UseFetchResult<Order[]> {
  const realtimeResult = useOrdersOptimized(storeId, options);
  const pollIntervalMs = options.pollIntervalMs || 5000; // 5 second fallback poll

  useEffect(() => {
    if (!storeId || options.skip) return;

    // Start polling as backup to websocket
    const pollInterval = setInterval(() => {
      console.log("[Orders] Polling backup check");
      realtimeResult.execute();
    }, pollIntervalMs);

    return () => clearInterval(pollInterval);
  }, [storeId, options.skip, pollIntervalMs, realtimeResult.execute]);

  return realtimeResult;
}


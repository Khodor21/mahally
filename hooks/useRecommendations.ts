import { useState, useCallback } from "react";

export interface FeaturedProduct {
  id: string;
  product_id: string;
  priority: number;
  created_at: string;
  products: {
    id: string;
    title: string;
    images: string[];
    price: number;
  };
}

/**
 * Hook to fetch featured products
 */
export function useRecommendations() {
  const [data, setData] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.fetch("/api/products/recommendations");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch: fetchRecommendations };
}

/**
 * Hook to add a product to featured list
 */
export function useRecommendationCreate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (product_id: string, priority = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id, priority }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

/**
 * Hook to update priority of a featured product
 */
export function useRecommendationUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (recommendation_id: string, priority: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/products/recommendations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recommendation_id, priority }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        return json.data;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { execute, loading, error };
}

/**
 * Hook to remove a product from featured list
 */
export function useRecommendationDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (recommendation_id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/products/recommendations?recommendation_id=${recommendation_id}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

import { useState, useCallback, useEffect } from "react";
import { Feature } from "@/types/api";

interface CreateFeatureRequest {
  title: string;
  description: string;
  icon_name: string;
  display_order?: number;
  is_active?: boolean;
}

interface UpdateFeatureRequest {
  title?: string;
  description?: string;
  icon_name?: string;
  display_order?: number;
  is_active?: boolean;
}

interface FeatureResponse {
  success: boolean;
  data?: Feature | Feature[];
  message?: string;
}

interface UseFeaturesOptions {
  skip?: boolean;
}

// ============================================
// useFeatures - Fetch features
// ============================================
export function useFeatures(storeId: string, options?: UseFeaturesOptions) {
  const [data, setData] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retry = useCallback(async () => {
    if (!storeId || options?.skip) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/features", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result: FeatureResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch features");
      }

      setData(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Error fetching features:", err);
    } finally {
      setLoading(false);
    }
  }, [storeId, options?.skip]);

  useEffect(() => {
    retry();
  }, [retry]);

  return {
    data,
    loading,
    error,
    retry,
  };
}

// ============================================
// useFeatureCreate - Create feature
// ============================================
export function useFeatureCreate(storeId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (payload: CreateFeatureRequest): Promise<Feature> => {
      if (!storeId) throw new Error("Store ID required");

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/features", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result: FeatureResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to create feature");
        }

        return result.data as Feature;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeId],
  );

  return { execute, loading, error };
}

// ============================================
// useFeatureUpdate - Update feature
// ============================================
export function useFeatureUpdate(storeId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (
      featureId: number,
      payload: UpdateFeatureRequest,
    ): Promise<Feature> => {
      if (!storeId) throw new Error("Store ID required");

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/features", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: featureId, ...payload }),
        });

        const result: FeatureResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to update feature");
        }

        return result.data as Feature;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeId],
  );

  return { execute, loading, error };
}

// ============================================
// useFeatureDelete - Delete feature
// ============================================
export function useFeatureDelete(storeId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (featureId: number): Promise<boolean> => {
      if (!storeId) throw new Error("Store ID required");

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/features?id=${featureId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result: FeatureResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to delete feature");
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeId],
  );

  return { execute, loading, error };
}

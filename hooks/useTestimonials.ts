// hooks/useTestimonials.ts

import { useState, useCallback } from "react";
import type { Testimonial, TestimonialFormData } from "@/types/api";
import {
  getTestimonials,
  createTestimonial as apiCreateTestimonial,
  updateTestimonial as apiUpdateTestimonial,
  deleteTestimonial as apiDeleteTestimonial,
} from "@/lib/api";

/**
 * Hook to fetch testimonials (admin dashboard)
 */
export function useTestimonials() {
  const [data, setData] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ARCHITECTURE FIX: Leverage centralized API to handle cache-busting
      const testimonialsData = await getTestimonials();
      setData(testimonialsData);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch testimonials";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch };
}

/**
 * Hook to create testimonial
 */
export function useTestimonialCreate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (form: TestimonialFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newTestimonial = await apiCreateTestimonial(form);
      return newTestimonial;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create testimonial";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

/**
 * Hook to update testimonial
 */
export function useTestimonialUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (
      id: string | number,
      form: Partial<TestimonialFormData> & { is_active?: boolean },
    ) => {
      setLoading(true);
      setError(null);
      try {
        const updatedTestimonial = await apiUpdateTestimonial(String(id), form);
        return updatedTestimonial;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update testimonial";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { execute, loading, error };
}

/**
 * Hook to delete testimonial
 */
export function useTestimonialDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteTestimonial(String(id));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete testimonial";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}

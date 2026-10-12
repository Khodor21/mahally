// hooks/useWholesaleProducts.ts
import { useState, useEffect } from "react";

export function useWholesaleProducts() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasWholesale, setHasWholesale] = useState(false);

  async function fetch() {
    setLoading(true);
    try {
      const res = await window.fetch("/api/wholesale/products");
      if (!res.ok) {
        setHasWholesale(false);
        return;
      }
      const json = await res.json();
      setHasWholesale(json.wholesale_store_ids?.length > 0);
      setData(json.products ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  return { data, loading, hasWholesale, retry: fetch };
}

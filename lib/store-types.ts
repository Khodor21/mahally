// Store type with language and currency support for multi-tenant SaaS
export type Store = {
  id: string;
  store_name: string;
  slug: string;
  language?: "en" | "ar"; // Default: "en" if not set
  currency?: string; // Default: "$" if not set
  currency_symbol?: string; // Default: "$" if not set
  // ... other store fields
};

/**
 * Get currency symbol for display
 * If store has currency_symbol, use that; otherwise use default based on currency
 */
export function getCurrencySymbol(store: Store | null): string {
  if (!store) return "$";

  // If store has explicit currency_symbol, use it
  if (store.currency_symbol) {
    return store.currency_symbol;
  }

  // If store has currency code, map to symbol
  if (store.currency) {
    const currencyMap: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      LBP: "ل.ل",
      SAR: "﷼",
      AED: "د.إ",
      KWD: "د.ك",
      QAR: "ر.ق",
      // Add more as needed
    };
    return currencyMap[store.currency] || store.currency;
  }

  return "$";
}

/**
 * Get language for store (defaults to "en")
 */
export function getStoreLanguage(store: Store | null): "en" | "ar" {
  return store?.language || "en";
}

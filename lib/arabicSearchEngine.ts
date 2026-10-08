/**
 * Professional Arabic Search Engine
 * Optimized for performance and accuracy
 */

export function normalizeArabicText(text: string): string {
  if (!text || typeof text !== "string") return "";

  let normalized = text.trim();
  normalized = normalized.replace(/[\u064B-\u065F\u0670]/g, "");
  normalized = normalized.replace(/[أإآ]/g, "ا");
  normalized = normalized.replace(/ـآ/g, "ا");
  normalized = normalized.replace(/ة/g, "ه");
  normalized = normalized.replace(/ى/g, "ي");
  normalized = normalized.replace(/ــي/g, "ي");
  normalized = normalized.replace(/\s+/g, " ");
  normalized = normalized.toLowerCase();

  return normalized;
}

export function fuzzySearchArabic(
  text: string,
  query: string,
  options: { exact?: boolean; partial?: boolean } = {
    exact: false,
    partial: true,
  },
): boolean {
  if (!text || !query) return false;

  const normalizedText = normalizeArabicText(text);
  const normalizedQuery = normalizeArabicText(query);

  if (!normalizedText || !normalizedQuery) return false;

  if (options.exact) {
    return normalizedText === normalizedQuery;
  }

  if (options.partial) {
    if (normalizedText.includes(normalizedQuery)) return true;
  }

  return false;
}

export function scoreMatch(text: string, query: string): number {
  if (!text || !query) return 0;

  const normalizedText = normalizeArabicText(text);
  const normalizedQuery = normalizeArabicText(query);

  if (normalizedText === normalizedQuery) return 100;
  if (normalizedText.startsWith(normalizedQuery)) return 80;
  if (normalizedText.includes(normalizedQuery)) return 60;

  // لا match إذا الـ query متعدد الكلمات وما وجد كـ phrase
  return 0;
}

export function extractVariantSearchTexts(variantGroups: any[]): string[] {
  const texts: string[] = [];

  if (!Array.isArray(variantGroups)) return texts;

  for (const group of variantGroups) {
    if (!group || typeof group !== "object") continue;

    if (group.title && typeof group.title === "string") {
      texts.push(group.title);
    }

    if (group.type === "text" && Array.isArray(group.options)) {
      for (const option of group.options) {
        if (option && option.value && typeof option.value === "string") {
          texts.push(option.value);
        }
      }
    }
  }

  return texts;
}

export function parseVariantGroups(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  if (typeof data === "string") {
    try {
      let attempt = data;
      for (let i = 0; i < 3; i++) {
        try {
          const result = JSON.parse(attempt);
          if (Array.isArray(result)) return result;
          if (typeof result === "string") {
            attempt = result;
            continue;
          }
          return [];
        } catch {
          break;
        }
      }
    } catch {
      return [];
    }
  }

  return [];
}

export interface SearchMatch {
  score: number;
  matchType: "title" | "variantTitle" | "variantValue";
  matchedText: string;
}

export function searchProduct(
  title: string,
  variantGroups: any[],
  query: string,
): SearchMatch | null {
  if (!title || !query) return null;

  const results: SearchMatch[] = [];

  const titleScore = scoreMatch(title, query);
  if (titleScore > 0) {
    results.push({
      score: titleScore,
      matchType: "title",
      matchedText: title,
    });
  }

  const variantTexts = extractVariantSearchTexts(
    parseVariantGroups(variantGroups),
  );

  for (const variantText of variantTexts) {
    const variantScore = scoreMatch(variantText, query);
    if (variantScore > 0) {
      results.push({
        score: variantScore,
        matchType: variantScore > 60 ? "variantTitle" : "variantValue",
        matchedText: variantText,
      });
    }
  }

  if (results.length === 0) return null;

  return results.reduce((best, current) =>
    current.score > best.score ? current : best,
  );
}

export interface ProductSearchResult {
  id: string;
  title: string;
  match: SearchMatch;
}

export function searchProducts(
  products: any[],
  query: string,
): ProductSearchResult[] {
  if (!Array.isArray(products) || !query) return [];

  const results: ProductSearchResult[] = [];

  for (const product of products) {
    if (!product.id || !product.title) continue;

    const match = searchProduct(product.title, product.variantGroups, query);

    if (match) {
      results.push({
        id: product.id,
        title: product.title,
        match,
      });
    }
  }

  return results.sort((a, b) => b.match.score - a.match.score);
}

export function highlightMatch(text: string, query: string): string {
  if (!text || !query) return text;

  const normalizedText = normalizeArabicText(text);
  const normalizedQuery = normalizeArabicText(query);

  if (!normalizedText.includes(normalizedQuery)) return text;

  const startIdx = normalizedText.indexOf(normalizedQuery);
  const endIdx = startIdx + normalizedQuery.length;

  return (
    text.slice(0, startIdx) +
    `<mark>${text.slice(startIdx, endIdx)}</mark>` +
    text.slice(endIdx)
  );
}

export function generateAlternativeSpellings(query: string): string[] {
  const alternatives = new Set<string>();

  alternatives.add(query);

  const variations = [
    query.replace(/[اأإآ]/g, "ا"),
    query.replace(/[اأإآ]/g, "أ"),
    query.replace(/[اأإآ]/g, "إ"),
    query.replace(/[اأإآ]/g, "آ"),
    query.replace(/ه$/g, "ة"),
    query.replace(/ة$/g, "ه"),
    query.replace(/ي/g, "ى"),
    query.replace(/ى/g, "ي"),
    normalizeArabicText(query),
  ];

  variations.forEach((v) => {
    if (v && v.trim()) alternatives.add(v.trim());
  });

  return Array.from(alternatives);
}

export function isValidSearchQuery(query: string): boolean {
  if (!query || typeof query !== "string") return false;

  const trimmed = query.trim();
  if (trimmed.length < 1) return false;
  if (trimmed.length > 100) return false;

  return true;
}

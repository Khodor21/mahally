/**
 * Professional Arabic Search Engine
 * Optimized for performance and accuracy
 */

/**
 * Comprehensive Arabic text normalization
 * Handles all diacritics, character variations, and common mistakes
 */
export function normalizeArabicText(text: string): string {
  if (!text || typeof text !== "string") return "";

  let normalized = text.trim();

  // Remove all diacritics (tashkeel)
  normalized = normalized.replace(/[\u064B-\u065F\u0670]/g, "");

  // Normalize different Alef forms to ا
  normalized = normalized.replace(/[أإآ]/g, "ا");

  // Normalize Alef with Madda variations
  normalized = normalized.replace(/ـآ/g, "ا");

  // Normalize Teh Marbuta to Heh
  normalized = normalized.replace(/ة/g, "ه");

  // Normalize Alef Maksura to Yeh
  normalized = normalized.replace(/ى/g, "ي");

  // Normalize different Yeh forms
  normalized = normalized.replace(/ــي/g, "ي");

  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, " ");

  // Convert to lowercase
  normalized = normalized.toLowerCase();

  return normalized;
}

/**
 * Advanced fuzzy search that handles:
 * - Partial matches
 * - Character substitutions
 * - Word boundaries
 */
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

  // Exact match
  if (options.exact) {
    return normalizedText === normalizedQuery;
  }

  // Partial match (default)
  if (options.partial) {
    // Direct substring match
    if (normalizedText.includes(normalizedQuery)) return true;

    // Word-level matching for better accuracy
    const words = normalizedText.split(/\s+/);
    const queryWords = normalizedQuery.split(/\s+/);

    // Check if all query words exist in text
    return queryWords.every((qWord) =>
      words.some((word) => word.includes(qWord) || qWord.includes(word)),
    );
  }

  return false;
}

/**
 * Search with weighted scoring
 * Prioritizes exact matches over partial matches
 */
export function scoreMatch(text: string, query: string): number {
  if (!text || !query) return 0;

  const normalizedText = normalizeArabicText(text);
  const normalizedQuery = normalizeArabicText(query);

  // Perfect match = 100
  if (normalizedText === normalizedQuery) return 100;

  // Starts with query = 80
  if (normalizedText.startsWith(normalizedQuery)) return 80;

  // Contains query = 60
  if (normalizedText.includes(normalizedQuery)) return 60;

  // Word match = 40
  const textWords = normalizedText.split(/\s+/);
  const queryWords = normalizedQuery.split(/\s+/);
  const matchedWords = queryWords.filter((qWord) =>
    textWords.some((word) => word.includes(qWord)),
  );
  if (matchedWords.length > 0) {
    return 40 + (matchedWords.length / queryWords.length) * 19;
  }

  return 0;
}

/**
 * Extract searchable text from variant groups
 * Returns both the variant title and all text option values
 */
export function extractVariantSearchTexts(variantGroups: any[]): string[] {
  const texts: string[] = [];

  if (!Array.isArray(variantGroups)) return texts;

  for (const group of variantGroups) {
    // Skip invalid groups
    if (!group || typeof group !== "object") continue;

    // Add variant group title if it exists
    if (group.title && typeof group.title === "string") {
      texts.push(group.title);
    }

    // Only process text type variants
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

/**
 * Parse variantGroups JSON safely
 * Handles multiple levels of JSON stringification
 */
export function parseVariantGroups(data: any): any[] {
  if (!data) return [];

  let parsed = data;

  // Handle already parsed data
  if (Array.isArray(data)) return data;

  // Handle JSON string(s) - may be double-stringified
  if (typeof data === "string") {
    try {
      let attempt = data;
      // Try parsing multiple times to handle nested JSON
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

/**
 * Main search function that checks all fields
 * Returns score and match details for sorting
 */
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

  // 1. Check product title
  const titleScore = scoreMatch(title, query);
  if (titleScore > 0) {
    results.push({
      score: titleScore,
      matchType: "title",
      matchedText: title,
    });
  }

  // 2. Check variant groups
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

  // Return best match
  if (results.length === 0) return null;

  return results.reduce((best, current) =>
    current.score > best.score ? current : best,
  );
}

/**
 * Batch search multiple products
 * Returns sorted by relevance
 */
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

  // Sort by score (descending)
  return results.sort((a, b) => b.match.score - a.match.score);
}

/**
 * Highlight matching text in original string
 * Preserves original formatting while highlighting match
 */
export function highlightMatch(text: string, query: string): string {
  if (!text || !query) return text;

  const normalizedText = normalizeArabicText(text);
  const normalizedQuery = normalizeArabicText(query);

  if (!normalizedText.includes(normalizedQuery)) return text;

  // Find position in normalized text
  const startIdx = normalizedText.indexOf(normalizedQuery);
  const endIdx = startIdx + normalizedQuery.length;

  // Return with HTML mark tags (for frontend rendering)
  return (
    text.slice(0, startIdx) +
    `<mark>${text.slice(startIdx, endIdx)}</mark>` +
    text.slice(endIdx)
  );
}

/**
 * Generate alternative spellings for fallback search
 * Useful for handling user typos
 */
export function generateAlternativeSpellings(query: string): string[] {
  const alternatives = new Set<string>();

  alternatives.add(query);

  // Generate common variations
  const variations = [
    // Alef variations
    query.replace(/[اأإآ]/g, "ا"),
    query.replace(/[اأإآ]/g, "أ"),
    query.replace(/[اأإآ]/g, "إ"),
    query.replace(/[اأإآ]/g, "آ"),

    // Teh Marbuta variations
    query.replace(/ه$/g, "ة"),
    query.replace(/ة$/g, "ه"),

    // Yeh variations
    query.replace(/ي/g, "ى"),
    query.replace(/ى/g, "ي"),

    // Normalized version
    normalizeArabicText(query),
  ];

  variations.forEach((v) => {
    if (v && v.trim()) alternatives.add(v.trim());
  });

  return Array.from(alternatives);
}

/**
 * Validate search input
 */
export function isValidSearchQuery(query: string): boolean {
  if (!query || typeof query !== "string") return false;

  const trimmed = query.trim();

  // Minimum 1 character
  if (trimmed.length < 1) return false;

  // Maximum 100 characters (reasonable limit)
  if (trimmed.length > 100) return false;

  return true;
}

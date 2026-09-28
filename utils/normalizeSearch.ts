// utils/normalizeSearch.ts
export function normalizeSearchText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase() // Normalizes English to lowercase
    .replace(/[أإآ]/g, "ا") // Normalizes Arabic Alef variants to bare Alef
    .replace(/ة/g, "ه") // Normalizes Teh Marbuta to Heh
    .replace(/ى/g, "ي") // Normalizes Alef Maksura to Yeh
    .replace(/[\u064B-\u065F\u0670]/g, ""); // Removes Arabic diacritics (Tashkeel)
}

// HOW TO USE IT IN YOUR SEARCH COMPONENT:
// const filteredBooks = books.filter(book => 
//   normalizeSearchText(book.title).includes(normalizeSearchText(searchQuery))
// );
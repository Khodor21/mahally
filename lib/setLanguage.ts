export function setLanguage(lang: "ar" | "en") {
  document.cookie = `lang=${lang}; path=/; max-age=31536000`;
}

export function getOrCreateVisitorId(): string {
  const STORAGE_KEY = "mahally_visitor_id";

  if (typeof window === "undefined") return "";

  let visitorId = localStorage.getItem(STORAGE_KEY);

  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, visitorId);
  }

  return visitorId;
}

/** Resolve only a local destination supplied by the login query string. */
export function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.includes("\\") || [...value].some(char => char.charCodeAt(0) <= 32)) return "/";
  const url = new URL(value, "https://brewlite.invalid");
  const pathname = url.pathname.replace(/\/+$/, "");
  if (url.origin !== "https://brewlite.invalid" || url.pathname.startsWith("//") || ["/login", "/register"].includes(pathname)) return "/";
  return url.pathname + url.search + url.hash;
}

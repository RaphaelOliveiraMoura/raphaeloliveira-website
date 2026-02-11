/**
 * Verifica se o código está sendo executado no cliente (browser).
 * Útil para guards de SSR ao acessar APIs do browser como window, document, navigator, etc.
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Verifica se o código está sendo executado no servidor (Node.js).
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

import { NextResponse } from "next/server";

// --- Client-Side Rate Limiter (existente) ---

export function createClientRateLimiter(maxRequests: number, windowMs: number) {
  const requests: number[] = [];

  return function canProceed(): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove timestamps fora da janela
    while (requests.length > 0 && (requests[0] as number) <= windowStart) {
      requests.shift();
    }

    if (requests.length >= maxRequests) {
      return false;
    }

    requests.push(now);
    return true;
  };
}

// --- Server-Side Rate Limiter (in-memory, para API routes) ---

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface ServerRateLimitConfig {
  /** Numero maximo de requests por janela (default: 60) */
  maxRequests: number;
  /** Duracao da janela em ms (default: 60000 = 1 min) */
  windowMs: number;
}

const DEFAULT_SERVER_CONFIG: ServerRateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000,
};

/**
 * Cria um rate limiter server-side in-memory para API routes.
 * Usa IP do request como identificador.
 *
 * Limitacao: em ambiente serverless com multiplas instancias,
 * cada instancia tem sua propria memoria. Para rate limiting
 * distribuido, usar Redis ou servico externo.
 *
 * @example
 * ```ts
 * // src/app/api/example/route.ts
 * import { createServerRateLimiter } from "@/lib/security";
 *
 * const rateLimiter = createServerRateLimiter({ maxRequests: 10, windowMs: 60_000 });
 *
 * export async function POST(request: Request) {
 *   const limited = rateLimiter.check(request);
 *   if (limited) return limited;
 *   // ... handle request
 * }
 * ```
 */
export function createServerRateLimiter(
  config: Partial<ServerRateLimitConfig> = {},
) {
  const cfg = { ...DEFAULT_SERVER_CONFIG, ...config };
  const store = new Map<string, RateLimitEntry>();

  // Limpar entradas expiradas periodicamente
  let cleanupTimer: ReturnType<typeof setInterval> | null = null;

  function ensureCleanup() {
    if (cleanupTimer) return;
    cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store) {
        if (now >= entry.resetAt) {
          store.delete(key);
        }
      }
      if (store.size === 0 && cleanupTimer) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
      }
    }, cfg.windowMs);
  }

  function getIdentifier(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
    const real = request.headers.get("x-real-ip");
    if (real) return real;
    return "unknown";
  }

  return {
    /**
     * Verifica se o request excede o rate limit.
     * Retorna NextResponse 429 se excedido, null caso contrario.
     */
    check(request: Request): NextResponse | null {
      const id = getIdentifier(request);
      const now = Date.now();
      let entry = store.get(id);

      if (!entry || now >= entry.resetAt) {
        entry = { count: 0, resetAt: now + cfg.windowMs };
        store.set(id, entry);
        ensureCleanup();
      }

      entry.count++;

      const _remaining = Math.max(0, cfg.maxRequests - entry.count);
      const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

      if (entry.count > cfg.maxRequests) {
        return NextResponse.json(
          { error: "Too Many Requests", retryAfter: resetSeconds },
          {
            status: 429,
            headers: {
              "Retry-After": String(resetSeconds),
              "X-RateLimit-Limit": String(cfg.maxRequests),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(entry.resetAt),
            },
          },
        );
      }

      // Headers serao adicionados pelo caller se necessario
      // Retorna null = request permitido
      return null;
    },

    /**
     * Retorna headers de rate limit para adicionar na response.
     */
    getHeaders(request: Request): Record<string, string> {
      const id = getIdentifier(request);
      const now = Date.now();
      const entry = store.get(id);

      if (!entry || now >= entry.resetAt) {
        return {
          "X-RateLimit-Limit": String(cfg.maxRequests),
          "X-RateLimit-Remaining": String(cfg.maxRequests),
        };
      }

      return {
        "X-RateLimit-Limit": String(cfg.maxRequests),
        "X-RateLimit-Remaining": String(
          Math.max(0, cfg.maxRequests - entry.count),
        ),
        "X-RateLimit-Reset": String(entry.resetAt),
      };
    },

    /** Limpar todo o store (util para testes) */
    reset(): void {
      store.clear();
      if (cleanupTimer) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
      }
    },
  };
}

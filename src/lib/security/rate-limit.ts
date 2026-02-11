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

import { createClientRateLimiter } from "@/lib/security/rate-limit";

describe("createClientRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within limit", () => {
    const limiter = createClientRateLimiter(3, 1000);
    expect(limiter()).toBe(true);
    expect(limiter()).toBe(true);
    expect(limiter()).toBe(true);
  });

  it("blocks requests exceeding limit", () => {
    const limiter = createClientRateLimiter(2, 1000);
    expect(limiter()).toBe(true);
    expect(limiter()).toBe(true);
    expect(limiter()).toBe(false);
  });

  it("allows requests after window resets", () => {
    const limiter = createClientRateLimiter(1, 1000);
    expect(limiter()).toBe(true);
    expect(limiter()).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(limiter()).toBe(true);
  });
});

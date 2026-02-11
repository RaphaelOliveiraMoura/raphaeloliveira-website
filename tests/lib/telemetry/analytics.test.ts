import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { track } from "@/lib/telemetry/analytics";

describe("track", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("logs event in development", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    track({ name: "test_event", properties: { page: "/home" } });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "info",
        message: "[Analytics]",
        event: "test_event",
        page: "/home",
      })
    );
    spy.mockRestore();
  });

  it("filters PII from properties", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    track({
      name: "form_submit",
      properties: {
        email: "user@test.com",
        password: "secret",
        cpf: "123.456.789-00",
        page: "/form",
      },
    });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "info",
        message: "[Analytics]",
        event: "form_submit",
        email: "[REDACTED]",
        password: "[REDACTED]",
        cpf: "[REDACTED]",
        page: "/form",
      })
    );
    spy.mockRestore();
  });
});

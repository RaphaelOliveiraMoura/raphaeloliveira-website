import { afterEach, describe, expect, it, vi } from "vitest";

import { domainEvents } from "../../src/lib/events";

describe("domainEvents", () => {
  afterEach(() => {
    domainEvents.removeAllListeners();
  });

  it("should emit and receive events", () => {
    const handler = vi.fn();
    domainEvents.on("user.created", handler);

    domainEvents.emit("user.created", {
      userId: "123",
      email: "test@test.com",
      role: "user",
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({
      userId: "123",
      email: "test@test.com",
      role: "user",
    });
  });

  it("should support multiple handlers", () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    domainEvents.on("auth.login", handler1);
    domainEvents.on("auth.login", handler2);

    domainEvents.emit("auth.login", {
      userId: "1",
      email: "a@b.com",
      ip: "127.0.0.1",
    });

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it("should support once() for one-time handlers", () => {
    const handler = vi.fn();
    domainEvents.once("user.deleted", handler);

    domainEvents.emit("user.deleted", {
      userId: "1",
      deletedBy: "admin",
    });
    domainEvents.emit("user.deleted", {
      userId: "2",
      deletedBy: "admin",
    });

    expect(handler).toHaveBeenCalledOnce();
  });

  it("should remove handlers with off()", () => {
    const handler = vi.fn();
    domainEvents.on("auth.logout", handler);
    domainEvents.off("auth.logout", handler);

    domainEvents.emit("auth.logout", { userId: "1" });

    expect(handler).not.toHaveBeenCalled();
  });

  it("should not propagate handler errors", () => {
    const failingHandler = vi.fn(() => {
      throw new Error("Handler error");
    });
    const successHandler = vi.fn();

    domainEvents.on("user.created", failingHandler);
    domainEvents.on("user.created", successHandler);

    // Should not throw
    expect(() =>
      domainEvents.emit("user.created", {
        userId: "1",
        email: "a@b.com",
        role: "user",
      }),
    ).not.toThrow();

    expect(failingHandler).toHaveBeenCalled();
    expect(successHandler).toHaveBeenCalled();
  });

  it("should report listener count", () => {
    const h1 = vi.fn();
    const h2 = vi.fn();

    expect(domainEvents.listenerCount("auth.login")).toBe(0);

    domainEvents.on("auth.login", h1);
    domainEvents.on("auth.login", h2);

    expect(domainEvents.listenerCount("auth.login")).toBe(2);
  });

  it("should remove all listeners for a specific event", () => {
    domainEvents.on("auth.login", vi.fn());
    domainEvents.on("auth.login", vi.fn());
    domainEvents.on("auth.logout", vi.fn());

    domainEvents.removeAllListeners("auth.login");

    expect(domainEvents.listenerCount("auth.login")).toBe(0);
    expect(domainEvents.listenerCount("auth.logout")).toBe(1);
  });
});

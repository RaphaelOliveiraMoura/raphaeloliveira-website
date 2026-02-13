import { afterEach, describe, expect, it } from "vitest";

import { container } from "../../src/lib/container";

// Use a simple mock provider for testing
const mockMailProvider = {
  send: async () => ({ success: true, messageId: "test-123" }),
  verify: async () => true,
};

const mockStorageProvider = {
  upload: async () => ({ key: "test", size: 0 }),
  download: async () => ({ data: Buffer.from(""), size: 0 }),
  delete: async () => {},
  getSignedUrl: async () => "https://example.com/file",
  exists: async () => true,
  verify: async () => true,
};

describe("container", () => {
  afterEach(() => {
    container.clear();
  });

  it("should register and resolve a service", () => {
    container.register("mail", mockMailProvider as never);
    const resolved = container.resolve("mail");
    expect(resolved).toBe(mockMailProvider);
  });

  it("should throw when resolving unregistered service", () => {
    expect(() => container.resolve("mail")).toThrow(
      'Service "mail" is not registered',
    );
  });

  it("should check if a service is registered", () => {
    expect(container.has("mail")).toBe(false);
    container.register("mail", mockMailProvider as never);
    expect(container.has("mail")).toBe(true);
  });

  it("should overwrite previous registration", () => {
    const provider1 = { ...mockMailProvider, id: 1 };
    const provider2 = { ...mockMailProvider, id: 2 };

    container.register("mail", provider1 as never);
    container.register("mail", provider2 as never);

    const resolved = container.resolve("mail") as typeof provider2;
    expect(resolved.id).toBe(2);
  });

  it("should unregister a service", () => {
    container.register("mail", mockMailProvider as never);
    container.unregister("mail");
    expect(container.has("mail")).toBe(false);
  });

  it("should clear all services", () => {
    container.register("mail", mockMailProvider as never);
    container.register("storage", mockStorageProvider as never);
    container.clear();

    expect(container.has("mail")).toBe(false);
    expect(container.has("storage")).toBe(false);
  });

  it("should list registered keys", () => {
    container.register("mail", mockMailProvider as never);
    container.register("storage", mockStorageProvider as never);

    const keys = container.keys();
    expect(keys).toContain("mail");
    expect(keys).toContain("storage");
    expect(keys).toHaveLength(2);
  });
});

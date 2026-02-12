import { afterEach, describe, expect, it, vi } from "vitest";

import { logger, type LogEntry, type LogTransport } from "@/lib/telemetry";

describe("logger", () => {
  afterEach(() => {
    // Restaurar nivel padrão
    logger.setMinLevel("debug");
  });

  it("logs at all levels", () => {
    const entries: LogEntry[] = [];
    const transport: LogTransport = {
      name: "test",
      log: (entry) => entries.push(entry),
    };
    const remove = logger.addTransport(transport);

    logger.debug("debug msg");
    logger.info("info msg");
    logger.warn("warn msg");
    logger.error("error msg");

    expect(entries).toHaveLength(4);
    expect(entries[0]?.level).toBe("debug");
    expect(entries[1]?.level).toBe("info");
    expect(entries[2]?.level).toBe("warn");
    expect(entries[3]?.level).toBe("error");

    remove();
  });

  it("respects minimum log level", () => {
    const entries: LogEntry[] = [];
    const transport: LogTransport = {
      name: "test",
      log: (entry) => entries.push(entry),
    };
    const remove = logger.addTransport(transport);

    logger.setMinLevel("warn");
    logger.debug("should be ignored");
    logger.info("should be ignored");
    logger.warn("should appear");
    logger.error("should appear");

    expect(entries).toHaveLength(2);
    expect(entries[0]?.level).toBe("warn");
    expect(entries[1]?.level).toBe("error");

    remove();
  });

  it("extracts Error context", () => {
    const entries: LogEntry[] = [];
    const remove = logger.addTransport({
      name: "test",
      log: (entry) => entries.push(entry),
    });

    const err = new Error("test error");
    logger.error("failed", err);

    expect(entries[0]?.context.error).toBeDefined();
    const errorCtx = entries[0]?.context.error as Record<string, unknown>;
    expect(errorCtx.name).toBe("Error");
    expect(errorCtx.message).toBe("test error");

    remove();
  });

  it("merges object context", () => {
    const entries: LogEntry[] = [];
    const remove = logger.addTransport({
      name: "test",
      log: (entry) => entries.push(entry),
    });

    logger.info("event", { userId: "123", action: "click" });
    expect(entries[0]?.context.userId).toBe("123");
    expect(entries[0]?.context.action).toBe("click");

    remove();
  });

  it("removes transport on cleanup", () => {
    const initialCount = logger.getTransports().length;
    const remove = logger.addTransport({ name: "temp", log: vi.fn() });
    expect(logger.getTransports().length).toBe(initialCount + 1);
    remove();
    expect(logger.getTransports().length).toBe(initialCount);
  });

  it("does not crash if transport throws", () => {
    const remove = logger.addTransport({
      name: "broken",
      log: () => {
        throw new Error("transport failed");
      },
    });

    expect(() => logger.info("test")).not.toThrow();
    remove();
  });
});

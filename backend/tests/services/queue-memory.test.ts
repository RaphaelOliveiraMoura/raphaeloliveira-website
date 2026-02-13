import { afterEach, describe, expect, it, vi } from "vitest";

import { MemoryQueueAdapter } from "../../src/services/queue/memory.adapter";

describe("MemoryQueueAdapter", () => {
  let queue: MemoryQueueAdapter;

  afterEach(async () => {
    await queue.close();
  });

  it("should add a job and process it", async () => {
    queue = new MemoryQueueAdapter();
    const handler = vi.fn();

    queue.process("test-job", handler);
    await queue.add("test-job", { value: 1 });

    // Wait for async processing (next tick)
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "test-job",
        data: { value: 1 },
        attemptsMade: 1,
      }),
    );
  });

  it("should return a job ID when adding", async () => {
    queue = new MemoryQueueAdapter();
    queue.process("test-job", vi.fn());

    const id = await queue.add("test-job", {});
    expect(id).toBeDefined();
    expect(typeof id).toBe("string");
  });

  it("should use custom jobId when provided", async () => {
    queue = new MemoryQueueAdapter();
    queue.process("test-job", vi.fn());

    const id = await queue.add("test-job", {}, { jobId: "custom-id" });
    expect(id).toBe("custom-id");
  });

  it("should add jobs in bulk", async () => {
    queue = new MemoryQueueAdapter();
    const handler = vi.fn();
    queue.process("bulk-job", handler);

    const ids = await queue.addBulk([
      { name: "bulk-job", data: { i: 1 } },
      { name: "bulk-job", data: { i: 2 } },
      { name: "bulk-job", data: { i: 3 } },
    ]);

    expect(ids).toHaveLength(3);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(handler).toHaveBeenCalledTimes(3);
  });

  it("should schedule a delayed job", async () => {
    queue = new MemoryQueueAdapter();
    const handler = vi.fn();
    queue.process("delayed", handler);

    await queue.schedule("delayed", { late: true }, 50);

    // Should not be processed immediately
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(handler).not.toHaveBeenCalled();

    // Should be processed after delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("should register cron jobs without throwing", async () => {
    queue = new MemoryQueueAdapter();

    // Cron jobs are logged but not executed in memory adapter
    await expect(
      queue.addCron("cron-job", {}, "0 * * * *"),
    ).resolves.not.toThrow();
  });

  it("should not process jobs after close", async () => {
    queue = new MemoryQueueAdapter();
    const handler = vi.fn();
    queue.process("test", handler);

    await queue.close();
    await queue.add("test", {});

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(handler).not.toHaveBeenCalled();
  });

  it("should verify returns true when open, false when closed", async () => {
    queue = new MemoryQueueAdapter();
    expect(await queue.verify()).toBe(true);

    await queue.close();
    expect(await queue.verify()).toBe(false);
  });

  it("should drop jobs with no registered handler", async () => {
    queue = new MemoryQueueAdapter();

    // No handler registered for "orphan-job"
    await queue.add("orphan-job", { lost: true });

    // Should not throw, just log a warning
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  it("should retry failed jobs", async () => {
    queue = new MemoryQueueAdapter();
    let attempts = 0;

    queue.process("retry-job", async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error("temporary failure");
      }
    });

    await queue.add(
      "retry-job",
      {},
      {
        attempts: 3,
        backoff: { type: "fixed", delay: 10 },
      },
    );

    // Wait for retries
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(attempts).toBe(3);
  });
});

import { EventEmitter } from "node:events";

import { logger } from "./logger";

const log = logger.child({ module: "events" });

// ---- Domain event definitions ----

/**
 * Registry of all domain events and their payload types.
 *
 * Extend this interface when adding new events:
 * ```ts
 * declare module "@/lib/events" {
 *   interface DomainEventMap {
 *     "order.created": { orderId: string; total: number };
 *   }
 * }
 * ```
 */
export interface DomainEventMap {
  // Auth
  "auth.login": { userId: string; email: string; ip: string };
  "auth.login.failed": { email: string; ip: string; reason: string };
  "auth.logout": { userId: string };
  "auth.password.reset.requested": { userId: string; email: string };
  "auth.password.reset.completed": { userId: string };
  "auth.email.verified": { userId: string; email: string };
  "auth.account.locked": { userId: string; email: string; attempts: number };
  "auth.register": { userId: string; email: string; ip: string };

  // Users
  "user.created": { userId: string; email: string; role: string };
  "user.updated": {
    userId: string;
    changes: string[];
    updatedBy: string;
  };
  "user.deleted": { userId: string; deletedBy: string };

  // API Keys
  "api-key.created": { apiKeyId: string; userId: string; name: string };
  "api-key.revoked": { apiKeyId: string; userId: string };

  // Sessions
  "session.created": { sessionId: string; userId: string };
  "session.revoked": { sessionId: string; userId: string };

  // Webhooks
  "webhook.test": { webhookId: string; test: boolean };

  // Settings
  "settings.updated": { scope: string; scopeId: string | null; keys: string[] };

  // Feature Flags
  "feature-flag.updated": { flagId: string; key: string; enabled: boolean };

  // Feedback
  "feedback.created": { feedbackId: string; userId: string; type: string };
  "feedback.status.changed": {
    feedbackId: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
  };
  "feedback.response.added": {
    feedbackId: string;
    responseId: string;
    userId: string;
    isInternal: boolean;
  };
}

type EventName = keyof DomainEventMap;
type EventPayload<T extends EventName> = DomainEventMap[T];
type EventHandler<T extends EventName> = (
  payload: EventPayload<T>,
) => void | Promise<void>;

// ---- Typed event emitter ----

class DomainEventEmitter {
  private emitter = new EventEmitter();

  constructor() {
    // Increase limit for production apps with many listeners
    this.emitter.setMaxListeners(50);
  }

  /**
   * Register an event handler.
   */
  on<T extends EventName>(event: T, handler: EventHandler<T>): this {
    this.emitter.on(event, handler as (...args: unknown[]) => void);
    return this;
  }

  /**
   * Register a one-time event handler.
   *
   * Uses a self-removing wrapper so that manual listener iteration
   * in `emit()` correctly removes the handler after the first call.
   */
  once<T extends EventName>(event: T, handler: EventHandler<T>): this {
    const wrapper = ((payload: EventPayload<T>) => {
      this.emitter.off(event, wrapper as (...args: unknown[]) => void);
      return handler(payload);
    }) as EventHandler<T>;

    // Store a reference so off() can match the original handler
    (wrapper as unknown as Record<string, unknown>).__original = handler;

    this.emitter.on(event, wrapper as (...args: unknown[]) => void);
    return this;
  }

  /**
   * Remove an event handler.
   */
  off<T extends EventName>(event: T, handler: EventHandler<T>): this {
    this.emitter.off(event, handler as (...args: unknown[]) => void);
    return this;
  }

  /**
   * Emit a domain event. Handlers are invoked asynchronously.
   * Errors in handlers are logged but do not propagate to the emitter.
   */
  emit<T extends EventName>(event: T, payload: EventPayload<T>): void {
    log.debug({ event, payload }, "Domain event emitted");

    // Wrap listeners in try/catch so one failing handler
    // doesn't prevent others from running
    const listeners = this.emitter.listeners(event);
    for (const listener of listeners) {
      try {
        const result = (listener as EventHandler<T>)(payload);

        // Handle async handlers
        if (result instanceof Promise) {
          result.catch((err) => {
            log.error(
              { event, error: err },
              "Async domain event handler failed",
            );
          });
        }
      } catch (err) {
        log.error({ event, error: err }, "Domain event handler failed");
      }
    }
  }

  /**
   * Remove all handlers for a specific event, or all events.
   */
  removeAllListeners(event?: EventName): this {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
    return this;
  }

  /**
   * Get the count of listeners for a given event.
   */
  listenerCount(event: EventName): number {
    return this.emitter.listenerCount(event);
  }
}

/**
 * Singleton domain event emitter.
 *
 * @example
 * ```ts
 * // Emit an event
 * domainEvents.emit("user.created", { userId: "...", email: "...", role: "user" });
 *
 * // Listen to an event
 * domainEvents.on("user.created", async (payload) => {
 *   await sendWelcomeEmail(payload.email);
 * });
 * ```
 */
export const domainEvents = new DomainEventEmitter();

import { logger } from "./logger";

const log = logger.child({ module: "container" });

import type { CacheProvider } from "../services/cache/cache.port";
import type { MailProvider } from "../services/mail/mail.port";
import type { QueueProvider } from "../services/queue/queue.port";
import type { StorageProvider } from "../services/storage/storage.port";

/**
 * Well-known service identifiers.
 * Extend via module augmentation:
 *
 * ```ts
 * declare module "@/lib/container" {
 *   interface ServiceMap {
 *     myService: MyServiceProvider;
 *   }
 * }
 * ```
 */
export interface ServiceMap {
  mail: MailProvider;
  storage: StorageProvider;
  cache: CacheProvider;
  queue: QueueProvider;
}

type ServiceKey = keyof ServiceMap;

/**
 * Lightweight service container for dependency injection.
 *
 * Services are registered during bootstrap and resolved by key.
 * This avoids hard-coupling modules to specific implementations
 * (Ports & Adapters / Hexagonal Architecture).
 *
 * @example
 * ```ts
 * // At bootstrap (server.ts or app.ts)
 * import { container } from "./lib/container";
 * import type { MailProvider } from "./services/mail/mail.port";
 *
 * container.register("mail", new ConsoleMailAdapter());
 *
 * // In any service
 * const mail = container.resolve<MailProvider>("mail");
 * await mail.send({ to: "user@example.com", subject: "Hello", html: "..." });
 * ```
 */
class ServiceContainer {
  private services = new Map<string, unknown>();

  /**
   * Register a service implementation.
   * Overwrites any previous registration for the same key.
   */
  register<K extends ServiceKey>(key: K, implementation: ServiceMap[K]): void {
    log.info({ service: key }, "Service registered");
    this.services.set(key, implementation);
  }

  /**
   * Resolve a registered service by key.
   * Throws if the service has not been registered.
   */
  resolve<K extends ServiceKey>(key: K): ServiceMap[K] {
    const service = this.services.get(key);

    if (!service) {
      throw new Error(
        `Service "${key}" is not registered. ` +
          "Make sure to register it during app bootstrap.",
      );
    }

    return service as ServiceMap[K];
  }

  /**
   * Check if a service is registered.
   */
  has(key: ServiceKey): boolean {
    return this.services.has(key);
  }

  /**
   * Remove a service registration.
   */
  unregister(key: ServiceKey): void {
    this.services.delete(key);
  }

  /**
   * Remove all service registrations.
   * Useful in tests.
   */
  clear(): void {
    this.services.clear();
  }

  /**
   * List all registered service keys.
   */
  keys(): string[] {
    return [...this.services.keys()];
  }
}

/** Singleton service container. */
export const container = new ServiceContainer();

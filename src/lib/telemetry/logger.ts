type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: Record<string, unknown>;
}

/**
 * Interface para transports plugaveis.
 * Projetos derivados implementam esta interface para enviar logs
 * a servicos externos (Sentry, DataDog, Axiom, etc.).
 */
export interface LogTransport {
  name: string;
  log(entry: LogEntry): void;
}

// --- Console Transport (default) ---

const consoleTransport: LogTransport = {
  name: "console",
  log(entry: LogEntry) {
    /* eslint-disable no-console -- Console transport is the fallback */
    const output =
      process.env.NODE_ENV === "production" ? JSON.stringify(entry) : entry;

    switch (entry.level) {
      case "debug":
        console.debug(output);
        break;
      case "info":
        console.info(output);
        break;
      case "warn":
        console.warn(output);
        break;
      case "error":
        console.error(output);
        break;
    }
    /* eslint-enable no-console */
  },
};

// --- Logger ---

const transports: LogTransport[] = [consoleTransport];

let minLevel: LogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug";

function extractContext(args: unknown[]): Record<string, unknown> {
  const context: Record<string, unknown> = {};
  for (const arg of args) {
    if (arg instanceof Error) {
      context.error = {
        name: arg.name,
        message: arg.message,
        stack: arg.stack,
        ...(arg.cause instanceof Error && {
          cause: { name: arg.cause.name, message: arg.cause.message },
        }),
      };
    } else if (typeof arg === "object" && arg !== null) {
      Object.assign(context, arg);
    }
  }
  return context;
}

function log(level: LogLevel, message: string, ...args: unknown[]) {
  if (LOG_LEVELS[level] < LOG_LEVELS[minLevel]) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: extractContext(args),
  };

  for (const transport of transports) {
    try {
      transport.log(entry);
    } catch {
      // Nao deixar falha de transport quebrar o app
    }
  }
}

export const logger = {
  debug: (message: string, ...args: unknown[]) =>
    log("debug", message, ...args),
  info: (message: string, ...args: unknown[]) => log("info", message, ...args),
  warn: (message: string, ...args: unknown[]) => log("warn", message, ...args),
  error: (message: string, ...args: unknown[]) =>
    log("error", message, ...args),

  /**
   * Adiciona um transport customizado ao logger.
   * Retorna funcao de cleanup para remover o transport.
   */
  addTransport(transport: LogTransport): () => void {
    transports.push(transport);
    return () => {
      const idx = transports.indexOf(transport);
      if (idx >= 0) transports.splice(idx, 1);
    };
  },

  /**
   * Define o nivel minimo de log.
   * Logs abaixo deste nivel sao ignorados.
   */
  setMinLevel(level: LogLevel): void {
    minLevel = level;
  },

  /**
   * Retorna os transports registrados (para debug/testing).
   */
  getTransports(): readonly LogTransport[] {
    return transports;
  },
};

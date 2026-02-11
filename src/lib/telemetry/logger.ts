type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, ...args: unknown[]) {
  const timestamp = new Date().toISOString();
  const logData = { timestamp, level, message, ...extractContext(args) };

  /* eslint-disable no-console -- Logger is the centralized console abstraction */
  switch (level) {
    case "debug":
      console.debug(logData);
      break;
    case "info":
      console.info(logData);
      break;
    case "warn":
      console.warn(logData);
      break;
    case "error":
      console.error(logData);
      break;
  }
  /* eslint-enable no-console */
}

function extractContext(args: unknown[]): LogContext {
  const context: LogContext = {};
  for (const arg of args) {
    if (arg instanceof Error) {
      context.error = {
        name: arg.name,
        message: arg.message,
        stack: arg.stack,
      };
    } else if (typeof arg === "object" && arg !== null) {
      Object.assign(context, arg);
    }
  }
  return context;
}

export const logger = {
  debug: (message: string, ...args: unknown[]) =>
    log("debug", message, ...args),
  info: (message: string, ...args: unknown[]) =>
    log("info", message, ...args),
  warn: (message: string, ...args: unknown[]) =>
    log("warn", message, ...args),
  error: (message: string, ...args: unknown[]) =>
    log("error", message, ...args),
};

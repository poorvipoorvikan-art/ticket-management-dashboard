type LogLevel = "info" | "warn" | "error" | "debug";

type LogContext = Record<string, unknown>;

const sensitiveKeys = [
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "secret",
  "apiKey",
  "email",
  "phone",
  "creditCard"
];

const sanitizeValue = (
  value: unknown,
  key = ""
): unknown => {
  if (
    sensitiveKeys.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey.toLowerCase())
    )
  ) {
    return "[REDACTED]";
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: import.meta.env.DEV ? value.stack : undefined
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeValue(entryValue, entryKey)
      ])
    );
  }

  return value;
};

const writeLog = (
  level: LogLevel,
  message: string,
  context?: LogContext
) => {
  if (level === "debug" && !import.meta.env.DEV) {
    return;
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    context: context ? sanitizeValue(context) : undefined
  };

  const formattedLog = JSON.stringify(logEntry);

  switch (level) {
    case "info":
      console.info(formattedLog);
      break;

    case "warn":
      console.warn(formattedLog);
      break;

    case "error":
      console.error(formattedLog);
      break;

    case "debug":
      console.debug(formattedLog);
      break;
  }
};

export const logger = {
  info: (message: string, context?: LogContext) =>
    writeLog("info", message, context),

  warn: (message: string, context?: LogContext) =>
    writeLog("warn", message, context),

  error: (message: string, context?: LogContext) =>
    writeLog("error", message, context),

  debug: (message: string, context?: LogContext) =>
    writeLog("debug", message, context)
};
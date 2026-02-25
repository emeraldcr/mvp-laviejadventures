export type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

function formatMeta(meta?: LogMeta): string {
  if (!meta || Object.keys(meta).length === 0) return "";

  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return " [unserializable-meta]";
  }
}

function writeLog(level: LogLevel, scope: string, message: string, meta?: LogMeta) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${scope}] ${message}`;
  const line = `${prefix}${formatMeta(meta)}`;

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export function createLogger(scope: string) {
  return {
    info(message: string, meta?: LogMeta) {
      writeLog("info", scope, message, meta);
    },
    warn(message: string, meta?: LogMeta) {
      writeLog("warn", scope, message, meta);
    },
    error(message: string, meta?: LogMeta) {
      writeLog("error", scope, message, meta);
    },
  };
}

export function maskEmail(email?: string | null): string | null {
  if (!email) return null;

  const [local, domain] = email.toLowerCase().split("@");
  if (!local || !domain) return "***";

  if (local.length <= 2) {
    return `${local[0] ?? "*"}*@${domain}`;
  }

  return `${local.slice(0, 2)}***@${domain}`;
}

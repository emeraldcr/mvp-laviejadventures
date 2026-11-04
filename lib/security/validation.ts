export function validEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 8 && Buffer.byteLength(value, "utf8") <= 72;
}

export function validResetToken(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

export function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

// Reject operators before untrusted JSON reaches any database filter. Bound nesting
// also prevents recursive analytics sanitization from exhausting the call stack.
export function safeJson(value: unknown, depth = 0): boolean {
  if (depth > 12) return false;
  if (Array.isArray(value)) return value.length <= 100 && value.every(item => safeJson(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.entries(value).every(([key, item]) =>
      !key.startsWith("$") && !key.includes(".") && !["__proto__", "constructor", "prototype"].includes(key) && safeJson(item, depth + 1));
  }
  return true;
}

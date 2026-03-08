const SAFE_TEXT_REGEX = /^[\p{L}\p{N}\s.,'()\-_/áéíóúÁÉÍÓÚñÑüÜ]+$/u;

export function sanitizeText(value: unknown, maxLength = 120): string {
  if (typeof value !== "string") return "";

  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[\r\n]/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function isSafeText(value: string, minLength = 1): boolean {
  return value.length >= minLength && SAFE_TEXT_REGEX.test(value);
}

export function normalizeEmail(value: unknown): string {
  return sanitizeText(value, 254).toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizePhone(value: unknown): string {
  return sanitizeText(value, 25);
}

export function isValidPhone(value: string): boolean {
  return /^\+?[0-9()\-\s]{7,20}$/.test(value);
}

export function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export function toPositiveCurrency(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Number(parsed.toFixed(2));
}

export function normalizeSlugLike(value: unknown, maxLength = 80): string {
  return sanitizeText(value, maxLength).toLowerCase();
}

export function isSlugLike(value: string): boolean {
  return /^[a-z0-9][a-z0-9-_]{0,79}$/.test(value);
}

export function isISODateOnly(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

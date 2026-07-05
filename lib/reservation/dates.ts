export function normalizeReservationDate(date: unknown, dateIso?: unknown): string | null {
  const tryParse = (value: unknown): string | null => {
    if (typeof value !== "string" || !value.trim()) return null;

    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return null;

    return parsed.toISOString().split("T")[0];
  };

  return tryParse(dateIso) ?? tryParse(date);
}

export function isWeekendIsoDate(date: string): boolean {
  const dateParts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateParts) return false;

  const [, yearRaw, monthRaw, dayRaw] = dateParts;
  const localDate = new Date(Number(yearRaw), Number(monthRaw) - 1, Number(dayRaw));
  const day = localDate.getDay();
  return day === 0 || day === 6;
}

// lib/constants/validation.ts
// Shared validation and parsing regex patterns.

// ─── Form validation ──────────────────────────────────────────────────────────

/** Basic email format check for form inputs */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Costa Rica local 8-digit phone format (e.g. 8888-9999 or 88889999) */
export const PHONE_NUMBER_REGEX = /^\d{4}[\s-]?\d{4}$/;

// ─── AI assistant free-text parsing patterns ──────────────────────────────────

/** ISO date format: YYYY-MM-DD or YYYY/MM/DD */
export const DATE_PATTERN_ISO = /\b(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})\b/;

/** Day-month-year format: DD-MM-YY or DD/MM/YYYY */
export const DATE_PATTERN_DMY = /\b(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})\b/;

/** Email pattern for extracting emails from free text */
export const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

/** Phone number extraction from free text (use a new RegExp per call due to /g flag) */
export const PHONE_PATTERN_GLOBAL = /\+?\d[\d\s()\-]{7,}\d/g;

/** Name extraction from Spanish phrases (e.g. "me llamo Juan") */
export const NAME_PATTERN =
  /(?:me\s+llamo|mi\s+nombre\s+es|soy|nombre|name)\s*[:=-]?\s*([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+){0,3})/i;

/** Ticket/person count extraction (e.g. "somos 4", "3 personas") */
export const TICKETS_PATTERN =
  /(?:somos|vamos|personas?|tickets?|boletos?|cupos?)\s*[:=]?\s*(\d{1,2})/i;

/** Phone context keywords to distinguish phone numbers from other digits */
export const PHONE_CONTEXT_PATTERN =
  /(?:tel(?:efono)?|cel(?:ular)?|movil|whatsapp|wa\b|phone|numero)/i;

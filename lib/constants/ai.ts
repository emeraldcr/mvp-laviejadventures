// lib/constants/ai.ts
// Model identifiers and cache config for AI features.

/** Model used for generating the dynamic hero slogan */
export const SLOGAN_MODEL = "claude-haiku-4-5-20251001";

/** Model used for the AI booking assistant */
export const ASSISTANT_MODEL = "claude-haiku-4-5";

/** TTL for caching assistant model responses (ms) — 10 minutes */
export const ASSISTANT_CACHE_TTL_MS = 1_000 * 60 * 10;

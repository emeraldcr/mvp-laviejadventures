// ─────────────────────────────────────────────────────────────
// Shared résumé definitions — the single source of truth for the facts that
// repeat across every variant. Import from here, not from a sibling variant.
//
//   identity.ts        → name, contact block, languages (+ builders)
//   education.ts        → the one education block
//   certifications.ts   → formal certs (none yet) + compliance exposure
//   jobs.ts             → one record per employer + the full bullet pool ("menu")
//
// Migration path for a variant's constants.ts:
//   import { buildContactInfo, buildLanguages, NAME } from "../definitions/identity";
//   export { education } from "../definitions/education";
//   export const personalInfo = { name: NAME, title: "…" };
//   export const contactInfo  = buildContactInfo("latam");
//   export const languages    = buildLanguages("short");
//   // summary + experience stay local — they are what each variant tailors.
// ─────────────────────────────────────────────────────────────

export * from "./identity";
export * from "./education";
export * from "./certifications";
export * from "./jobs";

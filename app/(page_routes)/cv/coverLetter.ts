// ─────────────────────────────────────────────────────────────
// Cover-letter generator.
//
// Paste a company blurb / job posting and this fills a fixed template with the
// pasted company + role and the active résumé variant's positioning — headline
// role, focus areas, and the two most recent experience bullets.
//
// Deterministic string templating, no network calls. Copy the draft out and
// swap in the real hiring-manager name + a company-specific detail before
// sending.
// ─────────────────────────────────────────────────────────────

import type { CvData, SummarySegment } from "./types";
import type { CvVariant } from "./variants";

export type CompanyInfo = {
  company: string;
  role: string;
  location: string;
  hiringManager: string;
};

const collapse = (s: string) => s.replace(/\s+/g, " ").trim();
const stripEdges = (s: string) => s.replace(/^[\s"'([]+|[\s"')\].,;:]+$/g, "");

// ── parse ───────────────────────────────────────────────────

/** Best-effort extraction from a pasted posting / notes blob. Everything the
 *  parser misses just falls back to the variant defaults at build time. */
export function parseCompanyInfo(raw: string): CompanyInfo {
  const text = raw.replace(/\r/g, "");
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const labelled = (labels: string[]): string => {
    const re = new RegExp(`^(?:${labels.join("|")})\\s*[:\\-–]\\s*(.+)$`, "i");
    for (const l of lines) {
      const m = l.match(re);
      if (m) return stripEdges(collapse(m[1]));
    }
    return "";
  };

  let company = labelled(["company", "employer", "organi[sz]ation", "client"]);
  let role = labelled(["role", "position", "job title", "title", "job"]);
  const location = labelled(["location", "based in", "office", "region"]);
  const hiringManager = labelled([
    "hiring manager",
    "hiring lead",
    "contact",
    "recruiter",
    "reporting to",
    "attn",
  ]);

  // "<Role> at <Company>" anywhere in the text.
  if (!company || !role) {
    const m = text.match(
      /\b([A-Z][A-Za-z0-9/&+.\-]*(?:\s+[A-Za-z0-9/&+.\-]+){0,5}?)\s+(?:role|position|job)?\s*at\s+([A-Z][A-Za-z0-9/&+.\-]*(?:\s+[A-Za-z0-9/&+.\-]+){0,4})/,
    );
    if (m) {
      if (!role) role = stripEdges(collapse(m[1]));
      if (!company) company = stripEdges(collapse(m[2]));
    }
  }

  // Last resort: first short, non-URL line is probably the company name.
  if (!company) {
    const first = lines.find((l) => !/^https?:\/\//i.test(l) && l.length <= 64);
    if (first) company = stripEdges(collapse(first));
  }

  return { company, role, location, hiringManager };
}

// ── build ───────────────────────────────────────────────────

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function flattenSummary(summary: readonly SummarySegment[][]): string {
  return collapse(summary.map((p) => p.map((s) => s.text).join("")).join(" "));
}

function listWithAnd(items: readonly string[]): string {
  const xs = items.filter(Boolean);
  if (xs.length <= 1) return xs[0] ?? "";
  return `${xs.slice(0, -1).join(", ")}, and ${xs[xs.length - 1]}`;
}

/** Lowercase the first letter unless it looks like an acronym (AWS, SQL…). */
function lowerFirst(s: string): string {
  return /^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s;
}

function asSentence(s: string): string {
  const t = collapse(s);
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

/** Trim a company field down to a name: drop "· Client: …", legal suffixes. */
function companyName(raw: string): string {
  const head = collapse(raw.split(/[·—]| - /)[0]);
  return head.replace(/,?\s+(Inc|LLC|Ltd|GmbH|S\.A\.|Corp)\.?$/i, "");
}

export type CoverLetterInput = {
  info: CompanyInfo;
  variant: CvVariant;
  cv: CvData;
  /** Free text — used verbatim as the "why this company" paragraph. */
  notes?: string;
  date?: Date;
};

export function buildCoverLetter({
  info,
  variant,
  cv,
  notes,
  date = new Date(),
}: CoverLetterInput): string {
  const name = cv.personalInfo.name;
  const contactLine = cv.contactInfo.map((c) => c.text).join("  ·  ");
  const company = info.company ? companyName(info.company) : "your company";
  const role = info.role || variant.role;

  const greeting = info.hiringManager
    ? `Dear ${info.hiringManager},`
    : info.company
      ? `Dear ${company} Hiring Team,`
      : "Dear Hiring Team,";

  const yearsMatch = flattenSummary(cv.summary).match(/\d+\+?\s*years/i);
  const years = yearsMatch ? yearsMatch[0].toLowerCase() : "over a decade";

  const focusAll = listWithAnd(variant.focus);
  const focusShort = listWithAnd(variant.focus.slice(0, 3));

  const current = cv.experience[0];
  const earlier = cv.experience.slice(1).find((e) => e.bullets.length > 0);

  const paras: string[] = [];

  paras.push(
    `I'm writing to express my interest in the ${role} position at ${company}. ` +
      `I'm a ${variant.role} with ${years} of experience delivering production software across enterprise, ` +
      `healthcare, consumer, and consulting environments, and this role is a strong match for my background in ${focusAll}.`,
  );

  if (current?.bullets[0]) {
    let proof = `In my current role at ${companyName(current.company)}, I ${lowerFirst(asSentence(current.bullets[0]))}`;
    if (earlier?.bullets[0]) {
      proof += ` Before that, at ${companyName(earlier.company)}, I ${lowerFirst(asSentence(earlier.bullets[0]))}`;
    }
    proof += ` I take that work end to end — from system design through delivery and production monitoring — across ${focusShort}.`;
    paras.push(proof);
  }

  paras.push(
    notes && notes.trim()
      ? asSentence(collapse(notes))
      : `${company} stands out to me for the scale and the engineering quality your team is known for. ` +
          `I'd bring the same end-to-end ownership and collaborative habits — code review, mentoring, and clear ` +
          `architectural trade-offs — that my teammates rely on today.`,
  );

  paras.push(
    `Thank you for your time and consideration. I'd welcome the chance to discuss how I can contribute to ${company}.`,
  );

  return [
    name,
    contactLine,
    "",
    formatDate(date),
    "",
    greeting,
    "",
    paras.map(collapse).join("\n\n"),
    "",
    "Sincerely,",
    name,
    "",
  ].join("\n");
}

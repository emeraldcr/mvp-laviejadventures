import { SKILL_DICTIONARY } from "@/app/(page_routes)/cv/audit";
import { CvInputError, normalizedText } from "./jd";
import { assembleCv, validateJobDescription } from "./validate";
import type { CvResult, CvSources, Evidence, JobDescription, TailoredDraft } from "./types";

const wordCount = (text: string) => text.trim().split(/\s+/).length;
const escape = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function termPattern(term: string): RegExp {
  const body = term.trim().split(/[\s_-]+/).map(escape).join("[\\s_-]+");
  return new RegExp(`(?:^|[^\\p{L}\\p{N}+#])(${body})(?=$|[^\\p{L}\\p{N}+#])`, "iu");
}
export const containsTerm = (text: string, term: string) => termPattern(term).test(text);

/** Conservative keyword extraction that never requires a provider connection. */
export function extractLocalJobDescription(text: string): JobDescription {
  const allLines = text.split("\n");
  const titleIndex = allLines.findIndex((line) => line.length <= 180 && !/[.!?]$/.test(line) && /\b(?:engineer|developer|architect|analyst|manager|designer|consultant|specialist|administrator|scientist|ingenier[oa]|desarrollador[ae]?|analista|gerente|diseñador[ae]?)\b/i.test(line));
  const hasRequirements = /\b(?:responsibilit\w*|requirements?|qualifications?|experience|role|position|seeking|skills|requisitos|experiencia|puesto|responsabilidades)\b/i.test(text);
  if (titleIndex < 0 || !hasRequirements) throw new CvInputError("Include the job title, responsibilities, and requirements so we can tailor your CV.");
  // Keep the posted company information for display, but exclude benefits,
  // equal-opportunity notices and form text from keyword scoring.
  const tail = allLines.findIndex((line, index) => index > titleIndex + 4 && /^(?:about (?!the role|this role|the position|the job|you)\S.*|our values|perks\s*(?:&|and)\s*benefits|compliance\s*(?:&|and)\s*privacy.*|equal opportunity.*|apply for this job)$/i.test(line));
  const lines = tail >= 0 ? allLines.slice(0, tail) : allLines;
  const keywords: JobDescription["keywords"] = [];
  const seen = new Set<string>();
  let section: JobDescription["keywords"][number]["priority"] = "context";
  for (const line of lines) {
    if (/^(?:requirements|qualifications|what you (?:bring|need)|your professional qualifications|required skills)/i.test(line)) section = "required";
    if (/^(?:preferred|nice.to.have|bonus)/i.test(line)) section = "preferred";
    for (const entry of SKILL_DICTIONARY) {
      const alternatives = entry.match ?? [entry.label, ...(entry.aliases ?? [])];
      const hit = alternatives.map((term) => termPattern(term).exec(line)?.[1]).find(Boolean);
      if (!hit) continue;
      // Preserve the term that actually occurs, not an inferred related tool.
      const suffix = line.slice(line.indexOf(hit) + hit.length).match(/^\s+(?:v(?:ersion)?\s*)?(\d+(?:\.\d+)*(?:\+)?)(?=$|[\s,;:)])/i);
      const term = suffix ? `${hit} ${suffix[1]}` : hit;
      const key = normalizedText(term);
      if (seen.has(key)) continue;
      seen.add(key);
      const priority = /\b(?:preferred|nice.to.have|bonus|exposure|familiarity)\b/i.test(line) ? "preferred" : /\b(?:required|must|minimum|at least)\b/i.test(line) ? "required" : section;
      keywords.push({ term, quote: line, priority });
    }
  }
  if (!keywords.length) keywords.push({ term: allLines[titleIndex], quote: allLines[titleIndex], priority: "context" });
  const preceding = allLines[titleIndex - 1];
  const company = preceding && preceding.length <= 80 && !/^(?:about|job|career|role|position|location|remote|hybrid|on.site|home|search|back)\b/i.test(preceding) ? preceding : null;
  const ordered = keywords.sort((a, b) => ({ required: 0, preferred: 1, context: 2 }[a.priority] - { required: 0, preferred: 1, context: 2 }[b.priority]));
  return validateJobDescription({ isJobDescription: true, title: allLines[titleIndex], company, cleanedText: lines.join("\n"), keywords: ordered.slice(0, 35),
    responsibilities: lines.filter((line) => /^(?:[-•]\s*)?(?:design|build|develop|lead|implement|maintain|collaborate|integrate|architect|deliver|crear|desarrollar|diseñar)\b/i.test(line)).slice(0, 12) }, text);
}

/** Every candidate sentence/skill is copied from the archive, never invented. */
export function buildArchiveResult(sources: CvSources, jd: JobDescription, notices: string[] = []): CvResult {
  const score = (text: string) => jd.keywords.reduce((sum, keyword) => sum + (containsTerm(text, keyword.term) ? keyword.priority === "required" ? 6 : keyword.priority === "preferred" ? 3 : 2 : 0), 0);
  const ranked = <T extends { text: string }>(items: T[]) => [...items].sort((a, b) => score(b.text) - score(a.text) || wordCount(a.text) - wordCount(b.text));
  const summaries = ranked(sources.evidence.filter((item) => item.zone === "summary" && !item.text.includes(": ") && wordCount(item.text) >= 15 && wordCount(item.text) <= 85));
  const summary: TailoredDraft["summary"] = [];
  let profileWords = 0;
  for (const proof of summaries) {
    if (profileWords + wordCount(proof.text) > 95) continue;
    // Do not fill the profile with several near-identical variant paragraphs.
    if (summary.length && (score(proof.text) === 0 || summary[0].text.includes(proof.text.slice(0, 45)))) continue;
    summary.push({ text: proof.text, evidenceIds: [proof.id] }); profileWords += wordCount(proof.text);
    if (summary.length === 2) break;
  }
  if (!summary.length) throw new Error("Archived CV profile evidence is unavailable.");
  const buckets = new Map<string, { label: string; skillIds: string[] }>();
  let skillChars = 0;
  const selected = ranked(sources.skills).filter((skill) => skill.text.length <= 145);
  for (const skill of selected) {
    const selectedCount = [...buckets.values()].reduce((sum, group) => sum + group.skillIds.length, 0);
    if (selectedCount >= 22 || skillChars + skill.text.length + 1 > 1_100) continue;
    const label = /ai|llm|agent/i.test(skill.label) ? "AI & Automation" : /front|react|ui/i.test(skill.label) ? "Frontend" : /cloud|devops|delivery|infra/i.test(skill.label) ? "Cloud & Delivery" : /language|backend|api|java|python/i.test(skill.label) ? "Languages & Backend" : "Data & Engineering";
    const group = buckets.get(label) ?? { label, skillIds: [] };
    group.skillIds.push(skill.id); buckets.set(label, group); skillChars += skill.text.length + 1;
  }
  const groups = [...buckets.values()];
  if (groups.length === 1) {
    const extra = groups[0].skillIds.splice(Math.ceil(groups[0].skillIds.length / 2));
    groups.push({ label: "Additional Skills", skillIds: extra });
  }
  let bulletWords = 0;
  const usedProof = new Set(summary.flatMap((paragraph) => paragraph.evidenceIds));
  const experience = sources.jobs.map((job) => {
    const candidates = ranked(sources.evidence.filter((item) => item.jobId === job.id && wordCount(item.text) <= 40));
    const bullets: TailoredDraft["experience"][number]["bullets"] = [];
    for (const proof of candidates) {
      if (bulletWords + wordCount(proof.text) > 300 && bullets.length) continue;
      if (bullets.some((bullet) => bullet.text === proof.text)) continue;
      bullets.push({ text: proof.text, evidenceIds: [proof.id] }); usedProof.add(proof.id); bulletWords += wordCount(proof.text);
      if (bullets.length === (job.index < 3 ? 2 : 1)) break;
    }
    if (!bullets.length) throw new Error("Archived employment evidence is unavailable.");
    return { jobId: job.id, bullets };
  });
  // Matches refer to proof actually present in this CV, rather than all archive text.
  const chosenSkills = new Set(groups.flatMap((group) => group.skillIds));
  const keywordMatches = jd.keywords.flatMap((keyword) => {
    const evidenceIds = sources.evidence.filter((item) => usedProof.has(item.id) && containsTerm(item.text, keyword.term)).map((item) => item.id).slice(0, 4);
    const skillIds = sources.skills.filter((skill) => chosenSkills.has(skill.id) && containsTerm(skill.text, keyword.term)).map((skill) => skill.id).slice(0, 4);
    return evidenceIds.length + skillIds.length ? [{ term: keyword.term, evidenceIds, skillIds }] : [];
  });
  const result = assembleCv(sources, jd, { headline: sources.base.personalInfo.title.split(" · ")[0], summary, skillGroups: groups, experience, keywordMatches });
  return { ...result, method: "archive", notices };
}

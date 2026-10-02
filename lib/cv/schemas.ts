const string = { type: "string" };
const array = (items: object) => ({ type: "array", items });
const object = (properties: Record<string, object>) => ({ type: "object", additionalProperties: false, properties, required: Object.keys(properties) });
const groundedText = object({ text: string, evidenceIds: array(string) });

export const JD_SCHEMA = object({
  isJobDescription: { type: "boolean" }, title: string, company: { type: ["string", "null"] }, cleanedText: string,
  keywords: array(object({ term: string, quote: string, priority: { type: "string", enum: ["required", "preferred", "context"] } })),
  responsibilities: array(string),
});
export const DRAFT_SCHEMA = object({
  headline: string, summary: array(groundedText),
  skillGroups: array(object({ label: string, skillIds: array(string) })),
  experience: array(object({ jobId: string, bullets: array(groundedText) })),
  keywordMatches: array(object({ term: string, evidenceIds: array(string), skillIds: array(string) })),
});
export const AUDIT_SCHEMA = object({ supported: { type: "boolean" }, issues: array(string) });

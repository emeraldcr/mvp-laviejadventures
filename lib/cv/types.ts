import type { EditableCv } from "@/app/(page_routes)/cv/editableCv";

export type SavedCv = EditableCv & { density: "standard" | "compact" };
export type Evidence = { id: string; text: string; zone: "summary" | "experience"; jobId: string | null; archives: string[] };
export type SourceSkill = { id: string; label: string; text: string; archives: string[] };
export type CvSources = { base: SavedCv; evidence: Evidence[]; skills: SourceSkill[]; jobs: { id: string; index: number }[]; archiveSlugs: string[]; version: string };
export type JobDescription = {
  isJobDescription: boolean;
  title: string;
  company: string | null;
  cleanedText: string;
  keywords: { term: string; quote: string; priority: "required" | "preferred" | "context" }[];
  responsibilities: string[];
};
export type GroundedText = { text: string; evidenceIds: string[] };
export type TailoredDraft = {
  headline: string;
  summary: GroundedText[];
  skillGroups: { label: string; skillIds: string[] }[];
  experience: { jobId: string; bullets: GroundedText[] }[];
  keywordMatches: { term: string; evidenceIds: string[]; skillIds: string[] }[];
};
export type GenerationDiagnostic = { stage: string; code: string; message: string; retryable: boolean; status?: number; requestId?: string; model?: string };
export type GenerationMethod = "ai" | "archive";
export type GenerationProgress = "extract" | "tailor" | "review" | "repair" | "fallback" | "complete";
export type CvResult = { cv: SavedCv; draft: TailoredDraft; jd: JobDescription; gaps: string[]; evidence: Evidence[]; sourceVersion: string; archiveSlugs: string[]; method?: GenerationMethod; notices?: string[] };
export type GenerationSummary = { id: string; title: string; company: string | null; status: "pending" | "complete" | "error"; createdAt: string };
export type GenerationView = GenerationSummary & { result: CvResult | null; error: string | null; jobDescription: string; progress?: GenerationProgress; diagnostics?: GenerationDiagnostic[] };

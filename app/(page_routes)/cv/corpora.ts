// ─────────────────────────────────────────────────────────────
// Every variant's résumé data + prebuilt text corpus, in one place.
//
// A route only loads its own constants.ts, but the sidebar needs all of them:
//   - VARIANT_CV      → build a cover letter for any variant ("Copy letter")
//   - VARIANT_CORPUS  → score every variant against a pasted JD ("Match" sort)
//
// Add a variant = one import + one line in each map (keys match variants.ts slugs).
// ─────────────────────────────────────────────────────────────

import { buildCorpus } from "./audit";
import type { CvData } from "./types";

import * as base from "./constants";
import * as agenticAi from "./agentic-ai/constants";
import * as pythonReactLead from "./python-react-lead/constants";
import * as pythonReactAws from "./python-react-aws/constants";
import * as pythonDotnet from "./python-dotnet/constants";
import * as java from "./java/constants";
import * as elasticsearch from "./elasticsearch/constants";
import * as electricAir from "./electric-air/constants";
import * as designli from "./designli/constants";

type CvConstantsModule = {
  personalInfo: CvData["personalInfo"];
  contactInfo: CvData["contactInfo"];
  primarySkills: CvData["primarySkills"];
  secondarySkills: CvData["secondarySkills"];
  education: CvData["education"];
  languages: CvData["languages"];
  summary: CvData["summary"];
  experience: CvData["experience"];
};

const asCv = (m: CvConstantsModule): CvData => ({
  personalInfo: m.personalInfo,
  contactInfo: m.contactInfo,
  primarySkills: m.primarySkills,
  secondarySkills: m.secondarySkills,
  education: m.education,
  languages: m.languages,
  summary: m.summary,
  experience: m.experience,
});

export const VARIANT_CV: Record<string, CvData> = {
  "": asCv(base),
  "agentic-ai": asCv(agenticAi),
  "python-react-lead": asCv(pythonReactLead),
  "python-react-aws": asCv(pythonReactAws),
  "python-dotnet": asCv(pythonDotnet),
  java: asCv(java),
  elasticsearch: asCv(elasticsearch),
  "electric-air": asCv(electricAir),
  designli: asCv(designli),
};

export const VARIANT_CORPUS: Record<string, string> = {};
for (const [slug, cv] of Object.entries(VARIANT_CV)) {
  VARIANT_CORPUS[slug] = buildCorpus(cv);
}

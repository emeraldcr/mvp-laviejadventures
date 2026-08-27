import type { LucideIcon } from "lucide-react";

// Shared shape every CV variant's `constants.ts` must satisfy.
// The document layout is identical across variants — only this data changes.

export type SummarySegment = {
  text: string;
  bold?: boolean;
  accent?: boolean;
};

export type SkillGroup = {
  label: string;
  items: readonly string[];
};

export type ContactEntry = {
  icon: LucideIcon;
  text: string;
  href?: string;
  external?: boolean;
};

export type ExperienceEntry = {
  role: string;
  company: string;
  period: string;
  location: string;
  current?: boolean;
  bullets: string[];
};

export type CvData = {
  personalInfo: { name: string; title: string };
  contactInfo: readonly ContactEntry[];
  primarySkills: readonly SkillGroup[];
  secondarySkills: readonly SkillGroup[];
  education: {
    degree: string;
    school: string;
    period: string;
    internshipLabel: string;
    internship: string;
  };
  languages: readonly { language: string; level: string }[];
  summary: readonly SummarySegment[][];
  experience: readonly ExperienceEntry[];
};

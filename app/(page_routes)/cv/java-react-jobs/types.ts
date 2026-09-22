import type { ApplicationState, ApplicationStatus } from "../applications";

export type JobLead = {
  id: string;
  applicationSlug: string;
  company: string;
  title: string;
  location: string;
  url: string;
  postedOn?: string;
  match: "campaign" | "exact" | "search";
  cvPath?: string;
  seeded: boolean;
};

export type JobLeadPatch = Partial<Pick<JobLead, "company" | "title" | "location" | "url">>;
export type StatusFilter = ApplicationStatus | "all";

export type JobRowModel = {
  job: JobLead;
  index: number;
  state: ApplicationState;
};

export type JobStats = {
  filled: number;
  applied: number;
  active: number;
  offers: number;
};

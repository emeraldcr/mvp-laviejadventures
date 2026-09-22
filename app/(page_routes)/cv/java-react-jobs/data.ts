import { JAVA_REACT_CAMPAIGN_JOB_KEYS, JAVA_REACT_CAMPAIGN_JOBS } from "../java-react-2026/jobs";
import { DEFAULT_REMOTE_LOCATION, TOTAL_JOBS } from "./constants";
import { RESEARCHED_JOBS } from "./researched-jobs";
import type { JobLead } from "./types";

function blankSlot(position: number): JobLead {
  const slot = String(position).padStart(3, "0");
  return {
    id: `slot-${slot}`,
    applicationSlug: `java-react-jobs/slot-${slot}`,
    company: "",
    title: "",
    location: DEFAULT_REMOTE_LOCATION,
    url: "",
    match: "search",
    seeded: false,
  };
}

export function createDefaultJobs(): JobLead[] {
  const seeded = JAVA_REACT_CAMPAIGN_JOB_KEYS.map((key) => {
    const job = JAVA_REACT_CAMPAIGN_JOBS[key];
    return {
      id: `campaign-${job.key}`,
      applicationSlug: `java-react-2026/${job.key}`,
      company: job.company,
      title: job.postingTitle,
      location: job.location,
      url: job.jobUrl,
      match: "campaign",
      cvPath: `/cv/java-react-2026/${job.key}`,
      seeded: true,
    } satisfies JobLead;
  });

  const researched = RESEARCHED_JOBS.slice(0, TOTAL_JOBS - seeded.length).map((job, index) => {
    const position = seeded.length + index + 1;
    const slot = String(position).padStart(3, "0");
    return {
      id: `slot-${slot}`,
      applicationSlug: `java-react-jobs/slot-${slot}`,
      company: job.company,
      title: job.title,
      location: job.location || DEFAULT_REMOTE_LOCATION,
      url: job.url,
      postedOn: job.postedOn,
      match: job.match,
      seeded: false,
    } satisfies JobLead;
  });
  const filled = seeded.length + researched.length;

  return [
    ...seeded,
    ...researched,
    ...Array.from({ length: TOTAL_JOBS - filled }, (_, index) => blankSlot(filled + index + 1)),
  ];
}

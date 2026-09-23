"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { ApplicationState } from "./applications";
import { useApplications } from "./useApplications";
import { createDefaultJobs } from "./java-react-jobs-data";
import { calculateJobStats, selectJobRows } from "./java-react-jobs-helpers";
import { readStoredJobs, writeStoredJobs } from "./java-react-jobs-memory";
import type { JobLead, JobLeadPatch, JobRowModel, JobStats, StatusFilter } from "./java-react-jobs-types";

type JobBoardContextValue = {
  rows: JobRowModel[];
  stats: JobStats;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  statusFilter: StatusFilter;
  setStatusFilter: Dispatch<SetStateAction<StatusFilter>>;
  filledOnly: boolean;
  setFilledOnly: Dispatch<SetStateAction<boolean>>;
  openId: string | null;
  toggleOpen: (id: string) => void;
  updateJob: (id: string, patch: JobLeadPatch) => void;
  updateApplication: (slug: string, patch: Partial<ApplicationState>) => void;
};

const JobBoardContext = createContext<JobBoardContextValue | null>(null);

export function JobBoardProvider({ children }: { children: ReactNode }) {
  const { get: getApplication, update: updateApplication } = useApplications();
  const [jobs, setJobs] = useState<JobLead[]>(createDefaultJobs);
  const [storageReady, setStorageReady] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filledOnly, setFilledOnly] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setJobs(readStoredJobs(createDefaultJobs()));
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (storageReady) writeStoredJobs(jobs);
  }, [jobs, storageReady]);

  const rows = useMemo(
    () => selectJobRows({ jobs, getApplication, query, statusFilter, filledOnly }),
    [filledOnly, getApplication, jobs, query, statusFilter],
  );
  const stats = useMemo(() => calculateJobStats(jobs, getApplication), [getApplication, jobs]);

  const value = useMemo<JobBoardContextValue>(
    () => ({
      rows,
      stats,
      query,
      setQuery,
      statusFilter,
      setStatusFilter,
      filledOnly,
      setFilledOnly,
      openId,
      toggleOpen: (id) => setOpenId((current) => (current === id ? null : id)),
      updateJob: (id, patch) =>
        setJobs((current) => current.map((job) => (job.id === id ? { ...job, ...patch } : job))),
      updateApplication,
    }),
    [filledOnly, openId, query, rows, stats, statusFilter, updateApplication],
  );

  return <JobBoardContext.Provider value={value}>{children}</JobBoardContext.Provider>;
}

export function useJobBoard(): JobBoardContextValue {
  const context = useContext(JobBoardContext);
  if (!context) throw new Error("useJobBoard must be used inside JobBoardProvider");
  return context;
}

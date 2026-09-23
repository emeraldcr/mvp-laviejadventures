"use client";

import { JobBoardScreen } from "./components/JobBoardScreen";
import { JobBoardProvider } from "./context";

export function JavaReactJobsClient() {
  return (
    <JobBoardProvider>
      <JobBoardScreen />
    </JobBoardProvider>
  );
}

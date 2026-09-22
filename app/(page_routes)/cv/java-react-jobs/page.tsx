import type { Metadata } from "next";
import { JavaReactJobsClient } from "./JavaReactJobsClient";

export const metadata: Metadata = {
  title: "100 Java + React Jobs | Application Tracker",
  description: "A focused application tracker for 100 remote Java and React opportunities.",
};

export default function JavaReactJobsPage() {
  return <JavaReactJobsClient />;
}

import type { Metadata } from "next";
import { CoverLetterWorkspace } from "./workspace";

export const metadata: Metadata = { title: "Cover letter editor" };

export default function CvCoverLetterPage() {
  return <CoverLetterWorkspace />;
}

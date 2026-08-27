"use client";

import { CvWorkspace } from "../CvWorkspace";
import {
  contactInfo,
  education,
  experience,
  languages,
  personalInfo,
  primarySkills,
  secondarySkills,
  summary,
} from "./constants";

export default function CvJavaPage() {
  return (
    <CvWorkspace
      activeSlug="java"
      cv={{ personalInfo, contactInfo, primarySkills, secondarySkills, education, languages, summary, experience }}
    />
  );
}

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

export default function CvDesignliPage() {
  return (
    <CvWorkspace
      activeSlug="designli"
      cv={{ personalInfo, contactInfo, primarySkills, secondarySkills, education, languages, summary, experience }}
    />
  );
}

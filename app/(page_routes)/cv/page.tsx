"use client";

import { CvWorkspace } from "./CvWorkspace";
import {
  contactInfo,
  education,
  experience,
  highlights,
  languages,
  personalInfo,
  primarySkills,
  secondarySkills,
  summary,
} from "./constants";

export default function CvPage() {
  return (
    <CvWorkspace
      activeSlug=""
      cv={{
        personalInfo,
        contactInfo,
        primarySkills,
        secondarySkills,
        education,
        languages,
        summary,
        highlights,
        experience,
      }}
    />
  );
}

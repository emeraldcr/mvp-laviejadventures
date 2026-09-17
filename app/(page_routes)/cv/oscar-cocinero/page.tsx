"use client";

import { CvWorkspace } from "../CvWorkspace";
import {
  contactInfo,
  education,
  experience,
  labels,
  languages,
  personalInfo,
  primarySkills,
  secondarySkills,
  summary,
} from "./constants";

export default function CvOscarCocineroPage() {
  return (
    <CvWorkspace
      activeSlug="oscar-cocinero"
      cv={{
        personalInfo,
        contactInfo,
        primarySkills,
        secondarySkills,
        education,
        languages,
        summary,
        experience,
        labels,
      }}
    />
  );
}

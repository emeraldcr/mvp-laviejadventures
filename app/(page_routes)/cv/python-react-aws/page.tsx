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

export default function CvPythonReactAwsPage() {
  return (
    <CvWorkspace
      activeSlug="python-react-aws"
      cv={{ personalInfo, contactInfo, primarySkills, secondarySkills, education, languages, summary, experience }}
    />
  );
}

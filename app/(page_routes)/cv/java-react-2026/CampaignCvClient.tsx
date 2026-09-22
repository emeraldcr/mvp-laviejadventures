"use client";

import { CvWorkspace } from "../CvWorkspace";
import { buildJavaReactCampaignCv, type JavaReactCampaignJobKey } from "./jobs";

export function CampaignCvClient({ company }: { company: JavaReactCampaignJobKey }) {
  return <CvWorkspace activeSlug={`java-react-2026/${company}`} cv={buildJavaReactCampaignCv(company)} />;
}


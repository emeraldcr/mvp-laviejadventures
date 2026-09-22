import { notFound } from "next/navigation";
import {
  isJavaReactCampaignJobKey,
  JAVA_REACT_CAMPAIGN_JOB_KEYS,
} from "../jobs";
import { CampaignCvClient } from "../CampaignCvClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return JAVA_REACT_CAMPAIGN_JOB_KEYS.map((company) => ({ company }));
}

export default async function JavaReactCampaignPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;
  if (!isJavaReactCampaignJobKey(company)) notFound();

  return <CampaignCvClient company={company} />;
}

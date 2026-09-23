"use client";

import { CvWorkspace } from "./CvWorkspace";
import { getCvBySlug } from "./cv-data";

/** Shared client boundary for every data-driven CV route. */
export function CvRoute({ slug }: { slug: string }) {
  const cv = getCvBySlug(slug);
  if (!cv) return null;

  return <CvWorkspace activeSlug={slug} cv={cv} />;
}

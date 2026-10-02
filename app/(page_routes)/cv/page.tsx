import type { Metadata } from "next";
import { getAdminFromCookies } from "@/lib/admin-auth";
import { getGeneration } from "@/lib/cv/store";
import { CvGenerator } from "./CvGenerator";

export const metadata: Metadata = { title: "CV Generator", robots: { index: false, follow: false } };

export default async function CvPage({ searchParams }: { searchParams: Promise<{ retry?: string }> }) {
  const admin = await getAdminFromCookies();
  const { retry } = await searchParams;
  let initialJd = "";
  if (admin && retry && /^[0-9a-f-]{36}$/i.test(retry)) {
    try { initialJd = (await getGeneration(admin.id, retry))?.jobDescription ?? ""; } catch {}
  }
  return <CvGenerator initiallySignedIn={Boolean(admin)} initialJd={initialJd} />;
}

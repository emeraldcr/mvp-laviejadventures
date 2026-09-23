import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isCvSlug } from "../cv-data";
import { cvVariantBySlug, cvVariants } from "../variants";

const FEATURE_ROUTES = ["cover-letter", "java-react-jobs", "stats"] as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...cvVariants.filter((variant) => variant.slug).map((variant) => ({
      slug: variant.slug.split("/"),
    })),
    ...FEATURE_ROUTES.map((route) => ({ slug: [route] })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const route = (await params).slug.join("/");

  if (route === "cover-letter") return { title: "Cover letter editor" };
  if (route === "java-react-jobs") {
    return {
      title: "100 Java + React Jobs | Application Tracker",
      description: "A focused application tracker for 100 remote Java and React opportunities.",
    };
  }
  if (route === "stats") return { title: "CV word budgets" };

  const variant = cvVariantBySlug(route);
  return variant ? { title: `${variant.name} | CV` } : {};
}

export default async function CvSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const route = (await params).slug.join("/");

  if (route === "cover-letter") {
    const { CoverLetterWorkspace } = await import("../CoverLetterWorkspace");
    return <CoverLetterWorkspace />;
  }
  if (route === "java-react-jobs") {
    const { JavaReactJobsClient } = await import("../JavaReactJobsClient");
    return <JavaReactJobsClient />;
  }
  if (route === "stats") {
    const { default: CvStatsPage } = await import("../CvStatsPage");
    return <CvStatsPage />;
  }
  if (!isCvSlug(route)) notFound();

  const { CvRoute } = await import("../CvRoute");
  return <CvRoute slug={route} />;
}

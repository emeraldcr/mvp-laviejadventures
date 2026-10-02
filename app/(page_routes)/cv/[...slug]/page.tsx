import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isCvSlug } from "../cv-data";
import { cvVariantBySlug, cvVariants } from "../variants";

const FEATURE_ROUTES = ["cover-letter", "java-react-jobs", "stats", "archive"] as const;

export const dynamicParams = true;

export function generateStaticParams() {
  return [
    ...cvVariants.filter((variant) => variant.slug).map((variant) => ({
      slug: variant.slug.split("/"),
    })),
    ...cvVariants.map((variant) => ({ slug: ["archive", ...(variant.slug || "master").split("/")] })),
    ...FEATURE_ROUTES.map((route) => ({ slug: [route] })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const route = (await params).slug.join("/");

  if (route.startsWith("generated/")) return { title: "Generated CV", robots: { index: false, follow: false } };
  if (route === "archive") return { title: "CV Archive", robots: { index: false, follow: false } };

  if (route === "cover-letter") return { title: "Cover letter editor" };
  if (route === "java-react-jobs") {
    return {
      title: "100 Java + React Jobs | Application Tracker",
      description: "A focused application tracker for 100 remote Java and React opportunities.",
    };
  }
  if (route === "stats") return { title: "CV word budgets" };

  const archiveSlug = route.startsWith("archive/") ? route.slice(8) : route;
  const variant = cvVariantBySlug(archiveSlug === "master" ? "" : archiveSlug);
  return variant ? { title: `${variant.name} | CV` } : {};
}

export default async function CvSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const route = (await params).slug.join("/");

  if (route === "archive") {
    const { CvArchive } = await import("../CvArchive");
    return <CvArchive />;
  }
  if (route.startsWith("generated/")) {
    const id = route.slice(10);
    if (id.includes("/")) notFound();
    const { CvGeneratedPage } = await import("../CvGeneratedPage");
    return <CvGeneratedPage id={id} />;
  }
  if (route.startsWith("archive/")) {
    const archived = route.slice(8);
    const slug = archived === "master" ? "" : archived;
    if (!isCvSlug(slug)) notFound();
    const { CvRoute } = await import("../CvRoute");
    return <CvRoute slug={slug} />;
  }

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

  redirect(`/cv/archive/${route}`);
}

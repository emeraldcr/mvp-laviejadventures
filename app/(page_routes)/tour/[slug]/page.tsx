import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TourDetailPage from "@/app/components/tours/TourDetailPage";
import { getTour } from "@/lib/tours/detail";
import { getTourShareImage } from "@/lib/tour-display";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTour(slug);
  if (!tour) notFound();
  return pageMetadata(`/tour/${encodeURIComponent(slug)}`, tour.titleEs, tour.descriptionEs, "es", getTourShareImage(slug));
}

export default async function SpanishTour({ params }: Props) {
  const { slug } = await params;
  const tour = await getTour(slug);
  if (!tour) notFound();
  return <TourDetailPage tour={tour} locale="es" />;
}

import AnalyticsViewer from "@/app/components/analytics/AnalyticsViewer";

export const metadata = {
  title: "Analítica | La Vieja Adventures",
  description: "Internal analytics overview for site activity and reservations.",
  robots: { index: false, follow: false },
};

export default function AnalyticsViewerPage() {
  return <AnalyticsViewer />;
}

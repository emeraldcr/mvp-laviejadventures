import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Tours",
  alternates: { canonical: `${SITE_URL}/tours` },
  description:
    "Cañón Ciudad Esmeralda, pozas, ATV, avistamiento de aves y más. Precios claros, guías locales certificados y reserva en línea.",
};

export default function ToursLayout({ children }: { children: React.ReactNode }) {
  return children;
}

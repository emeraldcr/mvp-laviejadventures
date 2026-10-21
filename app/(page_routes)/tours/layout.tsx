import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tours",
  alternates: { canonical: "https://www.laviejaadventures.com/tours" },
  description:
    "Cañón Ciudad Esmeralda, pozas, ATV, avistamiento de aves y más. Precios claros, guías locales certificados y reserva en línea.",
};

export default function ToursLayout({ children }: { children: React.ReactNode }) {
  return children;
}

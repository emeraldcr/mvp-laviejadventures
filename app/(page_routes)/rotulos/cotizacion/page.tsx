import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QuoteComparisonPlanner from "@/app/components/rotulos/quote/QuoteComparisonPlanner";

export const metadata: Metadata = {
  title: "Comparador de cotizaciones de rótulos | La Vieja Adventures",
  description:
    "Herramienta para comparar tres cotizaciones de rótulos con un presupuesto y alcance comunes.",
  robots: { index: false, follow: false },
};

export default function RotulosCotizacionPage() {
  return (
    <main className="min-h-screen bg-[#f3fbf9] text-[#2E2A25] print:bg-white">
      <header className="border-b border-[#2E2A25]/10 bg-white print:border-b-2">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/rotulos"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-[#2E2A25] transition hover:bg-[#d9f7f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C4B0] print:hidden"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver a diseños
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black">La Vieja Adventures</p>
              <p className="text-xs text-[#706b65]">Expediente de cotización</p>
            </div>
            <Image
              src="/logo2.jpg"
              alt="Logo de La Vieja Adventures"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />
          </div>
        </div>
      </header>

      <QuoteComparisonPlanner />
    </main>
  );
}

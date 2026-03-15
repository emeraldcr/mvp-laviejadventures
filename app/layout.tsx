import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/app/context/LanguageContext";
import SessionProvider from "@/app/components/SessionProvider";
import AnalyticsTracker from "@/app/components/analytics/AnalyticsTracker";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: "La Vieja Adventures | Ciudad Esmeralda Tour Aventura San Carlos en Rio La Vieja",
  description:
    "La Vieja Adventures | Ciudad Esmeralda Tour Aventura San Carlos en Rio La Vieja y Parque Nacional del Agua Juan Castro Blanco",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18016737230"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18016737230');`}
        </Script>
        <SessionProvider>
          <LanguageProvider>
            <Suspense fallback={null}>
              <AnalyticsTracker />
            </Suspense>
            {children}
          </LanguageProvider>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

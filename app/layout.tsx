import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/app/context/LanguageContext";
import SessionProvider from "@/app/components/SessionProvider";
import AnalyticsTracker from "@/app/components/analytics/AnalyticsTracker";

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
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-TF95FLV9');
            `,
          }}
        />
      </head>

      <body className="antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TF95FLV9"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

       
        
        <SessionProvider>
          <LanguageProvider>
            <Suspense fallback={null}>
              <AnalyticsTracker />
            </Suspense>
            {children}
          </LanguageProvider>
        </SessionProvider>

        <Analytics />
      </body>
    </html>
  );
}
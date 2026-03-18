import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/app/context/LanguageContext";
import SessionProvider from "@/app/components/SessionProvider";
import AnalyticsTracker from "@/app/components/analytics/AnalyticsTracker";
import PayPalLoader from "@/app/components/PayPalLoader";

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
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TQTJ5FQL');`}
        </Script>
      </head>
      <body className="antialiased">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TQTJ5FQL"
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
            <Suspense fallback={null}>
              <PayPalLoader />
            </Suspense>
            {children}
          </LanguageProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}

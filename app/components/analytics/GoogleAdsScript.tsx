"use client";

import Script from "next/script";

const GOOGLE_ADS_ID = "AW-18010006901"; // Hardcoded for testing

export default function GoogleAdsScript() {
  // Temporarily disabled privacy checks for testing
  // if (!shouldLoadAdsTracking()) return null;

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
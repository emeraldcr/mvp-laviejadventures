"use client";

import Script from "next/script";

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

function shouldLoadAdsTracking() {
  if (typeof window === "undefined") return false;

  const dnt = navigator.doNotTrack === "1" || (window as Window & { doNotTrack?: string }).doNotTrack === "1";
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;

  return !dnt && !gpc;
}

export default function GoogleAdsScript() {
  if (!GOOGLE_ADS_ID) return null;
  if (!shouldLoadAdsTracking()) return null;

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

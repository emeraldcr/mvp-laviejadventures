"use client";

import Script from "next/script";
import { useState, useEffect } from "react";

type GoogleAdsScriptProps = {
  googleAdsId?: string;
};

function shouldLoadAdsTracking() {
  const dnt = navigator.doNotTrack === "1" || (window as Window & { doNotTrack?: string }).doNotTrack === "1";
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  return !dnt && !gpc;
}

export default function GoogleAdsScript({ googleAdsId }: GoogleAdsScriptProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    setShouldLoad(shouldLoadAdsTracking());
  }, []);

  if (!googleAdsId || !shouldLoad) return null;

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAdsId}');`}
      </Script>
    </>
  );
}

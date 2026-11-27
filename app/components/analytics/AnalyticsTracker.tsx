"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

function getTrackableElement(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof HTMLElement)) return null;
  return target.closest("button, a, input, select, textarea, [data-analytics], [role='button']");
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/analytics")) return;

    void trackAnalyticsEvent("page_view", {
      path: pathname,
    }).catch(() => {});

  }, [pathname]);

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      const element = getTrackableElement(event.target);
      if (!element || window.location.pathname.startsWith("/analytics")) return;

      void trackAnalyticsEvent("click", {
        metadata: {
          target: {
            tag: element.tagName.toLowerCase(),
            role: element.getAttribute("role"),
            analyticsId: element.getAttribute("data-analytics"),
          },
        },
      }).catch(() => {});
    };

    window.addEventListener("click", clickHandler, { capture: true });
    return () => window.removeEventListener("click", clickHandler, { capture: true });
  }, []);

  return null;
}

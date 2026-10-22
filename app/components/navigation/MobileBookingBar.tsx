"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { localizeHref } from "@/lib/i18n";
import { BUSINESS_WHATSAPP_URL } from "@/lib/site-config";

export default function MobileBookingBar() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const [showBookingBar, setShowBookingBar] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");
  useEffect(() => {
    setCurrentSearch(window.location.search);
    // Let the first content block breathe before introducing a persistent CTA.
    const onScroll = () => setShowBookingBar(window.scrollY > window.innerHeight * 1.05);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
  if (/\/(reservar|reservation|booking|success|rotulos|add-ons)(\/|$)/.test(pathname)) return null;
  if (!showBookingBar) return null;
  const tour = pathname.match(/\/tour\/([^/]+)/)?.[1];
  const bookingQuery = new URLSearchParams(currentSearch);
  if (tour) bookingQuery.set("tour", decodeURIComponent(tour));
  const href = localizeHref(`/reservar${bookingQuery.toString() ? `?${bookingQuery.toString()}` : ""}`, lang);
  return <nav aria-label={lang === "es" ? "Reservas rápidas" : "Quick booking"} data-booking-bar className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-stone-300 bg-white/95 px-3 pt-2.5 backdrop-blur-xl dark:border-stone-700 dark:bg-stone-950/95 md:hidden" style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom, 0px))" }}>
    <Link href={href} className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-[#00C4B0] px-4 text-sm font-bold text-[#17211f]">{lang === "es" ? "Reservar" : "Book now"}</Link>
    <a href={BUSINESS_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-3 text-sm font-semibold text-stone-900 dark:text-white">WhatsApp</a>
  </nav>;
}

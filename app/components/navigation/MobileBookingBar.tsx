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
  useEffect(() => {
    const onScroll = () => setShowBookingBar(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (/\/(reservar|reservation|booking|success|rotulos|add-ons)(\/|$)/.test(pathname)) return null;
  if (!showBookingBar) return null;
  const tour = pathname.match(/\/tour\/([^/]+)/)?.[1];
  const href = localizeHref(`/reservar${tour ? `?tour=${tour}` : ""}`, lang);
  return <nav aria-label={lang === "es" ? "Reservas rápidas" : "Quick booking"} data-booking-bar className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-stone-300 bg-white/95 px-4 pt-3 backdrop-blur-xl dark:border-stone-700 dark:bg-stone-950/95 md:hidden" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
    <Link href={href} className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#00C4B0] px-5 font-bold text-[#17211f]">{lang === "es" ? "Reservar" : "Book now"}</Link>
    <a href={BUSINESS_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center rounded-full border border-stone-300 px-4 font-semibold text-stone-900 dark:text-white">WhatsApp</a>
  </nav>;
}

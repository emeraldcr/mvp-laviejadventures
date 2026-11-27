"use client";

import { useEffect, useMemo, useState } from "react";
import { useCalendarContext } from "@/lib/booking/calendar/CalendarContext";
import { getPackageDisplayName, getPackageId, getTourPackageOptions, resolveInitialPackage } from "@/lib/booking/packages/pricing";
import { getMinBookableIsoDateInCostaRica, toIsoDate } from "@/lib/shared/dates/costa-rica-time";
import { isPackageAvailableOnDate } from "@/lib/tours/packages";
import type { TourSummary } from "@/lib/tours/types";
import { BUSINESS_WHATSAPP_URL } from "@/lib/site/config";

export default function UpcomingDepartures({ tour, preferredPackage, lang, onChoosePackage }: {
  tour: TourSummary; preferredPackage?: string; lang: "es" | "en"; onChoosePackage: (id: string) => void;
}) {
  const { setSelectedDate, tickets } = useCalendarContext();
  const [result, setResult] = useState<{ key: string; days: { date: string; slots: number }[]; failed: boolean } | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const packages = useMemo(() => getTourPackageOptions(tour), [tour]);
  const preferred = preferredPackage ? resolveInitialPackage(packages, preferredPackage) : null;
  const essential = packages.find((pkg) => /essential|esencial/i.test(`${pkg.id} ${pkg.name} ${pkg.nameEs}`));
  const minDate = getMinBookableIsoDateInCostaRica();
  const resultKey = `${tour.slug}:${minDate}:${retryVersion}`;
  const supportMessage = lang === "es" ? `Hola, quisiera consultar fechas para ${tour.titleEs}, para ${tickets} personas.` : `Hello, I would like to ask about dates for ${tour.titleEn}, for ${tickets} guests.`;
  const supportHref = `${BUSINESS_WHATSAPP_URL}?text=${encodeURIComponent(supportMessage)}`;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 20_000);
    const [year, month] = minDate.split("-").map(Number);
    const months = Array.from({ length: 3 }, (_, i) => new Date(year, month - 1 + i, 1));
    Promise.all(months.map(async (date) => {
      const y = date.getFullYear(), m = date.getMonth();
      const response = await fetch(`/api/calendar/availability?year=${y}&month=${m}&tourSlug=${encodeURIComponent(tour.slug)}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Availability unavailable");
      const data = await response.json();
      if (!data?.availability || typeof data.availability !== "object" || Array.isArray(data.availability) || Object.values(data.availability).some((value) => typeof value !== "number" || !Number.isFinite(value) || value < 0)) throw new Error("Invalid availability");
      return Object.entries(data.availability as Record<string, number>).map(([day, slots]) => ({ date: toIsoDate(y, m + 1, Number(day)), slots }));
    })).then((monthsData) => { if (active) setResult({ key: resultKey, days: monthsData.flat().filter((day) => day.date >= minDate), failed: false }); })
      .catch(() => { if (active) { controller.abort(); setResult({ key: resultKey, days: [], failed: true }); } })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [minDate, resultKey, tour.slug]);

  const currentResult = result?.key === resultKey ? result : null;
  const days = currentResult ? currentResult.days.filter((day) => day.slots >= tickets) : [];
  const candidates = days.map((day) => {
    const open = packages.filter((pkg) => isPackageAvailableOnDate(pkg, day.date));
    const pkg = preferred && open.includes(preferred) ? preferred : open.find((item) => item.groupTour !== false) ?? open[0];
    return { ...day, open, pkg };
  }).filter((day) => day.pkg);
  const shown = (preferred ? candidates.filter((day) => day.open.includes(preferred)) : candidates).slice(0, 3);
  const choose = (date: string, packageId: string) => {
    onChoosePackage(packageId);
    const [year, month, day] = date.split("-").map(Number);
    setSelectedDate(new Date(year, month - 1, day));
  };
  return <section aria-labelledby="upcoming-title" className="mb-4 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-900 dark:bg-stone-900 sm:p-5">
    <h2 id="upcoming-title" className="text-lg font-black">{lang === "es" ? "Próximas salidas" : "Upcoming departures"}</h2>
    <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{lang === "es" ? "Cupos sujetos a confirmación del equipo y condiciones seguras." : "Places are subject to team confirmation and safe conditions."}</p>
    {currentResult?.failed ? <div className="mt-3 text-sm" role="alert"><p>{lang === "es" ? "No pudimos consultar las próximas salidas." : "We could not check upcoming departures."}</p><div className="mt-2 flex flex-wrap gap-3 font-bold"><button type="button" className="underline" onClick={() => setRetryVersion((version) => version + 1)}>{lang === "es" ? "Reintentar" : "Try again"}</button><a className="underline" href={supportHref} target="_blank" rel="noopener noreferrer">WhatsApp</a></div></div> : !currentResult ? <p className="mt-3 text-sm" role="status">{lang === "es" ? "Consultando salidas…" : "Checking departures…"}</p> : shown.length === 0 ? <div className="mt-3 text-sm" role="status"><p>{lang === "es" ? `No encontramos fechas para ${tickets} ${tickets === 1 ? "persona" : "personas"}${preferred ? " con el paquete elegido" : ""} en los próximos tres meses. Puede revisar el calendario o consultar al equipo.` : `We found no dates for ${tickets} ${tickets === 1 ? "guest" : "guests"}${preferred ? " with the selected package" : ""} in the next three months. Check the calendar or ask the team.`}</p><a className="mt-2 inline-block font-bold underline" href={supportHref} target="_blank" rel="noopener noreferrer">{lang === "es" ? "Consultar por WhatsApp" : "Ask on WhatsApp"}</a></div> : <div className="mt-3 grid gap-2">{shown.map(({ date, open, pkg }) => {
      const [year, month, day] = date.split("-").map(Number);
      const privateOnly = open.every((item) => item.groupTour === false);
      const nextEssential = essential && days.find((item) => item.date > date && isPackageAvailableOnDate(essential, item.date));
      return <div key={date} className="rounded-xl border border-stone-200 p-3 dark:border-white/10">
        <button type="button" onClick={() => choose(date, getPackageId(pkg))} className="w-full text-left hover:text-emerald-700">
          <span className="block font-bold capitalize">{new Intl.DateTimeFormat(lang === "es" ? "es-CR" : "en-US", { dateStyle: "full" }).format(new Date(year, month - 1, day))}</span>
          <span className="mt-1 block text-sm">{(pkg.departureTimes ?? []).join(", ") || (lang === "es" ? "Horario por confirmar" : "Time to be confirmed")} · {getPackageDisplayName(pkg, lang === "es")} · US${pkg.price} {lang === "es" ? "por persona, antes de IVA" : "per person, before tax"}</span>
        </button>
        {privateOnly && <><p className="mt-2 text-sm font-bold text-amber-700 dark:text-amber-400">{lang === "es" ? "Solo tour privado disponible" : "Only a private tour is available"}</p>{nextEssential && essential && <button type="button" className="mt-1 text-sm font-bold text-emerald-700 underline dark:text-emerald-400" onClick={() => choose(nextEssential.date, getPackageId(essential))}>{lang === "es" ? "Ver próxima fecha con Paquete Esencial" : "See next date with Essential Package"}</button>}</>}
      </div>;
    })}</div>}
  </section>;
}

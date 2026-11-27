"use client";

import { useEffect, useMemo, useState } from "react";
import { useCalendarContext } from "@/lib/booking/calendar/CalendarContext";
import { getPackageDisplayName, getPackageId, getTourPackageOptions, resolveInitialPackage } from "@/lib/booking/packages/pricing";
import { getMinBookableIsoDateInCostaRica, toIsoDate } from "@/lib/shared/dates/costa-rica-time";
import { isPackageAvailableOnDate } from "@/lib/tours/packages";
import type { TourSummary } from "@/lib/tours/types";

export default function UpcomingDepartures({ tour, preferredPackage, lang, onChoosePackage }: {
  tour: TourSummary; preferredPackage?: string; lang: "es" | "en"; onChoosePackage: (id: string) => void;
}) {
  const { setSelectedDate, tickets } = useCalendarContext();
  const [result, setResult] = useState<{ key: string; days: { date: string; slots: number }[] } | null>(null);
  const [failed, setFailed] = useState(false);
  const packages = useMemo(() => getTourPackageOptions(tour), [tour]);
  const preferred = preferredPackage ? resolveInitialPackage(packages, preferredPackage) : null;
  const essential = packages.find((pkg) => /essential|esencial/i.test(`${pkg.id} ${pkg.name} ${pkg.nameEs}`));
  const minDate = getMinBookableIsoDateInCostaRica();

  useEffect(() => {
    const controller = new AbortController();
    const [year, month] = minDate.split("-").map(Number);
    const months = Array.from({ length: 3 }, (_, i) => new Date(year, month - 1 + i, 1));
    Promise.all(months.map(async (date) => {
      const y = date.getFullYear(), m = date.getMonth();
      const response = await fetch(`/api/calendar/availability?year=${y}&month=${m}&tourSlug=${encodeURIComponent(tour.slug)}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Availability unavailable");
      const data = await response.json();
      return Object.entries(data.availability as Record<string, number>).map(([day, slots]) => ({ date: toIsoDate(y, m + 1, Number(day)), slots }));
    })).then((monthsData) => { setResult({ key: tour.slug, days: monthsData.flat().filter((day) => day.date >= minDate) }); setFailed(false); })
      .catch((error) => { if (error.name !== "AbortError") setFailed(true); });
    return () => controller.abort();
  }, [minDate, tour.slug]);

  const days = result?.key === tour.slug ? result.days.filter((day) => day.slots >= tickets) : [];
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
    {failed ? <p className="mt-3 text-sm">{lang === "es" ? "No pudimos consultar los cupos. Intente de nuevo o contacte al equipo." : "We could not check availability. Please try again or contact the team."}</p> : !result || result.key !== tour.slug ? <p className="mt-3 text-sm" role="status">{lang === "es" ? "Consultando salidas…" : "Checking departures…"}</p> : shown.length === 0 ? <p className="mt-3 text-sm">{lang === "es" ? "No encontramos fechas con cupo para este paquete en los próximos tres meses." : "No dates with space for this package were found in the next three months."}</p> : <div className="mt-3 grid gap-2">{shown.map(({ date, open, pkg }) => {
      const [year, month, day] = date.split("-").map(Number);
      const privateOnly = open.every((item) => item.groupTour === false);
      const nextEssential = essential && days.find((item) => item.date > date && isPackageAvailableOnDate(essential, item.date));
      return <div key={date} className="rounded-xl border border-stone-200 p-3 dark:border-white/10">
        <button type="button" onClick={() => choose(date, getPackageId(pkg))} className="w-full text-left hover:text-emerald-700">
          <span className="block font-bold capitalize">{new Intl.DateTimeFormat(lang === "es" ? "es-CR" : "en-US", { dateStyle: "full" }).format(new Date(year, month - 1, day))}</span>
          <span className="mt-1 block text-sm">{(pkg.departureTimes ?? []).join(", ") || (lang === "es" ? "Horario por confirmar" : "Time to be confirmed")} · {getPackageDisplayName(pkg, lang === "es")} · US${pkg.price} {lang === "es" ? "por persona" : "per person"}</span>
        </button>
        {privateOnly && <><p className="mt-2 text-sm font-bold text-amber-700 dark:text-amber-400">{lang === "es" ? "Solo tour privado disponible" : "Only a private tour is available"}</p>{nextEssential && essential && <button type="button" className="mt-1 text-sm font-bold text-emerald-700 underline dark:text-emerald-400" onClick={() => choose(nextEssential.date, getPackageId(essential))}>{lang === "es" ? "Ver próxima fecha con Paquete Esencial" : "See next date with Essential Package"}</button>}</>}
      </div>;
    })}</div>}
  </section>;
}

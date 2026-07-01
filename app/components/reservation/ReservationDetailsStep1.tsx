import type { KeyboardEvent, RefObject } from "react";
import {
  AlertCircle,
  Check,
  Clock3,
  Sparkles,
  Users,
  Minus,
  Plus,
} from "lucide-react";
import { formatDepartureLabel } from "@/lib/reservation/constants";
import { ADDON_OPTIONS } from "@/lib/reservation/constants";
import type { TourTime } from "@/lib/reservation/types";

type ReservationTranslations = typeof import("@/lib/translations").translations["es"]["reservation"];

interface ReservationDetailsStep1Props {
  scheduleSectionRef: RefObject<HTMLElement | null>;
  ticketsInputRef: RefObject<HTMLInputElement | null>;
  tourTime: TourTime | null;
  availableTimeSlots: string[];
  isTicketsValid: boolean;
  tickets: number;
  slots: number;
  selectedAddons: string[];
  addonsPricePerPerson: number;
  basePriceUSD: number;
  pricePerPerson: number;
  totalWithTaxes: number;
  subtotal: number;
  taxes: number;
  ivaRatePercent: number;
  missingStep1Items: string[];
  onTourTimeSelect: (slot: TourTime) => void;
  onTicketsChange: (rawValue: string) => void;
  onStep1Enter: (event: KeyboardEvent<HTMLInputElement>) => void;
  onAddonToggle: (addonId: string) => void;
  tr: ReservationTranslations;
  lang: "es" | "en";
}

export default function ReservationDetailsStep1({
  scheduleSectionRef,
  ticketsInputRef,
  tourTime,
  availableTimeSlots,
  isTicketsValid,
  tickets,
  slots,
  selectedAddons,
  addonsPricePerPerson,
  basePriceUSD,
  pricePerPerson,
  totalWithTaxes,
  subtotal,
  taxes,
  ivaRatePercent,
  missingStep1Items,
  onTourTimeSelect,
  onTicketsChange,
  onStep1Enter,
  onAddonToggle,
  tr,
  lang,
}: ReservationDetailsStep1Props) {
  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)]">
        <div className="space-y-4">
          <section
            ref={scheduleSectionRef}
            className={`rounded-2xl border bg-white p-4 shadow-sm transition-all dark:bg-zinc-900/70 sm:p-5 ${
              !tourTime
                ? "border-amber-300 ring-2 ring-amber-300/35 dark:border-amber-600"
                : "border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <Clock3 className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-black leading-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">{tr.tourTimeTitle}</h3>
                  {!tourTime && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
                      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {tr.indicators.chooseTourTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {availableTimeSlots.map((slot) => {
                const isSelected = tourTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onTourTimeSelect(slot)}
                    className={`min-h-14 rounded-xl border-2 px-4 py-3 text-center text-base font-black transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-900/15 dark:bg-emerald-500 dark:text-zinc-950"
                        : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-emerald-950/30"
                    }`}
                  >
                    {formatDepartureLabel(slot)}
                  </button>
                );
              })}
            </div>
          </section>

          <section
            className={`rounded-2xl border bg-white p-4 shadow-sm transition-all dark:bg-zinc-900/70 sm:p-5 ${
              !isTicketsValid
                ? "border-amber-300 ring-2 ring-amber-300/35 dark:border-amber-600"
                : "border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
                  <Users className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-black leading-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">{tr.ticketsTitle}</h3>
                  {!isTicketsValid && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
                      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {tr.indicators.chooseTickets}
                    </p>
                  )}
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-700 dark:text-teal-300">
                {tr.availablePrefix} {slots}
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950/35">
              <label htmlFor="tickets" className="mb-3 block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                {tr.numPeople}
              </label>
              <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
                <button
                  type="button"
                  onClick={() => onTicketsChange(String(tickets - 1))}
                  disabled={slots === 0 || tickets <= 1}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition hover:border-teal-500 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  aria-label={lang === "es" ? "Reducir personas" : "Decrease guests"}
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <input
                  ref={ticketsInputRef}
                  id="tickets"
                  type="number"
                  min={1}
                  max={Math.max(1, slots)}
                  value={tickets}
                  onChange={(e) => onTicketsChange(e.target.value)}
                  onKeyDown={onStep1Enter}
                  className="h-11 w-full rounded-xl border border-zinc-300 bg-white text-center text-lg font-black text-zinc-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  disabled={slots === 0}
                />
                <button
                  type="button"
                  onClick={() => onTicketsChange(String(tickets + 1))}
                  disabled={slots === 0 || tickets >= slots}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition hover:border-teal-500 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  aria-label={lang === "es" ? "Aumentar personas" : "Increase guests"}
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
              <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {lang === "es" ? "Entrada General" : "General Entry"}
              </span>
              <span className="font-black text-zinc-900 dark:text-zinc-50">${basePriceUSD} / {tr.perPerson}</span>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/70 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <Sparkles className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-black leading-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">
                    {lang === "es" ? "Mejora tu experiencia" : "Upgrade your experience"}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {lang === "es" ? "Opcional. Se calcula por persona." : "Optional. Calculated per person."}
                  </p>
                </div>
              </div>
              {selectedAddons.length > 0 && (
                <span className="shrink-0 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-black text-white">
                  +{selectedAddons.length}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ADDON_OPTIONS.map((addon) => {
                const isSelected = selectedAddons.includes(addon.id);
                const Icon = addon.icon;
                const addonName = lang === "es" ? addon.nameEs : addon.nameEn;
                const addonDesc = lang === "es" ? addon.descriptionEs : addon.descriptionEn;

                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => onAddonToggle(addon.id)}
                    aria-pressed={isSelected}
                    className={`flex min-h-[104px] items-start gap-3 rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/60 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/90 shadow-md shadow-emerald-500/15 dark:border-emerald-500 dark:bg-emerald-950/30"
                        : "border-zinc-200 bg-zinc-50 hover:border-emerald-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-950/35 dark:hover:border-emerald-700"
                    }`}
                  >
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isSelected
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}>
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-black leading-tight ${isSelected ? "text-emerald-800 dark:text-emerald-200" : "text-zinc-900 dark:text-zinc-100"}`}>
                          {addonName}
                        </p>
                        <span className={`shrink-0 text-sm font-black ${isSelected ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-800 dark:text-zinc-100"}`}>
                          +${addon.price}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{addonDesc}</p>
                    </div>
                    {isSelected && (
                      <span className="ml-1 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedAddons.length > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  {lang === "es" ? "Extra por persona" : "Extra per person"}
                </span>
                <span className="font-black text-emerald-800 dark:text-emerald-300">+${addonsPricePerPerson}</span>
              </div>
            )}
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-xl shadow-black/5 dark:border-emerald-900/60 dark:bg-zinc-900">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-50/80">
                {lang === "es" ? "Total estimado" : "Estimated total"}
              </p>
              <p className="mt-2 text-4xl font-black tracking-tight">${totalWithTaxes.toFixed(2)}</p>
              <p className="mt-1 text-sm font-semibold text-emerald-50/85">
                {tickets} {lang === "es" ? "persona(s)" : "guest(s)"} | ${pricePerPerson} {tr.perPerson}
              </p>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">{lang === "es" ? "Tour" : "Tour"}</span>
                <span className="text-right font-bold text-zinc-900 dark:text-zinc-50">{tr.selectedTourLabel}</span>
              </div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">{lang === "es" ? "Hora" : "Time"}</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-50">{tourTime ? formatDepartureLabel(tourTime) : "—"}</span>
              </div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">{lang === "es" ? "Base" : "Base"}</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-50">${basePriceUSD} / {tr.perPerson}</span>
              </div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">{lang === "es" ? "Extras" : "Add-ons"}</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-50">+${addonsPricePerPerson} / {tr.perPerson}</span>
              </div>
              <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">{tr.subtotalLabel}</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-50">${subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">{tr.taxes} ({ivaRatePercent}%)</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-50">${taxes.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isTicketsValid && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{tr.completeStepOneHint}</p>
          <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
            {missingStep1Items.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

import type { KeyboardEvent, RefObject } from "react";
import {
  AlertCircle,
  Clock3,
  Users,
  Minus,
  Plus,
} from "lucide-react";
import { formatDepartureLabel } from "@/lib/reservation/constants";
import AddOnsExperience from "@/app/components/reservation/AddOnsExperience";
import type { ReservationAddonDetails, TourTime } from "@/lib/reservation/types";

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
  addonDetails: ReservationAddonDetails;
  addonsPricePerPerson: number;
  basePriceUSD: number;
  onTourTimeSelect: (slot: TourTime) => void;
  onTicketsChange: (rawValue: string) => void;
  onStep1Enter: (event: KeyboardEvent<HTMLInputElement>) => void;
  onAddonToggle: (addonId: string) => void;
  onAddonDetailsChange: (details: ReservationAddonDetails) => void;
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
  addonDetails,
  addonsPricePerPerson,
  basePriceUSD,
  onTourTimeSelect,
  onTicketsChange,
  onStep1Enter,
  onAddonToggle,
  onAddonDetailsChange,
  tr,
  lang,
}: ReservationDetailsStep1Props) {
  return (
    <div className="mb-3 space-y-3">
      <section
        ref={scheduleSectionRef}
        className={`rounded-2xl border bg-white p-3 shadow-sm transition-all dark:bg-zinc-900/70 sm:p-4 ${
          !tourTime || !isTicketsValid
            ? "border-amber-300 ring-2 ring-amber-300/35 dark:border-amber-600"
            : "border-zinc-200 dark:border-zinc-700"
        }`}
      >
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-black text-zinc-900 dark:text-zinc-50">
            <Clock3 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden />
            {tr.tourTimeTitle}
          </h3>
          {!tourTime && (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden /> {tr.indicators.chooseTourTime}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {availableTimeSlots.map((slot) => {
            const isSelected = tourTime === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onTourTimeSelect(slot)}
                className={`min-h-11 rounded-xl border-2 px-2 py-2 text-center text-sm font-black transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-900/15 dark:bg-emerald-500 dark:text-zinc-950"
                    : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-emerald-400 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-emerald-950/30"
                }`}
              >
                {formatDepartureLabel(slot)}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-600 dark:text-teal-300" aria-hidden />
            <label htmlFor="tickets" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              {tr.numPeople}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTicketsChange(String(tickets - 1))}
              disabled={slots === 0 || tickets <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition hover:border-teal-500 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
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
              className="h-9 w-14 rounded-lg border border-zinc-300 bg-white text-center text-base font-black text-zinc-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              disabled={slots === 0}
            />
            <button
              type="button"
              onClick={() => onTicketsChange(String(tickets + 1))}
              disabled={slots === 0 || tickets >= slots}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition hover:border-teal-500 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              aria-label={lang === "es" ? "Aumentar personas" : "Increase guests"}
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
            <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-bold text-teal-700 dark:text-teal-300">
              {tr.availablePrefix} {slots}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-500 dark:text-zinc-400">
            {lang === "es" ? "Entrada General" : "General Entry"}
          </span>
          <span className="font-black text-zinc-900 dark:text-zinc-50">${basePriceUSD} / {tr.perPerson}</span>
        </div>
      </section>

      <AddOnsExperience
        lang={lang}
        selectedAddons={selectedAddons}
        addonDetails={addonDetails}
        onAddonToggle={onAddonToggle}
        onAddonDetailsChange={onAddonDetailsChange}
      />

      {selectedAddons.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-800/50 dark:bg-emerald-950/20">
          <span className="font-semibold text-emerald-800 dark:text-emerald-300">
            {lang === "es" ? "Extras por persona" : "Add-ons per person"}
          </span>
          <span className="font-black text-emerald-800 dark:text-emerald-300">+${addonsPricePerPerson}</span>
        </div>
      )}
    </div>
  );
}

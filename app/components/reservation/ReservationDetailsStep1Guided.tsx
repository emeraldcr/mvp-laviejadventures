"use client";

import type { KeyboardEvent, RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock3, Minus, Plus, Sparkles, Users } from "lucide-react";
import AddOnsExperience from "./AddOnsExperience";
import PackagePicker from "./PackagePicker";
import { formatDepartureLabel } from "@/lib/reservation/constants";
import type { ReservationAddonDetails, TourTime } from "@/lib/reservation/types";
import type { TourPackageOption } from "@/lib/types/index";

type ReservationTranslations = typeof import("@/lib/translations").translations["es"]["reservation"];
export type ChoiceStep = 1 | 2 | 3;

interface Props {
  choiceStep: ChoiceStep;
  onChoiceStepChange: (step: ChoiceStep) => void;
  scheduleSectionRef: RefObject<HTMLElement | null>;
  ticketsInputRef: RefObject<HTMLInputElement | null>;
  tourTime: TourTime | null;
  availableTimeSlots: string[];
  isTicketsValid: boolean;
  tickets: number;
  slots: number;
  packages: TourPackageOption[];
  selectedPackageId: string;
  excludedAddonIds: string[];
  selectedAddons: string[];
  addonDetails: ReservationAddonDetails;
  addonsPricePerPerson: number;
  packageLabel: string;
  reservationDateIso: string;
  estimatedTotal: number;
  continueLabel: string;
  onPackageSelect: (packageId: string) => void;
  isPackageDisabled?: (pkg: TourPackageOption) => boolean;
  onTourTimeSelect: (slot: TourTime) => void;
  onTicketsChange: (value: string) => void;
  onStep1Enter: (event: KeyboardEvent<HTMLInputElement>) => void;
  onAddonToggle: (addonId: string) => void;
  onAddonDetailsChange: (details: ReservationAddonDetails) => void;
  onContinue: () => void;
  canContinue: boolean;
  transportQuote?: import("@/lib/reservation/transport").TransportQuoteResult | null;
  transportLoading?: boolean;
  transportError?: string | null;
  transportPreview?: boolean;
  tr: ReservationTranslations;
  lang: "es" | "en";
}

const GUEST_PRESETS = [1, 2, 3, 4, 6] as const;

export default function ReservationDetailsStep1Guided(props: Props) {
  const {
    choiceStep, onChoiceStepChange, scheduleSectionRef, ticketsInputRef, tourTime,
    availableTimeSlots, isTicketsValid, tickets, slots, packages, selectedPackageId,
    excludedAddonIds, selectedAddons, addonDetails, addonsPricePerPerson, packageLabel,
    reservationDateIso, estimatedTotal, continueLabel, onPackageSelect, isPackageDisabled,
    onTourTimeSelect, onTicketsChange, onStep1Enter, onAddonToggle, onAddonDetailsChange,
    onContinue, canContinue, transportQuote = null, transportLoading = false,
    transportError = null, transportPreview = false, tr, lang,
  } = props;
  const isEs = lang === "es";
  const reduceMotion = useReducedMotion();
  const guestPresets = GUEST_PRESETS.filter((count) => count <= Math.max(1, slots));
  const titles = isEs
    ? ["Elegí tu experiencia", "¿Cuándo y cuántos?", "Personalizá tu aventura"]
    : ["Choose your experience", "When and how many?", "Make it your adventure"];
  const descriptions = isEs
    ? [
        "Compará con calma. El precio es por persona y podés cambiarlo después.",
        "Seleccioná la salida y el tamaño de tu grupo.",
        "Los extras son opcionales. Podés continuar sin agregar ninguno.",
      ]
    : [
        "Take your time comparing. Pricing is per guest and can be changed later.",
        "Select a departure time and your group size.",
        "Extras are optional. You can continue without adding any.",
      ];

  const goNext = () => {
    if (choiceStep < 3) onChoiceStepChange((choiceStep + 1) as ChoiceStep);
    else onContinue();
  };

  return (
    <div className="mb-4">
      <div className="mb-7 flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/85">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
            {isEs ? `Selección ${choiceStep} de 3` : `Choice ${choiceStep} of 3`}
          </p>
          <p className="truncate text-sm font-black text-zinc-900 dark:text-white">{packageLabel}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{isEs ? "Estimado" : "Estimate"}</p>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">${estimatedTotal.toFixed(0)}</p>
        </div>
      </div>

      <div className="mb-8 flex gap-2" aria-label={isEs ? "Progreso de selección" : "Selection progress"}>
        {[1, 2, 3].map((step) => (
          <div key={step} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step <= choiceStep ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={choiceStep}
          initial={reduceMotion ? false : { opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-[430px]">
          <div className="mb-7 max-w-2xl">
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {choiceStep === 1 ? <Sparkles className="h-5 w-5" /> : choiceStep === 2 ? <Clock3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </span>
            <h3 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-4xl">{titles[choiceStep - 1]}</h3>
            <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">{descriptions[choiceStep - 1]}</p>
          </div>

          {choiceStep === 1 && (
            <PackagePicker packages={packages} selectedPackageId={selectedPackageId}
              onSelect={onPackageSelect} lang={lang} dateIso={reservationDateIso}
              isPackageDisabled={isPackageDisabled} />
          )}

          {choiceStep === 2 && (
            <section ref={scheduleSectionRef} className="space-y-8">
              <div>
                <p className="mb-3 text-sm font-black text-zinc-900 dark:text-white">{tr.tourTimeTitle}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {availableTimeSlots.map((slot) => {
                    const selected = tourTime === slot;
                    return (
                      <button key={slot} type="button" onClick={() => onTourTimeSelect(slot as TourTime)}
                        className={`min-h-16 rounded-2xl border-2 px-4 text-base font-black transition ${selected ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-900/15" : "border-zinc-200 bg-white text-zinc-800 hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"}`}>
                        {formatDepartureLabel(slot)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-black text-zinc-900 dark:text-white"><Users className="h-4 w-4 text-emerald-600" />{tr.numPeople}</p>
                  <span className="text-xs font-bold text-zinc-500">{tr.availablePrefix} {slots}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {guestPresets.map((count) => (
                    <button key={count} type="button" onClick={() => onTicketsChange(String(count))}
                      className={`h-12 min-w-12 rounded-2xl border px-4 text-sm font-black transition ${tickets === count ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-300 bg-white text-zinc-700 hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"}`}>
                      {count}
                    </button>
                  ))}
                  <div className="ml-auto flex items-center gap-2">
                    <button type="button" onClick={() => onTicketsChange(String(tickets - 1))} disabled={tickets <= 1} className="grid h-12 w-12 place-items-center rounded-2xl border border-zinc-300 disabled:opacity-40 dark:border-zinc-700" aria-label={isEs ? "Reducir personas" : "Decrease guests"}><Minus className="h-4 w-4" /></button>
                    <input ref={ticketsInputRef} id="tickets" type="number" min={1} max={Math.max(1, slots)} value={tickets} onChange={(e) => onTicketsChange(e.target.value)} onKeyDown={onStep1Enter} className="h-12 w-16 rounded-2xl border border-zinc-300 bg-white text-center font-black dark:border-zinc-700 dark:bg-zinc-900" />
                    <button type="button" onClick={() => onTicketsChange(String(tickets + 1))} disabled={tickets >= slots} className="grid h-12 w-12 place-items-center rounded-2xl border border-zinc-300 disabled:opacity-40 dark:border-zinc-700" aria-label={isEs ? "Aumentar personas" : "Increase guests"}><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {choiceStep === 3 && (
            <div>
              <AddOnsExperience lang={lang} selectedAddons={selectedAddons} addonDetails={addonDetails}
                onAddonToggle={onAddonToggle} onAddonDetailsChange={onAddonDetailsChange}
                excludedAddonIds={excludedAddonIds} transportQuote={transportQuote}
                transportLoading={transportLoading} transportError={transportError}
                transportPreview={transportPreview} />
              {selectedAddons.length > 0 && (
                <p className="mt-4 text-right text-sm font-black text-emerald-700 dark:text-emerald-300">
                  {isEs ? "Extras por persona" : "Add-ons per guest"}: +${addonsPricePerPerson}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 hidden items-center gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-700 md:flex">
        {choiceStep > 1 && (
          <button type="button" onClick={() => onChoiceStepChange((choiceStep - 1) as ChoiceStep)} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-zinc-300 px-6 font-bold dark:border-zinc-600">
            <ArrowLeft className="h-4 w-4" /> {isEs ? "Atrás" : "Back"}
          </button>
        )}
        <button type="button" onClick={goNext} disabled={(choiceStep === 2 && (!tourTime || !isTicketsValid)) || (choiceStep === 3 && !canContinue)}
          className="ml-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-600 px-8 font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40">
          {choiceStep === 3 ? continueLabel : isEs ? "Continuar" : "Continue"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

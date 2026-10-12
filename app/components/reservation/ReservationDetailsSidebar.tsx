"use client";

import { MapPin } from "lucide-react";
import type { BookingStepId, ReservationChoiceStep, TourTime } from "@/lib/reservation/types";
import { formatDepartureLabel } from "@/lib/reservation/constants";
import ReservationDetailsStepProgress from "./ReservationDetailsStepProgress";

type StepOption = { id: BookingStepId; label: string };

export default function ReservationDetailsSidebar({
  lang,
  selectedTourName,
  formattedDate,
  tourTime,
  hasConfirmedTickets,
  tickets,
  isStep1Valid,
  termsAccepted,
  total,
  currentStep,
  choiceStep,
  packageLabel,
  hasConfirmedPackage,
  steps,
  maxReachableStep,
  onStepSelect,
}: {
  lang: "es" | "en";
  selectedTourName: string;
  formattedDate: string;
  tourTime: TourTime | null;
  hasConfirmedTickets: boolean;
  tickets: number;
  isStep1Valid: boolean;
  termsAccepted: boolean;
  total: number;
  currentStep: BookingStepId;
  choiceStep: ReservationChoiceStep;
  packageLabel: string;
  hasConfirmedPackage: boolean;
  steps: StepOption[];
  maxReachableStep: BookingStepId;
  onStepSelect: (step: BookingStepId) => void;
}) {
  const isCheckoutAccepted = currentStep === 3 && termsAccepted;

  return (
    <aside className={`min-w-0 lg:sticky lg:top-4 ${isCheckoutAccepted ? "hidden" : ""}`}>
      <div className={`mb-3 flex items-center gap-2.5 rounded-xl border p-2 ${
        isStep1Valid
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-white dark:border-emerald-800/40 dark:from-emerald-950/30 dark:to-zinc-900/60"
          : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900/60"
      }`}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-300">
          <MapPin className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-black leading-tight text-zinc-900 dark:text-zinc-50">{selectedTourName}</h3>
          <p className="truncate text-xs font-semibold capitalize text-zinc-500 dark:text-zinc-400">
            {formattedDate}
            {tourTime ? ` · ${formatDepartureLabel(tourTime)}` : ""}
            {hasConfirmedTickets ? ` · ${tickets} pax` : ` · ${lang === "es" ? "personas por elegir" : "guests to choose"}`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
            {isStep1Valid ? (lang === "es" ? "Listo" : "Ready") : "Est."}
          </p>
          <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">${total.toFixed(0)}</p>
        </div>
      </div>

      <ReservationDetailsStepProgress
        steps={steps}
        currentStep={currentStep}
        sidebar
        maxReachableStep={maxReachableStep}
        onStepSelect={onStepSelect}
      />

      {currentStep === 1 && (
        <div className="hidden rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-800/40 dark:bg-emerald-950/20 lg:block">
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            {lang === "es" ? `Paso ${choiceStep} de 3` : `Step ${choiceStep} of 3`}
          </p>
          <p className="mt-1 truncate text-sm font-bold text-zinc-800 dark:text-zinc-100">
            {hasConfirmedPackage ? packageLabel : (lang === "es" ? "Paquete por elegir" : "Choose a package")}
          </p>
          <p className="mt-2 text-xl font-black text-emerald-700 dark:text-emerald-300">${total.toFixed(0)}</p>
          <div className="mt-3 flex gap-1.5" aria-hidden="true">
            {[1, 2, 3].map((step) => (
              <span key={step} className={`h-1 flex-1 rounded-full ${step <= choiceStep ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

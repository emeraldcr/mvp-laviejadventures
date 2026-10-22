"use client";

import { Check, ChevronDown, CloudRain, MessageCircle, ShieldCheck } from "lucide-react";
import type { BookingStepId, ReservationChoiceStep, TourTime } from "@/lib/reservation/types";
import { formatDepartureLabel } from "@/lib/reservation/constants";
import type { TourPackageOption } from "@/lib/types/index";
import { TOUR_INFO } from "@/lib/tour-info";
import ReservationDetailsStepProgress from "./ReservationDetailsStepProgress";

type StepOption = { id: BookingStepId; label: string };

type Props = {
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
  selectedPackage: TourPackageOption | null;
  slots: number;
  pricePerPerson: number;
  subtotal: number;
  taxes: number;
  ivaRatePercent: number;
  cancellationPolicy: string;
  hasConfirmedPackage: boolean;
  steps: StepOption[];
  maxReachableStep: BookingStepId;
  onStepSelect: (step: BookingStepId) => void;
};

export default function ReservationDetailsSidebar({
  lang, selectedTourName, formattedDate, tourTime, hasConfirmedTickets, tickets,
  isStep1Valid, termsAccepted, total, currentStep, choiceStep, packageLabel,
  selectedPackage, slots, pricePerPerson, subtotal, taxes, ivaRatePercent,
  cancellationPolicy, hasConfirmedPackage, steps, maxReachableStep, onStepSelect,
}: Props) {
  const isEs = lang === "es";
  const isCheckoutAccepted = currentStep === 3 && termsAccepted;
  const packageIncludes = selectedPackage?.includes?.slice(0, 4) ?? [];
  const whatsappHref = `https://wa.me/506${TOUR_INFO.contact.whatsapp.replace(/\D/g, "")}`;

  const summaryContent = (
    <>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
            {isEs ? "Tu reserva, clara desde el inicio" : "Your booking, clear from the start"}
          </p>
          <h3 className="mt-1 text-base font-black text-zinc-900 dark:text-zinc-50">{isEs ? "Resumen de la experiencia" : "Experience summary"}</h3>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
          {isStep1Valid ? (isEs ? "Cupo visible" : "Space shown") : isEs ? "En proceso" : "In progress"}
        </span>
      </div>

      <div className="space-y-2.5 text-sm">
        <SummaryRow label={isEs ? "Tour" : "Tour"} value={selectedTourName} />
        <SummaryRow label={isEs ? "Fecha" : "Date"} value={formattedDate} />
        <SummaryRow label={isEs ? "Horario" : "Departure"} value={tourTime ? formatDepartureLabel(tourTime) : "—"} />
        <SummaryRow label={isEs ? "Personas" : "Guests"} value={hasConfirmedTickets ? String(tickets) : "—"} />
      </div>

      <div className="my-4 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{isEs ? "Paquete" : "Package"}</p>
            <p className="mt-1 truncate font-black text-zinc-900 dark:text-zinc-50">{hasConfirmedPackage ? packageLabel : isEs ? "Por elegir" : "To choose"}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">${pricePerPerson.toFixed(2)}</p>
            <p className="text-[10px] font-semibold text-zinc-500">{isEs ? "por persona" : "per person"}</p>
          </div>
        </div>
        {packageIncludes.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-t border-emerald-200/70 pt-3 text-xs text-zinc-600 dark:border-emerald-800/40 dark:text-zinc-300">
            {packageIncludes.map((item) => <li key={item} className="flex gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />{item}</li>)}
          </ul>
        )}
      </div>

      <div className="space-y-1.5 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <SummaryRow label={isEs ? "Subtotal" : "Subtotal"} value={`$${subtotal.toFixed(2)}`} />
        <SummaryRow label={`${isEs ? "IVA" : "Tax"} (${ivaRatePercent}%)`} value={`$${taxes.toFixed(2)}`} />
        <div className="mt-2 flex items-end justify-between gap-3 border-t border-zinc-200 pt-2 dark:border-zinc-800">
          <span className="font-black text-zinc-900 dark:text-zinc-50">{isEs ? "Total" : "Total"}</span>
          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-zinc-600 dark:text-zinc-300">
        <div className="flex gap-2 rounded-xl bg-sky-50 p-2.5 dark:bg-sky-950/20"><CloudRain className="h-4 w-4 shrink-0 text-sky-600" aria-hidden /><span><strong className="text-zinc-900 dark:text-zinc-100">{isEs ? "Clima y río: " : "Weather & river: "}</strong>{isEs ? "si llueve fuerte o el río crece, no salimos al cañón; reprogramamos o proponemos una alternativa segura." : "if heavy rain or a high river makes it unsafe, we do not run the canyon; we reschedule or offer a safe alternative."}</span></div>
        <div className="flex gap-2 rounded-xl bg-amber-50 p-2.5 dark:bg-amber-950/20"><ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" aria-hidden /><span><strong className="text-zinc-900 dark:text-zinc-100">{isEs ? "Cancelación: " : "Cancellation: "}</strong>{cancellationPolicy}</span></div>
        <p className="text-[11px] font-semibold text-zinc-500">{isEs ? `${slots} cupo(s) mostrado(s) para esta fecha. La confirmación final se valida con el equipo.` : `${slots} space(s) shown for this date. Final confirmation is validated by the team.`}</p>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-950/40">
        <p className="font-black text-zinc-900 dark:text-zinc-50">{isEs ? "¿Qué pasa después?" : "What happens next?"}</p>
        <p className="mt-1 leading-relaxed text-zinc-600 dark:text-zinc-300">{isEs ? "Revise los datos, acepte las políticas y PayPal carga el pago seguro. Después le llevamos a la confirmación de su reserva." : "Review your details, accept the policies, and PayPal loads the secure payment. Then we take you to your booking confirmation."}</p>
      </div>

      <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-emerald-300 px-3 py-2.5 text-xs font-black text-emerald-800 transition hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-950/40">
        <MessageCircle className="h-4 w-4" aria-hidden />
        {isEs ? "Caso especial · escribir al equipo" : "Special case · message the team"}
      </a>
    </>
  );

  return (
    <aside className={`min-w-0 lg:sticky lg:top-4 ${isCheckoutAccepted ? "hidden" : ""}`}>
      <details className="group overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm dark:border-emerald-900/60 dark:bg-zinc-900 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{isEs ? `Paso ${currentStep} de 3 · Resumen` : `Step ${currentStep} of 3 · Summary`}</p>
            <p className="truncate text-sm font-black text-zinc-900 dark:text-zinc-50">{selectedTourName} · ${total.toFixed(2)}</p>
          </div>
          <ChevronDown className="h-5 w-5 shrink-0 text-emerald-700 transition group-open:rotate-180" aria-hidden />
        </summary>
        <div className="border-t border-emerald-100 p-3 dark:border-emerald-900/50">{summaryContent}</div>
      </details>

      <div className="hidden rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-900/60 dark:bg-zinc-900 lg:block">{summaryContent}</div>
      <ReservationDetailsStepProgress steps={steps} currentStep={currentStep} sidebar maxReachableStep={maxReachableStep} onStepSelect={onStepSelect} />

      {currentStep === 1 && (
        <div className="hidden rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-800/40 dark:bg-emerald-950/20 lg:block">
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">{isEs ? `Paso ${choiceStep} de 3` : `Step ${choiceStep} of 3`}</p>
          <p className="mt-1 truncate text-sm font-bold text-zinc-800 dark:text-zinc-100">{hasConfirmedPackage ? packageLabel : isEs ? "Paquete por elegir" : "Choose a package"}</p>
          <div className="mt-3 flex gap-1.5" aria-hidden="true">{[1, 2, 3].map((step) => <span key={step} className={`h-1 flex-1 rounded-full ${step <= choiceStep ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />)}</div>
        </div>
      )}
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-3"><span className="text-zinc-500 dark:text-zinc-400">{label}</span><span className="max-w-[62%] text-right font-bold text-zinc-900 dark:text-zinc-50">{value}</span></div>;
}

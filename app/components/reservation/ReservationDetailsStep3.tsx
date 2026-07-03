import Link from "next/link";
import type { KeyboardEvent, RefObject } from "react";
import { Check, ShieldCheck } from "lucide-react";
import type { ReservationAddonDetails, TourTime } from "@/lib/reservation/types";
import { ADDON_OPTIONS, getTransportLocationLabel } from "@/lib/reservation/constants";

type ReservationTranslations = typeof import("@/lib/translations").translations["es"]["reservation"];

interface ReservationDetailsStep3Props {
  reviewSectionRef: RefObject<HTMLDivElement | null>;
  termsCheckboxRef: RefObject<HTMLInputElement | null>;
  formState: {
    agreeTerms: boolean;
  };
  selectedTourName: string;
  basePriceUSD: number;
  tourTime: TourTime | null;
  tickets: number;
  selectedAddons: string[];
  addonDetails: ReservationAddonDetails;
  transportQuote?: any | null;
  transportLoading?: boolean;
  transportError?: string | null;
  subtotal: number;
  taxes: number;
  totalWithTaxes: number;
  ivaRatePercent: number;
  localizedCancellationPolicy: string;
  onTermsChange: (accepted: boolean) => void;
  onTermsEnter: (event: KeyboardEvent<HTMLInputElement>) => void;
  tr: ReservationTranslations;
  lang: "es" | "en";
}

export default function ReservationDetailsStep3({
  reviewSectionRef,
  termsCheckboxRef,
  formState,
  selectedTourName,
  basePriceUSD,
  tourTime,
  tickets,
  selectedAddons,
  addonDetails,
  subtotal,
  taxes,
  totalWithTaxes,
  ivaRatePercent,
  localizedCancellationPolicy,
  onTermsChange,
  onTermsEnter,
  tr,
  lang,
  transportQuote,
  transportLoading,
  transportError,
}: ReservationDetailsStep3Props) {
  return (
    <>
      <div ref={reviewSectionRef} className="mb-6 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
        <div className="mb-2 flex justify-between"><span>{tr.tourLabel}</span><span className="font-medium">{selectedTourName}</span></div>
        <div className="mb-2 flex justify-between">
          <span>{lang === "es" ? "Entrada General" : "General Entry"}</span>
          <span className="font-medium">${basePriceUSD} / {tr.perPerson}</span>
        </div>
        <div className="mb-2 flex justify-between"><span>{tr.tourTimeTitle}</span><span>{tourTime ?? "—"}</span></div>
        <div className="mb-2 flex justify-between">
          <span>{lang === "es" ? "Personas" : "People"}</span>
          <span>{tickets}</span>
        </div>
        {selectedAddons.length > 0 && (
          <div className="mt-2 mb-2 border-t border-zinc-300 pt-2 dark:border-zinc-600">
            <p className="mb-1 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              {lang === "es" ? "Servicios extra:" : "Extra services:"}
            </p>
            {ADDON_OPTIONS.filter((a) => selectedAddons.includes(a.id)).map((addon) => {
              const detailLines = getAddonDetailLines(addon.id, addonDetails, lang);
              const isTransport = addon.id === "transporte";
              let displayPrice = addon.price;
              if (isTransport && transportQuote) {
                displayPrice = transportQuote.perPerson ?? transportQuote.basePrice ?? addon.price;
              }

              return (
                <div key={addon.id} className="mb-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                  <div className="flex justify-between gap-3">
                    <span className="font-bold text-zinc-800 dark:text-zinc-100">{lang === "es" ? addon.nameEs : addon.nameEn}</span>
                    <span className="shrink-0 font-bold">+${displayPrice}{isTransport ? ` / ${tr.perPerson}` : ` / ${tr.perPerson}`}</span>
                  </div>
                  {isTransport && transportLoading && (
                    <p className="mt-2 text-xs text-zinc-500">Calculando precio de transporte…</p>
                  )}
                  {isTransport && transportError && (
                    <p className="mt-2 text-xs text-red-600">{transportError}</p>
                  )}
                  {isTransport && transportQuote && transportQuote.type === "private" && (
                    <p className="mt-2 text-xs text-zinc-600">Total vehículo: ${transportQuote.total}</p>
                  )}
                  {detailLines.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {detailLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="mb-2 flex justify-between"><span>{tr.subtotalLabel}</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="mb-2 flex justify-between"><span>{tr.taxes} ({ivaRatePercent}%)</span><span>${taxes.toFixed(2)}</span></div>
        <div className="flex justify-between border-t border-zinc-300 pt-2 text-lg font-bold dark:border-zinc-700"><span>{tr.total}</span><span>${totalWithTaxes.toFixed(2)}</span></div>
      </div>

      <div className="mb-6">
        <h3 className="mb-4 text-xl font-semibold">{tr.policiesTitle}</h3>
        <div className="mb-4 rounded-xl bg-yellow-50 p-4 text-zinc-800 dark:bg-yellow-900/20 dark:text-zinc-300">
          <strong className="mb-1 block text-yellow-900 dark:text-yellow-300">{tr.cancellationLabel}</strong>
          <p className="text-sm">{localizedCancellationPolicy}</p>
        </div>
        <label htmlFor="agreeTerms" className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${formState.agreeTerms ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20" : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}>
          <input
            ref={termsCheckboxRef}
            id="agreeTerms"
            type="checkbox"
            checked={formState.agreeTerms}
            onChange={(e) => onTermsChange(e.target.checked)}
            onKeyDown={onTermsEnter}
            className="mt-0.5 h-5 w-5 rounded border-zinc-400 text-teal-600 focus:ring-teal-500 dark:border-zinc-600 dark:bg-zinc-700"
          />
          <span className="text-base text-zinc-700 dark:text-zinc-400">
            {tr.agreeText}
            <Link href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-1 text-teal-600 underline">{tr.termsLink}</Link>{" "}{tr.andThe}{" "}
            <Link href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-1 text-teal-600 underline">{tr.privacyLink}</Link>.
          </span>
        </label>
      </div>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 border-t border-zinc-200 pb-1 pt-4 dark:border-zinc-800">
        <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
          {lang === "es" ? "Cancelación gratuita hasta 24h antes" : "Free cancellation up to 24h before"}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
          {lang === "es" ? "Confirmación inmediata" : "Instant confirmation"}
        </span>
      </div>
    </>
  );
}

function getAddonDetailLines(addonId: string, details: ReservationAddonDetails, lang: "es" | "en") {
  if (addonId === "alojamiento") {
    return [
      details.lodgingType ? `${lang === "es" ? "Tipo" : "Type"}: ${formatLodgingType(details.lodgingType, lang)}` : null,
      details.lodgingNights ? `${lang === "es" ? "Noches" : "Nights"}: ${details.lodgingNights}` : null,
      details.lodgingRoom ? `${lang === "es" ? "Cuarto" : "Room"}: ${details.lodgingRoom}` : null,
    ].filter(Boolean) as string[];
  }

  if (addonId === "almuerzo") {
    return [
      details.restaurantMeal ? `${lang === "es" ? "Comida" : "Meal"}: ${details.restaurantMeal}` : null,
      details.restaurantProtein ? `${lang === "es" ? "Proteína" : "Protein"}: ${details.restaurantProtein}` : null,
      details.restaurantNotes ? `${lang === "es" ? "Notas" : "Notes"}: ${details.restaurantNotes}` : null,
    ].filter(Boolean) as string[];
  }

  if (addonId === "transporte") {
    return [
      details.transportType ? `${lang === "es" ? "Tipo" : "Type"}: ${details.transportType === "private" ? (lang === "es" ? "Privado 4x4" : "Private 4x4") : (lang === "es" ? "Compartido" : "Shared shuttle")}` : null,
      details.pickupLocation ? `${lang === "es" ? "Pickup" : "Pickup"}: ${getTransportLocationLabel(details.pickupLocation, lang)}` : null,
      details.dropoffLocation ? `${lang === "es" ? "Drop-off" : "Drop-off"}: ${getTransportLocationLabel(details.dropoffLocation, lang)}` : null,
      details.transportNotes ? `${lang === "es" ? "Notas" : "Notes"}: ${details.transportNotes}` : null,
    ].filter(Boolean) as string[];
  }

  return [];
}

function formatLodgingType(type: NonNullable<ReservationAddonDetails["lodgingType"]>, lang: "es" | "en") {
  if (type === "hostel") return lang === "es" ? "Hostal" : "Hostel";
  if (type === "hotel") return "Hotel";
  return lang === "es" ? "Cabina" : "Cabin";
}

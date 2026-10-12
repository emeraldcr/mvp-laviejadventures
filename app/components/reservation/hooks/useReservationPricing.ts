"use client";

import { useEffect, useMemo, useState } from "react";
import { getTransportLocationLabel } from "@/lib/reservation/constants";
import { buildAddonsBreakdown, getAddonsPricePerPerson } from "@/lib/reservation/addons";
import { isTransportConfigComplete, type TransportQuoteResult } from "@/lib/reservation/transport";
import type { ReservationAddonDetails } from "@/lib/reservation/types";
import { useTransportQuote } from "./useTransportQuote";

export function useReservationPricing({
  tickets,
  lang,
  packagePriceUSD,
  ivaRatePercent,
  excludedAddonIds,
}: {
  tickets: number;
  lang: "es" | "en";
  packagePriceUSD: number;
  ivaRatePercent: number;
  excludedAddonIds: string[];
}) {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addonDetails, setAddonDetails] = useState<ReservationAddonDetails>({});
  const transportQuoteEnabled = isTransportConfigComplete(addonDetails);
  const { transportQuote, transportLoading, transportError } = useTransportQuote({
    enabled: transportQuoteEnabled,
    addonDetails,
    tickets,
  });

  useEffect(() => {
    setSelectedAddons((current) => current.filter((id) => !excludedAddonIds.includes(id)));
  }, [excludedAddonIds]);

  const addonsPricePerPerson = useMemo(() => getAddonsPricePerPerson(selectedAddons, addonDetails, {
    transportPricePerPerson: transportQuote?.perPerson ?? null,
  }), [selectedAddons, addonDetails, transportQuote]);
  const addonsBreakdown = useMemo(() => buildAddonsBreakdown(selectedAddons, addonDetails, {
    transportPricePerPerson: transportQuote?.perPerson ?? null,
  }), [selectedAddons, addonDetails, transportQuote]);

  const addonDetailsSummary = useMemo(() => {
    const lines: string[] = [];
    if (selectedAddons.includes("alojamiento")) {
      lines.push([
        lang === "es" ? "Hospedaje" : "Lodging",
        addonDetails.lodgingType,
        addonDetails.lodgingNights ? addonDetails.lodgingNights + " night(s)" : null,
        addonDetails.lodgingRoom,
      ].filter(Boolean).join(": "));
    }
    if (selectedAddons.includes("almuerzo")) {
      lines.push([
        lang === "es" ? "Restaurante" : "Restaurant",
        addonDetails.restaurantMeal,
        addonDetails.restaurantProtein,
        addonDetails.restaurantNotes,
      ].filter(Boolean).join(": "));
    }
    if (selectedAddons.includes("transporte")) {
      lines.push([
        lang === "es" ? "Transporte" : "Transport",
        addonDetails.transportType === "private"
          ? (lang === "es" ? "Privado 4x4" : "Private 4x4")
          : addonDetails.transportType === "shared"
            ? (lang === "es" ? "Compartido" : "Shared shuttle")
            : null,
        addonDetails.pickupLocation
          ? (lang === "es" ? "Pickup: " : "Pickup: ") + getTransportLocationLabel(addonDetails.pickupLocation, lang)
          : null,
        addonDetails.dropoffLocation
          ? "Drop-off: " + getTransportLocationLabel(addonDetails.dropoffLocation, lang)
          : null,
        addonDetails.transportNotes,
      ].filter(Boolean).join(" | "));
    }
    return lines.filter((line) => line.includes(":")).join(" | ");
  }, [addonDetails, lang, selectedAddons]);

  const pricePerPerson = packagePriceUSD + addonsPricePerPerson;
  const totals = useMemo(() => {
    const subtotal = (Number.isFinite(tickets) ? Math.max(0, tickets) : 0) * pricePerPerson;
    const taxRate = Number.isFinite(ivaRatePercent) ? Math.max(0, ivaRatePercent) / 100 : 0;
    const taxes = subtotal * taxRate;
    return { subtotal, taxes, total: subtotal + taxes };
  }, [tickets, pricePerPerson, ivaRatePercent]);

  return {
    selectedAddons,
    setSelectedAddons,
    addonDetails,
    setAddonDetails,
    transportQuoteEnabled,
    transportQuote: transportQuote as TransportQuoteResult | null,
    transportLoading,
    transportError,
    addonsPricePerPerson,
    addonsBreakdown,
    addonDetailsSummary,
    pricePerPerson,
    subtotal: Number.isFinite(totals.subtotal) ? totals.subtotal : 0,
    taxes: Number.isFinite(totals.taxes) ? totals.taxes : 0,
    totalWithTaxes: Number.isFinite(totals.total) ? totals.total : 0,
  };
}

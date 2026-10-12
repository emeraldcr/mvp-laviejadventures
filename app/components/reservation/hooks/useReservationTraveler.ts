"use client";

import { useEffect, useRef } from "react";
import useReservationForm from "@/app/hooks/useReservationForm";
import { ADDON_OPTIONS, RESERVATION_TRAVELER_DRAFT_KEY } from "@/lib/reservation/constants";
import type { ReservationAddonDetails, TourTime } from "@/lib/reservation/types";
import { PHONE_COUNTRIES } from "@/app/components/reservation/phoneCountries";

export function useReservationTraveler({
  availableTimeSlots,
  setTourTime,
  setSelectedAddons,
  setAddonDetails,
}: {
  availableTimeSlots: string[];
  setTourTime: (time: TourTime) => void;
  setSelectedAddons: (updater: (current: string[]) => string[]) => void;
  setAddonDetails: (details: ReservationAddonDetails) => void;
}) {
  const travelerForm = useReservationForm({
    name: "",
    email: "",
    phoneCode: PHONE_COUNTRIES[0]?.code ?? "+506",
    phoneNumber: "",
    specialRequests: "",
    agreeTerms: false,
  }, { storageKey: RESERVATION_TRAVELER_DRAFT_KEY });
  const hasPrefilledProfileRef = useRef(false);
  const hasAppliedPrefillRef = useRef(false);
  const { isHydrated, setFormState } = travelerForm;

  useEffect(() => {
    if (hasAppliedPrefillRef.current || !isHydrated || availableTimeSlots.length === 0) return;

    try {
      const params = new URLSearchParams(window.location.search);
      const requestedTime = (params.get("time") ?? params.get("tourTime") ?? "").trim();
      if (requestedTime && availableTimeSlots.includes(requestedTime)) setTourTime(requestedTime);

      const requestedPhone = (params.get("phone") ?? "").trim();
      const requestedPhoneNumber = (params.get("phoneNumber") ?? "").trim();
      const phoneMatch = requestedPhone.match(/^(\+\d{1,4})[\s-]*(.*)$/);
      const requestedAddonIds = (params.get("addons") ?? params.get("addonIds") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter((value) => ADDON_OPTIONS.some((addon) => addon.id === value));
      if (requestedAddonIds.length > 0) setSelectedAddons(() => requestedAddonIds);

      const addonDetailsParam = params.get("addonDetails");
      if (addonDetailsParam) {
        try {
          const parsedDetails = JSON.parse(addonDetailsParam) as ReservationAddonDetails;
          if (parsedDetails && typeof parsedDetails === "object") setAddonDetails(parsedDetails);
        } catch {
          // Ignore malformed optional add-on data and keep the reservation usable.
        }
      }

      setFormState((current) => ({
        ...current,
        name: params.get("name")?.trim() || current.name || "",
        email: params.get("email")?.trim() || current.email || "",
        phoneCode: params.get("phoneCode")?.trim() || phoneMatch?.[1] || current.phoneCode,
        phoneNumber: requestedPhoneNumber || phoneMatch?.[2] || requestedPhone || current.phoneNumber,
        specialRequests: params.get("specialRequests")?.trim() || current.specialRequests || "",
        agreeTerms: false,
      }));
      hasAppliedPrefillRef.current = true;
    } catch {
      hasAppliedPrefillRef.current = true;
    }
  }, [availableTimeSlots, isHydrated, setAddonDetails, setFormState, setSelectedAddons, setTourTime]);

  useEffect(() => {
    if (hasPrefilledProfileRef.current) return;
    hasPrefilledProfileRef.current = true;
    let cancelled = false;

    fetch("/api/user/profile")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled) return;
        const profile = data?.profile as { name?: string; email?: string; phone?: string } | undefined;
        if (!profile) return;

        setFormState((previous) => {
          const next = {
            ...previous,
            name: previous.name.trim() ? previous.name : (profile.name ?? previous.name),
            email: previous.email.trim() ? previous.email : (profile.email ?? previous.email),
          };
          if (previous.phoneNumber.trim() || !profile.phone?.trim()) return next;

          const normalizedPhone = profile.phone.trim();
          const matchedCode = PHONE_COUNTRIES.find((country) => normalizedPhone.startsWith(country.code));
          if (matchedCode) {
            return {
              ...next,
              phoneCode: matchedCode.code,
              phoneNumber: normalizedPhone.slice(matchedCode.code.length).trim(),
            };
          }
          return { ...next, phoneNumber: normalizedPhone };
        });
      })
      .catch(() => {
        // Guest or offline: saved draft values remain available.
      });

    return () => { cancelled = true; };
  }, [setFormState]);

  return { ...travelerForm, hasAppliedPrefillRef };
}

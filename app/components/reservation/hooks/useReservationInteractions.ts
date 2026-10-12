"use client";

import { useCallback, type MutableRefObject } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import type { ReservationFieldName, ReservationFormState, TourTime } from "@/lib/reservation/types";
import { RESERVATION_STEP_LABELS } from "../constants/reservationWizard";

type Validation = {
  isNameValid: boolean;
  isEmailValid: boolean;
  isPhoneNumberValid: boolean;
  isAgreeTermsValid: boolean;
};

export function useReservationInteractions({
  getBookingSnapshot,
  setTourTime,
  setHasConfirmedTime,
  step1FieldFocusRef,
  setTickets,
  slots,
  setHasConfirmedTickets,
  formState,
  validation,
  missingStep2Keys,
  setSelectedPackageId,
  setHasConfirmedPackage,
}: {
  getBookingSnapshot: () => Record<string, unknown>;
  setTourTime: (time: TourTime) => void;
  setHasConfirmedTime: (value: boolean) => void;
  step1FieldFocusRef: MutableRefObject<"schedule" | "tickets" | null>;
  setTickets: (tickets: number) => void;
  slots: number;
  setHasConfirmedTickets: (value: boolean) => void;
  formState: ReservationFormState;
  validation: Validation;
  missingStep2Keys: string[];
  setSelectedPackageId: (packageId: string) => void;
  setHasConfirmedPackage: (value: boolean) => void;
}) {
  const onTourTimeSelect = useCallback((slot: TourTime) => {
    setTourTime(slot);
    setHasConfirmedTime(true);
    step1FieldFocusRef.current = "tickets";
    trackAnalyticsEvent("booking_selection_changed", {
      metadata: {
        step: 1,
        stepLabel: RESERVATION_STEP_LABELS[1],
        field: "tour_time",
        value: slot,
        booking: { ...getBookingSnapshot(), selectedTime: slot, hasSelectedTime: true },
      },
    });
  }, [getBookingSnapshot, setHasConfirmedTime, setTourTime, step1FieldFocusRef]);

  const onTicketsChange = useCallback((rawValue: string) => {
    const parsedValue = Number(rawValue);
    const nextTickets = Math.min(
      Math.max(Number.isFinite(parsedValue) ? Math.trunc(parsedValue) : 1, 1),
      Math.max(slots, 1),
    );
    setTickets(nextTickets);
    setHasConfirmedTickets(true);
    trackAnalyticsEvent("booking_selection_changed", {
      metadata: {
        step: 1,
        stepLabel: RESERVATION_STEP_LABELS[1],
        field: "tickets",
        rawValue: Number.isFinite(parsedValue) ? parsedValue : null,
        value: nextTickets,
        wasClamped: nextTickets !== parsedValue,
        slots,
        booking: { ...getBookingSnapshot(), tickets: nextTickets },
      },
    });
  }, [getBookingSnapshot, setHasConfirmedTickets, setTickets, slots]);

  const onFieldBlur = useCallback((field: ReservationFieldName) => {
    const fieldState = {
      name: {
        isValid: validation.isNameValid,
        isEmpty: formState.name.trim() === "",
        valueLength: formState.name.trim().length,
      },
      email: {
        isValid: validation.isEmailValid,
        isEmpty: formState.email.trim() === "",
        valueLength: formState.email.trim().length,
      },
      phone: {
        isValid: validation.isPhoneNumberValid,
        isEmpty: formState.phoneNumber.trim() === "",
        valueLength: formState.phoneNumber.trim().length,
        phoneCode: formState.phoneCode,
      },
      specialRequests: {
        isValid: true,
        isEmpty: formState.specialRequests.trim() === "",
        valueLength: formState.specialRequests.trim().length,
      },
      terms: {
        isValid: validation.isAgreeTermsValid,
        isEmpty: !validation.isAgreeTermsValid,
        valueLength: validation.isAgreeTermsValid ? 1 : 0,
      },
    }[field];

    trackAnalyticsEvent("booking_field_blur", {
      metadata: {
        step: field === "terms" ? 3 : 2,
        stepLabel: field === "terms" ? RESERVATION_STEP_LABELS[3] : RESERVATION_STEP_LABELS[2],
        field,
        ...fieldState,
        missingStep2Keys,
        termsAccepted: validation.isAgreeTermsValid,
        booking: getBookingSnapshot(),
      },
    });
  }, [formState, getBookingSnapshot, missingStep2Keys, validation]);

  const onPackageSelect = useCallback((packageId: string) => {
    setSelectedPackageId(packageId);
    setHasConfirmedPackage(true);
    trackAnalyticsEvent("booking_selection_changed", {
      metadata: {
        step: 1,
        stepLabel: RESERVATION_STEP_LABELS[1],
        field: "package",
        value: packageId,
        booking: getBookingSnapshot(),
      },
    });
  }, [getBookingSnapshot, setHasConfirmedPackage, setSelectedPackageId]);

  return { onTourTimeSelect, onTicketsChange, onFieldBlur, onPackageSelect };
}

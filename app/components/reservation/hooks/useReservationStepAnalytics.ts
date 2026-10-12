"use client";

import { useCallback, useEffect, useRef } from "react";
import type { BookingStepId } from "@/lib/reservation/types";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { RESERVATION_STEP_LABELS } from "../constants/reservationWizard";

type Args = {
  currentStep: BookingStepId;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  termsAccepted: boolean;
  isFormValid: boolean;
  missingStep1Items: string[];
  missingStep2Items: string[];
  missingStep1Keys: string[];
  missingStep2Keys: string[];
  getBookingSnapshot: () => Record<string, unknown>;
  selectedDate: number;
  currentMonth: number;
  currentYear: number;
  tickets: number;
};

export function useReservationStepAnalytics({
  currentStep,
  isStep1Valid,
  isStep2Valid,
  termsAccepted,
  isFormValid,
  missingStep1Items,
  missingStep2Items,
  missingStep1Keys,
  missingStep2Keys,
  getBookingSnapshot,
  selectedDate,
  currentMonth,
  currentYear,
  tickets,
}: Args) {
  const currentStepRef = useRef<BookingStepId>(1);
  const stepEnteredAtRef = useRef(0);
  const completedStepsRef = useRef(new Set<BookingStepId>());

  const getMissingKeysForStep = useCallback((step: BookingStepId) => {
    if (step === 1) return missingStep1Keys;
    if (step === 2) return missingStep2Keys;
    return termsAccepted ? [] : ["terms"];
  }, [missingStep1Keys, missingStep2Keys, termsAccepted]);

  useEffect(() => {
    if (stepEnteredAtRef.current === 0) stepEnteredAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    trackAnalyticsEvent("booking_step", {
      metadata: {
        step: currentStep,
        stepLabel: RESERVATION_STEP_LABELS[currentStep],
        completion: {
          step1Valid: isStep1Valid,
          step2Valid: isStep2Valid,
          termsAccepted,
          formReadyToSubmit: isFormValid,
          missingStep1Items,
          missingStep2Items,
          missingStep1Keys,
          missingStep2Keys,
        },
        booking: getBookingSnapshot(),
        selectedDate,
        currentMonth,
        currentYear,
        tickets,
      },
    });
  }, [
    currentStep,
    isStep1Valid,
    isStep2Valid,
    termsAccepted,
    isFormValid,
    missingStep1Items,
    missingStep2Items,
    missingStep1Keys,
    missingStep2Keys,
    getBookingSnapshot,
    selectedDate,
    currentMonth,
    currentYear,
    tickets,
  ]);

  useEffect(() => {
    const previousStep = currentStepRef.current;
    if (previousStep === currentStep) return;

    const durationMs = Date.now() - stepEnteredAtRef.current;
    trackAnalyticsEvent("booking_step_abandoned", {
      metadata: {
        step: previousStep,
        stepLabel: RESERVATION_STEP_LABELS[previousStep],
        durationMs,
        durationSeconds: Math.round(durationMs / 1000),
        missingKeys: getMissingKeysForStep(previousStep),
        completed: completedStepsRef.current.has(previousStep),
        nextStep: currentStep,
        nextStepLabel: RESERVATION_STEP_LABELS[currentStep],
        booking: getBookingSnapshot(),
      },
    });

    currentStepRef.current = currentStep;
    stepEnteredAtRef.current = Date.now();
  }, [currentStep, getBookingSnapshot, getMissingKeysForStep]);

  useEffect(() => {
    const handlePageHide = () => {
      const activeStep = currentStepRef.current;
      const durationMs = Date.now() - stepEnteredAtRef.current;

      trackAnalyticsEvent("booking_step_abandoned", {
        metadata: {
          step: activeStep,
          stepLabel: RESERVATION_STEP_LABELS[activeStep],
          durationMs,
          durationSeconds: Math.round(durationMs / 1000),
          missingKeys: getMissingKeysForStep(activeStep),
          completed: completedStepsRef.current.has(activeStep),
          nextStep: null,
          nextStepLabel: null,
          source: "pagehide",
          booking: getBookingSnapshot(),
        },
      });
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [getBookingSnapshot, getMissingKeysForStep]);

  const trackBlockedStep = useCallback((targetStep: BookingStepId | "checkout", source: string) => {
    trackAnalyticsEvent("booking_step_blocked", {
      metadata: {
        step: currentStep,
        stepLabel: RESERVATION_STEP_LABELS[currentStep],
        targetStep,
        targetStepLabel: targetStep === "checkout" ? "checkout" : RESERVATION_STEP_LABELS[targetStep],
        source,
        missingKeys: getMissingKeysForStep(currentStep),
        missingStep1Keys,
        missingStep2Keys,
        termsAccepted,
        booking: getBookingSnapshot(),
      },
    });
  }, [currentStep, getBookingSnapshot, getMissingKeysForStep, missingStep1Keys, missingStep2Keys, termsAccepted]);

  const markStepCompleted = useCallback((step: BookingStepId) => {
    completedStepsRef.current.add(step);
  }, []);

  const trackStepCompleted = useCallback((step: BookingStepId, targetStep: BookingStepId | "checkout", source: string) => {
    markStepCompleted(step);
    const durationMs = Date.now() - stepEnteredAtRef.current;

    trackAnalyticsEvent("booking_step_completed", {
      metadata: {
        step,
        stepLabel: RESERVATION_STEP_LABELS[step],
        targetStep,
        targetStepLabel: targetStep === "checkout" ? "checkout" : RESERVATION_STEP_LABELS[targetStep],
        source,
        durationMs,
        durationSeconds: Math.round(durationMs / 1000),
        booking: getBookingSnapshot(),
      },
    });
  }, [getBookingSnapshot, markStepCompleted]);

  const resetCompletedSteps = useCallback(() => completedStepsRef.current.clear(), []);

  return { trackBlockedStep, trackStepCompleted, markStepCompleted, resetCompletedSteps };
}

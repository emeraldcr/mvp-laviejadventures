"use client";

import { useCallback, useEffect, useRef, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
import type { BookingStepId, ReservationChoiceStep, TourTime } from "@/lib/reservation/types";

type Validation = {
  isNameValid: boolean;
  isEmailValid: boolean;
  isPhoneNumberValid: boolean;
  isAgreeTermsValid: boolean;
};

export function useReservationNavigation({
  currentStep,
  setCurrentStep,
  choiceStep,
  setChoiceStep,
  isStep1Valid,
  isStep2Valid,
  isTicketsValid,
  hasConfirmedPackage,
  hasConfirmedTime,
  hasConfirmedTickets,
  tourTime,
  validation,
  trackBlockedStep,
  trackStepCompleted,
  markStepCompleted,
}: {
  currentStep: BookingStepId;
  setCurrentStep: Dispatch<SetStateAction<BookingStepId>>;
  choiceStep: ReservationChoiceStep;
  setChoiceStep: Dispatch<SetStateAction<ReservationChoiceStep>>;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  isTicketsValid: boolean;
  hasConfirmedPackage: boolean;
  hasConfirmedTime: boolean;
  hasConfirmedTickets: boolean;
  tourTime: TourTime | null;
  validation: Validation;
  trackBlockedStep: (targetStep: BookingStepId | "checkout", source: string) => void;
  trackStepCompleted: (step: BookingStepId, targetStep: BookingStepId | "checkout", source: string) => void;
  markStepCompleted: (step: BookingStepId) => void;
}) {
  const nextStepFocusRef = useRef<BookingStepId | null>(null);
  const step1FieldFocusRef = useRef<"schedule" | "tickets" | null>(null);
  const scheduleSectionRef = useRef<HTMLElement | null>(null);
  const ticketsInputRef = useRef<HTMLInputElement | null>(null);
  const travelerSectionRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);
  const termsCheckboxRef = useRef<HTMLInputElement | null>(null);

  const guideToElement = useCallback((element: HTMLElement | null, focus = false) => {
    if (!element) return;
    window.setTimeout(() => {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      if (focus && "focus" in element) {
        window.setTimeout(() => element.focus({ preventScroll: true }), 180);
      }
    }, 80);
  }, []);

  const guideToStep = useCallback((step: BookingStepId) => {
    if (step === 1) {
      guideToElement(tourTime ? ticketsInputRef.current : scheduleSectionRef.current, Boolean(tourTime));
      return;
    }
    if (step === 2) {
      const target = !validation.isNameValid
        ? nameInputRef.current
        : !validation.isEmailValid
          ? emailInputRef.current
          : !validation.isPhoneNumberValid
            ? phoneInputRef.current
            : travelerSectionRef.current;
      const focus = target !== travelerSectionRef.current;
      guideToElement(target, focus);
      return;
    }
    guideToElement(validation.isAgreeTermsValid ? reviewSectionRef.current : termsCheckboxRef.current, !validation.isAgreeTermsValid);
  }, [guideToElement, tourTime, validation.isAgreeTermsValid, validation.isEmailValid, validation.isNameValid, validation.isPhoneNumberValid]);

  const goToStep = useCallback((targetStep: BookingStepId, source: string) => {
    if (targetStep > currentStep) {
      if (currentStep === 1 && !isStep1Valid) {
        trackBlockedStep(targetStep, source);
        guideToStep(1);
        return;
      }
      if ((currentStep === 2 || targetStep === 3) && !isStep2Valid) {
        trackBlockedStep(targetStep, source);
        if (currentStep === 1 && isStep1Valid) {
          trackStepCompleted(1, 2, source);
          nextStepFocusRef.current = 2;
          setCurrentStep(2);
          return;
        }
        guideToStep(2);
        return;
      }
      trackStepCompleted(currentStep, targetStep, source);
      if (currentStep === 1 && targetStep === 3) markStepCompleted(2);
    }
    nextStepFocusRef.current = targetStep;
    setCurrentStep(targetStep);
  }, [currentStep, guideToStep, isStep1Valid, isStep2Valid, markStepCompleted, setCurrentStep, trackBlockedStep, trackStepCompleted]);

  useEffect(() => {
    if (nextStepFocusRef.current !== currentStep) return;
    nextStepFocusRef.current = null;
    guideToStep(currentStep);
  }, [currentStep, guideToStep]);

  useEffect(() => {
    if (currentStep !== 1 || step1FieldFocusRef.current !== "tickets" || !tourTime) return;
    step1FieldFocusRef.current = null;
    guideToElement(ticketsInputRef.current, true);
  }, [currentStep, guideToElement, tourTime]);

  const goToNextStep = useCallback(() => {
    if (currentStep === 1) {
      if (choiceStep === 1) {
        if (hasConfirmedPackage) setChoiceStep(2);
        return;
      }
      if (choiceStep === 2) {
        if (tourTime && hasConfirmedTime) setChoiceStep(3);
        return;
      }
      if (choiceStep === 3 && (!isTicketsValid || !hasConfirmedTickets)) return;
      goToStep(2, "next_button");
      return;
    }
    if (currentStep === 2) goToStep(3, "next_button");
  }, [choiceStep, currentStep, goToStep, hasConfirmedPackage, hasConfirmedTickets, hasConfirmedTime, isTicketsValid, setChoiceStep, tourTime]);

  const handleStep1Enter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (isStep1Valid) goToNextStep();
    else guideToStep(1);
  }, [goToNextStep, guideToStep, isStep1Valid]);

  const handleNameEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    guideToElement(validation.isNameValid ? emailInputRef.current : nameInputRef.current, true);
  }, [guideToElement, validation.isNameValid]);

  const handleEmailEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    guideToElement(validation.isEmailValid ? phoneInputRef.current : emailInputRef.current, true);
  }, [guideToElement, validation.isEmailValid]);

  const handlePhoneEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (isStep2Valid) goToNextStep();
    else guideToStep(2);
  }, [goToNextStep, guideToStep, isStep2Valid]);

  const resetPendingFocus = useCallback(() => {
    nextStepFocusRef.current = null;
    step1FieldFocusRef.current = null;
  }, []);

  return {
    goToStep,
    goToNextStep,
    handleStep1Enter,
    handleNameEnter,
    handleEmailEnter,
    handlePhoneEnter,
    step1FieldFocusRef,
    resetPendingFocus,
    scheduleSectionRef,
    ticketsInputRef,
    travelerSectionRef,
    nameInputRef,
    emailInputRef,
    phoneInputRef,
    reviewSectionRef,
    termsCheckboxRef,
  };
}

"use client";

import { useState, useMemo, useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import {
  formatDepartureLabel,
} from "@/lib/reservation/constants";
import { getPackageId, resolveInitialPackage } from "@/lib/reservation/pricing";
import ReservationDetailsStep3 from "./ReservationDetailsStep3";
import BookingStickyBar from "./BookingStickyBar";
import type {
  TourTime,
  BookingStepId,
  ReservationChoiceStep,
  ReservationDetailsProps,
} from "@/lib/reservation/types";
import ReservationDetailsStep1Guided from "./ReservationDetailsStep1Guided";
import ReservationDetailsStep2 from "./ReservationDetailsStep2";
import InlinePayPalCheckout from "./InlinePayPalCheckout";
import type { OrderDetails } from "@/lib/types/index";
import { ReservationWizardProvider, useReservationWizard } from "./context/ReservationWizardContext";
import { useReservationStepAnalytics } from "./hooks/useReservationStepAnalytics";
import { RESERVATION_STEP_LABELS } from "./constants/reservationWizard";
import { useReservationTourSelection } from "./hooks/useReservationTourSelection";
import { useReservationTraveler } from "./hooks/useReservationTraveler";
import { useReservationPricing } from "./hooks/useReservationPricing";
import ReservationDetailsSidebar from "./ReservationDetailsSidebar";
import { useReservationNavigation } from "./hooks/useReservationNavigation";

// ---------------------- MAIN COMPONENT ----------------------

export default function ReservationDetails(props: ReservationDetailsProps) {
  return (
    <ReservationWizardProvider>
      <ReservationDetailsFlow {...props} />
    </ReservationWizardProvider>
  );
}

function ReservationDetailsFlow({
  selectedDate,
  currentMonth,
  tickets,
  setTickets,
  availability,
  currentYear,
  tourInfo,
  tours,
  initialSelectedTourSlug,
  initialSelectedPackageId,
  hasPreselectedTour = false,
  ivaRatePercent = 13,
}: ReservationDetailsProps) {
  const { lang } = useLanguage();
  const { currentStep, setCurrentStep, choiceStep, setChoiceStep } = useReservationWizard();
  const tr = translations[lang].reservation;
  const dateLocale = lang === "es" ? es : enUS;
  const slots = availability[selectedDate] ?? 0;
  const isTicketsValid = Number.isInteger(tickets) && tickets >= 1 && tickets <= slots;

  const reservationDate = new Date(currentYear, currentMonth, selectedDate);
  const reservationDateIso = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;
  const formattedDate = format(
    reservationDate,
    lang === "es" ? "EEEE, dd 'de' MMMM 'de' yyyy" : "EEEE, MMMM dd, yyyy",
    { locale: dateLocale }
  );

  const [tourTime, setTourTime] = useState<TourTime | null>(null);
  const paymentAttemptIdRef = useRef<string | null>(null);

  const {
    selectedTour,
    packageOptions,
    selectedPackageId,
    setSelectedPackageId,
    hasConfirmedPackage,
    setHasConfirmedPackage,
    selectedPackage,
    excludedAddonIds,
    packageLabel,
    packagePriceUSD,
    selectedTourName,
    availableTimeSlots,
    isPackageDisabled,
    localizedCancellationPolicy,
  } = useReservationTourSelection({
    tours,
    initialSelectedTourSlug,
    initialSelectedPackageId,
    reservationDateIso,
    tickets,
    lang,
    tourInfo,
    defaultCancellationPolicy: tr.defaultCancellationPolicy,
  });
  const [hasConfirmedTime, setHasConfirmedTime] = useState(false);
  const [hasConfirmedTickets, setHasConfirmedTickets] = useState(false);

  useEffect(() => {
    if (tourTime && !availableTimeSlots.includes(tourTime)) {
      setTourTime(null);
    }
  }, [availableTimeSlots, tourTime]);

  const {
    selectedAddons,
    setSelectedAddons,
    addonDetails,
    setAddonDetails,
    transportQuoteEnabled,
    transportQuote,
    transportLoading,
    transportError,
    addonsPricePerPerson,
    addonDetailsSummary,
    pricePerPerson,
    subtotal,
    taxes,
    totalWithTaxes,
  } = useReservationPricing({
    tickets,
    lang,
    packagePriceUSD,
    ivaRatePercent,
    excludedAddonIds,
  });

  const {
    formState,
    isHydrated: isTravelerDraftHydrated,
    handleChange,
    validation,
    hasAppliedPrefillRef,
  } = useReservationTraveler({
    availableTimeSlots,
    setTourTime,
    setSelectedAddons,
    setAddonDetails,
  });
  const previousReservationDateRef = useRef(reservationDateIso);
  const hasResumedProgressRef = useRef(false);

  const isStep1Valid =
    isTicketsValid &&
    tourTime !== null &&
    hasConfirmedPackage &&
    hasConfirmedTime &&
    hasConfirmedTickets &&
    Boolean(selectedTour) &&
    Boolean(selectedPackage) &&
    !isPackageDisabled(selectedPackage);
  const isStep2Valid = validation.isNameValid && validation.isEmailValid && validation.isPhoneNumberValid;

  const missingStep1Items = useMemo(() => {
    const missing: string[] = [];

    if (!tourTime) missing.push(tr.missing.time);
    if (!selectedTour) missing.push(lang === "es" ? "Elegir un tour." : "Choose a tour.");
    if (!isTicketsValid) missing.push(tr.missing.tickets);

    return missing;
  }, [tourTime, isTicketsValid, selectedTour, tr.missing, lang]);

  const missingStep2Items = useMemo(() => {
    const missing: string[] = [];

    if (!validation.isNameValid) missing.push(tr.missing.name);
    if (!validation.isEmailValid) missing.push(tr.missing.email);
    if (!validation.isPhoneNumberValid) missing.push(tr.missing.phone);

    return missing;
  }, [validation.isNameValid, validation.isEmailValid, validation.isPhoneNumberValid, tr.missing]);

  const isFormValid = useMemo(
    () => isStep1Valid && isStep2Valid && validation.isAgreeTermsValid,
    [isStep1Valid, isStep2Valid, validation.isAgreeTermsValid]
  );

  const paypalOrderDetails = useMemo<OrderDetails | null>(() => {
    if (!isFormValid || !selectedTour || !selectedPackage || !tourTime) return null;
    paymentAttemptIdRef.current ??= crypto.randomUUID();

    return {
      bookingAttemptId: paymentAttemptIdRef.current,
      name: formState.name.trim(),
      email: formState.email.trim(),
      phone: `${formState.phoneCode} ${formState.phoneNumber.trim()}`,
      tickets,
      total: totalWithTaxes,
      date: formattedDate,
      dateIso: reservationDateIso,
      tourTime,
      packageId: selectedPackage.id ?? selectedPackageId ?? "general-entry",
      tourPackage: packageLabel,
      tourSlug: selectedTour.slug,
      tourName: selectedTourName,
      packagePrice: packagePriceUSD,
      specialRequests: formState.specialRequests.trim(),
      addons: [],
      addonIds: [],
      addonsPrice: 0,
      addonsPricePerPerson: 0,
      addonsBreakdown: [],
      addonDetails: {},
    };
  }, [
    formState.email,
    formState.name,
    formState.phoneCode,
    formState.phoneNumber,
    formState.specialRequests,
    formattedDate,
    isFormValid,
    packageLabel,
    packagePriceUSD,
    reservationDateIso,
    selectedPackage,
    selectedPackageId,
    selectedTour,
    selectedTourName,
    tickets,
    totalWithTaxes,
    tourTime,
  ]);

  const stepLabels = RESERVATION_STEP_LABELS;

  const missingStep1Keys = useMemo(() => {
    const missing: string[] = [];

    if (!tourTime) missing.push("tour_time");
    if (!selectedTour) missing.push("tour");
    if (!isTicketsValid) missing.push("tickets");

    return missing;
  }, [tourTime, isTicketsValid, selectedTour]);

  const missingStep2Keys = useMemo(() => {
    const missing: string[] = [];

    if (!validation.isNameValid) missing.push("name");
    if (!validation.isEmailValid) missing.push("email");
    if (!validation.isPhoneNumberValid) missing.push("phone");

    return missing;
  }, [validation.isNameValid, validation.isEmailValid, validation.isPhoneNumberValid]);

  const getAnalyticsBookingSnapshot = useCallback(() => ({
    hasPreselectedTour,
    selectedTourSlug: selectedTour?.slug ?? null,
    selectedTourName,
    selectedDate,
    currentMonth,
    currentYear,
    tickets,
    slots,
    hasSelectedTime: Boolean(tourTime),
    selectedTime: tourTime,
    selectedAddons,
    addonDetails,
    addonDetailsSummary,
    addonsPricePerPerson,
    pricePerPerson,
    subtotal,
    taxes,
    totalWithTaxes,
  }), [
    hasPreselectedTour,
    selectedTour?.slug,
    selectedTourName,
    selectedDate,
    currentMonth,
    currentYear,
    tickets,
    slots,
    tourTime,
    selectedAddons,
    addonDetails,
    addonDetailsSummary,
    addonsPricePerPerson,
    pricePerPerson,
    subtotal,
    taxes,
    totalWithTaxes,
  ]);

  const {
    trackBlockedStep,
    trackStepCompleted,
    markStepCompleted,
    resetCompletedSteps,
  } = useReservationStepAnalytics({
    currentStep,
    isStep1Valid,
    isStep2Valid,
    termsAccepted: validation.isAgreeTermsValid,
    isFormValid,
    missingStep1Items,
    missingStep2Items,
    missingStep1Keys,
    missingStep2Keys,
    getBookingSnapshot: getAnalyticsBookingSnapshot,
    selectedDate,
    currentMonth,
    currentYear,
    tickets,
  });

  const {
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
  } = useReservationNavigation({
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
  });

  useEffect(() => {
    if (previousReservationDateRef.current === reservationDateIso) return;
    previousReservationDateRef.current = reservationDateIso;
    resetCompletedSteps();
    resetPendingFocus();
    setCurrentStep(1);
    setChoiceStep(1);
    setTourTime(null);
    setHasConfirmedPackage(false);
    setHasConfirmedTime(false);
    setHasConfirmedTickets(false);
    handleChange("agreeTerms", false);
  }, [handleChange, reservationDateIso, resetCompletedSteps, resetPendingFocus, setChoiceStep, setCurrentStep]);

  useEffect(() => {
    if (
      hasResumedProgressRef.current ||
      !hasAppliedPrefillRef.current ||
      !isTravelerDraftHydrated ||
      !selectedTour ||
      !selectedPackage ||
      !selectedPackageId ||
      (initialSelectedPackageId &&
        getPackageId(selectedPackage) !== getPackageId(resolveInitialPackage(packageOptions, initialSelectedPackageId))) ||
      transportLoading
    ) return;

    hasResumedProgressRef.current = true;
    // A fresh visit always follows the guided sequence. Prefilled values may be
    // displayed as suggestions, but only direct user actions unlock each choice.
    setCurrentStep(1);
    setChoiceStep(1);
  }, [
    addonDetails,
    isStep1Valid,
    isStep2Valid,
    isTicketsValid,
    isTravelerDraftHydrated,
    lang,
    selectedAddons,
    initialSelectedPackageId,
    packageOptions,
    selectedPackageId,
    selectedPackage,
    selectedTour,
    tourTime,
    transportError,
    transportLoading,
    transportQuote,
    transportQuoteEnabled,
    validation.isAgreeTermsValid,
  ]);


  const handleTermsEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    handleChange("agreeTerms", true);
  }, [handleChange]);

  const handleTourTimeSelect = useCallback((slot: TourTime) => {
    setTourTime(slot);
    setHasConfirmedTime(true);
    step1FieldFocusRef.current = "tickets";
    trackAnalyticsEvent("booking_selection_changed", {
      metadata: {
        step: 1,
        stepLabel: stepLabels[1],
        field: "tour_time",
        value: slot,
        booking: {
          ...getAnalyticsBookingSnapshot(),
          selectedTime: slot,
          hasSelectedTime: true,
        },
      },
    });
  }, [getAnalyticsBookingSnapshot, stepLabels]);

  const handleAddonToggle = useCallback((addonId: string) => {
    setSelectedAddons((prev) => {
      const next = prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId];
      return next;
    });
    trackAnalyticsEvent("booking_selection_changed", {
      metadata: {
        step: 1,
        stepLabel: stepLabels[1],
        field: "addon",
        addonId,
        booking: getAnalyticsBookingSnapshot(),
      },
    });
  }, [getAnalyticsBookingSnapshot, stepLabels]);

  const handleTicketsChange = useCallback((rawValue: string) => {
    const parsedValue = Number(rawValue);
    const integerValue = Number.isFinite(parsedValue) ? Math.trunc(parsedValue) : 1;
    const nextTickets = Math.min(Math.max(integerValue, 1), Math.max(slots, 1));

    setTickets(nextTickets);
    setHasConfirmedTickets(true);
    trackAnalyticsEvent("booking_selection_changed", {
      metadata: {
        step: 1,
        stepLabel: stepLabels[1],
        field: "tickets",
        rawValue: Number.isFinite(parsedValue) ? parsedValue : null,
        value: nextTickets,
        wasClamped: nextTickets !== parsedValue,
        slots,
        booking: {
          ...getAnalyticsBookingSnapshot(),
          tickets: nextTickets,
        },
      },
    });
  }, [getAnalyticsBookingSnapshot, setTickets, slots, stepLabels]);

  const trackFieldBlur = useCallback((field: "name" | "email" | "phone" | "specialRequests" | "terms") => {
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
        stepLabel: field === "terms" ? stepLabels[3] : stepLabels[2],
        field,
        ...fieldState,
        missingStep2Keys,
        termsAccepted: validation.isAgreeTermsValid,
        booking: getAnalyticsBookingSnapshot(),
      },
    });
  }, [formState, getAnalyticsBookingSnapshot, missingStep2Keys, stepLabels, validation]);

  const missingItems = useMemo(() => [
    ...missingStep1Items,
    ...missingStep2Items,
    ...(validation.isAgreeTermsValid ? [] : [lang === "es" ? "Aceptar los términos." : "Accept the terms."]),
  ], [missingStep1Items, missingStep2Items, validation.isAgreeTermsValid, lang]);

  const wizardSteps = useMemo(
    () => [
      { id: 1 as BookingStepId, label: tr.steps.schedule },
      { id: 2 as BookingStepId, label: tr.steps.traveler },
      { id: 3 as BookingStepId, label: tr.steps.review },
    ],
    [tr.steps.schedule, tr.steps.traveler, tr.steps.review],
  );

  const stickySecondaryLabel = [
    formattedDate,
    hasConfirmedTime && tourTime ? formatDepartureLabel(tourTime) : null,
    hasConfirmedTickets ? `${tickets} pax` : null,
    hasConfirmedPackage ? packageLabel : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const step1ContinueLabel = lang === "es" ? "Siguiente · mis datos" : "Next · my details";

  const stickyLabel = currentStep === 1
    ? choiceStep < 3
      ? lang === "es" ? "Continuar" : "Continue"
      : step1ContinueLabel
    : lang === "es" ? "Revisar" : "Review";

  const handlePackageSelect = useCallback((packageId: string) => {
    setSelectedPackageId(packageId);
    setHasConfirmedPackage(true);
    trackAnalyticsEvent("booking_selection_changed", {
      metadata: {
        step: 1,
        stepLabel: stepLabels[1],
        field: "package",
        value: packageId,
        booking: getAnalyticsBookingSnapshot(),
      },
    });
  }, [getAnalyticsBookingSnapshot, stepLabels]);

  return (
    <div className={`grid gap-4 pb-32 md:pb-4 lg:items-start lg:gap-6 ${currentStep === 3 && formState.agreeTerms ? "lg:grid-cols-1" : "lg:grid-cols-[minmax(220px,270px)_minmax(0,1fr)]"}`}>
      <ReservationDetailsSidebar
        lang={lang}
        selectedTourName={selectedTourName}
        formattedDate={formattedDate}
        tourTime={tourTime}
        hasConfirmedTickets={hasConfirmedTickets}
        tickets={tickets}
        isStep1Valid={isStep1Valid}
        termsAccepted={formState.agreeTerms}
        total={totalWithTaxes}
        currentStep={currentStep}
        choiceStep={choiceStep}
        packageLabel={packageLabel}
        hasConfirmedPackage={hasConfirmedPackage}
        steps={wizardSteps}
        maxReachableStep={
          currentStep === 1
            ? isStep1Valid
              ? isStep2Valid ? 3 : 2
              : 1
            : currentStep === 2
              ? isStep2Valid ? 3 : 2
              : 3
        }
        onStepSelect={(step) => {
          if (step < currentStep) {
            setCurrentStep(step);
            return;
          }
          if (currentStep === 1 && step === 3 && isStep1Valid && isStep2Valid) {
            goToStep(3, "progress_skip");
            return;
          }
          goToStep(step, "progress");
        }}
      />

      <main className="min-w-0">
      {currentStep === 1 && (
        <ReservationDetailsStep1Guided
          choiceStep={choiceStep}
          onChoiceStepChange={setChoiceStep}
          scheduleSectionRef={scheduleSectionRef}
          ticketsInputRef={ticketsInputRef}
          tourTime={tourTime}
          availableTimeSlots={availableTimeSlots}
          isTicketsValid={isTicketsValid}
          hasConfirmedPackage={hasConfirmedPackage}
          hasConfirmedTime={hasConfirmedTime}
          hasConfirmedTickets={hasConfirmedTickets}
          tickets={tickets}
          slots={slots}
          packages={packageOptions}
          selectedPackageId={selectedPackageId}
          excludedAddonIds={excludedAddonIds}
          selectedAddons={selectedAddons}
          addonDetails={addonDetails}
          addonsPricePerPerson={addonsPricePerPerson}
          packageLabel={hasConfirmedPackage ? packageLabel : (lang === "es" ? "Paquete por elegir" : "Package to choose")}
          reservationDateIso={reservationDateIso}
          estimatedTotal={totalWithTaxes}
          continueLabel={step1ContinueLabel}
          onPackageSelect={handlePackageSelect}
          isPackageDisabled={isPackageDisabled}
          onTourTimeSelect={handleTourTimeSelect}
          onTicketsChange={handleTicketsChange}
          onStep1Enter={handleStep1Enter}
          onAddonToggle={handleAddonToggle}
          onAddonDetailsChange={setAddonDetails}
          onContinue={goToNextStep}
          canContinue={isStep1Valid}
          transportQuote={transportQuote}
          transportLoading={transportLoading}
          transportError={transportError}
          transportPreview={transportQuoteEnabled}
          tr={tr}
          lang={lang}
        />
      )}

      {currentStep === 2 && (
        <ReservationDetailsStep2
          travelerSectionRef={travelerSectionRef}
          nameInputRef={nameInputRef}
          emailInputRef={emailInputRef}
          phoneInputRef={phoneInputRef}
          isStep2Valid={isStep2Valid}
          formState={formState}
          validation={validation}
          onNameChange={(value) => handleChange("name", value)}
          onEmailChange={(value) => handleChange("email", value)}
          onPhoneCodeChange={(value) => handleChange("phoneCode", value)}
          onPhoneNumberChange={(value) => handleChange("phoneNumber", value)}
          onSpecialRequestsChange={(value) => handleChange("specialRequests", value)}
          onNameEnter={handleNameEnter}
          onEmailEnter={handleEmailEnter}
          onPhoneEnter={handlePhoneEnter}
          onFieldBlur={trackFieldBlur}
          onBack={() => setCurrentStep(1)}
          onContinue={() => goToStep(3, "continue_button")}
          canContinue={isStep2Valid}
          tr={tr}
          lang={lang}
        />
      )}

      {currentStep === 3 && (
        <>
          {formState.agreeTerms ? (
            <InlinePayPalCheckout
              orderDetails={paypalOrderDetails!}
              lang={lang}
              onBack={() => handleChange("agreeTerms", false)}
            />
          ) : <ReservationDetailsStep3
            reviewSectionRef={reviewSectionRef}
            termsCheckboxRef={termsCheckboxRef}
            formState={formState}
            selectedTourName={selectedTourName}
            packageLabel={packageLabel}
            basePriceUSD={packagePriceUSD}
            tourTime={tourTime}
            tickets={tickets}
            formattedDate={formattedDate}
            selectedAddons={selectedAddons}
            addonDetails={addonDetails}
            transportQuote={transportQuote}
            transportLoading={transportLoading}
            transportError={transportError}
            subtotal={subtotal}
            taxes={taxes}
            totalWithTaxes={totalWithTaxes}
            ivaRatePercent={ivaRatePercent}
            localizedCancellationPolicy={localizedCancellationPolicy}
            onTermsChange={(accepted) => handleChange("agreeTerms", accepted)}
            onTermsEnter={handleTermsEnter}
            onEditStep={(step) => setCurrentStep(step)}
            tr={tr}
            lang={lang}
          />}

          {!formState.agreeTerms && <div className="mb-3 hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex-1 rounded-full border border-zinc-300 px-6 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200"
            >
              {lang === "es" ? "Volver" : "Back"}
            </button>
          </div>}

          {!formState.agreeTerms && !isFormValid && missingItems.length > 0 && (
            <p className="mb-3 text-center text-xs font-semibold text-amber-600 dark:text-amber-400">
              {missingItems.join(" ")}
            </p>
          )}
        </>
      )}
      </main>

      {currentStep !== 3 && <BookingStickyBar
        lang={lang}
        label={stickyLabel}
        secondaryLabel={stickySecondaryLabel}
        total={totalWithTaxes}
        disabled={
          (currentStep === 1
            ? choiceStep === 1
              ? !selectedPackage || !hasConfirmedPackage
              : choiceStep === 2
                ? !tourTime || !hasConfirmedTime
                : choiceStep === 3
                  ? !isTicketsValid || !hasConfirmedTickets
                  : !isStep1Valid
            : currentStep === 2
              ? !isStep2Valid
              : !isFormValid)
        }
        onBack={
          currentStep === 1 && choiceStep > 1
            ? () => setChoiceStep((choiceStep - 1) as ReservationChoiceStep)
            : currentStep > 1
              ? () => setCurrentStep((currentStep - 1) as BookingStepId)
              : undefined
        }
        onAction={goToNextStep}
      />}
    </div>
  );
}

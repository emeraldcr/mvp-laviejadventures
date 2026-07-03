"use client";

import { useState, useMemo, useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { MapPin, ShieldCheck } from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { TOUR_INFO } from "@/lib/tour-info";
import { ADDON_OPTIONS, DEFAULT_DEPARTURE_TIMES } from "@/lib/reservation/constants";
import type {
  TourTime,
  BookingStepId,
  ReservationDetailsProps,
} from "@/lib/reservation/types";
import useReservationForm from "../../hooks/useReservationForm";
import { PHONE_COUNTRIES as ALL_PHONE_COUNTRIES } from "@/app/components/reservation/phoneCountries";
import { resolveSelectedTourSlug, getDefaultMainTourInfo } from "./reservationDetails.helpers";
import ReservationDetailsStepProgress from "./ReservationDetailsStepProgress";
import ReservationDetailsStep1 from "./ReservationDetailsStep1";
import ReservationDetailsStep2 from "./ReservationDetailsStep2";
import ReservationDetailsStep3 from "./ReservationDetailsStep3";
import type { MainTourInfo, TourPackageOption } from "@/lib/types/index";

// ---------------------- MAIN COMPONENT ----------------------

export default function ReservationDetails({
  selectedDate,
  currentMonth,
  tickets,
  setTickets,
  onReserve,
  availability,
  currentYear,
  tourInfo,
  tours,
  initialSelectedTourSlug,
  hasPreselectedTour = false,
  ivaRatePercent = 13,
}: ReservationDetailsProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].reservation;
  const dateLocale = lang === "es" ? es : enUS;
  const [selectedTourInfo, setSelectedTourInfo] = useState<{ slug: string; tour: MainTourInfo } | null>(null);
  const slots = availability[selectedDate] ?? 0;
  const isTicketsValid = tickets >= 1 && tickets <= slots;

  const reservationDate = new Date(currentYear, currentMonth, selectedDate);
  const reservationDateIso = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;
  const formattedDate = format(
    reservationDate,
    lang === "es" ? "EEEE, dd 'de' MMMM 'de' yyyy" : "EEEE, MMMM dd, yyyy",
    { locale: dateLocale }
  );

  const [tourTime, setTourTime] = useState<TourTime | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<BookingStepId>(1);
  const currentStepRef = useRef<BookingStepId>(1);
  const stepEnteredAtRef = useRef(0);
  const completedStepsRef = useRef<Set<BookingStepId>>(new Set());
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

  const selectedTourSlug = resolveSelectedTourSlug(tours, null, initialSelectedTourSlug);
  const selectedTour = tours.find((tour) => tour.slug === selectedTourSlug) ?? tours[0] ?? null;
  const selectedTourName = selectedTour ? (lang === "es" ? selectedTour.titleEs : selectedTour.titleEn) : (lang === "es" ? "Tour" : "Tour");
  const selectedTourDescription = selectedTour
    ? (lang === "es" ? selectedTour.descriptionEs : selectedTour.descriptionEn) ?? selectedTour.descriptionEs ?? selectedTour.descriptionEn ?? ""
    : "";
  const selectedTourFallbackInfo = useMemo<MainTourInfo | null>(() => {
    if (!selectedTour) return null;

    const priceLabel = typeof selectedTour.priceCRC === "number"
      ? new Intl.NumberFormat("es-CR", {
          style: "currency",
          currency: "CRC",
          maximumFractionDigits: 0,
        }).format(selectedTour.priceCRC)
      : "";

    return {
      name: selectedTourName,
      operator: TOUR_INFO.operator,
      duration: selectedTour.duration ?? "",
      price: priceLabel,
      location: selectedTour.location ?? "",
      inclusions: selectedTour.inclusions ?? [],
      exclusions: selectedTour.exclusions ?? [],
      cancellationPolicy: selectedTour.cancellationPolicy ?? "",
      details: selectedTourDescription,
      restrictions: selectedTour.restrictions ?? "",
      contact: TOUR_INFO.contact,
    };
  }, [selectedTour, selectedTourDescription, selectedTourName]);
  const defaultMainTourInfo: MainTourInfo = getDefaultMainTourInfo();
  const apiSelectedTourInfo = selectedTourInfo?.slug === selectedTourSlug ? selectedTourInfo.tour : null;
  const resolvedTourInfo: MainTourInfo = apiSelectedTourInfo
    ? {
        ...(selectedTourFallbackInfo ?? tourInfo ?? defaultMainTourInfo),
        ...apiSelectedTourInfo,
        duration: apiSelectedTourInfo.duration || selectedTourFallbackInfo?.duration || tourInfo?.duration || defaultMainTourInfo.duration,
        price: apiSelectedTourInfo.price || selectedTourFallbackInfo?.price || tourInfo?.price || defaultMainTourInfo.price,
        location: apiSelectedTourInfo.location || selectedTourFallbackInfo?.location || tourInfo?.location || defaultMainTourInfo.location,
        inclusions: apiSelectedTourInfo.inclusions.length > 0 ? apiSelectedTourInfo.inclusions : selectedTourFallbackInfo?.inclusions ?? tourInfo?.inclusions ?? defaultMainTourInfo.inclusions,
        exclusions: apiSelectedTourInfo.exclusions.length > 0 ? apiSelectedTourInfo.exclusions : selectedTourFallbackInfo?.exclusions ?? tourInfo?.exclusions ?? defaultMainTourInfo.exclusions,
        cancellationPolicy: apiSelectedTourInfo.cancellationPolicy || selectedTourFallbackInfo?.cancellationPolicy || tourInfo?.cancellationPolicy || defaultMainTourInfo.cancellationPolicy,
        details: apiSelectedTourInfo.details || selectedTourFallbackInfo?.details || tourInfo?.details || defaultMainTourInfo.details,
        restrictions: apiSelectedTourInfo.restrictions || selectedTourFallbackInfo?.restrictions || tourInfo?.restrictions || defaultMainTourInfo.restrictions,
        contact: apiSelectedTourInfo.contact ?? selectedTourFallbackInfo?.contact ?? tourInfo?.contact ?? defaultMainTourInfo.contact,
      }
    : selectedTourFallbackInfo ?? (tourInfo ? { ...defaultMainTourInfo, ...tourInfo, cancellationPolicy: tourInfo.cancellationPolicy ?? defaultMainTourInfo.cancellationPolicy } : defaultMainTourInfo);

  // Base price per person in USD (entry fee only, no packages)
  const basePriceUSD = useMemo(() => {
    if (selectedTour?.priceCRC) return Math.round(selectedTour.priceCRC / 525);
    return 30;
  }, [selectedTour]);

  // Departure times from tour data or defaults
  const availableTimeSlots = useMemo(() => {
    if (selectedTour?.packages && Array.isArray(selectedTour.packages) && selectedTour.packages.length > 0) {
      const times = (selectedTour.packages as TourPackageOption[]).flatMap((p) => p.departureTimes ?? []);
      const unique = Array.from(new Set(times.map((t) => t.trim()).filter(Boolean)));
      if (unique.length > 0) return unique;
    }
    return DEFAULT_DEPARTURE_TIMES;
  }, [selectedTour]);

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/tours/main?slug=${encodeURIComponent(selectedTourSlug)}`)
      .then((response) => response.json())
      .then((data) => {
        if (isMounted && data?.tour) {
          setSelectedTourInfo({ slug: selectedTourSlug, tour: data.tour as MainTourInfo });
        }
      })
      .catch(() => {
        if (isMounted && tourInfo && !selectedTourFallbackInfo) {
          setSelectedTourInfo({ slug: selectedTourSlug, tour: tourInfo });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTourSlug, selectedTourFallbackInfo, tourInfo]);

  const seemsSpanish = useCallback((value?: string) => {
    if (!value) return false;
    return /[áéíóúñ]|\b(entrada|guía|recorrido|cañón|horas|cancelación|solo|adultos|incluye)\b/i.test(value);
  }, []);

  const localizedCancellationPolicy = useMemo(() => {
    if (lang === "es") {
      return resolvedTourInfo.cancellationPolicy || tr.defaultCancellationPolicy;
    }

    if (!seemsSpanish(resolvedTourInfo.cancellationPolicy)) {
      return resolvedTourInfo.cancellationPolicy || tr.defaultCancellationPolicy;
    }

    return tr.defaultCancellationPolicy;
  }, [lang, resolvedTourInfo.cancellationPolicy, seemsSpanish, tr.defaultCancellationPolicy]);

  // Addon price per person for selected addons
  const addonsPricePerPerson = useMemo(
    () => ADDON_OPTIONS.filter((a) => selectedAddons.includes(a.id)).reduce((sum, a) => sum + a.price, 0),
    [selectedAddons]
  );

  const pricePerPerson = basePriceUSD + addonsPricePerPerson;

  const { subtotalRaw, taxesRaw, totalWithTaxesRaw } = useMemo(() => {
    const safeTickets = Number.isFinite(tickets) ? Math.max(0, tickets) : 0;
    const sub = safeTickets * pricePerPerson;
    const normalizedTaxRate = Number.isFinite(ivaRatePercent)
      ? Math.max(0, ivaRatePercent) / 100
      : 0;
    const tax = sub * normalizedTaxRate;
    return { subtotalRaw: sub, taxesRaw: tax, totalWithTaxesRaw: sub + tax };
  }, [tickets, pricePerPerson, ivaRatePercent]);

  const subtotal = Number.isFinite(subtotalRaw) ? subtotalRaw : 0;
  const taxes = Number.isFinite(taxesRaw) ? taxesRaw : 0;
  const totalWithTaxes = Number.isFinite(totalWithTaxesRaw) ? totalWithTaxesRaw : 0;

  const { formState, handleChange, validation } = useReservationForm({
    name: "",
    email: "",
    phoneCode: ALL_PHONE_COUNTRIES[0]?.code ?? "+506",
    phoneNumber: "",
    specialRequests: "",
    agreeTerms: false,
  });

  // Step 1 only requires time + tickets (no package selection)
  const isStep1Valid = isTicketsValid && tourTime !== null && Boolean(selectedTour);
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

  const steps = [
    { id: 1 as const, label: tr.steps.schedule },
    { id: 2 as const, label: tr.steps.traveler },
    { id: 3 as const, label: tr.steps.review },
  ];

  const stepLabels = useMemo<Record<BookingStepId, string>>(() => ({
    1: "schedule",
    2: "traveler_details",
    3: "review",
  }), []);

  useEffect(() => {
    if (stepEnteredAtRef.current === 0) {
      stepEnteredAtRef.current = Date.now();
    }
  }, []);

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

  const getMissingKeysForStep = useCallback((step: BookingStepId) => {
    if (step === 1) return missingStep1Keys;
    if (step === 2) return missingStep2Keys;
    return validation.isAgreeTermsValid ? [] : ["terms"];
  }, [missingStep1Keys, missingStep2Keys, validation.isAgreeTermsValid]);

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
    addonsPricePerPerson,
    pricePerPerson,
    subtotal: subtotalRaw,
    taxes: taxesRaw,
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
    addonsPricePerPerson,
    pricePerPerson,
    subtotalRaw,
    taxesRaw,
    totalWithTaxes,
  ]);

  useEffect(() => {
    trackAnalyticsEvent("booking_step", {
      metadata: {
        step: currentStep,
        stepLabel: stepLabels[currentStep],
        completion: {
          step1Valid: isStep1Valid,
          step2Valid: isStep2Valid,
          termsAccepted: validation.isAgreeTermsValid,
          formReadyToSubmit: isFormValid,
          missingStep1Items,
          missingStep2Items,
          missingStep1Keys,
          missingStep2Keys,
        },
        booking: getAnalyticsBookingSnapshot(),
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
    validation.isAgreeTermsValid,
    isFormValid,
    missingStep1Items,
    missingStep2Items,
    missingStep1Keys,
    missingStep2Keys,
    getAnalyticsBookingSnapshot,
    selectedDate,
    currentMonth,
    currentYear,
    tickets,
    stepLabels,
  ]);

  useEffect(() => {
    const previousStep = currentStepRef.current;
    if (previousStep !== currentStep) {
      const durationMs = Date.now() - stepEnteredAtRef.current;

      trackAnalyticsEvent("booking_step_abandoned", {
        metadata: {
          step: previousStep,
          stepLabel: stepLabels[previousStep],
          durationMs,
          durationSeconds: Math.round(durationMs / 1000),
          missingKeys: getMissingKeysForStep(previousStep),
          completed: completedStepsRef.current.has(previousStep),
          nextStep: currentStep,
          nextStepLabel: stepLabels[currentStep],
          booking: getAnalyticsBookingSnapshot(),
        },
      });

      currentStepRef.current = currentStep;
      stepEnteredAtRef.current = Date.now();
    }
  }, [currentStep, getAnalyticsBookingSnapshot, getMissingKeysForStep, stepLabels]);

  useEffect(() => {
    const handlePageHide = () => {
      const activeStep = currentStepRef.current;
      const durationMs = Date.now() - stepEnteredAtRef.current;

      trackAnalyticsEvent("booking_step_abandoned", {
        metadata: {
          step: activeStep,
          stepLabel: stepLabels[activeStep],
          durationMs,
          durationSeconds: Math.round(durationMs / 1000),
          missingKeys: getMissingKeysForStep(activeStep),
          completed: completedStepsRef.current.has(activeStep),
          nextStep: null,
          nextStepLabel: null,
          source: "pagehide",
          booking: getAnalyticsBookingSnapshot(),
        },
      });
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [getAnalyticsBookingSnapshot, getMissingKeysForStep, stepLabels]);

  const trackBlockedStep = useCallback((targetStep: BookingStepId | "checkout", source: string) => {
    const missingKeys = getMissingKeysForStep(currentStep);

    trackAnalyticsEvent("booking_step_blocked", {
      metadata: {
        step: currentStep,
        stepLabel: stepLabels[currentStep],
        targetStep,
        targetStepLabel: targetStep === "checkout" ? "checkout" : stepLabels[targetStep],
        source,
        missingKeys,
        missingStep1Keys,
        missingStep2Keys,
        termsAccepted: validation.isAgreeTermsValid,
        booking: getAnalyticsBookingSnapshot(),
      },
    });
  }, [
    currentStep,
    getAnalyticsBookingSnapshot,
    getMissingKeysForStep,
    missingStep1Keys,
    missingStep2Keys,
    stepLabels,
    validation.isAgreeTermsValid,
  ]);

  const trackStepCompleted = useCallback((step: BookingStepId, targetStep: BookingStepId | "checkout", source: string) => {
    completedStepsRef.current.add(step);

    trackAnalyticsEvent("booking_step_completed", {
      metadata: {
        step,
        stepLabel: stepLabels[step],
        targetStep,
        targetStepLabel: targetStep === "checkout" ? "checkout" : stepLabels[targetStep],
        source,
        durationMs: Date.now() - stepEnteredAtRef.current,
        durationSeconds: Math.round((Date.now() - stepEnteredAtRef.current) / 1000),
        booking: getAnalyticsBookingSnapshot(),
      },
    });
  }, [getAnalyticsBookingSnapshot, stepLabels]);

  const guideToElement = useCallback((element: HTMLElement | null, focus = false) => {
    if (!element) return;

    window.setTimeout(() => {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

      if (focus && "focus" in element) {
        window.setTimeout(() => {
          element.focus({ preventScroll: true });
        }, 180);
      }
    }, 80);
  }, []);

  const getStep1GuideTarget = useCallback(() => {
    if (!tourTime) return { element: scheduleSectionRef.current, focus: false };
    if (!isTicketsValid) return { element: ticketsInputRef.current, focus: true };
    return { element: ticketsInputRef.current, focus: true };
  }, [isTicketsValid, tourTime]);

  const getStep2GuideTarget = useCallback(() => {
    if (!validation.isNameValid) return { element: nameInputRef.current, focus: true };
    if (!validation.isEmailValid) return { element: emailInputRef.current, focus: true };
    if (!validation.isPhoneNumberValid) return { element: phoneInputRef.current, focus: true };
    return { element: travelerSectionRef.current, focus: false };
  }, [validation.isEmailValid, validation.isNameValid, validation.isPhoneNumberValid]);

  const getStep3GuideTarget = useCallback(() => {
    if (!validation.isAgreeTermsValid) return { element: termsCheckboxRef.current, focus: true };
    return { element: reviewSectionRef.current, focus: false };
  }, [validation.isAgreeTermsValid]);

  const guideToStep = useCallback((step: BookingStepId) => {
    const target =
      step === 1 ? getStep1GuideTarget() :
      step === 2 ? getStep2GuideTarget() :
      getStep3GuideTarget();

    guideToElement(target.element, target.focus);
  }, [getStep1GuideTarget, getStep2GuideTarget, getStep3GuideTarget, guideToElement]);

  const goToStep = useCallback((targetStep: BookingStepId, source: string) => {
    if (targetStep > currentStep) {
      if (currentStep === 1 && !isStep1Valid) {
        trackBlockedStep(targetStep, source);
        guideToStep(1);
        return;
      }

      if (currentStep === 2 && !isStep2Valid) {
        trackBlockedStep(targetStep, source);
        guideToStep(2);
        return;
      }

      trackStepCompleted(currentStep, targetStep, source);
    }

    nextStepFocusRef.current = targetStep;
    setCurrentStep(targetStep);
  }, [currentStep, guideToStep, isStep1Valid, isStep2Valid, trackBlockedStep, trackStepCompleted]);

  useEffect(() => {
    if (nextStepFocusRef.current !== currentStep) return;

    nextStepFocusRef.current = null;
    guideToStep(currentStep);
  }, [currentStep, guideToStep]);

  useEffect(() => {
    if (currentStep !== 1 || !step1FieldFocusRef.current) return;

    if (step1FieldFocusRef.current === "tickets" && tourTime) {
      step1FieldFocusRef.current = null;
      guideToElement(ticketsInputRef.current, true);
    }
  }, [currentStep, guideToElement, tourTime]);

  const handleReserve = useCallback(() => {
    if (!isFormValid || !tourTime || !selectedTour) {
      trackBlockedStep("checkout", "checkout_button");
      guideToStep(currentStep);
      return;
    }

    trackStepCompleted(3, "checkout", "checkout_button");

    trackAnalyticsEvent("booking_submitted", {
      metadata: {
        step: 3,
        stepLabel: "review",
        tickets,
        tourTime,
        tourSlug: selectedTour.slug,
        selectedAddons,
        totalWithTaxes,
      },
    });

    const selectedAddonObjects = ADDON_OPTIONS.filter((a) => selectedAddons.includes(a.id));

    onReserve({
      tickets,
      date: formattedDate,
      dateIso: reservationDateIso,
      total: totalWithTaxes,
      name: formState.name,
      email: formState.email,
      phone: `${formState.phoneCode} ${formState.phoneNumber}`,
      specialRequests: formState.specialRequests,
      tourTime,
      packageId: "entrada-general",
      tourPackage: lang === "es" ? "Entrada General" : "General Entry",
      tourSlug: selectedTour.slug,
      tourName: selectedTourName,
      packagePrice: basePriceUSD,
      addons: selectedAddonObjects.map((a) => (lang === "es" ? a.nameEs : a.nameEn)),
      addonIds: selectedAddonObjects.map((a) => a.id),
      addonsPrice: addonsPricePerPerson * tickets,
    });
  }, [
    isFormValid,
    tourTime,
    onReserve,
    tickets,
    formattedDate,
    reservationDateIso,
    totalWithTaxes,
    formState,
    selectedTour,
    selectedTourName,
    basePriceUSD,
    selectedAddons,
    addonsPricePerPerson,
    lang,
    trackBlockedStep,
    trackStepCompleted,
    guideToStep,
    currentStep,
  ]);

  const goToNextStep = useCallback(() => {
    const targetStep = currentStep < 3 ? ((currentStep + 1) as BookingStepId) : currentStep;
    goToStep(targetStep, "next_button");
  }, [currentStep, goToStep]);

  const goToPrevStep = useCallback(() => {
    const targetStep = currentStep > 1 ? ((currentStep - 1) as BookingStepId) : currentStep;
    nextStepFocusRef.current = targetStep;
    setCurrentStep(targetStep);
  }, [currentStep]);

  const handleStep1Enter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    if (isStep1Valid) {
      goToNextStep();
      return;
    }

    guideToStep(1);
  }, [goToNextStep, guideToStep, isStep1Valid]);

  const handleNameEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    if (validation.isNameValid) {
      guideToElement(emailInputRef.current, true);
      return;
    }

    guideToElement(nameInputRef.current, true);
  }, [guideToElement, validation.isNameValid]);

  const handleEmailEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    if (validation.isEmailValid) {
      guideToElement(phoneInputRef.current, true);
      return;
    }

    guideToElement(emailInputRef.current, true);
  }, [guideToElement, validation.isEmailValid]);

  const handlePhoneEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    if (isStep2Valid) {
      goToNextStep();
      return;
    }

    guideToStep(2);
  }, [goToNextStep, guideToStep, isStep2Valid]);

  const handleTermsEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    if (!validation.isAgreeTermsValid) {
      handleChange("agreeTerms", true);
      return;
    }

    handleReserve();
  }, [handleChange, handleReserve, validation.isAgreeTermsValid]);

  const handleTourTimeSelect = useCallback((slot: TourTime) => {
    setTourTime(slot);
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
    const nextTickets = parsedValue >= 1 && parsedValue <= slots
      ? parsedValue
      : parsedValue < 1
      ? 1
      : slots;

    setTickets(nextTickets);
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

  return (
    <div className="border-t border-zinc-300 dark:border-zinc-700">
      <h2 className="mb-5 text-center text-2xl font-black leading-tight text-zinc-900 dark:text-zinc-50">
        {tr.titlePrefix} {formattedDate}
      </h2>

      <ReservationDetailsStepProgress steps={steps} currentStep={currentStep} />

      <div className={`mb-5 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900/60 ${!selectedTour ? "ring-2 ring-amber-300/70" : ""}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
          <MapPin className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400">{tr.selectedTourLabel}</p>
          <h3 className="truncate text-lg font-black leading-tight text-zinc-900 dark:text-zinc-50">{selectedTourName}</h3>
        </div>
        <span className="shrink-0 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-black text-teal-800 dark:border-teal-700 dark:bg-teal-950/30 dark:text-teal-300">
          {lang === "es" ? "Desde" : "From"} ${basePriceUSD}
        </span>
      </div>

      {currentStep === 1 && (
        <>
          <ReservationDetailsStep1
            scheduleSectionRef={scheduleSectionRef}
            ticketsInputRef={ticketsInputRef}
            tourTime={tourTime}
            availableTimeSlots={availableTimeSlots}
            isTicketsValid={isTicketsValid}
            tickets={tickets}
            slots={slots}
            selectedAddons={selectedAddons}
            addonsPricePerPerson={addonsPricePerPerson}
            basePriceUSD={basePriceUSD}
            pricePerPerson={pricePerPerson}
            totalWithTaxes={totalWithTaxes}
            subtotal={subtotal}
            taxes={taxes}
            ivaRatePercent={ivaRatePercent}
            missingStep1Items={missingStep1Items}
            onTourTimeSelect={handleTourTimeSelect}
            onTicketsChange={handleTicketsChange}
            onStep1Enter={handleStep1Enter}
            onAddonToggle={handleAddonToggle}
            tr={tr}
            lang={lang}
          />

          {!isStep1Valid && (
            <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{tr.completeStepOneHint}</p>
              <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                {missingStep1Items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </>
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
          missingStep2Items={missingStep2Items}
          onNameChange={(value) => handleChange("name", value)}
          onEmailChange={(value) => handleChange("email", value)}
          onPhoneCodeChange={(value) => handleChange("phoneCode", value)}
          onPhoneNumberChange={(value) => handleChange("phoneNumber", value)}
          onSpecialRequestsChange={(value) => handleChange("specialRequests", value)}
          onNameEnter={handleNameEnter}
          onEmailEnter={handleEmailEnter}
          onPhoneEnter={handlePhoneEnter}
          onFieldBlur={trackFieldBlur}
          tr={tr}
          lang={lang}
        />
      )}

      {currentStep === 3 && (
        <ReservationDetailsStep3
          reviewSectionRef={reviewSectionRef}
          termsCheckboxRef={termsCheckboxRef}
          formState={formState}
          selectedTourName={selectedTourName}
          basePriceUSD={basePriceUSD}
          tourTime={tourTime}
          tickets={tickets}
          selectedAddons={selectedAddons}
          subtotal={subtotal}
          taxes={taxes}
          totalWithTaxes={totalWithTaxes}
          ivaRatePercent={ivaRatePercent}
          localizedCancellationPolicy={localizedCancellationPolicy}
          onTermsChange={(accepted) => {
            handleChange("agreeTerms", accepted);
            trackAnalyticsEvent("booking_field_blur", {
              metadata: {
                step: 3,
                stepLabel: stepLabels[3],
                field: "terms",
                isValid: accepted,
                isEmpty: !accepted,
                valueLength: accepted ? 1 : 0,
                termsAccepted: accepted,
                booking: getAnalyticsBookingSnapshot(),
              },
            });
          }}
          onTermsEnter={handleTermsEnter}
          tr={tr}
          lang={lang}
        />
      )}

      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
        {currentStep > 1 && (
          <button type="button" onClick={goToPrevStep} className="min-h-12 rounded-full border border-zinc-300 px-6 py-3 font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800 sm:min-w-32">
            {tr.backBtn}
          </button>
        )}
        {currentStep < 3 && (
          <button
            type="button"
            onClick={goToNextStep}
            aria-disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-8 py-3 font-bold text-white shadow-lg transition-all sm:min-w-44 ${
              (currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)
                ? "cursor-not-allowed bg-zinc-400 opacity-70 shadow-none"
                : "bg-teal-600 shadow-teal-950/20 hover:-translate-y-0.5 hover:bg-teal-500 hover:shadow-xl hover:shadow-teal-950/25"
            }`}
          >
            {currentStep === 1
              ? (lang === "es" ? "Mis datos →" : "My details →")
              : (lang === "es" ? "Revisar reserva →" : "Review booking →")}
          </button>
        )}
        {currentStep === 3 && (
          <button
            type="button"
            onClick={handleReserve}
            aria-disabled={!isFormValid}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-8 py-3 font-bold text-white shadow-lg transition-all sm:min-w-44 ${
              !isFormValid
                ? "cursor-not-allowed bg-zinc-400 opacity-70 shadow-none"
                : "bg-emerald-600 shadow-emerald-900/25 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-900/30"
            }`}
          >
            <ShieldCheck className="h-5 w-5" aria-hidden />
            {tr.proceedBtn}
          </button>
        )}
      </div>
    </div>
  );
}

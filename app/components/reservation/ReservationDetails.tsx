// components/ReservationDetails.tsx
import Link from "next/link";
import { createPortal } from "react-dom";
import { TOUR_INFO } from "@/lib/tour-info";
import { AvailabilityMap, MainTourInfo, TourSummary } from "@/lib/types/index";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";
import { AlertCircle, Camera, ChevronRight, Clock3, Info, MapPin, Route, ShieldCheck, Sparkles, TreePalm, Users, UtensilsCrossed, X } from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

// ---------------------- CONSTANTS ----------------------
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_REGEX = /^\d{4}[\s-]?\d{4}$/;

const COUNTRY_CODES = [
  { code: "+506", name: "Costa Rica" },
  { code: "+1", name: "EE. UU. / Canadá" },
  { code: "+52", name: "México" },
  { code: "+57", name: "Colombia" },
  { code: "+34", name: "España" },
];

// ---------------------- TIME SLOTS ----------------------
const TIME_SLOTS = [
  { id: "08:00" as const, label: "8:00 AM" },
  { id: "09:00" as const, label: "9:00 AM" },
  { id: "10:00" as const, label: "10:00 AM" },
];

export type TourTime = "08:00" | "09:00" | "10:00";

// ---------------------- PACKAGES ----------------------
export type TourPackage = "basic" | "full-day" | "private";

interface PackageOption {
  id: TourPackage;
  priceUSD: number;
  priceCRC: number | null;
  availableOn: "weekdays" | "weekends";
}

export type { TourSummary };

const PACKAGES: PackageOption[] = [
  {
    id: "basic",
    priceUSD: 30,
    priceCRC: 15000,
    availableOn: "weekends",
  },
  {
    id: "full-day",
    priceUSD: 40,
    priceCRC: 20000,
    availableOn: "weekends",
  },
  {
    id: "private",
    priceUSD: 60,
    priceCRC: null,
    availableOn: "weekdays",
  },
];

// Keep tour selection as a plain helper so production minification does not wrap
// dependent tour lookups in hook closures that can hit temporal dead zone errors.
const resolveSelectedTourSlug = (
  tours: TourSummary[],
  manualSelectedTourSlug: string | null,
  initialSelectedTourSlug?: string
): string => {
  if (manualSelectedTourSlug && tours.some((tour) => tour.slug === manualSelectedTourSlug)) {
    return manualSelectedTourSlug;
  }

  if (initialSelectedTourSlug && tours.some((tour) => tour.slug === initialSelectedTourSlug)) {
    return initialSelectedTourSlug;
  }

  return tours[0]?.slug ?? "tour-ciudad-esmeralda";
};

const PACKAGE_META = {
  basic: {
    icon: TreePalm,
    accent: "from-sky-500/20 to-emerald-500/10",
    highlightEs: ["Guía certificado local", "Ingreso a zonas naturales", "Briefing de seguridad"],
    highlightEn: ["Certified local guide", "Nature area access", "Safety briefing"],
  },
  "full-day": {
    icon: UtensilsCrossed,
    accent: "from-violet-500/20 to-indigo-500/10",
    highlightEs: ["Incluye almuerzo típico", "Paradas fotográficas", "Ruta extendida todo el día"],
    highlightEn: ["Traditional lunch included", "Photo stops", "Extended full-day route"],
  },
  private: {
    icon: Sparkles,
    accent: "from-amber-500/20 to-orange-500/10",
    highlightEs: ["Atención exclusiva", "Ritmo personalizado", "Ideal para parejas o grupos"],
    highlightEn: ["Exclusive attention", "Custom pace", "Great for couples or groups"],
  },
} satisfies Record<TourPackage, {
  icon: typeof TreePalm;
  accent: string;
  highlightEs: string[];
  highlightEn: string[];
}>;

// ---------------------- TYPES ----------------------
interface ReservationFormState {
  name: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  specialRequests: string;
  agreeTerms: boolean;
}

interface ReservationOrderPayload {
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total: number;
  date: string;
  dateIso: string;
  tourTime: TourTime;
  tourPackage: TourPackage;
  tourSlug: string;
  tourName: string;
  packagePrice: number;
  specialRequests: string;
}

// ---------------------- CUSTOM HOOK ----------------------
const useReservationForm = (initialState: ReservationFormState) => {
  const [formState, setFormState] = useState(initialState);

  const handleChange = useCallback(
    (key: keyof ReservationFormState, value: string | boolean) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const validation = useMemo(() => {
    const isNameValid = formState.name.trim() !== "";
    const isEmailValid =
      formState.email.trim() !== "" && EMAIL_REGEX.test(formState.email.trim());
    const isPhoneNumberValid =
      formState.phoneNumber.trim() !== "" &&
      PHONE_NUMBER_REGEX.test(formState.phoneNumber.trim());

    return {
      isNameValid,
      isEmailValid,
      isPhoneNumberValid,
      isAgreeTermsValid: formState.agreeTerms,
    };
  }, [formState]);

  return { formState, setFormState, handleChange, validation };
};

// ---------------------- CHILD COMPONENTS ----------------------

const FormError = ({ message }: { message: string }) => (
  <p className="text-red-500 text-sm mt-1">{message}</p>
);

const TravelerInputField = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  isValid,
  validationMessage,
  required = false,
  className = "",
}: {
  label: string;
  id: keyof ReservationFormState;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isValid: boolean;
  validationMessage: string;
  required?: boolean;
  className?: string;
}) => {
  const isTouched = value.trim() !== "";
  const showError = isTouched && !isValid;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-zinc-800 dark:text-zinc-100 sm:text-base">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-12 w-full rounded-xl border bg-white p-3 text-base focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 ${
          showError
            ? "border-red-500"
            : "border-zinc-300 dark:border-zinc-700"
        }`}
        placeholder={placeholder}
        required={required}
      />
      {showError && <FormError message={validationMessage} />}
    </div>
  );
};

const TravelerPhoneInput = ({
  phoneCode,
  phoneNumber,
  setPhoneCode,
  setPhoneNumber,
  isValid,
  label,
  placeholder,
  validationMessage,
}: {
  phoneCode: string;
  phoneNumber: string;
  setPhoneCode: (code: string) => void;
  setPhoneNumber: (number: string) => void;
  isValid: boolean;
  label: string;
  placeholder: string;
  validationMessage: string;
}) => {
  const isTouched = phoneNumber.trim() !== "";
  const showError = isTouched && !isValid;

  return (
    <div className="md:col-span-2">
      <label htmlFor="phoneNumber" className="mb-1 block text-sm font-bold text-zinc-800 dark:text-zinc-100 sm:text-base">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          id="phoneCode"
          value={phoneCode}
          onChange={(e) => setPhoneCode(e.target.value)}
          className="min-h-12 w-[40%] rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:border-teal-500 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800 sm:w-1/3 md:w-1/4"
        >
          {COUNTRY_CODES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.code} ({country.name})
            </option>
          ))}
        </select>
        <input
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className={`min-h-12 w-full rounded-xl border bg-white p-3 text-base focus:border-teal-500 focus:ring-teal-500 dark:bg-zinc-800 ${
            showError ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
          }`}
          placeholder={placeholder}
          required
        />
      </div>
      {showError && <FormError message={validationMessage} />}
    </div>
  );
};

// ---------------------- MAIN COMPONENT ----------------------

type Props = {
  selectedDate: number;
  currentMonth: number;
  monthName: string;
  tickets: number;
  setTickets: (n: number) => void;
  onReserve: (data: ReservationOrderPayload) => void;
  availability: AvailabilityMap;
  currentYear: number;
  tourInfo?: MainTourInfo | null;
  tours: TourSummary[];
  initialSelectedTourSlug?: string;
  hasPreselectedTour?: boolean;
  ivaRatePercent?: number;
};

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
}: Props) {
  const { lang } = useLanguage();
  const tr = translations[lang].reservation;
  const { data: session } = useSession();
  const hasPrefilledUserData = useRef(false);
  const dateLocale = lang === "es" ? es : enUS;
  const [selectedTourInfo, setSelectedTourInfo] = useState<MainTourInfo | null>(tourInfo ?? null);

  const resolvedTourInfo = selectedTourInfo ?? tourInfo ?? TOUR_INFO;
  const slots = availability[selectedDate] ?? 0;
  const isTicketsValid = tickets >= 1 && tickets <= slots;

  const reservationDate = new Date(currentYear, currentMonth, selectedDate);
  const formattedDate = format(
    reservationDate,
    lang === "es" ? "EEEE, dd 'de' MMMM 'de' yyyy" : "EEEE, MMMM dd, yyyy",
    { locale: dateLocale }
  );

  const isWeekend = reservationDate.getDay() === 0 || reservationDate.getDay() === 6;
  const [tourTime, setTourTime] = useState<TourTime | null>(null);
  const [tourPackage, setTourPackage] = useState<TourPackage | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [manualSelectedTourSlug, setManualSelectedTourSlug] = useState<string | null>(null);
  const [showTourModal, setShowTourModal] = useState(false);

  const selectedTourSlug = resolveSelectedTourSlug(tours, manualSelectedTourSlug, initialSelectedTourSlug);
  const selectedTour = tours.find((tour) => tour.slug === selectedTourSlug) ?? tours[0] ?? null;
  const selectedTourName = selectedTour ? (lang === "es" ? selectedTour.titleEs : selectedTour.titleEn) : (lang === "es" ? "Tour" : "Tour");

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/tours/main?slug=${encodeURIComponent(selectedTourSlug)}`)
      .then((response) => response.json())
      .then((data) => {
        if (isMounted && data?.tour) {
          setSelectedTourInfo(data.tour as MainTourInfo);
        }
      })
      .catch(() => {
        if (isMounted && tourInfo) {
          setSelectedTourInfo(tourInfo);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTourSlug, tourInfo]);

  const seemsSpanish = useCallback((value?: string) => {
    if (!value) return false;
    return /[áéíóúñ]|\b(entrada|guía|recorrido|cañón|horas|cancelación|solo|adultos|incluye)\b/i.test(value);
  }, []);

  const localizedDetails = useMemo(() => {
    if (lang === "es") {
      return resolvedTourInfo.details;
    }

    if (!seemsSpanish(resolvedTourInfo.details)) {
      return resolvedTourInfo.details;
    }

    return tr.tourInfoFallbackDetails;
  }, [lang, resolvedTourInfo.details, seemsSpanish, tr.tourInfoFallbackDetails]);

  const localizedDuration = useMemo(() => {
    if (lang === "es") {
      return resolvedTourInfo.duration || tr.defaultDuration;
    }

    if (!seemsSpanish(resolvedTourInfo.duration)) {
      return resolvedTourInfo.duration || tr.defaultDuration;
    }

    return tr.defaultDuration;
  }, [lang, resolvedTourInfo.duration, seemsSpanish, tr.defaultDuration]);

  const localizedCancellationPolicy = useMemo(() => {
    if (lang === "es") {
      return resolvedTourInfo.cancellationPolicy || tr.defaultCancellationPolicy;
    }

    if (!seemsSpanish(resolvedTourInfo.cancellationPolicy)) {
      return resolvedTourInfo.cancellationPolicy || tr.defaultCancellationPolicy;
    }

    return tr.defaultCancellationPolicy;
  }, [lang, resolvedTourInfo.cancellationPolicy, seemsSpanish, tr.defaultCancellationPolicy]);

  const selectedPackage = useMemo(
    () => PACKAGES.find((p) => p.id === tourPackage) ?? null,
    [tourPackage]
  );

  const selectedPackageUnavailable = selectedPackage
    ? selectedPackage.availableOn === "weekdays"
      ? isWeekend
      : !isWeekend
    : false;

  const effectiveTourPackage = selectedPackageUnavailable ? null : tourPackage;
  const effectiveSelectedPackage = selectedPackageUnavailable ? null : selectedPackage;

  const { subtotalRaw, taxesRaw, totalWithTaxesRaw } = useMemo(() => {
    const safeTickets = Number.isFinite(tickets) ? Math.max(0, tickets) : 0;
    const pricePerPerson = Number.isFinite(effectiveSelectedPackage?.priceUSD)
      ? Math.max(0, effectiveSelectedPackage?.priceUSD ?? 0)
      : 0;
    const sub = safeTickets * pricePerPerson;
    const normalizedTaxRate = Number.isFinite(ivaRatePercent)
      ? Math.max(0, ivaRatePercent) / 100
      : 0;
    const tax = sub * normalizedTaxRate;
    return { subtotalRaw: sub, taxesRaw: tax, totalWithTaxesRaw: sub + tax };
  }, [tickets, effectiveSelectedPackage, ivaRatePercent]);

  const subtotal = Number.isFinite(subtotalRaw) ? subtotalRaw : 0;
  const taxes = Number.isFinite(taxesRaw) ? taxesRaw : 0;
  const totalWithTaxes = Number.isFinite(totalWithTaxesRaw) ? totalWithTaxesRaw : 0;

  const { formState, setFormState, handleChange, validation } = useReservationForm({
    name: "",
    email: "",
    phoneCode: COUNTRY_CODES[0].code,
    phoneNumber: "",
    specialRequests: "",
    agreeTerms: false,
  });

  useEffect(() => {
    if (!session?.user || hasPrefilledUserData.current) return;

    hasPrefilledUserData.current = true;

    setFormState((prev) => ({
      ...prev,
      name: prev.name.trim() ? prev.name : (session.user?.name ?? ""),
      email: prev.email.trim() ? prev.email : (session.user?.email ?? ""),
    }));

    fetch("/api/user/profile")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const profile = data?.profile as { name?: string; email?: string; phone?: string } | undefined;
        if (!profile) return;

        setFormState((prev) => {
          const next = {
            ...prev,
            name: prev.name.trim() ? prev.name : (profile.name ?? prev.name),
            email: prev.email.trim() ? prev.email : (profile.email ?? prev.email),
          };

          if (!prev.phoneNumber.trim() && profile.phone?.trim()) {
            const normalizedPhone = profile.phone.trim();
            const matchedCode = COUNTRY_CODES.find((country) => normalizedPhone.startsWith(country.code));

            if (matchedCode) {
              return {
                ...next,
                phoneCode: matchedCode.code,
                phoneNumber: normalizedPhone.slice(matchedCode.code.length).trim(),
              };
            }

            return {
              ...next,
              phoneNumber: normalizedPhone,
            };
          }

          return next;
        });
      })
      .catch(() => {
        // ignore profile prefill errors
      });
  }, [session?.user, setFormState]);

  const isStep1Valid =
    isTicketsValid &&
    tourTime !== null &&
    effectiveTourPackage !== null &&
    Boolean(selectedTour);
  const isStep2Valid = validation.isNameValid && validation.isEmailValid && validation.isPhoneNumberValid;

  const missingStep1Items = useMemo(() => {
    const missing: string[] = [];

    if (!tourTime) missing.push(tr.missing.time);
    if (!effectiveTourPackage) missing.push(tr.missing.package);
    if (!selectedTour) missing.push(lang === "es" ? "Elegir un tour." : "Choose a tour.");
    if (!isTicketsValid) missing.push(tr.missing.tickets);

    return missing;
  }, [tourTime, effectiveTourPackage, isTicketsValid, selectedTour, tr.missing, lang]);

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

  useEffect(() => {
    const stepLabels: Record<1 | 2 | 3, string> = {
      1: "schedule",
      2: "traveler_details",
      3: "review",
    };

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
        },
        booking: {
          hasPreselectedTour,
          selectedTourSlug: selectedTour?.slug ?? null,
          selectedTourName,
          selectedDate,
          currentMonth,
          currentYear,
          tickets,
          hasSelectedTime: Boolean(tourTime),
          selectedTime: tourTime,
          hasSelectedPackage: Boolean(effectiveTourPackage),
          selectedPackage: effectiveTourPackage,
          subtotal: subtotalRaw,
          taxes: taxesRaw,
          totalWithTaxes,
        },
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
    hasPreselectedTour,
    selectedTourName,
    selectedDate,
    currentMonth,
    currentYear,
    tickets,
    tourTime,
    effectiveTourPackage,
    selectedTour?.slug,
    subtotalRaw,
    taxesRaw,
    totalWithTaxes,
  ]);

  useEffect(() => {
    if (!showTourModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowTourModal(false); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [showTourModal]);

  const handleReserve = useCallback(() => {
    if (!isFormValid || !effectiveSelectedPackage || !tourTime || !effectiveTourPackage || !selectedTour) return;

    trackAnalyticsEvent("booking_submitted", {
      metadata: {
        tickets,
        tourTime,
        tourPackage: effectiveTourPackage,
        tourSlug: selectedTour.slug,
        totalWithTaxes,
      },
    });

    onReserve({
      tickets,
      date: formattedDate,
      dateIso: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`,
      total: totalWithTaxes,
      name: formState.name,
      email: formState.email,
      phone: `${formState.phoneCode} ${formState.phoneNumber}`,
      specialRequests: formState.specialRequests,
      tourTime,
      tourPackage: effectiveTourPackage,
      tourSlug: selectedTour.slug,
      tourName: selectedTourName,
      packagePrice: effectiveSelectedPackage.priceUSD,
    });
  }, [
    isFormValid,
    effectiveSelectedPackage,
    tourTime,
    effectiveTourPackage,
    onReserve,
    tickets,
    formattedDate,
    currentYear,
    currentMonth,
    selectedDate,
    totalWithTaxes,
    formState,
    selectedTour,
    selectedTourName,
  ]);

  const goToNextStep = useCallback(() => {
    if (currentStep === 1 && !isStep1Valid) return;
    if (currentStep === 2 && !isStep2Valid) return;
    setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
  }, [currentStep, isStep1Valid, isStep2Valid]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
  }, []);

  return (
    <div className="border-t border-zinc-300 px-4 py-5 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100 sm:px-6 sm:py-6">
      <h2 className="mb-4 text-xl font-black leading-tight sm:text-2xl">
        {tr.titlePrefix} {formattedDate}
      </h2>

      <div className="sticky top-16 z-20 mb-6 rounded-2xl border border-zinc-200 bg-zinc-50/95 p-3 shadow-lg shadow-black/5 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95 sm:static sm:mb-8 sm:p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {tr.flowTitle}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {steps.map((step) => {
            const isCurrent = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id > currentStep) {
                    if (currentStep === 1 && !isStep1Valid) return;
                    if (currentStep === 2 && !isStep2Valid) return;
                  }
                  setCurrentStep(step.id);
                }}
                className={`rounded-xl border px-2 py-2 text-center text-[11px] font-bold transition-all sm:px-3 sm:text-left sm:text-sm ${
                  isCurrent
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                    : isDone
                    ? "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-900/20 dark:text-teal-300"
                    : "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                <span className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold sm:mx-0 sm:mb-0 sm:mr-2 sm:inline-flex">
                  {step.id}
                </span>
                {step.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-4 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:via-zinc-900 dark:to-teal-950/30 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="mb-1 text-lg font-bold text-teal-900 dark:text-teal-300 sm:text-xl">
              {tr.tourInfoTitle}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{tr.tourInfoSubtitle}</p>
          </div>
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-teal-300/60 bg-teal-100/70 text-teal-700 dark:border-teal-700/60 dark:bg-teal-900/30 dark:text-teal-300"
            title={tr.tooltips.tourInfoCard}
          >
            <Info className="h-4 w-4" aria-hidden />
          </span>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-400 sm:text-base">{localizedDetails}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200/70 bg-white/85 p-3 dark:border-zinc-700 dark:bg-zinc-900/70" title={tr.tooltips.durationCard}>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <Clock3 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden />
              {tr.duration}
            </p>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{localizedDuration}</p>
          </div>
          <div className="rounded-xl border border-zinc-200/70 bg-white/85 p-3 dark:border-zinc-700 dark:bg-zinc-900/70" title={tr.tooltips.routeCard}>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <Route className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden />
              {tr.routeLabel}
            </p>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{tr.routeValue}</p>
          </div>
          <div className="rounded-xl border border-zinc-200/70 bg-white/85 p-3 dark:border-zinc-700 dark:bg-zinc-900/70" title={tr.tooltips.locationCard}>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <MapPin className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden />
              {tr.locationLabel}
            </p>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{tr.locationValue}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-200/80 bg-white/80 p-4 dark:border-zinc-700 dark:bg-zinc-900/70">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{tr.bookingStrategyTitle}</p>
          <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            {tr.bookingStrategyItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {currentStep === 1 && (
        <>
          <div className={`mb-6 rounded-xl ${!selectedTour ? "ring-2 ring-amber-300/70 p-3" : ""}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">{tr.tourLabel}</h3>
              {hasPreselectedTour && (
                <Link
                  href="/tours"
                  className="inline-flex items-center rounded-full border border-teal-500/40 px-3 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-900/20"
                >
                  {tr.searchToursBtn}
                </Link>
              )}
            </div>

            {/* Compact selected-tour card — always visible */}
            <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 dark:bg-emerald-900/20">
              <div className="min-w-0">
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {tr.selectedTourLabel}
                </p>
                <p className="truncate font-bold text-base text-zinc-800 dark:text-zinc-100">
                  {selectedTourName}
                </p>
              </div>
              {tours.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowTourModal(true)}
                  className="shrink-0 inline-flex items-center gap-1 rounded-full border border-emerald-500/50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                >
                  {tr.changeBtn}
                  <ChevronRight size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Tour selection modal */}
          {showTourModal && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowTourModal(false)}
              />
              {/* Panel */}
              <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
                  <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                    {tr.chooseTourTitle}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowTourModal(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <X size={18} className="text-zinc-500" />
                  </button>
                </div>
                <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
                  {tours.map((tour) => {
                    const isSelected = selectedTourSlug === tour.slug;
                    const name = lang === "es" ? tour.titleEs : tour.titleEn;
                    return (
                      <button
                        key={tour.slug}
                        type="button"
                        onClick={() => {
                          setManualSelectedTourSlug(tour.slug);
                          setShowTourModal(false);
                        }}
                        className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                            : "border-zinc-200 hover:border-emerald-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">{name}</p>
                          {isSelected && (
                            <span className="shrink-0 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                              {tr.activeLabel}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>,
            document.body
          )}

          <div className={`mb-6 rounded-2xl ${!tourTime ? "ring-2 ring-amber-300/70 p-3" : ""}`}>
            <h3 className="mb-3 text-lg font-bold sm:text-xl">{tr.tourTimeTitle}</h3>
            {!tourTime && <p className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400"><AlertCircle className="h-4 w-4" aria-hidden /> {tr.indicators.chooseTourTime}</p>}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              {TIME_SLOTS.map((slot) => {
                const isSelected = tourTime === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setTourTime(slot.id)}
                    className={`min-h-12 rounded-xl border-2 px-2 py-3 text-sm font-bold transition-all sm:min-w-[90px] sm:flex-1 sm:px-4 sm:text-base ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                        : "border-zinc-300 dark:border-zinc-600 hover:border-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`mb-6 rounded-xl ${!effectiveTourPackage ? "ring-2 ring-amber-300/70 p-3" : ""}`}>
            <h3 className="mb-3 text-lg font-bold sm:text-xl">{tr.packageTitle}</h3>
            {!effectiveTourPackage && <p className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400"><AlertCircle className="h-4 w-4" aria-hidden /> {tr.indicators.choosePackage}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PACKAGES.map((pkg) => {
                const isSelected = effectiveTourPackage === pkg.id;
                const isDisabled =
                  pkg.availableOn === "weekdays" ? isWeekend : !isWeekend;
                const pkgTr = tr.packages[pkg.id];
                const pkgMeta = PACKAGE_META[pkg.id];
                const Icon = pkgMeta.icon;
                const packageHighlights = lang === "es" ? pkgMeta.highlightEs : pkgMeta.highlightEn;

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => !isDisabled && setTourPackage(pkg.id)}
                    disabled={isDisabled}
                    className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all sm:p-5 ${
                      isDisabled
                        ? "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50 opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10"
                        : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
                    }`}
                  >
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${pkgMeta.accent} opacity-70`} />
                    <div className="relative z-10">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-emerald-700 shadow-sm dark:bg-zinc-800/90 dark:text-emerald-300">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        {pkg.availableOn === "weekdays" && (
                          <span className="inline-block text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded px-2 py-0.5">
                            {tr.weekdaysOnly}
                          </span>
                        )}
                        {pkg.availableOn === "weekends" && (
                          <span className="inline-block text-xs font-semibold bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 rounded px-2 py-0.5">
                            {tr.weekendsOnly}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-base mb-1 text-zinc-800 dark:text-zinc-100">{pkgTr.name}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-snug">{pkgTr.description}</p>
                      <ul className="mb-4 space-y-1.5">
                        {packageHighlights.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-end justify-between gap-3 border-t border-zinc-200/70 pt-3 dark:border-zinc-700/80">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{tr.priceFrom}</p>
                          <p className="font-bold text-xl text-zinc-900 dark:text-zinc-100">${pkg.priceUSD}</p>
                        </div>
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">USD / {tr.perPerson}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40 sm:grid-cols-3">
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                <p className="text-xs text-zinc-600 dark:text-zinc-300">{tr.packageFootnotes.capacity}</p>
              </div>
              <div className="flex items-start gap-2">
                <Camera className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                <p className="text-xs text-zinc-600 dark:text-zinc-300">{tr.packageFootnotes.photo}</p>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                <p className="text-xs text-zinc-600 dark:text-zinc-300">{tr.packageFootnotes.support}</p>
              </div>
            </div>
            {selectedPackageUnavailable && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                <span className="text-red-500 mt-0.5">⚠</span>
                <p className="text-sm text-red-600 dark:text-red-400">{tr.packageAvailabilityWarning}</p>
              </div>
            )}
          </div>

          <div className={`mb-6 rounded-xl ${!isTicketsValid ? "ring-2 ring-amber-300/70 p-3" : ""}`}>
            <h3 className="text-xl font-semibold mb-4">{tr.ticketsTitle}</h3>
            {!isTicketsValid && <p className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400"><AlertCircle className="h-4 w-4" aria-hidden /> {tr.indicators.chooseTickets}</p>}
            <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <label htmlFor="tickets" className="text-base font-bold sm:text-lg">{tr.numPeople}</label>
              <input
                id="tickets"
                type="number"
                min={1}
                max={Math.max(1, slots)}
                value={tickets}
                onChange={(e) => {
                  const val = +e.target.value;
                  if (val >= 1 && val <= slots) setTickets(val);
                  else if (val < 1) setTickets(1);
                  else if (val > slots) setTickets(slots);
                }}
                className="min-h-12 w-24 rounded-xl border bg-white p-3 text-base font-bold dark:bg-zinc-800"
                disabled={slots === 0}
              />
              <span className="text-sm text-zinc-500">({tr.availablePrefix} {slots})</span>
            </div>
          </div>
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
        <>
          <div className={`mb-6 rounded-xl ${!isStep2Valid ? "ring-2 ring-amber-300/70 p-3" : ""}`}>
            <h3 className="text-xl font-semibold mb-4">{tr.travelerTitle}</h3>
            {!isStep2Valid && <p className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400"><AlertCircle className="h-4 w-4" aria-hidden /> {tr.indicators.completeTravelerData}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TravelerInputField id="name" label={tr.fullName} value={formState.name} onChange={(v) => handleChange("name", v)} placeholder={tr.namePlaceholder} isValid={validation.isNameValid} validationMessage={tr.nameRequired} required />
              <TravelerInputField id="email" label={tr.emailLabel} type="email" value={formState.email} onChange={(v) => handleChange("email", v)} placeholder={tr.emailPlaceholder} isValid={validation.isEmailValid} validationMessage={tr.emailInvalid} required />
              <TravelerPhoneInput phoneCode={formState.phoneCode} phoneNumber={formState.phoneNumber} setPhoneCode={(v) => handleChange("phoneCode", v)} setPhoneNumber={(v) => handleChange("phoneNumber", v)} isValid={validation.isPhoneNumberValid} label={tr.phoneLabel} placeholder={tr.phonePlaceholder} validationMessage={tr.phoneInvalid} />
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">{tr.specialTitle}</h3>
            <textarea id="specialRequests" value={formState.specialRequests} onChange={(e) => handleChange("specialRequests", e.target.value)} className="h-28 w-full rounded-xl border border-zinc-300 bg-white p-3 text-base focus:border-teal-500 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-800" placeholder={tr.specialPlaceholder} />
          </div>
          {!isStep2Valid && (
            <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{tr.completeStepTwoHint}</p>
              <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                {missingStep2Items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {currentStep === 3 && (
        <>
          <div className="mb-6 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl">
            <div className="flex justify-between mb-2"><span>{tr.tourLabel}</span><span className="font-medium">{selectedTourName}</span></div>
            <div className="flex justify-between mb-2"><span>{tr.packageLabel}</span><span className="font-medium">{effectiveSelectedPackage ? tr.packages[effectiveSelectedPackage.id].name : "—"}</span></div>
            <div className="flex justify-between mb-2"><span>{tr.tourTimeTitle}</span><span>{tourTime ?? "—"}</span></div>
            <div className="flex justify-between mb-2"><span>{tr.subtotalLabel}</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between mb-2"><span>{tr.taxes} ({ivaRatePercent}%)</span><span>${taxes.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 border-zinc-300 dark:border-zinc-700"><span>{tr.total}</span><span>${totalWithTaxes.toFixed(2)}</span></div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">{tr.policiesTitle}</h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-4 text-zinc-800 dark:text-zinc-300">
              <strong className="block mb-1 text-yellow-900 dark:text-yellow-300">{tr.cancellationLabel}</strong>
              <p className="text-sm">{localizedCancellationPolicy}</p>
            </div>
            <label htmlFor="agreeTerms" className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${formState.agreeTerms ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20" : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}>
              <input id="agreeTerms" type="checkbox" checked={formState.agreeTerms} onChange={(e) => handleChange("agreeTerms", e.target.checked)} className="h-5 w-5 text-teal-600 rounded border-zinc-400 focus:ring-teal-500 dark:bg-zinc-700 dark:border-zinc-600 mt-0.5" />
              <span className="text-zinc-700 dark:text-zinc-400 text-base">
                {tr.agreeText}
                <Link href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-teal-600 underline ml-1">{tr.termsLink}</Link>{" "}{tr.andThe}{" "}
                <Link href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-teal-600 underline ml-1">{tr.privacyLink}</Link>.
              </span>
            </label>
          </div>
        </>
      )}

      <div className="sticky bottom-0 z-30 -mx-4 -mb-5 flex flex-col-reverse gap-3 border-t border-zinc-200 bg-white/95 p-4 shadow-[0_-16px_35px_rgba(0,0,0,0.12)] backdrop-blur dark:border-zinc-700 dark:bg-zinc-950/95 sm:static sm:m-0 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        {currentStep > 1 && (
          <button type="button" onClick={goToPrevStep} className="min-h-12 rounded-full border border-zinc-300 px-6 py-3 font-semibold dark:border-zinc-600">
            {tr.backBtn}
          </button>
        )}
        {currentStep < 3 && (
          <button
            type="button"
            onClick={goToNextStep}
            disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)}
            className="min-h-12 rounded-full bg-teal-500 px-8 py-3 font-black text-zinc-950 shadow-lg transition-all hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50 sm:text-white"
          >
            {tr.nextBtn}
          </button>
        )}
        {currentStep === 3 && (
          <button
            type="button"
            onClick={handleReserve}
            disabled={!isFormValid}
            className="min-h-12 rounded-full bg-teal-500 px-8 py-3 font-black text-zinc-950 shadow-lg transition-all hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50 sm:text-white"
          >
            {tr.proceedBtn}
          </button>
        )}
      </div>
    </div>
  );
}

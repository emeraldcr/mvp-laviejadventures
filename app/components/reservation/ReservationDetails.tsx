// components/ReservationDetails.tsx
import Link from "next/link";
import { TOUR_INFO } from "@/lib/tour-info";
import { AvailabilityMap, MainTourInfo, TourPackageOption, TourSummary } from "@/lib/types/index";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { AlertCircle, Camera, Clock3, Info, MapPin, Route, ShieldCheck, Sparkles, TreePalm, Users, UtensilsCrossed } from "lucide-react";
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

const DEFAULT_DEPARTURE_TIMES = ["08:00", "09:00", "10:00"];

export type TourTime = string;
type BookingStepId = 1 | 2 | 3;

// ---------------------- PACKAGES ----------------------
export type TourPackage = string;

interface PackageOption extends TourPackageOption {
  id: TourPackage;
  name: string;
  price: number;
  priceCRC: number | null;
  departureTimes: string[];
}

export type { TourSummary };

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

const PACKAGE_META = [
  {
    icon: TreePalm,
    accent: "from-sky-500/20 to-emerald-500/10",
    highlightEs: ["Guía certificado local", "Ingreso a zonas naturales", "Briefing de seguridad"],
    highlightEn: ["Certified local guide", "Nature area access", "Safety briefing"],
  },
  {
    icon: UtensilsCrossed,
    accent: "from-violet-500/20 to-indigo-500/10",
    highlightEs: ["Incluye almuerzo típico", "Paradas fotográficas", "Ruta extendida todo el día"],
    highlightEn: ["Traditional lunch included", "Photo stops", "Extended full-day route"],
  },
  {
    icon: Sparkles,
    accent: "from-amber-500/20 to-orange-500/10",
    highlightEs: ["Atención exclusiva", "Ritmo personalizado", "Ideal para parejas o grupos"],
    highlightEn: ["Exclusive attention", "Custom pace", "Great for couples or groups"],
  },
];

const slugifyPackageId = (value: string, index: number) => {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `package-${index + 1}`;
};

const formatDepartureLabel = (value: string) => {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return normalized;

  const hour24 = Number(match[1]);
  const minute = match[2];
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${period}`;
};

type PackageMeta = {
  icon: typeof TreePalm;
  accent: string;
  highlightEs: string[];
  highlightEn: string[];
};

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
  packageId: string;
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
  onBlur,
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
  onBlur?: () => void;
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
      <label htmlFor={id} className="block font-semibold text-lg mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full p-3 rounded-lg border focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-zinc-800 ${
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
  onBlur,
  isValid,
  label,
  placeholder,
  validationMessage,
}: {
  phoneCode: string;
  phoneNumber: string;
  setPhoneCode: (code: string) => void;
  setPhoneNumber: (number: string) => void;
  onBlur?: () => void;
  isValid: boolean;
  label: string;
  placeholder: string;
  validationMessage: string;
}) => {
  const isTouched = phoneNumber.trim() !== "";
  const showError = isTouched && !isValid;

  return (
    <div className="md:col-span-2">
      <label htmlFor="phoneNumber" className="block font-semibold text-lg mb-1">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          id="phoneCode"
          value={phoneCode}
          onChange={(e) => setPhoneCode(e.target.value)}
          className="p-3 rounded-lg border bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 focus:ring-teal-500 focus:border-teal-500 w-1/3 md:w-1/4"
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
          onBlur={onBlur}
          className={`w-full p-3 rounded-lg border focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-zinc-800 ${
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
  initialSelectedPackageId?: string;
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
  initialSelectedPackageId,
  hasPreselectedTour = false,
  ivaRatePercent = 13,
}: Props) {
  const { lang } = useLanguage();
  const tr = translations[lang].reservation;
  const dateLocale = lang === "es" ? es : enUS;
  const [selectedTourInfo, setSelectedTourInfo] = useState<{ slug: string; tour: MainTourInfo } | null>(null);
  const slots = availability[selectedDate] ?? 0;
  const isTicketsValid = tickets >= 1 && tickets <= slots;

  const reservationDate = new Date(currentYear, currentMonth, selectedDate);
  const formattedDate = format(
    reservationDate,
    lang === "es" ? "EEEE, dd 'de' MMMM 'de' yyyy" : "EEEE, MMMM dd, yyyy",
    { locale: dateLocale }
  );

  const [tourTime, setTourTime] = useState<TourTime | null>(null);
  const [tourPackage, setTourPackage] = useState<TourPackage | null>(null);
  const [currentStep, setCurrentStep] = useState<BookingStepId>(1);
  const currentStepRef = useRef<BookingStepId>(1);
  const stepEnteredAtRef = useRef(0);
  const completedStepsRef = useRef<Set<BookingStepId>>(new Set());

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
  const defaultMainTourInfo: MainTourInfo = {
    ...TOUR_INFO,
    cancellationPolicy: TOUR_INFO.cancellationPolicy ?? "",
  };
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

  const PACKAGES = useMemo<PackageOption[]>(() => {
    if (!selectedTour) return [];

    const dbPackages = Array.isArray(selectedTour.packages) ? selectedTour.packages : [];
    if (dbPackages.length > 0) {
      return dbPackages
        .filter((pkg) => typeof pkg.name === "string" && pkg.name.trim() && Number.isFinite(Number(pkg.price)))
        .map((pkg, index) => ({
          ...pkg,
          id: pkg.id?.trim() || slugifyPackageId(pkg.nameEs || pkg.name, index),
          name: pkg.name,
          price: Number(pkg.price),
          priceCRC: typeof pkg.priceCRC === "number" ? pkg.priceCRC : null,
          includes: Array.isArray(pkg.includes) ? pkg.includes : [],
          departureTimes: Array.isArray(pkg.departureTimes) && pkg.departureTimes.length > 0
            ? pkg.departureTimes
            : DEFAULT_DEPARTURE_TIMES,
        }));
    }

    const exchangeRate = 525;
    const fallbackPriceUSD = selectedTour.priceCRC ? Math.round(selectedTour.priceCRC / exchangeRate) : 40;

    return [{
      id: "standard-package",
      name: lang === "es" ? "Paquete Estandar" : "Standard Package",
      nameEs: "Paquete Estandar",
      price: fallbackPriceUSD,
      priceCRC: selectedTour.priceCRC ?? null,
      descriptionEs: selectedTour.descriptionEs,
      descriptionEn: selectedTour.descriptionEn,
      includes: selectedTour.inclusions ?? [],
      groupTour: true,
      departureTimes: DEFAULT_DEPARTURE_TIMES,
    }];
  }, [lang, selectedTour]);

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

  const localizedDetails = useMemo(() => {
    if (lang === "es") {
      return resolvedTourInfo.details || selectedTourDescription || tr.tourInfoFallbackDetails;
    }

    if (!seemsSpanish(resolvedTourInfo.details)) {
      return resolvedTourInfo.details || selectedTourDescription || tr.tourInfoFallbackDetails;
    }

    return selectedTour?.descriptionEn || tr.tourInfoFallbackDetails;
  }, [lang, resolvedTourInfo.details, selectedTour?.descriptionEn, selectedTourDescription, seemsSpanish, tr.tourInfoFallbackDetails]);

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

  const localizedLocation = resolvedTourInfo.location || tr.locationValue;
  const localizedRoute = selectedTour?.difficulty || resolvedTourInfo.restrictions || tr.routeValue;
  const localizedPrice = resolvedTourInfo.price || (
    typeof selectedTour?.priceCRC === "number"
      ? new Intl.NumberFormat("es-CR", {
          style: "currency",
          currency: "CRC",
          maximumFractionDigits: 0,
        }).format(selectedTour.priceCRC)
      : ""
  );

  const selectedPackage = useMemo(
    () => PACKAGES.find((p) => p.id === tourPackage) ?? null,
    [tourPackage, PACKAGES]
  );

  useEffect(() => {
    if (!initialSelectedPackageId) return;

    const matchingPackage = PACKAGES.find((pkg) => pkg.id === initialSelectedPackageId);
    if (!matchingPackage) return;

    setTourPackage(matchingPackage.id);
  }, [PACKAGES, initialSelectedPackageId]);

  const availableTimeSlots = useMemo(() => {
    const sourceTimes = selectedPackage
      ? selectedPackage.departureTimes
      : PACKAGES.flatMap((pkg) => pkg.departureTimes);
    const uniqueTimes = Array.from(new Set(sourceTimes.map((time) => time.trim()).filter(Boolean)));
    return uniqueTimes.length > 0 ? uniqueTimes : DEFAULT_DEPARTURE_TIMES;
  }, [PACKAGES, selectedPackage]);

  const effectiveTourPackage = tourPackage;
  const effectiveSelectedPackage = selectedPackage;
  const selectedPackageUnavailable = false;

  useEffect(() => {
    if (tourPackage && !PACKAGES.some((pkg) => pkg.id === tourPackage)) {
      setTourPackage(null);
    }
  }, [PACKAGES, tourPackage]);

  useEffect(() => {
    if (tourTime && !availableTimeSlots.includes(tourTime)) {
      setTourTime(null);
    }
  }, [availableTimeSlots, tourTime]);

  const { subtotalRaw, taxesRaw, totalWithTaxesRaw } = useMemo(() => {
    const safeTickets = Number.isFinite(tickets) ? Math.max(0, tickets) : 0;
    const pricePerPerson = Number.isFinite(effectiveSelectedPackage?.price)
      ? Math.max(0, effectiveSelectedPackage?.price ?? 0)
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

  const isStep1Valid =
    isTicketsValid &&
    tourTime !== null &&
    effectiveTourPackage !== null &&
    Boolean(selectedTour);
  const isStep2Valid = validation.isNameValid && validation.isEmailValid && validation.isPhoneNumberValid;

  const missingStep1Items = useMemo(() => {
    const missing: string[] = [];

    if (!effectiveTourPackage) missing.push(tr.missing.package);
    if (effectiveTourPackage && !tourTime) missing.push(tr.missing.time);
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

    if (!effectiveTourPackage) missing.push("tour_package");
    if (effectiveTourPackage && !tourTime) missing.push("tour_time");
    if (!selectedTour) missing.push("tour");
    if (!isTicketsValid) missing.push("tickets");

    return missing;
  }, [tourTime, effectiveTourPackage, isTicketsValid, selectedTour]);

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
    hasSelectedPackage: Boolean(effectiveTourPackage),
    selectedPackage: effectiveTourPackage,
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
    effectiveTourPackage,
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

  const goToStep = useCallback((targetStep: BookingStepId, source: string) => {
    if (targetStep > currentStep) {
      if (currentStep === 1 && !isStep1Valid) {
        trackBlockedStep(targetStep, source);
        return;
      }

      if (currentStep === 2 && !isStep2Valid) {
        trackBlockedStep(targetStep, source);
        return;
      }

      trackStepCompleted(currentStep, targetStep, source);
    }

    setCurrentStep(targetStep);
  }, [currentStep, isStep1Valid, isStep2Valid, trackBlockedStep, trackStepCompleted]);

  const handleReserve = useCallback(() => {
    if (!isFormValid || !effectiveSelectedPackage || !tourTime || !effectiveTourPackage || !selectedTour) {
      trackBlockedStep("checkout", "checkout_button");
      return;
    }

    trackStepCompleted(3, "checkout", "checkout_button");

    trackAnalyticsEvent("booking_submitted", {
      metadata: {
        step: 3,
        stepLabel: "review",
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
      packageId: effectiveSelectedPackage.id,
      tourPackage: lang === "es" ? (effectiveSelectedPackage.nameEs || effectiveSelectedPackage.name) : effectiveSelectedPackage.name,
      tourSlug: selectedTour.slug,
      tourName: selectedTourName,
      packagePrice: effectiveSelectedPackage.price,
    });
  }, [
    isFormValid,
    effectiveSelectedPackage,
    tourTime,
    effectiveTourPackage,
    onReserve,
    tickets,
    formattedDate,
    currentMonth,
    currentYear,
    selectedDate,
    totalWithTaxes,
    formState,
    selectedTour,
    selectedTourName,
    lang,
    trackBlockedStep,
    trackStepCompleted,
  ]);

  const goToNextStep = useCallback(() => {
    const targetStep = currentStep < 3 ? ((currentStep + 1) as BookingStepId) : currentStep;
    goToStep(targetStep, "next_button");
  }, [currentStep, goToStep]);

  const goToPrevStep = useCallback(() => {
    const targetStep = currentStep > 1 ? ((currentStep - 1) as BookingStepId) : currentStep;
    setCurrentStep(targetStep);
  }, [currentStep]);

  const handleTourTimeSelect = useCallback((slot: TourTime) => {
    setTourTime(slot);
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

  const handlePackageSelect = useCallback((pkg: PackageOption) => {
    setTourPackage(pkg.id);
    setTourTime(null);

    trackAnalyticsEvent("booking_selection_changed", {
      metadata: {
        step: 1,
        stepLabel: stepLabels[1],
        field: "tour_package",
        value: pkg.id,
        priceUSD: pkg.price,
        departureTimes: pkg.departureTimes,
        booking: {
          ...getAnalyticsBookingSnapshot(),
          selectedPackage: pkg.id,
          hasSelectedPackage: true,
          selectedTime: null,
          hasSelectedTime: false,
        },
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

      <div className="mb-8 border-y border-zinc-200 py-3 dark:border-zinc-800" aria-label={tr.flowTitle}>
        <div className="flex items-center gap-2">
          {steps.map((step) => {
            const isCurrent = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <div
                key={step.id}
                className="flex flex-1 items-center gap-2"
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                    isCurrent
                      ? "border-emerald-400 bg-emerald-500 text-zinc-950"
                      : isDone
                      ? "border-teal-400 bg-teal-400/20 text-teal-300"
                      : "border-zinc-700 bg-zinc-900 text-zinc-500"
                  }`}
                >
                  {step.id}
                </span>
                <span className={`hidden min-w-0 truncate text-xs font-semibold sm:inline ${isCurrent ? "text-emerald-300" : isDone ? "text-teal-300" : "text-zinc-500"}`}>
                  {step.label}
                </span>
                {step.id < steps.length && (
                  <span className={`h-px flex-1 ${isDone ? "bg-teal-500/60" : "bg-zinc-800"}`} aria-hidden />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`mb-6 text-center ${!selectedTour ? "rounded-xl ring-2 ring-amber-300/70 p-3" : ""}`}>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-400">
          {tr.selectedTourLabel}
        </p>
        <h3 className="mx-auto max-w-xl text-2xl font-black leading-tight text-zinc-900 dark:text-zinc-50">
          {selectedTourName}
        </h3>
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-5 shadow-sm dark:border-zinc-700 dark:from-zinc-900 dark:via-zinc-900 dark:to-teal-950/30">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-teal-300/60 bg-teal-100/70 text-teal-700 dark:border-teal-700/60 dark:bg-teal-900/30 dark:text-teal-300" title={tr.tooltips.tourInfoCard}>
            <Info className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <h3 className="mb-1 text-xl font-black text-teal-900 dark:text-teal-300">
              {tr.tourInfoTitle}
            </h3>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{selectedTourName}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{tr.tourInfoSubtitle}</p>
          </div>
        </div>

        <p className="mx-auto mb-4 max-w-2xl text-center text-zinc-700 dark:text-zinc-400">{localizedDetails}</p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{localizedRoute}</p>
          </div>
          <div className="rounded-xl border border-zinc-200/70 bg-white/85 p-3 dark:border-zinc-700 dark:bg-zinc-900/70" title={tr.tooltips.locationCard}>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <MapPin className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden />
              {tr.locationLabel}
            </p>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{localizedLocation}</p>
          </div>
          {localizedPrice && (
            <div className="rounded-xl border border-zinc-200/70 bg-white/85 p-3 dark:border-zinc-700 dark:bg-zinc-900/70">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden />
                {tr.priceFrom}
              </p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{localizedPrice}</p>
            </div>
          )}
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
          <div className={`mb-6 rounded-xl ${!effectiveTourPackage ? "ring-2 ring-amber-300/70 p-3" : ""}`}>
            <h3 className="text-xl font-semibold mb-3">{tr.packageTitle}</h3>
            {!effectiveTourPackage && <p className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400"><AlertCircle className="h-4 w-4" aria-hidden /> {tr.indicators.choosePackage}</p>}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {PACKAGES.map((pkg, index) => {
                const isSelected = effectiveTourPackage === pkg.id;
                const pkgName = lang === "es" ? (pkg.nameEs || pkg.name) : pkg.name;
                const pkgDescription = lang === "es"
                  ? (pkg.descriptionEs || pkg.descriptionEn || "")
                  : (pkg.descriptionEn || pkg.descriptionEs || "");
                const pkgMeta: PackageMeta = PACKAGE_META[index % PACKAGE_META.length];
                const Icon = pkgMeta.icon;
                const packageHighlights = pkg.includes && pkg.includes.length > 0
                  ? pkg.includes
                  : lang === "es" ? pkgMeta.highlightEs : pkgMeta.highlightEn;

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handlePackageSelect(pkg)}
                    className={`group relative flex h-full min-h-[430px] overflow-hidden text-left p-5 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10"
                        : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
                    }`}
                  >
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${pkgMeta.accent} opacity-70`} />
                    <div className="relative z-10 flex h-full w-full flex-col">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/90 text-emerald-700 shadow-sm dark:bg-zinc-800/90 dark:text-emerald-300">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        {pkg.groupTour === false && (
                          <span className="inline-flex shrink-0 items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold leading-none text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                            {lang === "es" ? "Privado" : "Private"}
                          </span>
                        )}
                        {pkg.groupTour !== false && (
                          <span className="inline-flex shrink-0 items-center rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold leading-none text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                            {lang === "es" ? "Grupal" : "Group"}
                          </span>
                        )}
                      </div>
                      <div className="mb-4 min-h-[126px]">
                        <p className="mb-2 text-lg font-bold leading-tight text-zinc-800 dark:text-zinc-100">{pkgName}</p>
                        <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{pkgDescription}</p>
                      </div>
                      <ul className="mb-5 space-y-2">
                        {packageHighlights.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs leading-snug text-zinc-700 dark:text-zinc-300">
                            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                            <span className="min-w-0">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto flex items-end justify-between gap-3 border-t border-zinc-200/70 pt-4 dark:border-zinc-700/80">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{tr.priceFrom}</p>
                          <p className="font-bold text-xl text-zinc-900 dark:text-zinc-100">${pkg.price}</p>
                        </div>
                        <p className="max-w-[7rem] text-right text-xs font-semibold leading-tight text-zinc-500 dark:text-zinc-400">USD / {tr.perPerson}</p>
                      </div>
                      {pkg.scheduleNote && (
                        <p className="mt-3 text-xs leading-snug text-zinc-500 dark:text-zinc-400">{pkg.scheduleNote}</p>
                      )}
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

          {effectiveSelectedPackage && (
            <div className={`mb-6 rounded-xl ${!tourTime ? "ring-2 ring-amber-300/70 p-3" : ""}`}>
              <h3 className="text-xl font-semibold mb-3">{tr.tourTimeTitle}</h3>
              {!tourTime && <p className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400"><AlertCircle className="h-4 w-4" aria-hidden /> {tr.indicators.chooseTourTime}</p>}
              <div className="flex gap-3 flex-wrap">
                {availableTimeSlots.map((slot) => {
                  const isSelected = tourTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleTourTimeSelect(slot)}
                      className={`flex-1 min-w-[90px] py-3 px-4 rounded-xl border-2 font-semibold text-base transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                          : "border-zinc-300 dark:border-zinc-600 hover:border-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {formatDepartureLabel(slot)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className={`mb-6 rounded-xl ${!isTicketsValid ? "ring-2 ring-amber-300/70 p-3" : ""}`}>
            <h3 className="text-xl font-semibold mb-4">{tr.ticketsTitle}</h3>
            {!isTicketsValid && <p className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400"><AlertCircle className="h-4 w-4" aria-hidden /> {tr.indicators.chooseTickets}</p>}
            <div className="flex items-center gap-4 mb-4">
              <label htmlFor="tickets" className="font-semibold text-lg">{tr.numPeople}</label>
              <input
                id="tickets"
                type="number"
                min={1}
                max={Math.max(1, slots)}
                value={tickets}
                onChange={(e) => {
                  handleTicketsChange(e.target.value);
                }}
                className="w-20 p-2 rounded-lg border bg-white dark:bg-zinc-800"
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
              <TravelerInputField id="name" label={tr.fullName} value={formState.name} onChange={(v) => handleChange("name", v)} onBlur={() => trackFieldBlur("name")} placeholder={tr.namePlaceholder} isValid={validation.isNameValid} validationMessage={tr.nameRequired} required />
              <TravelerInputField id="email" label={tr.emailLabel} type="email" value={formState.email} onChange={(v) => handleChange("email", v)} onBlur={() => trackFieldBlur("email")} placeholder={tr.emailPlaceholder} isValid={validation.isEmailValid} validationMessage={tr.emailInvalid} required />
              <TravelerPhoneInput phoneCode={formState.phoneCode} phoneNumber={formState.phoneNumber} setPhoneCode={(v) => handleChange("phoneCode", v)} setPhoneNumber={(v) => handleChange("phoneNumber", v)} onBlur={() => trackFieldBlur("phone")} isValid={validation.isPhoneNumberValid} label={tr.phoneLabel} placeholder={tr.phonePlaceholder} validationMessage={tr.phoneInvalid} />
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">{tr.specialTitle}</h3>
            <textarea id="specialRequests" value={formState.specialRequests} onChange={(e) => handleChange("specialRequests", e.target.value)} onBlur={() => trackFieldBlur("specialRequests")} className="w-full p-3 rounded-lg border bg-white dark:bg-zinc-800 h-24 border-zinc-300 dark:border-zinc-700 focus:ring-teal-500 focus:border-teal-500" placeholder={tr.specialPlaceholder} />
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
            <div className="flex justify-between mb-2"><span>{tr.packageLabel}</span><span className="font-medium">{effectiveSelectedPackage ? (lang === "es" ? effectiveSelectedPackage.nameEs || effectiveSelectedPackage.name : effectiveSelectedPackage.name) : "—"}</span></div>
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
              <input
                id="agreeTerms"
                type="checkbox"
                checked={formState.agreeTerms}
                onChange={(e) => {
                  const accepted = e.target.checked;
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
                className="h-5 w-5 text-teal-600 rounded border-zinc-400 focus:ring-teal-500 dark:bg-zinc-700 dark:border-zinc-600 mt-0.5"
              />
              <span className="text-zinc-700 dark:text-zinc-400 text-base">
                {tr.agreeText}
                <Link href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-teal-600 underline ml-1">{tr.termsLink}</Link>{" "}{tr.andThe}{" "}
                <Link href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-teal-600 underline ml-1">{tr.privacyLink}</Link>.
              </span>
            </label>
          </div>
        </>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {currentStep > 1 && (
          <button type="button" onClick={goToPrevStep} className="px-6 py-3 rounded-full border border-zinc-300 dark:border-zinc-600 font-semibold">
            {tr.backBtn}
          </button>
        )}
        {currentStep < 3 && (
          <button
            type="button"
            onClick={goToNextStep}
            aria-disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)}
            className={`px-8 py-3 bg-teal-600 text-white rounded-full font-bold shadow-lg transition-all ${
              (currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-teal-700"
            }`}
          >
            {tr.nextBtn}
          </button>
        )}
        {currentStep === 3 && (
          <button
            type="button"
            onClick={handleReserve}
            aria-disabled={!isFormValid}
            className={`px-8 py-3 bg-teal-600 text-white rounded-full font-bold shadow-lg transition-all ${
              !isFormValid ? "cursor-not-allowed opacity-50" : "hover:bg-teal-700"
            }`}
          >
            {tr.proceedBtn}
          </button>
        )}
      </div>
    </div>
  );
}

// components/ReservationDetails.tsx
import Link from "next/link";
import { TOUR_INFO } from "@/lib/tour-info";
import { AvailabilityMap, MainTourInfo, TourPackageOption, TourSummary } from "@/lib/types/index";
import { useState, useMemo, useCallback, useEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLanguage } from "@/lib/LanguageContext";
import { translations } from "@/lib/translations";
import { AlertCircle, Check, ChevronDown, Clock3, MapPin, Minus, Plus, Route, Search, ShieldCheck, Sparkles, TreePalm, Users, UtensilsCrossed } from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { PHONE_COUNTRIES as ALL_PHONE_COUNTRIES } from "@/app/components/reservation/phoneCountries";

// ---------------------- CONSTANTS ----------------------
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_REGEX = /^[\d\s().-]{6,20}$/;

const DEFAULT_DEPARTURE_TIMES = ["08:00", "09:00", "10:00"];

export type TourTime = string;
type BookingStepId = 1 | 2 | 3;

// ---------------------- ADD-ONS ----------------------
interface AddOnOption {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  price: number;
  icon: typeof TreePalm;
}

const ADDON_OPTIONS: AddOnOption[] = [
  {
    id: "almuerzo",
    nameEs: "Almuerzo Típico",
    nameEn: "Traditional Lunch",
    descriptionEs: "Casado costarricense (pollo, res o vegetariano) con bebida natural y postre.",
    descriptionEn: "Costa Rican casado (chicken, beef or vegetarian) with natural drink and dessert.",
    price: 15,
    icon: UtensilsCrossed,
  },
  {
    id: "guia-privado",
    nameEs: "Guía Privado",
    nameEn: "Private Guide",
    descriptionEs: "Guía exclusivo para tu grupo con atención personalizada y ritmo flexible.",
    descriptionEn: "Exclusive guide for your group with personalized attention and flexible pace.",
    price: 25,
    icon: Users,
  },
  {
    id: "alojamiento",
    nameEs: "Alojamiento",
    nameEn: "Lodging",
    descriptionEs: "Noche de hospedaje en alojamiento local cerca de la experiencia.",
    descriptionEn: "One night stay at local lodging near the experience.",
    price: 40,
    icon: TreePalm,
  },
  {
    id: "transporte",
    nameEs: "Transporte",
    nameEn: "Transport",
    descriptionEs: "Traslado de ida y vuelta desde puntos de encuentro designados.",
    descriptionEn: "Round-trip transfer from designated meeting points.",
    price: 15,
    icon: Route,
  },
];

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

// ---------------------- TYPES ----------------------
export type TourPackage = string;
export type { TourSummary };

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
  addons: string[];
  addonsPrice: number;
}

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
      PHONE_NUMBER_REGEX.test(formState.phoneNumber.trim()) &&
      formState.phoneNumber.replace(/\D/g, "").length >= 6;

    return {
      isNameValid,
      isEmailValid,
      isPhoneNumberValid,
      isAgreeTermsValid: formState.agreeTerms,
    };
  }, [formState]);

  return { formState, handleChange, validation };
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
  onKeyDown,
  inputRef,
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
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
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
        onKeyDown={onKeyDown}
        ref={inputRef}
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
  onKeyDown,
  inputRef,
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
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  isValid: boolean;
  label: string;
  placeholder: string;
  validationMessage: string;
}) => {
  const isTouched = phoneNumber.trim() !== "";
  const showError = isTouched && !isValid;
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryPickerRef = useRef<HTMLDivElement | null>(null);
  const selectedCountry = ALL_PHONE_COUNTRIES.find((country) => country.code === phoneCode) ?? ALL_PHONE_COUNTRIES[0];
  const normalizedCountrySearch = countrySearch.trim().toLowerCase();
  const filteredCountries = ALL_PHONE_COUNTRIES.filter((country) => {
    if (!normalizedCountrySearch) return true;

    return [country.name, country.code, country.flag]
      .some((value) => value.toLowerCase().includes(normalizedCountrySearch));
  });

  useEffect(() => {
    if (!isCountryOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!countryPickerRef.current?.contains(event.target as Node)) {
        setIsCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isCountryOpen]);

  const handleCountrySelect = (countryCode: string) => {
    setPhoneCode(countryCode);
    setCountrySearch("");
    setIsCountryOpen(false);
    window.setTimeout(() => inputRef?.current?.focus({ preventScroll: true }), 80);
  };

  return (
    <div className="md:col-span-2">
      <label htmlFor="phoneNumber" className="block font-semibold text-lg mb-1">
        {label}
      </label>
      <div className="grid gap-2 sm:grid-cols-[minmax(210px,0.85fr)_minmax(0,1fr)]">
        <div ref={countryPickerRef} className="relative">
          <button
            id="phoneCode"
            type="button"
            onClick={() => setIsCountryOpen((prev) => !prev)}
            className="flex h-12 w-full items-center justify-between gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-left text-sm font-semibold text-zinc-900 transition hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/25 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            aria-haspopup="listbox"
            aria-expanded={isCountryOpen}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-1 text-xs font-black text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
                {selectedCountry.flag}
              </span>
              <span className="min-w-0 truncate">{selectedCountry.name}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-zinc-500">
              {selectedCountry.code}
              <ChevronDown className={`h-4 w-4 transition-transform ${isCountryOpen ? "rotate-180" : ""}`} aria-hidden />
            </span>
          </button>

          {isCountryOpen && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl shadow-black/20 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 p-2 dark:border-zinc-700">
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
                  <Search className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                  <input
                    type="search"
                    value={countrySearch}
                    onChange={(event) => setCountrySearch(event.target.value)}
                    placeholder="Search country or code"
                    className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto p-1" role="listbox" aria-labelledby="phoneCode">
                {filteredCountries.map((country) => {
                  const isSelected = country.code === phoneCode;
                  return (
                    <button
                      key={`${country.code}-${country.flag}`}
                      type="button"
                      onClick={() => handleCountrySelect(country.code)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                        isSelected
                          ? "bg-teal-500/10 text-teal-700 dark:text-teal-300"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 rounded bg-zinc-100 px-2 py-1 text-xs font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                          {country.flag}
                        </span>
                        <span className="min-w-0 truncate">{country.name}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2 font-bold">
                        {country.code}
                        {isSelected && <Check className="h-4 w-4" aria-hidden />}
                      </span>
                    </button>
                  );
                })}
                {filteredCountries.length === 0 && (
                  <p className="px-3 py-4 text-center text-sm text-zinc-500">No country found</p>
                )}
              </div>
            </div>
          )}
        </div>
        <input
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          ref={inputRef}
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
    phoneCode: ALL_PHONE_COUNTRIES[0].code,
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
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)]">
            <div className="space-y-4">
            <section
              ref={scheduleSectionRef}
              className={`rounded-2xl border bg-white p-4 shadow-sm transition-all dark:bg-zinc-900/70 sm:p-5 ${
                !tourTime
                  ? "border-amber-300 ring-2 ring-amber-300/35 dark:border-amber-600"
                  : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                    <Clock3 className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black leading-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">{tr.tourTimeTitle}</h3>
                    {!tourTime && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {tr.indicators.chooseTourTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {availableTimeSlots.map((slot) => {
                  const isSelected = tourTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleTourTimeSelect(slot)}
                      className={`min-h-14 rounded-xl border-2 px-4 py-3 text-center text-base font-black transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-900/15 dark:bg-emerald-500 dark:text-zinc-950"
                          : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-emerald-950/30"
                      }`}
                    >
                      {formatDepartureLabel(slot)}
                    </button>
                  );
                })}
              </div>
            </section>

            <section
              className={`rounded-2xl border bg-white p-4 shadow-sm transition-all dark:bg-zinc-900/70 sm:p-5 ${
                !isTicketsValid
                  ? "border-amber-300 ring-2 ring-amber-300/35 dark:border-amber-600"
                  : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
                    <Users className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black leading-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">{tr.ticketsTitle}</h3>
                    {!isTicketsValid && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden /> {tr.indicators.chooseTickets}
                      </p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-700 dark:text-teal-300">
                  {tr.availablePrefix} {slots}
                </span>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950/35">
                <label htmlFor="tickets" className="mb-3 block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  {tr.numPeople}
                </label>
                <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTicketsChange(String(tickets - 1))}
                    disabled={slots === 0 || tickets <= 1}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition hover:border-teal-500 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                    aria-label={lang === "es" ? "Reducir personas" : "Decrease guests"}
                  >
                    <Minus className="h-4 w-4" aria-hidden />
                  </button>
                  <input
                    ref={ticketsInputRef}
                    id="tickets"
                    type="number"
                    min={1}
                    max={Math.max(1, slots)}
                    value={tickets}
                    onChange={(e) => {
                      handleTicketsChange(e.target.value);
                    }}
                    onKeyDown={handleStep1Enter}
                    className="h-11 w-full rounded-xl border border-zinc-300 bg-white text-center text-lg font-black text-zinc-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    disabled={slots === 0}
                  />
                  <button
                    type="button"
                    onClick={() => handleTicketsChange(String(tickets + 1))}
                    disabled={slots === 0 || tickets >= slots}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition hover:border-teal-500 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                    aria-label={lang === "es" ? "Aumentar personas" : "Increase guests"}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>

              {/* Base price display */}
              <div className="mt-3 flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                  {lang === "es" ? "Entrada General" : "General Entry"}
                </span>
                <span className="font-black text-zinc-900 dark:text-zinc-50">${basePriceUSD} / {tr.perPerson}</span>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/70 sm:p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                    <Sparkles className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black leading-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">
                      {lang === "es" ? "Mejora tu experiencia" : "Upgrade your experience"}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {lang === "es" ? "Opcional. Se calcula por persona." : "Optional. Calculated per person."}
                    </p>
                  </div>
                </div>
                {selectedAddons.length > 0 && (
                  <span className="shrink-0 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-black text-white">
                    +{selectedAddons.length}
                  </span>
                )}
              </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {ADDON_OPTIONS.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    const Icon = addon.icon;
                    const addonName = lang === "es" ? addon.nameEs : addon.nameEn;
                    const addonDesc = lang === "es" ? addon.descriptionEs : addon.descriptionEn;

                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => handleAddonToggle(addon.id)}
                        aria-pressed={isSelected}
                        className={`flex min-h-[104px] items-start gap-3 rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/60 ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/90 shadow-md shadow-emerald-500/15 dark:border-emerald-500 dark:bg-emerald-950/30"
                            : "border-zinc-200 bg-zinc-50 hover:border-emerald-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-950/35 dark:hover:border-emerald-700"
                        }`}
                      >
                        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isSelected
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}>
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-black leading-tight ${isSelected ? "text-emerald-800 dark:text-emerald-200" : "text-zinc-900 dark:text-zinc-100"}`}>
                              {addonName}
                            </p>
                            <span className={`shrink-0 text-sm font-black ${isSelected ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-800 dark:text-zinc-100"}`}>
                              +${addon.price}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{addonDesc}</p>
                        </div>
                        {isSelected && (
                          <span className="ml-1 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Check className="h-3.5 w-3.5" aria-hidden />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedAddons.length > 0 && (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                    <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      {lang === "es" ? "Extra por persona" : "Extra per person"}
                    </span>
                    <span className="font-black text-emerald-800 dark:text-emerald-300">+${addonsPricePerPerson}</span>
                  </div>
                )}
            </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-xl shadow-black/5 dark:border-emerald-900/60 dark:bg-zinc-900">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-50/80">
                    {lang === "es" ? "Total estimado" : "Estimated total"}
                  </p>
                  <p className="mt-2 text-4xl font-black tracking-tight">${totalWithTaxes.toFixed(2)}</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-50/85">
                    {tickets} {lang === "es" ? "persona(s)" : "guest(s)"} | ${pricePerPerson} {tr.perPerson}
                  </p>
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">{lang === "es" ? "Tour" : "Tour"}</span>
                    <span className="text-right font-bold text-zinc-900 dark:text-zinc-50">{selectedTourName}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">{lang === "es" ? "Hora" : "Time"}</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">{tourTime ? formatDepartureLabel(tourTime) : "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">{lang === "es" ? "Base" : "Base"}</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">${basePriceUSD} / {tr.perPerson}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">{lang === "es" ? "Extras" : "Add-ons"}</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">+${addonsPricePerPerson} / {tr.perPerson}</span>
                  </div>
                  <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">{tr.subtotalLabel}</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-50">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">{tr.taxes} ({ivaRatePercent}%)</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-50">${taxes.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={goToNextStep}
                    aria-disabled={!isStep1Valid}
                    className={`inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3 font-black text-white transition ${
                      !isStep1Valid
                        ? "cursor-not-allowed bg-zinc-400 opacity-70"
                        : "bg-zinc-950 hover:-translate-y-0.5 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    }`}
                  >
                    {lang === "es" ? "Continuar a mis datos" : "Continue to details"}
                  </button>
                </div>
              </div>
            </aside>
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
          <div ref={travelerSectionRef} className={`mb-6 rounded-xl ${!isStep2Valid ? "ring-2 ring-amber-300/70 p-3" : ""}`}>
            <h3 className="text-xl font-semibold mb-4">{tr.travelerTitle}</h3>
            {!isStep2Valid && <p className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400"><AlertCircle className="h-4 w-4" aria-hidden /> {tr.indicators.completeTravelerData}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TravelerInputField id="name" label={tr.fullName} value={formState.name} onChange={(v) => handleChange("name", v)} onBlur={() => trackFieldBlur("name")} onKeyDown={handleNameEnter} inputRef={nameInputRef} placeholder={tr.namePlaceholder} isValid={validation.isNameValid} validationMessage={tr.nameRequired} required />
              <TravelerInputField id="email" label={tr.emailLabel} type="email" value={formState.email} onChange={(v) => handleChange("email", v)} onBlur={() => trackFieldBlur("email")} onKeyDown={handleEmailEnter} inputRef={emailInputRef} placeholder={tr.emailPlaceholder} isValid={validation.isEmailValid} validationMessage={tr.emailInvalid} required />
              <TravelerPhoneInput phoneCode={formState.phoneCode} phoneNumber={formState.phoneNumber} setPhoneCode={(v) => handleChange("phoneCode", v)} setPhoneNumber={(v) => handleChange("phoneNumber", v)} onBlur={() => trackFieldBlur("phone")} onKeyDown={handlePhoneEnter} inputRef={phoneInputRef} isValid={validation.isPhoneNumberValid} label={tr.phoneLabel} placeholder={tr.phonePlaceholder} validationMessage={tr.phoneInvalid} />
              <div className="md:col-span-2">
                <label htmlFor="specialRequests" className="mb-2 block text-lg font-semibold">
                  {lang === "es" ? "¿Necesitas algo extra?" : "Need anything extra?"}
                  <span className="ml-2 text-sm font-normal text-zinc-500">
                    {lang === "es" ? "opcional" : "optional"}
                  </span>
                </label>
                <textarea
                  id="specialRequests"
                  value={formState.specialRequests}
                  onChange={(event) => handleChange("specialRequests", event.target.value)}
                  onBlur={() => trackFieldBlur("specialRequests")}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  placeholder={
                    lang === "es"
                      ? "Ej: transporte desde hotel, comida vegetariana, cumpleaños, guia privado, fotos..."
                      : "Ex: hotel pickup, vegetarian meal, birthday, private guide, photos..."
                  }
                />
                <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {lang === "es"
                    ? "Lo revisamos antes de confirmar si requiere costo adicional."
                    : "We review it before confirmation if it requires an extra cost."}
                </p>
              </div>
            </div>
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
          <div ref={reviewSectionRef} className="mb-6 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl">
            <div className="flex justify-between mb-2"><span>{tr.tourLabel}</span><span className="font-medium">{selectedTourName}</span></div>
            <div className="flex justify-between mb-2">
              <span>{lang === "es" ? "Entrada General" : "General Entry"}</span>
              <span className="font-medium">${basePriceUSD} / {tr.perPerson}</span>
            </div>
            <div className="flex justify-between mb-2"><span>{tr.tourTimeTitle}</span><span>{tourTime ?? "—"}</span></div>
            <div className="flex justify-between mb-2">
              <span>{lang === "es" ? "Personas" : "People"}</span>
              <span>{tickets}</span>
            </div>
            {selectedAddons.length > 0 && (
              <div className="mb-2 border-t border-zinc-300 dark:border-zinc-600 pt-2 mt-2">
                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  {lang === "es" ? "Servicios extra:" : "Extra services:"}
                </p>
                {ADDON_OPTIONS.filter((a) => selectedAddons.includes(a.id)).map((addon) => (
                  <div key={addon.id} className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-700 dark:text-zinc-300">{lang === "es" ? addon.nameEs : addon.nameEn}</span>
                    <span>+${addon.price} / {tr.perPerson}</span>
                  </div>
                ))}
              </div>
            )}
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
                ref={termsCheckboxRef}
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
                onKeyDown={handleTermsEnter}
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

      {/* Trust signals */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 border-t border-zinc-200 pt-4 pb-1 dark:border-zinc-800">
        <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
          {lang === "es" ? "Cancelación gratuita hasta 24h antes" : "Free cancellation up to 24h before"}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
          {lang === "es" ? "Confirmación inmediata" : "Instant confirmation"}
        </span>
      </div>

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

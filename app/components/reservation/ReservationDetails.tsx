// components/ReservationDetails.tsx
import Link from "next/link";
import { TOUR_INFO } from "@/lib/tour-info";
import { AvailabilityMap, MainTourInfo } from "@/lib/types";
import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

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

const TAX_RATE = 0.13;

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
  weekdayOnly: boolean;
}

const PACKAGES: PackageOption[] = [
  {
    id: "basic",
    priceUSD: 30,
    priceCRC: 15000,
    weekdayOnly: false,
  },
  {
    id: "full-day",
    priceUSD: 40,
    priceCRC: 20000,
    weekdayOnly: false,
  },
  {
    id: "private",
    priceUSD: 60,
    priceCRC: null,
    weekdayOnly: true,
  },
];

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
  tourTime: TourTime;
  tourPackage: TourPackage;
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
      <label htmlFor={id} className="block font-semibold text-lg mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
}: Props) {
  const { lang } = useLanguage();
  const tr = translations[lang].reservation;
  const dateLocale = lang === "es" ? es : enUS;

  const resolvedTourInfo = tourInfo ?? TOUR_INFO;
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

  const selectedPackage = useMemo(
    () => PACKAGES.find((p) => p.id === tourPackage) ?? null,
    [tourPackage]
  );

  const privateOnWeekend = tourPackage === "private" && isWeekend;

  const { subtotal, taxes, totalWithTaxes } = useMemo(() => {
    const pricePerPerson = selectedPackage?.priceUSD ?? 0;
    const sub = tickets * pricePerPerson;
    const tax = sub * TAX_RATE;
    return { subtotal: sub, taxes: tax, totalWithTaxes: sub + tax };
  }, [tickets, selectedPackage]);

  const { formState, handleChange, validation } = useReservationForm({
    name: "",
    email: "",
    phoneCode: COUNTRY_CODES[0].code,
    phoneNumber: "",
    specialRequests: "",
    agreeTerms: false,
  });

  const isStep1Valid = isTicketsValid && tourTime !== null && tourPackage !== null && !privateOnWeekend;
  const isStep2Valid = validation.isNameValid && validation.isEmailValid && validation.isPhoneNumberValid;

  const isFormValid = useMemo(
    () => isStep1Valid && isStep2Valid && validation.isAgreeTermsValid,
    [isStep1Valid, isStep2Valid, validation.isAgreeTermsValid]
  );

  const steps = [
    { id: 1 as const, label: tr.steps.schedule },
    { id: 2 as const, label: tr.steps.traveler },
    { id: 3 as const, label: tr.steps.review },
  ];

  const handleReserve = useCallback(() => {
    if (!isFormValid || !selectedPackage || !tourTime || !tourPackage) return;

    onReserve({
      tickets,
      date: formattedDate,
      total: totalWithTaxes,
      name: formState.name,
      email: formState.email,
      phone: `${formState.phoneCode} ${formState.phoneNumber}`,
      specialRequests: formState.specialRequests,
      tourTime,
      tourPackage,
      packagePrice: selectedPackage.priceUSD,
    });
  }, [
    isFormValid,
    selectedPackage,
    tourTime,
    tourPackage,
    onReserve,
    tickets,
    formattedDate,
    totalWithTaxes,
    formState,
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
    <div className="border-t border-zinc-300 dark:border-zinc-700">
      <h2 className="text-2xl font-bold mb-4">
        {tr.titlePrefix} {formattedDate}
      </h2>

      <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/60">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {tr.flowTitle}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {steps.map((step) => {
            const isCurrent = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition-all ${
                  isCurrent
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                    : isDone
                    ? "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-900/20 dark:text-teal-300"
                    : "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold">
                  {step.id}
                </span>
                {step.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-teal-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 mb-6">
        <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-300 mb-2">
          {tr.tourInfoTitle}
        </h3>
        <p className="text-zinc-700 dark:text-zinc-400 mb-4">{resolvedTourInfo.details}</p>
        <div className="mb-4">
          <strong className="block text-zinc-800 dark:text-zinc-200">{tr.duration}</strong>
          <span className="text-zinc-700 dark:text-zinc-400">{resolvedTourInfo.duration || "2-3 horas (aprox.)"}</span>
        </div>
      </div>

      {currentStep === 1 && (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{tr.tourTimeTitle}</h3>
            <div className="flex gap-3 flex-wrap">
              {TIME_SLOTS.map((slot) => {
                const isSelected = tourTime === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setTourTime(slot.id)}
                    className={`flex-1 min-w-[90px] py-3 px-4 rounded-xl border-2 font-semibold text-base transition-all ${
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

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">{tr.packageTitle}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PACKAGES.map((pkg) => {
                const isSelected = tourPackage === pkg.id;
                const isDisabled = pkg.weekdayOnly && isWeekend;
                const pkgTr = tr.packages[pkg.id];

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => !isDisabled && setTourPackage(pkg.id)}
                    disabled={isDisabled}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                      isDisabled
                        ? "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50 opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                        : "border-zinc-300 dark:border-zinc-600 hover:border-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                    }`}
                  >
                    {pkg.weekdayOnly && (
                      <span className="inline-block text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded px-2 py-0.5 mb-2">
                        {tr.weekdaysOnly}
                      </span>
                    )}
                    <p className="font-bold text-base mb-1 text-zinc-800 dark:text-zinc-100">{pkgTr.name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3 leading-snug">{pkgTr.description}</p>
                    <p className="font-bold text-lg text-zinc-800 dark:text-zinc-100">${pkg.priceUSD} USD</p>
                  </button>
                );
              })}
            </div>
            {privateOnWeekend && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                <span className="text-red-500 mt-0.5">⚠</span>
                <p className="text-sm text-red-600 dark:text-red-400">{tr.privateWeekendWarning}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">{tr.ticketsTitle}</h3>
            <div className="flex items-center gap-4 mb-4">
              <label htmlFor="tickets" className="font-semibold text-lg">{tr.numPeople}</label>
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
                className="w-20 p-2 rounded-lg border bg-white dark:bg-zinc-800"
                disabled={slots === 0}
              />
              <span className="text-sm text-zinc-500">({tr.availablePrefix} {slots})</span>
            </div>
          </div>
          {!isStep1Valid && <p className="mb-6 text-sm text-amber-600 dark:text-amber-400">{tr.completeStepOneHint}</p>}
        </>
      )}

      {currentStep === 2 && (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">{tr.travelerTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TravelerInputField id="name" label={tr.fullName} value={formState.name} onChange={(v) => handleChange("name", v)} placeholder={tr.namePlaceholder} isValid={validation.isNameValid} validationMessage={tr.nameRequired} required />
              <TravelerInputField id="email" label={tr.emailLabel} type="email" value={formState.email} onChange={(v) => handleChange("email", v)} placeholder={tr.emailPlaceholder} isValid={validation.isEmailValid} validationMessage={tr.emailInvalid} required />
              <TravelerPhoneInput phoneCode={formState.phoneCode} phoneNumber={formState.phoneNumber} setPhoneCode={(v) => handleChange("phoneCode", v)} setPhoneNumber={(v) => handleChange("phoneNumber", v)} isValid={validation.isPhoneNumberValid} label={tr.phoneLabel} placeholder={tr.phonePlaceholder} validationMessage={tr.phoneInvalid} />
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">{tr.specialTitle}</h3>
            <textarea id="specialRequests" value={formState.specialRequests} onChange={(e) => handleChange("specialRequests", e.target.value)} className="w-full p-3 rounded-lg border bg-white dark:bg-zinc-800 h-24 border-zinc-300 dark:border-zinc-700 focus:ring-teal-500 focus:border-teal-500" placeholder={tr.specialPlaceholder} />
          </div>
          {!isStep2Valid && <p className="mb-6 text-sm text-amber-600 dark:text-amber-400">{tr.completeStepTwoHint}</p>}
        </>
      )}

      {currentStep === 3 && (
        <>
          <div className="mb-6 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl">
            <div className="flex justify-between mb-2"><span>{tr.packageLabel}</span><span className="font-medium">{selectedPackage ? tr.packages[selectedPackage.id].name : "—"}</span></div>
            <div className="flex justify-between mb-2"><span>{tr.tourTimeTitle}</span><span>{tourTime ?? "—"}</span></div>
            <div className="flex justify-between mb-2"><span>{tr.subtotalLabel}</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between mb-2"><span>{tr.taxes} ({TAX_RATE * 100}%)</span><span>${taxes.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 border-zinc-300 dark:border-zinc-700"><span>{tr.total}</span><span>${totalWithTaxes.toFixed(2)}</span></div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">{tr.policiesTitle}</h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-4 text-zinc-800 dark:text-zinc-300">
              <strong className="block mb-1 text-yellow-900 dark:text-yellow-300">{tr.cancellationLabel}</strong>
              <p className="text-sm">{resolvedTourInfo.cancellationPolicy || "Cancelación gratuita hasta 24 horas antes del tour."}</p>
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
            disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tr.nextBtn}
          </button>
        )}
        {currentStep === 3 && (
          <button
            type="button"
            onClick={handleReserve}
            disabled={!isFormValid}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tr.proceedBtn}
          </button>
        )}
      </div>
    </div>
  );
}

// components/ReservationDetails.tsx
import Link from "next/link";
import { TOUR_INFO } from "@/lib/tour-info";
import { AvailabilityMap } from "@/lib/types";
import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

const TAX_RATE = 0.1;

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
  name: string;
  priceUSD: number;
  priceCRC: number | null;
  description: string;
  weekdayOnly: boolean;
}

const PACKAGES: PackageOption[] = [
  {
    id: "basic",
    name: "Paquete Básico",
    priceUSD: 30,
    priceCRC: 15000,
    description: "Incluye guía profesional y equipamiento básico.",
    weekdayOnly: false,
  },
  {
    id: "full-day",
    name: "Día Completo con Almuerzo",
    priceUSD: 40,
    priceCRC: 20000,
    description: "Incluye guía, equipamiento y almuerzo típico costarricense.",
    weekdayOnly: false,
  },
  {
    id: "private",
    name: "Tour Privado",
    priceUSD: 60,
    priceCRC: null,
    description: "Experiencia exclusiva para tu grupo. Solo disponible de lunes a viernes.",
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
}: {
  phoneCode: string;
  phoneNumber: string;
  setPhoneCode: (code: string) => void;
  setPhoneNumber: (number: string) => void;
  isValid: boolean;
}) => {
  const isTouched = phoneNumber.trim() !== "";
  const showError = isTouched && !isValid;

  return (
    <div className="md:col-span-2">
      <label htmlFor="phoneNumber" className="block font-semibold text-lg mb-1">
        Teléfono
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
          placeholder="Ej. 1234 5678"
          required
        />
      </div>
      {showError && (
        <FormError message="Número de teléfono no válido. Formato sugerido: #### ####." />
      )}
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
  onReserve: (data: any) => void;
  availability: AvailabilityMap;
  currentYear: number;
};

export default function ReservationDetails({
  selectedDate,
  currentMonth,
  tickets,
  setTickets,
  onReserve,
  availability,
  currentYear,
}: Props) {
  // --- Date & slots ---
  const slots = availability[selectedDate] ?? 0;
  const isTicketsValid = tickets >= 1 && tickets <= slots;

  const reservationDate = new Date(currentYear, currentMonth, selectedDate);
  const formattedDate = format(reservationDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
    locale: es,
  });

  const isWeekend = reservationDate.getDay() === 0 || reservationDate.getDay() === 6;

  // --- New selections ---
  const [tourTime, setTourTime] = useState<TourTime | null>(null);
  const [tourPackage, setTourPackage] = useState<TourPackage | null>(null);

  const selectedPackage = useMemo(
    () => PACKAGES.find((p) => p.id === tourPackage) ?? null,
    [tourPackage]
  );

  const privateOnWeekend = tourPackage === "private" && isWeekend;

  // --- Pricing ---
  const { subtotal, taxes, totalWithTaxes } = useMemo(() => {
    const pricePerPerson = selectedPackage?.priceUSD ?? 0;
    const sub = tickets * pricePerPerson;
    const tax = sub * TAX_RATE;
    return { subtotal: sub, taxes: tax, totalWithTaxes: sub + tax };
  }, [tickets, selectedPackage]);

  // --- Form state ---
  const { formState, handleChange, validation } = useReservationForm({
    name: "",
    email: "",
    phoneCode: COUNTRY_CODES[0].code,
    phoneNumber: "",
    specialRequests: "",
    agreeTerms: false,
  });

  // --- Validation ---
  const isFormValid = useMemo(
    () =>
      isTicketsValid &&
      tourTime !== null &&
      tourPackage !== null &&
      !privateOnWeekend &&
      validation.isNameValid &&
      validation.isEmailValid &&
      validation.isPhoneNumberValid &&
      validation.isAgreeTermsValid,
    [isTicketsValid, tourTime, tourPackage, privateOnWeekend, validation]
  );

  // --- Submit ---
  const handleReserve = useCallback(() => {
    if (!isFormValid || !selectedPackage) return;

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
    onReserve,
    tickets,
    formattedDate,
    totalWithTaxes,
    formState,
    tourTime,
    tourPackage,
    selectedPackage,
  ]);

  return (
    <div className="border-t border-zinc-300 dark:border-zinc-700">
      <h2 className="text-2xl font-bold mb-4">
        Reservar para el {formattedDate}
      </h2>

      {/* ---------------------- TOUR INFO ---------------------- */}
      <div className="bg-teal-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 mb-6">
        <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-300 mb-2">
          Información del Tour
        </h3>

        <p className="text-zinc-700 dark:text-zinc-400 mb-4">
          {TOUR_INFO.details}
        </p>

        <div className="mb-4">
          <strong className="block text-zinc-800 dark:text-zinc-200">Duración:</strong>
          <span className="text-zinc-700 dark:text-zinc-400">
            {TOUR_INFO.duration || "2-3 horas (aprox.)"}
          </span>
        </div>

        <div className="mb-4">
          <strong className="block text-zinc-800 dark:text-zinc-200">Inclusiones:</strong>
          <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-1">
            {(TOUR_INFO.inclusions || ["Guía profesional", "transporte", "entradas"]).map(
              (item: string, i: number) => (
                <li key={i}>{item}</li>
              )
            )}
          </ul>
        </div>

        <div className="mb-4">
          <strong className="block text-zinc-800 dark:text-zinc-200">Exclusiones:</strong>
          <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-1">
            {(TOUR_INFO.exclusions || ["Comidas", "propinas", "gastos personales"]).map(
              (item: string, i: number) => (
                <li key={i}>{item}</li>
              )
            )}
          </ul>
        </div>

        <div>
          <strong className="block text-zinc-800 dark:text-zinc-200">Restricciones:</strong>
          <span className="text-zinc-700 dark:text-zinc-400">
            {TOUR_INFO.restrictions}
          </span>
        </div>
      </div>

      {/* ---------------------- TIME SLOT SELECTOR ---------------------- */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Hora del Tour</h3>
        <div className="flex gap-3 flex-wrap">
          {TIME_SLOTS.map((slot) => {
            const isSelected = tourTime === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setTourTime(slot.id)}
                className={`flex-1 min-w-[90px] py-3 px-4 rounded-xl border-2 font-semibold text-base transition-all
                  ${
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
        {tourTime === null && (
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
            Selecciona una hora para continuar.
          </p>
        )}
      </div>

      {/* ---------------------- PACKAGE SELECTOR ---------------------- */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Paquete del Tour</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PACKAGES.map((pkg) => {
            const isSelected = tourPackage === pkg.id;
            const isDisabled = pkg.weekdayOnly && isWeekend;

            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => !isDisabled && setTourPackage(pkg.id)}
                disabled={isDisabled}
                className={`relative text-left p-4 rounded-xl border-2 transition-all
                  ${
                    isDisabled
                      ? "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50 opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-zinc-300 dark:border-zinc-600 hover:border-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                  }`}
              >
                {pkg.weekdayOnly && (
                  <span className="inline-block text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded px-2 py-0.5 mb-2">
                    Solo lunes–viernes
                  </span>
                )}
                <p
                  className={`font-bold text-base mb-1 ${
                    isSelected
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-zinc-800 dark:text-zinc-100"
                  }`}
                >
                  {pkg.name}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3 leading-snug">
                  {pkg.description}
                </p>
                <p className="font-bold text-lg text-zinc-800 dark:text-zinc-100">
                  ${pkg.priceUSD} USD
                </p>
                {pkg.priceCRC && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    ₡{pkg.priceCRC.toLocaleString("es-CR")}
                  </p>
                )}
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  por persona
                </p>
              </button>
            );
          })}
        </div>

        {/* Private tour + weekend warning */}
        {privateOnWeekend && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
            <span className="text-red-500 mt-0.5">⚠</span>
            <p className="text-sm text-red-600 dark:text-red-400">
              El tour privado solo está disponible de lunes a viernes. Por favor selecciona una fecha entre semana o elige otro paquete.
            </p>
          </div>
        )}
      </div>

      {/* ---------------------- TRAVELER INFO ---------------------- */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">
          Información del Viajero Principal
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TravelerInputField
            id="name"
            label="Nombre Completo"
            value={formState.name}
            onChange={(v) => handleChange("name", v)}
            placeholder="Ej. Juan Pérez"
            isValid={validation.isNameValid}
            validationMessage="El nombre es obligatorio."
            required
          />

          <TravelerInputField
            id="email"
            label="Correo Electrónico"
            type="email"
            value={formState.email}
            onChange={(v) => handleChange("email", v)}
            placeholder="Ej. juan@example.com"
            isValid={validation.isEmailValid}
            validationMessage="Por favor, introduce un correo electrónico válido."
            required
          />

          <TravelerPhoneInput
            phoneCode={formState.phoneCode}
            phoneNumber={formState.phoneNumber}
            setPhoneCode={(v) => handleChange("phoneCode", v)}
            setPhoneNumber={(v) => handleChange("phoneNumber", v)}
            isValid={validation.isPhoneNumberValid}
          />
        </div>
      </div>

      {/* ---------------------- PRICE & TICKETS ---------------------- */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Selección de Tickets</h3>

        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="tickets" className="font-semibold text-lg">
            Número de Personas
          </label>
          <input
            id="tickets"
            type="number"
            min={1}
            max={Math.max(1, slots)}
            value={tickets}
            onChange={(e) => {
              const val = +e.target.value;
              if (val >= 1 && val <= slots) {
                setTickets(val);
              } else if (val < 1) {
                setTickets(1);
              } else if (val > slots) {
                setTickets(slots);
              }
            }}
            className="w-20 p-2 rounded-lg border bg-white dark:bg-zinc-800"
            disabled={slots === 0}
          />
          <span className="text-sm text-zinc-500">(Disponibles: {slots})</span>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl">
          {selectedPackage ? (
            <>
              <div className="flex justify-between mb-2">
                <span>Paquete</span>
                <span className="font-medium">{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Precio por persona</span>
                <span>${selectedPackage.priceUSD.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between mb-2 text-zinc-400">
              <span>Selecciona un paquete para ver el precio</span>
            </div>
          )}

          <div className="flex justify-between mb-2">
            <span>Subtotal ({tickets} {tickets === 1 ? "persona" : "personas"})</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between mb-2">
            <span>Impuestos ({TAX_RATE * 100}%)</span>
            <span>${taxes.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-lg border-t pt-2 border-zinc-300 dark:border-zinc-700">
            <span>Total</span>
            <span>${totalWithTaxes.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ---------------------- SPECIAL REQUESTS ---------------------- */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Solicitudes Especiales</h3>
        <textarea
          id="specialRequests"
          value={formState.specialRequests}
          onChange={(e) => handleChange("specialRequests", e.target.value)}
          className="w-full p-3 rounded-lg border bg-white dark:bg-zinc-800 h-24 border-zinc-300 dark:border-zinc-700 focus:ring-teal-500 focus:border-teal-500"
          placeholder="Ej. Requerimientos dietéticos, accesibilidad, etc."
        />
      </div>

      {/* ---------------------- TERMS ---------------------- */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Políticas y Términos</h3>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-4 text-zinc-800 dark:text-zinc-300">
          <strong className="block mb-1 text-yellow-900 dark:text-yellow-300">
            Política de Cancelación:
          </strong>
          <p className="text-sm">
            {TOUR_INFO.cancellationPolicy ||
              "Cancelación gratuita hasta 24 horas antes del tour."}
          </p>
        </div>

        <label
          htmlFor="agreeTerms"
          className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
            formState.agreeTerms
              ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
              : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          }`}
        >
          <input
            id="agreeTerms"
            type="checkbox"
            checked={formState.agreeTerms}
            onChange={(e) => handleChange("agreeTerms", e.target.checked)}
            className="h-5 w-5 text-teal-600 rounded border-zinc-400 focus:ring-teal-500 dark:bg-zinc-700 dark:border-zinc-600 mt-0.5"
          />
          <span className="text-zinc-700 dark:text-zinc-400 text-base">
            He leído y acepto los
            <Link
              href="/terminos-y-condiciones"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-teal-600 underline ml-1"
            >
              Términos y Condiciones
            </Link>
            y la
            <Link
              href="/politica-de-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-teal-600 underline ml-1"
            >
              Política de Privacidad
            </Link>
            .
          </span>
        </label>
      </div>

      {/* ---------------------- BUTTON ---------------------- */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleReserve}
          disabled={!isFormValid}
          className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceder a Pago
        </button>
      </div>
    </div>
  );
}

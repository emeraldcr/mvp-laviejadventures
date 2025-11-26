// components/ReservationDetails.tsx
import Link from "next/link";
import { TOUR_INFO } from "@/lib/tour-info";
import { AvailabilityMap } from "@/lib/types";
import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ---------------------- CONSTANTS ----------------------
// Move regex definitions to a utility or constant file if reused, but keep here for simplicity.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_REGEX = /^\d{4}[\s-]?\d{4}$/;

// Define Phone Codes as a constant outside the component
const COUNTRY_CODES = [
  { code: "+506", name: "Costa Rica" },
  { code: "+1", name: "EE. UU. / Canadá" },
  { code: "+52", name: "México" },
  { code: "+57", name: "Colombia" },
  { code: "+34", name: "España" },
];

// Define Ticket Price as a constant
const PRICE_PER_TICKET = 50;
const TAX_RATE = 0.1;

// ---------------------- TYPES (Re-used for form state) ----------------------
interface ReservationFormState {
  name: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  specialRequests: string;
  agreeTerms: boolean;
}

// ---------------------- CUSTOM HOOK: useReservationForm ----------------------
// Good for isolating complex state and validation logic.
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

  return {
    formState,
    handleChange,
    validation,
  };
};

// ---------------------- CHILD COMPONENTS (for Composition) ----------------------

// Component for displaying form errors
const FormError = ({ message }: { message: string }) => (
  <p className="text-red-500 text-sm mt-1">{message}</p>
);

// Component for a single traveler input field
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

// Component for Phone Input (since it's a composite field)
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
            <label htmlFor="phoneNumber" className="block font-semibold text-lg mb-1">Teléfono</label>
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
                        showError
                            ? "border-red-500"
                            : "border-zinc-300 dark:border-zinc-700"
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
  monthName: string; // Not needed if using Date object/format()
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
  // 1. Data/Slot calculation
  const slots = availability[selectedDate] ?? 0;
  const isTicketsValid = tickets >= 1 && tickets <= slots;
  
  // Create a proper Date object only once
  const reservationDate = new Date(currentYear, currentMonth, selectedDate);
  const formattedDate = format(reservationDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
    locale: es,
  });

  // 2. Pricing calculation (use useMemo for expensive/derived values)
  const { subtotal, taxes, totalWithTaxes } = useMemo(() => {
    const sub = tickets * PRICE_PER_TICKET;
    const tax = sub * TAX_RATE;
    const total = sub + tax;
    return { subtotal: sub, taxes: tax, totalWithTaxes: total };
  }, [tickets]);

  // 3. Form State Management (via Custom Hook)
  const { formState, handleChange, validation } = useReservationForm({
    name: "",
    email: "",
    phoneCode: COUNTRY_CODES[0].code, // Use the constant
    phoneNumber: "",
    specialRequests: "",
    agreeTerms: false,
  });

  // 4. Validation Check
  const isFormValid = useMemo(
    () =>
      isTicketsValid &&
      validation.isNameValid &&
      validation.isEmailValid &&
      validation.isPhoneNumberValid &&
      validation.isAgreeTermsValid,
    [isTicketsValid, validation]
  );

  // 5. Handler (use useCallback)
  const handleReserve = useCallback(() => {
    if (!isFormValid) return;

    // The data object is consistent with the original structure
    onReserve({
      tickets,
      date: formattedDate,
      total: totalWithTaxes,
      name: formState.name,
      email: formState.email,
      phone: `${formState.phoneCode} ${formState.phoneNumber}`,
      specialRequests: formState.specialRequests,
    });
  }, [
    isFormValid,
    onReserve,
    tickets,
    formattedDate,
    totalWithTaxes,
    formState,
  ]);

  return (
    <div className="p-6 border-t border-zinc-300 dark:border-zinc-700">
      <h2 className="text-2xl font-bold mb-4">
        Reservar para el {formattedDate}
      </h2>

      {/* ---------------------- TOUR INFO (Could be a separate component: <TourInfoBlock />) ---------------------- */}
      <div className="bg-teal-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 mb-6">
        <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-300 mb-2">
          Información del Tour
        </h3>

        <p className="text-zinc-700 dark:text-zinc-400 mb-4">
          {TOUR_INFO.details}
        </p>

        <div className="mb-4">
          <strong className="block text-zinc-800 dark:text-zinc-200">
            Duración:
          </strong>
          <span className="text-zinc-700 dark:text-zinc-400">
            {TOUR_INFO.duration || "2-3 horas (aprox.)"}
          </span>
        </div>

        <div className="mb-4">
          <strong className="block text-zinc-800 dark:text-zinc-200">
            Inclusiones:
          </strong>
          <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-1">
            {(TOUR_INFO.inclusions || [
              "Guía profesional",
              "transporte",
              "entradas",
            ]).map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <strong className="block text-zinc-800 dark:text-zinc-200">
            Exclusiones:
          </strong>
          <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-1">
            {(TOUR_INFO.exclusions || [
              "Comidas",
              "propinas",
              "gastos personales",
            ]).map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <strong className="block text-zinc-800 dark:text-zinc-200">
            Restricciones:
          </strong>
          <span className="text-zinc-700 dark:text-zinc-400">
            {TOUR_INFO.restrictions}
          </span>
        </div>
      </div>

      {/* ---------------------- TRAVELER INFO ---------------------- */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">
          Información del Viajero Principal
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* NAME */}
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

          {/* EMAIL */}
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

          {/* PHONE */}
          <TravelerPhoneInput
            phoneCode={formState.phoneCode}
            phoneNumber={formState.phoneNumber}
            setPhoneCode={(v) => handleChange("phoneCode", v)}
            setPhoneNumber={(v) => handleChange("phoneNumber", v)}
            isValid={validation.isPhoneNumberValid}
          />
        </div>
      </div>

      {/* ---------------------- PRICE & TICKETS (Could be a separate component: <TicketSelection />) ---------------------- */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Selección de Tickets</h3>

        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="tickets" className="font-semibold text-lg">
            Número de Tickets
          </label>
          <input
            id="tickets"
            type="number"
            min={1}
            max={Math.max(1, slots)}
            value={tickets}
            onChange={(e) => {
              const val = +e.target.value;
              // Only call setTickets if the value is valid to prevent unnecessary re-renders
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
          <div className="flex justify-between mb-2">
            <span>Precio por Ticket</span>
            <span>${PRICE_PER_TICKET.toFixed(2)}</span>
          </div>

          <div className="flex justify-between mb-2">
            <span>Subtotal ({tickets} tickets)</span>
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
          type="button" // Use type="button" to prevent implicit form submission if wrapped in a <form> later
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
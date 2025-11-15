// components/ReservationDetails.tsx

import { TOUR_INFO } from "@/lib/tour-info";
import { AvailabilityMap } from "@/lib/types"; // Assuming types are in lib/types.ts
import { useState } from "react";

// --- VALIDATION HELPERS (NUEVO) ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regex para un número de 8 dígitos (ej. formato en Costa Rica, asumiendo el código de país se maneja aparte)
const PHONE_NUMBER_REGEX = /^\d{4}[\s-]?\d{4}$/; 

type Props = {
  selectedDate: number;
  currentMonth: number;
  monthName: string;
  tickets: number;
  setTickets: (n: number) => void;
  onReserve: () => void;
  availability: AvailabilityMap;
  currentYear: number;
};

export default function ReservationDetails({
  selectedDate,
  currentMonth,
  monthName,
  tickets,
  setTickets,
  onReserve,
  availability,
  currentYear,
}: Props) {
  const slots = availability[selectedDate] ?? 0;

  const fullDate = new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('es', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const pricePerTicket = 50;
  const totalPrice = tickets * pricePerTicket;

  // ESTADO DE FORMULARIO ACTUALIZADO
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // NUEVO: Separamos código y número para mejor control internacional
  const [phoneCode, setPhoneCode] = useState('+506'); // Default a Costa Rica
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // NUEVO: LÓGICA DE VALIDACIÓN MEJORADA
  const isNameValid = name.trim() !== '';
  const isEmailValid = email.trim() !== '' && EMAIL_REGEX.test(email.trim());
  const isPhoneNumberValid = phoneNumber.trim() !== '' && PHONE_NUMBER_REGEX.test(phoneNumber.trim());
  const isTicketsValid = tickets >= 1 && tickets <= slots;

  const isFormValid = isTicketsValid && isNameValid && isEmailValid && isPhoneNumberValid && agreeTerms;

  const handleReserve = () => {
    if (isFormValid) {
      // Aquí se enviaría la data completa: { date, tickets, name, email, phone: `${phoneCode} ${phoneNumber}`, specialRequests }
      onReserve();
    }
  };

  // DATOS: Lista de códigos de país simplificada (para simular el efecto de la bandera)
  const countryCodes = [
    { code: '+506', name: 'Costa Rica' },
    { code: '+1', name: 'EE. UU. / Canadá' },
    { code: '+52', name: 'México' },
    { code: '+57', name: 'Colombia' },
    { code: '+34', name: 'España' },
  ];

  return (
    <div className="p-6 border-t border-zinc-300 dark:border-zinc-700">
      <h2 className="text-2xl font-bold mb-4">
        Reservar para el {fullDate}
      </h2>

      {/* INFORMACIÓN DEL TOUR (Sin cambios mayores) */}
      <div className="bg-teal-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 mb-6">
        <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-300 mb-2">
          Información del Tour
        </h3>
        <p className="text-zinc-700 dark:text-zinc-400 mb-4">{TOUR_INFO.details}</p>
        {/* ... (resto de la sección de Información del Tour) ... */}
        <div className="mb-4">
          <strong className="block text-zinc-800 dark:text-zinc-200">Duración:</strong>
          <span className="text-zinc-700 dark:text-zinc-400">{TOUR_INFO.duration || '2-3 horas (aprox.)'}</span>
        </div>
        <div className="mb-4">
          <strong className="block text-zinc-800 dark:text-zinc-200">Inclusiones:</strong>
          <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-1">
            {TOUR_INFO.inclusions?.map((item: string, i: number) => <li key={i}>{item}</li>) || <li>Guía profesional, transporte, entradas.</li>}
          </ul>
        </div>
        <div className="mb-4">
          <strong className="block text-zinc-800 dark:text-zinc-200">Exclusiones:</strong>
          <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-1">
            {TOUR_INFO.exclusions?.map((item: string, i: number) => <li key={i}>{item}</li>) || <li>Comidas, propinas, gastos personales.</li>}
          </ul>
        </div>
        <div>
          <strong className="block text-zinc-800 dark:text-zinc-200">Restricciones:</strong>
          <span className="text-zinc-700 dark:text-zinc-400">{TOUR_INFO.restrictions}</span>
        </div>
      </div>

      {/* INFORMACIÓN DEL VIAJERO (VALIDACIÓN Y DISEÑO MEJORADOS) */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Información del Viajero Principal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre Completo */}
          <div>
            <label className="block font-semibold text-lg mb-1" htmlFor="name">Nombre Completo</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              // Mejoras: p-3, focus ring, validación visual
              className={`w-full p-3 rounded-lg border focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-zinc-800 ${!isNameValid && name.trim() !== '' ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}
              placeholder="Ej. Juan Pérez"
              required
            />
          </div>

          {/* Correo Electrónico (VALIDACIÓN MEJORADA) */}
          <div>
            <label className="block font-semibold text-lg mb-1" htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // Mejoras: p-3, focus ring, validación visual
              className={`w-full p-3 rounded-lg border focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-zinc-800 ${!isEmailValid && email.trim() !== '' ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}
              placeholder="Ej. juan@example.com"
              required
            />
            {!isEmailValid && email.trim() !== '' && (
              <p className="text-red-500 text-sm mt-1">Por favor, introduce un correo electrónico válido.</p>
            )}
          </div>

          {/* Teléfono (MEJORADO CON CÓDIGO DE PAÍS) */}
          <div className="md:col-span-2">
            <label className="block font-semibold text-lg mb-1" htmlFor="phone-number">Teléfono</label>
            <div className="flex gap-2">
              {/* Selector de Código de País */}
              <select
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className="p-3 rounded-lg border bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 focus:ring-teal-500 focus:border-teal-500 w-1/3 md:w-1/4"
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} ({country.name})
                  </option>
                ))}
              </select>
              {/* Campo para el Número de Teléfono */}
              <input
                id="phone-number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                // Mejoras: p-3, focus ring, validación visual
                className={`w-full p-3 rounded-lg border focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-zinc-800 ${!isPhoneNumberValid && phoneNumber.trim() !== '' ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}
                placeholder="Ej. 1234 5678"
                maxLength={12} // Permite un poco de flexibilidad en el número de dígitos
                required
              />
            </div>
            {!isPhoneNumberValid && phoneNumber.trim() !== '' && (
              <p className="text-red-500 text-sm mt-1">Número de teléfono no válido. Formato sugerido: #### ####.</p>
            )}
            <p className="text-sm text-zinc-500 mt-1">
              *Para incluir banderas y validación más robusta, considera una librería externa de React.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE TICKETS Y PRECIO (Sin cambios mayores) */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Selección de Tickets</h3>
        <div className="flex items-center gap-4 mb-4">
          <label className="font-semibold text-lg">Número de Tickets</label>
          <input
            type="number"
            min={1}
            max={Math.max(1, slots)}
            value={tickets}
            onChange={(e) => {
              const val = +e.target.value;
              if (val >= 1 && val <= slots) setTickets(val);
            }}
            className="w-20 p-2 rounded-lg border bg-white dark:bg-zinc-800"
            disabled={slots === 0}
          />
          <span className="text-sm text-zinc-500">(Disponibles: {slots})</span>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl">
          <div className="flex justify-between mb-2">
            <span>Precio por Ticket</span>
            <span>${pricePerTicket.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Subtotal ({tickets} tickets)</span>
            <span>${(tickets * pricePerTicket).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Impuestos (10%)</span>
            <span>${(totalPrice * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 border-zinc-300 dark:border-zinc-700">
            <span>Total</span>
            <span>${(totalPrice * 1.1).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Solicitudes Especiales (Diseño actualizado) */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Solicitudes Especiales</h3>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          // Mejoras: p-3, focus ring
          className="w-full p-3 rounded-lg border bg-white dark:bg-zinc-800 h-24 border-zinc-300 dark:border-zinc-700 focus:ring-teal-500 focus:border-teal-500"
          placeholder="Ej. Requerimientos dietéticos, accesibilidad, etc."
        />
      </div>

      {/* POLÍTICAS Y TÉRMINOS (MEJORA DE UX/UI) */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Políticas y Términos</h3>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-4 text-zinc-800 dark:text-zinc-300">
          <strong className="block mb-1 text-yellow-900 dark:text-yellow-300">Política de Cancelación:</strong>
          <p className="text-sm">{TOUR_INFO.cancellationPolicy || 'Cancelación gratuita hasta 24 horas antes del tour.'}</p>
        </div>
        
        {/* Checkbox mejorado visualmente con foco en los enlaces y el estado */}
        <label
          className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${agreeTerms
            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' // Estilo cuando está activo
            : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800' // Estilo inactivo
          }`}
        >
          <div className="mt-0.5"> {/* Alineación visual del checkbox */}
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="form-checkbox h-5 w-5 text-teal-600 rounded border-zinc-400 focus:ring-teal-500 dark:bg-zinc-700 dark:border-zinc-600"
            />
          </div>
          <span className="text-zinc-700 dark:text-zinc-400 text-base">
            He leído y acepto los{" "}
            {/* Términos y Política como enlaces clickeables (aún si son simulados) */}
            <a 
              href="#" 
              className="text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 font-medium underline transition-colors" 
              onClick={(e) => e.preventDefault()}
            >
              Términos y Condiciones
            </a>
            {" y la "}
            <a 
              href="#" 
              className="text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 font-medium underline transition-colors" 
              onClick={(e) => e.preventDefault()}
            >
              Política de Privacidad
            </a>.
          </span>
        </label>
      </div>

      {/* Botón de Reserva */}
      <div className="flex justify-end">
        <button
          onClick={handleReserve}
          className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          disabled={!isFormValid}
        >
          Proceder a Pago
        </button>
      </div>
    </div>
  );
}
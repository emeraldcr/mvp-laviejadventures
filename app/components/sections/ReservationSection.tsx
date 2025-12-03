"use client";

import { useState } from "react";
import { useCalendarContext } from "@/app/context/CalendarContext";
import ReservationDetails from "@/app/components/reservation/ReservationDetails";
import PaymentModal from "@/app/components/reservation/PaymentModal";
import { PayPalOrder } from "@/lib/types";

type OrderPayload = {
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total: number;
  date: string;
};

type Props = {
  className?: string;
};

export default function ReservationSection({ className }: Props) {
  const {
    selectedDate,
    selectedDay,
    currentMonth,
    currentYear,
    tickets,
    setTickets,
    availability,
  } = useCalendarContext();

  const [orderDetails, setOrderDetails] = useState<OrderPayload | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleReserve = (data: OrderPayload) => {
    setOrderDetails(data);
    setShowModal(true);
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const monthName = monthNames[currentMonth];

  if (!selectedDay) {
    return (
      <div className={className}>
        <div className="rounded-xl bg-blue-50 dark:bg-zinc-900 p-8 text-center">
          <p className="text-lg text-blue-800 dark:text-blue-300">
            Selecciona una fecha disponible en el calendario.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReservationDetails
        selectedDate={selectedDay}
        currentMonth={currentMonth}
        monthName={monthName}
        tickets={tickets}
        setTickets={setTickets}
        onReserve={handleReserve}
        availability={availability}
        currentYear={currentYear}
      />

      {showModal && orderDetails && (
        <PaymentModal
          orderDetails={orderDetails}
          onClose={() => setShowModal(false)}
          onSuccess={(order: PayPalOrder) => {
            console.log("PAYPAL SUCCESS:", order);
          }}
        />
      )}
    </div>
  );
}
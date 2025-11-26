"use client";

import { useState } from "react";
import ReservationDetails from "@/app/components/reservation/ReservationDetails";
import PaymentModal from "@/app/components/reservation/PaymentModal";
import { AvailabilityMap, PayPalOrder } from "@/lib/types";

type OrderPayload = {
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total: number;
  date: string; // <-- already formatted human-readable date
};

type ModalPayload = {
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total: number;
  date: string; // <-- FINAL FORMATTED STRING
};

type Props = {
  selectedDate: number | null;
  currentMonth: number;
  monthName: string;
  tickets: number;
  setTickets: (n: number) => void;
  availability: AvailabilityMap;
  currentYear: number;
};

export default function ReservationSection({
  selectedDate,
  currentMonth,
  monthName,
  tickets,
  setTickets,
  availability,
  currentYear,
}: Props) {
  const [orderDetails, setOrderDetails] = useState<ModalPayload | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleReserve = (data: OrderPayload) => {
    // data.date ya viene formateada desde ReservationDetails
    const modalPayload: ModalPayload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      tickets: data.tickets,
      total: data.total,
      date: data.date,
    };

    setOrderDetails(modalPayload);
    setShowModal(true);
  };

  return (
    <>
      {selectedDate ? (
        <ReservationDetails
          selectedDate={selectedDate}
          currentMonth={currentMonth}
          monthName={monthName}
          tickets={tickets}
          setTickets={setTickets}
          onReserve={handleReserve}
          availability={availability}
          currentYear={currentYear}
        />
      ) : (
        <div className="rounded-xl bg-blue-50 dark:bg-zinc-900 p-8 text-center">
          <p className="text-lg text-blue-800 dark:text-blue-300">
            Selecciona una fecha disponible en el calendario.
          </p>
        </div>
      )}

      {showModal && orderDetails && (
        <PaymentModal
          orderDetails={orderDetails}
          onClose={() => setShowModal(false)}
          onSuccess={(order: PayPalOrder) => {
            console.log("PAYPAL SUCCESS:", order);
          }}
        />
      )}
    </>
  );
}

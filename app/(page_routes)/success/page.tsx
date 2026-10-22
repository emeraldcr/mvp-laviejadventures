// app/payment/success/page.tsx
import { SuccessClient } from "./SuccessClient";
import { processSuccessfulBooking } from "./bookingService";
import type { SuccessPageProps } from "@/lib/types/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reserva confirmada | La Vieja Adventures", robots: { index: false, follow: false } };

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId } = await searchParams;

  if (!orderId) {
    return (
      <SuccessClient
        error="No se encontró el ID de la orden."
        name=""
        email=""
        date=""
        tickets=""
      />
    );
  }

  const result = await processSuccessfulBooking(orderId);

  return (
    <SuccessClient
      error={result.error}
      name={result.name}
      email={result.email}
      phone={result.phone}
      date={result.date}
      tourName={result.tourName}
      tourPackage={result.tourPackage}
      tourTime={result.tourTime}
      tickets={result.tickets}
      amount={result.amount}
      currency={result.currency}
      orderId={result.orderId}
      captureId={result.captureId}
      reservationId={result.reservationId}
      status={result.status}
    />
  );
}

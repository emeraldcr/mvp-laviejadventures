"use client";

import { redirect } from "next/navigation";

export default async function LegacyReservationRedirect({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const resume = params.resume;
  const query = typeof resume === "string"
    ? `?step=pago&resume=${encodeURIComponent(resume)}`
    : "";
  redirect(`/reservar${query}`);
}

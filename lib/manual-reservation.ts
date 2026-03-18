export type ManualReservationPackageId = "basic" | "full-day" | "private";

export const MANUAL_RESERVATION_PACKAGES = [
  { id: "basic" as const, label: "Basic", priceUSD: 30 },
  { id: "full-day" as const, label: "Full Day", priceUSD: 40 },
  { id: "private" as const, label: "Private", priceUSD: 60 },
];

export const MANUAL_RESERVATION_TIME_SLOTS = [
  { id: "08:00", label: "8:00 AM" },
  { id: "09:00", label: "9:00 AM" },
  { id: "10:00", label: "10:00 AM" },
] as const;

export function getManualReservationPackage(packageId: string) {
  return MANUAL_RESERVATION_PACKAGES.find((pkg) => pkg.id === packageId) ?? null;
}

import type { BookingStepId } from "@/lib/reservation/types";

export const RESERVATION_STEP_LABELS: Record<BookingStepId, string> = {
  1: "schedule",
  2: "traveler_details",
  3: "review",
};

import { redirect } from "next/navigation";

export default function LegacyEnglishReservationRedirect() {
  redirect("/en/reservar");
}

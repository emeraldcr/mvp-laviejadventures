import { redirect } from "next/navigation";

export default function LegacyEnglishBookingRedirect() {
  redirect("/en/mis-reservas");
}

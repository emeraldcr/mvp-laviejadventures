import ReservationsPanel from "@/app/components/reservation/ReservationsPanel";

export const metadata = {
  title: "Panel de reservas",
  robots: { index: false, follow: false },
};

export default function ReservationsPage() {
  return <ReservationsPanel />;
}

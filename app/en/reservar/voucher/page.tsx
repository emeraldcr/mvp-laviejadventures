import type { Metadata } from "next";
import VoucherPage from "@/app/(page_routes)/reservar/voucher/page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Reservation voucher | La Vieja Adventures",
  robots: { index: false, follow: false },
};

export default VoucherPage;

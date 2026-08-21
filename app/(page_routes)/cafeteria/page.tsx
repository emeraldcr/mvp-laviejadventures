import type { Metadata } from "next";
import CafeteriaSigns from "@/app/components/cafeteria/CafeteriaSigns";

export const metadata: Metadata = {
  title: "Rótulos de cafetería | La Vieja Adventures",
  description:
    "Propuesta interna de seis rótulos para la cafetería de La Vieja Adventures.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CafeteriaPage() {
  return <CafeteriaSigns />;
}

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
export const metadata: Metadata = { title: "Reservar Tour en San Carlos", description: "Elija fecha, personas y paquete; vea el precio final antes de pagar. Confirmación inmediata y cancelación gratis hasta 48 h antes.", alternates: { canonical: `${SITE_URL}/reservar` } };
export default function ReservarLayout({ children }: { children: React.ReactNode }) { return children; }

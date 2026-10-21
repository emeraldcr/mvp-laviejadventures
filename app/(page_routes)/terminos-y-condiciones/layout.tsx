import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
export const metadata: Metadata = { title: "Términos y Condiciones", description: "Condiciones de reserva, pago, reprogramación por clima y cancelación de los tours de La Vieja Adventures en San Carlos, Costa Rica.", alternates: { canonical: `${SITE_URL}/terminos-y-condiciones` } };
export default function TermsLayout({ children }: { children: React.ReactNode }) { return children; }

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
export const metadata: Metadata = { title: "Política de Privacidad", description: "Cómo La Vieja Adventures recopila, usa y protege sus datos personales al reservar o contactarnos por WhatsApp.", alternates: { canonical: `${SITE_URL}/politica-de-privacidad` } };
export default function PrivacyLayout({ children }: { children: React.ReactNode }) { return children; }

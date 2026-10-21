import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
export const metadata: Metadata = { title: "Preguntas Frecuentes", description: "Cambios de fecha, lluvia, qué llevar, transporte y cancelación: lo que conviene saber antes de su tour en San Carlos.", alternates: { canonical: `${SITE_URL}/preguntas-frecuentes` } };
export default function FaqLayout({ children }: { children: React.ReactNode }) { return children; }

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
export const metadata: Metadata = { title: "Info, Tarifas y Cómo Llegar", description: "Tours, precios, qué llevar y cómo llegar a Sucre de Ciudad Quesada, San Carlos. Proyecto local con guías de la zona.", alternates: { canonical: `${SITE_URL}/info` } };
export default function InfoLayout({ children }: { children: React.ReactNode }) { return children; }

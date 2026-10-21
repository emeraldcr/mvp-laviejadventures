import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
export const metadata: Metadata = { title: "Galería: Cañón y Cascada El Zafiro", description: "Fotos del Cañón del Río La Vieja, Ciudad Esmeralda, pozas turquesa y la Cascada El Zafiro en San Carlos, Costa Rica.", alternates: { canonical: `${SITE_URL}/galeria` } };
export default function GaleriaLayout({ children }: { children: React.ReactNode }) { return children; }

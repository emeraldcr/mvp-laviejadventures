import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
export const metadata: Metadata = { title: "Pronóstico del Tiempo en el Cañón", description: "Revise el clima en Sucre, San Carlos antes de su tour. Si llueve fuerte o crece el río, ajustamos la ruta o reprogramamos sin costo.", alternates: { canonical: `${SITE_URL}/tiempo` } };
export default function TiempoLayout({ children }: { children: React.ReactNode }) { return children; }

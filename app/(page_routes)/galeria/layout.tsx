import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
export const metadata: Metadata = { alternates: { canonical: `${SITE_URL}/galeria` } };
export default function GaleriaLayout({ children }: { children: React.ReactNode }) { return children; }

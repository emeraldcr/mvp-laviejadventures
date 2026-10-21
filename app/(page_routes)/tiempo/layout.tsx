import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
export const metadata: Metadata = { alternates: { canonical: `${SITE_URL}/tiempo` } };
export default function TiempoLayout({ children }: { children: React.ReactNode }) { return children; }

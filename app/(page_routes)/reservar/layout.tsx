import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
export const metadata: Metadata = { alternates: { canonical: `${SITE_URL}/reservar` } };
export default function ReservarLayout({ children }: { children: React.ReactNode }) { return children; }

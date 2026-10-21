import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
export const metadata: Metadata = { alternates: { canonical: `${SITE_URL}/politica-de-privacidad` } };
export default function PrivacyLayout({ children }: { children: React.ReactNode }) { return children; }

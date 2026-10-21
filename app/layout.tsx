import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { BUSINESS_ADDRESS, BUSINESS_NAME, BUSINESS_PHONE, SITE_URL } from "@/lib/site-config";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ThemeProvider, THEME_NO_FLASH_SCRIPT } from "@/lib/ThemeContext";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
export const metadata: Metadata = { metadataBase: new URL(SITE_URL), title: { default: "Ciudad Esmeralda: Tour de Cañón en San Carlos, CR", template: "%s | La Vieja Adventures" }, description: "Cañón del Río La Vieja hasta la Cascada El Zafiro: 3–4 h con guía local bilingüe. Desde US$40. Cancelación gratis hasta 48 h antes.", alternates: { canonical: "/", languages: { es: "/", en: "/?lang=en" } }, openGraph: { type: "website", locale: "es_CR", url: SITE_URL, siteName: BUSINESS_NAME } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = { "@context": "https://schema.org", "@type": "TouristInformationCenter", name: BUSINESS_NAME, url: SITE_URL, telephone: BUSINESS_PHONE, address: { "@type": "PostalAddress", ...BUSINESS_ADDRESS }, areaServed: "San Carlos, Alajuela, Costa Rica", knowsLanguage: ["es", "en"], sameAs: ["https://www.facebook.com/laviejaadventures", "https://www.instagram.com/laviejaadventures", "https://www.tiktok.com/@la.vieja.adventures"] };
  return <html lang="es" className={`dark ${manrope.variable} ${bricolage.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: THEME_NO_FLASH_SCRIPT }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></head><body className="antialiased"><ThemeProvider><LanguageProvider>{children}</LanguageProvider></ThemeProvider><Analytics /></body></html>;
}

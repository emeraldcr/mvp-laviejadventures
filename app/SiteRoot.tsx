import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { BUSINESS_ADDRESS, BUSINESS_NAME, BUSINESS_PHONE, SITE_URL, SOCIAL_URLS } from "@/lib/site-config";
import { LanguageProvider } from "@/lib/LanguageContext";
import JsonLd from "@/app/components/seo/JsonLd";
import MobileBookingBar from "@/app/components/navigation/MobileBookingBar";
import { ThemeProvider, THEME_NO_FLASH_SCRIPT } from "@/lib/ThemeContext";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "La Vieja Adventures", template: "%s | La Vieja Adventures" },
  description: "Tours de naturaleza y aventura con guías locales en San Carlos, Costa Rica.",
  applicationName: BUSINESS_NAME,
  category: "travel",
  openGraph: {
    type: "website",
    locale: "es_CR",
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    images: [{ url: "/image/IMG_6812.jpg", width: 1200, height: 630, alt: "Cascada El Zafiro en Ciudad Esmeralda, San Carlos, Costa Rica" }],
  },
  twitter: { card: "summary_large_image", images: ["/image/IMG_6812.jpg"] },
};
export default function SiteRoot({ children, locale }: Readonly<{ children: React.ReactNode; locale: "es" | "en" }>) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TravelAgency",
        "@id": `${SITE_URL}/#business`,
        name: BUSINESS_NAME,
        url: SITE_URL,
        image: `${SITE_URL}/image/IMG_6812.jpg`,
        logo: `${SITE_URL}/logo2.jpg`,
        telephone: BUSINESS_PHONE,
        address: { "@type": "PostalAddress", ...BUSINESS_ADDRESS },
        areaServed: [
          { "@type": "City", name: "San Carlos" },
          { "@type": "AdministrativeArea", name: "Alajuela" },
          { "@type": "Country", name: "Costa Rica" },
        ],
        knowsLanguage: ["es", "en"],
        sameAs: Object.values(SOCIAL_URLS),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: BUSINESS_NAME,
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#business` },
        inLanguage: ["es-CR", "en-US"],
      },
    ],
  };
  return <html lang={locale} className={`${manrope.variable} ${bricolage.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: THEME_NO_FLASH_SCRIPT }} /><JsonLd data={schema} /></head><body className="antialiased"><ThemeProvider><LanguageProvider initialLang={locale}>{children}<MobileBookingBar /></LanguageProvider></ThemeProvider><Analytics /></body></html>;
}

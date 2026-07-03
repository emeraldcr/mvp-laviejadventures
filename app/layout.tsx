import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import "./globals.css";

import { LanguageProvider } from "@/lib/LanguageContext";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Vieja Adventures | Ciudad Esmeralda Tour Aventura San Carlos en Rio La Vieja",
  description:
    "La Vieja Adventures | Ciudad Esmeralda Tour Aventura San Carlos en Rio La Vieja y Parque Nacional del Agua Juan Castro Blanco",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${bricolage.variable}`}>
      <body className="antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { LanguageProvider } from "@/app/context/LanguageContext";
import SessionProvider from "@/app/components/SessionProvider";

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
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}

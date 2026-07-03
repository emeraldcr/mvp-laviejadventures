import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda | Gear de aventura · La Vieja Adventures",
  description:
    "Equipo curado por guías de San Carlos para río, cañón y montaña. Pedí por WhatsApp con envío nacional o retiro local. Envío gratis desde $75.",
  openGraph: {
    title: "La Vieja Store · Gear real para aventura",
    description:
      "Mochilas, calzado técnico y esenciales probados en nuestros tours. Checkout humano por WhatsApp.",
    type: "website",
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
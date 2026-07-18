import type { Metadata, Viewport } from "next";
import GrupoJessClient from "./GrupoJessClient";

export const metadata: Metadata = {
  title: "JESS Group | Tienda, academia, eventos y servicio técnico",
  description:
    "Propuesta de sitio web para JESS Group: tienda de instrumentos, academia de artes, producción de eventos, estudio y reparación de audio en Ciudad Quesada, San Carlos.",
  manifest: "/propuestas/grupo-jess/site.webmanifest",
  icons: {
    icon: [{ url: "/propuestas/grupo-jess/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/propuestas/grupo-jess/favicon.svg",
    apple: "/propuestas/grupo-jess/apple-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#070b20",
};

export default function Page() {
  return <GrupoJessClient />;
}

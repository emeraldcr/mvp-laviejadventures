import type { Metadata } from "next";
import PanaderiaSite from "./PanaderiaSite";

export const metadata: Metadata = {
  title: "Panadería Inocente Hidalgo | Tradición en Ciudad Quesada",
  description:
    "Panadería Inocente Hidalgo en Ciudad Quesada, San Carlos. Pan artesanal, repostería, queques y café. Frente al Mercado Municipal, 100 m norte de la Catedral.",
};

export default function PanaderiaProposalPage() {
  return <PanaderiaSite />;
}

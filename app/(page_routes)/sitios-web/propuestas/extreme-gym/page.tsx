import type { Metadata } from "next";
import ExtremeGymSite from "./ExtremeGymSite";

export const metadata: Metadata = {
  title: "Xtreme Gym | Ciudad Quesada, San Carlos — Entrena sin límites",
  description:
    "Xtreme Gym en Ciudad Quesada, San Carlos. Musculación, entrenamiento funcional, clases y planes de membresía. Contiguo a la plaza de deportes, Barrio San Pablo.",
};

export default function ExtremeGymProposalPage() {
  return <ExtremeGymSite />;
}

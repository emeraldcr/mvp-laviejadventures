import { readPublicTours } from "@/lib/tours/public-catalog";
import { ToursClient } from "./ToursClient";

export const dynamic = "force-dynamic";

export default async function ToursPage() {
  const tours = await readPublicTours();
  return <ToursClient tours={tours} />;
}
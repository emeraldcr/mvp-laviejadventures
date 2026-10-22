import { readPublicTours } from "@/lib/tours/catalog/public";
import { ToursClient } from "./ToursClient";

export const revalidate = 300;

export default async function ToursPage() {
  const tours = await readPublicTours();
  return <ToursClient tours={tours} />;
}

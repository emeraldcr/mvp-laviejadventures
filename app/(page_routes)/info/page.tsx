export const dynamic = "force-dynamic";
import InfoClient from "./InfoClient";
import { getPublicTours } from "@/lib/tours/read";

export default async function InfoPage() {
  return <InfoClient tours={await getPublicTours()} />;
}

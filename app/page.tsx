import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import HomeServerFaq from "./home/HomeServerFaq";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = { alternates: { canonical: `${SITE_URL}/` } };

export default function HomePage() {
  return <><HomeClient /><HomeServerFaq /></>;
}

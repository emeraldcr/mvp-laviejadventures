"use client";

import TourWeatherDashboard from "@/app/(page_routes)/tiempo/page";

/** The English route keeps the same live station, river model, charts and safety guidance as /tiempo. */
export default function WeatherEnglish() {
  return <TourWeatherDashboard locale="en" />;
}

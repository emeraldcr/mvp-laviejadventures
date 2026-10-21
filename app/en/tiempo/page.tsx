import { pageMetadata } from "@/lib/seo";
import WeatherEnglish from "./WeatherEnglish";
export const metadata = pageMetadata("/tiempo", "Weather and River Conditions in San Carlos", "Check recent rain readings before your La Vieja River adventure. Local guides confirm the route and departure according to conditions.", "en");
export default function EnglishWeatherPage() { return <WeatherEnglish />; }

import HomeNav from "@/app/components/home/HomeNav";
import HomeServerFaq from "@/app/home/HomeServerFaq";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/preguntas-frecuentes", "Frequently Asked Questions", "How to book, what to bring, payment options and what happens if rain or river conditions affect your tour in San Carlos.", "en");
export default function EnglishFaq() { return <main className="min-h-screen bg-white pt-28 text-stone-900 dark:bg-stone-950 dark:text-white"><HomeNav solid /><h1 className="px-4 text-center text-4xl font-bold">Before your adventure</h1><HomeServerFaq locale="en" /></main>; }

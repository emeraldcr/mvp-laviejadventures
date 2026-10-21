import HomeNav from "@/app/components/home/HomeNav";
import { CircleHelp } from "lucide-react";
import { SITE_FAQS } from "@/lib/site-faqs";
import JsonLd from "@/app/components/seo/JsonLd";

export default function PreguntasFrecuentesPage() {
  const items = SITE_FAQS.es;
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
  return <main className="min-h-screen bg-gradient-to-b from-teal-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900"><HomeNav solid /><JsonLd data={faqSchema} /><section className="mx-auto mt-4 w-full max-w-5xl rounded-3xl border border-teal-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10"><p className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-sm font-semibold text-teal-700 dark:border-teal-800/70 dark:bg-teal-900/20 dark:text-teal-300"><CircleHelp size={16} />Preguntas frecuentes</p><h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">Lo que la gente pregunta de verdad</h1><div className="mt-8 space-y-3">{items.map((item) => <details key={item.question} className="rounded-2xl border border-teal-100 p-5 dark:border-zinc-800"><summary className="cursor-pointer font-bold text-zinc-900 dark:text-white">{item.question}</summary><p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">{item.answer}</p></details>)}</div></section></main>;
}

import { SITE_FAQS } from "@/lib/site-faqs";
import JsonLd from "@/app/components/seo/JsonLd";

export default function HomeServerFaq() {
  const items = SITE_FAQS.es;
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
  return <section className="bg-white px-4 py-10 dark:bg-[#0b0a09]" aria-labelledby="home-faq-heading"><JsonLd data={schema} /><div className="mx-auto max-w-4xl"><h2 id="home-faq-heading" className="font-display text-3xl font-bold text-stone-900 dark:text-white">Preguntas frecuentes</h2><div className="mt-5 space-y-3">{items.map((item) => <details key={item.question} className="rounded-2xl border border-stone-200 p-5 dark:border-stone-800"><summary className="cursor-pointer font-bold text-stone-900 dark:text-white">{item.question}</summary><p className="mt-3 leading-relaxed text-stone-600 dark:text-stone-300">{item.answer}</p></details>)}</div></div></section>;
}

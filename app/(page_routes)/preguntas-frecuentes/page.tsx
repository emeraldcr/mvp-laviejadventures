import SiteHeader from "@/app/components/navigation/SiteHeader";
import PageFooter from "@/app/components/sections/PageFooter";
import { CircleHelp } from "lucide-react";
import { SITE_FAQS } from "@/lib/site-faqs";
import JsonLd from "@/app/components/seo/JsonLd";
import { EditorialFinalCta, EditorialIntro, EditorialTrust } from "@/app/components/layouts/EditorialPageBlocks";

export default function PreguntasFrecuentesPage() {
  const items = SITE_FAQS.es;
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
  return <main className="min-h-screen bg-gradient-to-b from-teal-50 via-zinc-50 to-white px-4 pb-16 pt-24 dark:from-black dark:via-zinc-950 dark:to-zinc-900 md:pt-32"><SiteHeader solid /><JsonLd data={faqSchema} /><div className="mx-auto mt-4 w-full max-w-5xl space-y-6"><EditorialIntro eyebrow="Antes de venir" title="Lo que la gente pregunta de verdad" promise="Respuestas claras para elegir la aventura correcta, llegar preparado y reservar con confianza." primaryHref="/reservar" primaryLabel="Ver fechas y reservar" secondaryHref="/info" secondaryLabel="Conocer La Vieja"><EditorialTrust>Si la lluvia está fuerte o el río viene crecido, la seguridad manda: ajustamos el plan con usted.</EditorialTrust></EditorialIntro><section aria-labelledby="faq-content" className="rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10"><h2 id="faq-content" className="flex items-center gap-2 text-2xl font-black text-zinc-900 dark:text-white"><CircleHelp size={22} className="text-teal-600" />Preguntas frecuentes</h2><div className="mt-6 space-y-3">{items.map((item) => <details key={item.question} className="rounded-2xl border border-teal-100 p-5 dark:border-zinc-800"><summary className="cursor-pointer font-bold text-zinc-900 dark:text-white">{item.question}</summary><p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">{item.answer}</p></details>)}</div></section><EditorialFinalCta title="¿Listo para bajar al río?" body="Elija su tour y fecha; el equipo le confirma la disponibilidad antes de cerrar la reserva." label="Elegir mi aventura" /></div><PageFooter /></main>;
}

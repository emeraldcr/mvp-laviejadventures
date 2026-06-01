"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { principalContent } from "@/lib/constants/principal";

export default function ConversionSection() {
  const { lang } = useLanguage();
  const copy = principalContent[lang].conversion;
  const [activeFaq, setActiveFaq] = useState(0);
  const currentFaq = copy.faqs[activeFaq] ?? copy.faqs[0];

  const goToPreviousFaq = () => {
    setActiveFaq((current) => (current - 1 + copy.faqs.length) % copy.faqs.length);
  };

  const goToNextFaq = () => {
    setActiveFaq((current) => (current + 1) % copy.faqs.length);
  };

  return (
    <section className="relative bg-black py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-300">
            FAQ
          </p>
          <h2 className="text-3xl font-black text-white md:text-5xl">
            {copy.title}
          </h2>
          {copy.subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
              {copy.subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-10 max-w-3xl"
        >
          <article className="min-h-[240px] rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.36)] sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <span className="rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
                {String(activeFaq + 1).padStart(2, "0")} / {String(copy.faqs.length).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPreviousFaq}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/12"
                  aria-label={lang === "es" ? "Pregunta anterior" : "Previous question"}
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={goToNextFaq}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/12"
                  aria-label={lang === "es" ? "Pregunta siguiente" : "Next question"}
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              {currentFaq.question}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
              {currentFaq.answer.replaceAll("**", "")}
            </p>
          </article>

          <div className="mt-5 flex justify-center gap-2">
            {copy.faqs.map((item, index) => (
              <button
                key={item.question}
                type="button"
                onClick={() => setActiveFaq(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeFaq ? "w-8 bg-teal-400" : "w-2 bg-white/25 hover:bg-white/50"
                }`}
                aria-label={`${lang === "es" ? "Ir a pregunta" : "Go to question"} ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
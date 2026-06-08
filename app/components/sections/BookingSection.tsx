"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, ClipboardList } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useCalendarContext } from "@/lib/CalendarContext";
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import { principalContent } from "@/lib/constants/principal";

type Props = {
  selectedTourSlug: string | null;
};

export default function BookingSection({ selectedTourSlug }: Props) {
  const { lang } = useLanguage();
  const { selectedDay, selectDay } = useCalendarContext();
  const copy = principalContent[lang].booking;
  const isDateStep = !selectedDay;

  useEffect(() => {
    selectDay(null);
  }, [selectedTourSlug, selectDay]);

  const changeDateLabel = lang === "es" ? "Cambiar fecha" : "Change date";

  return (
    <section id="booking" className="relative overflow-hidden bg-zinc-950">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 bg-teal-900/15 blur-[140px]" />
      <div className="pointer-events-none absolute left-0 top-40 h-[350px] w-[350px] bg-teal-800/8 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-[350px] w-[350px] bg-cyan-900/8 blur-[120px]" />

      <div className="relative z-10 container mx-auto px-4 py-16 md:px-8 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-teal-400">
            {copy.eyebrow}
          </p>
          <h2 className="mb-4 text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            {copy.title}
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
            {copy.description}
          </p>
          <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-teal-500/25 bg-gradient-to-r from-teal-900/10 via-cyan-900/5 to-teal-900/10 p-5 shadow-[0_18px_50px_rgba(16,185,129,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.24em] text-teal-300">{copy.urgentOfferBadge}</p>
                <h3 className="text-xl font-black text-white sm:text-2xl">{copy.urgentOfferTitle}</h3>
                <p className="mt-2 max-w-2xl text-sm text-zinc-300">{copy.urgentOfferDescription}</p>
              </div>
              <div className="inline-flex items-center gap-3 rounded-full border border-teal-300/40 bg-black/10 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-950/10">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-zinc-950">24h</span>
                <span>{lang === "es" ? "Retén tu lugar ahora" : "Hold your spot now"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-12 flex items-center justify-center gap-3"
        >
          <div className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-colors ${
            isDateStep
              ? "border-teal-500/25 bg-teal-500/12 shadow-[0_0_18px_rgba(20,184,166,0.12)]"
              : "border-teal-400/35 bg-teal-400/10"
          }`}>
            <CalendarDays size={13} className={isDateStep ? "text-teal-400" : "text-teal-300"} />
            <span className={`text-[11px] font-bold uppercase tracking-widest ${isDateStep ? "text-teal-300" : "text-teal-200"}`}>
              {copy.steps.date}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`h-px w-3 ${isDateStep ? "bg-zinc-700" : "bg-teal-500/60"}`} />
            <div className={`h-1.5 w-1.5 rounded-full ${isDateStep ? "bg-zinc-700" : "bg-teal-400"}`} />
            <div className={`h-px w-3 ${isDateStep ? "bg-zinc-700" : "bg-teal-500/60"}`} />
          </div>
          <div className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-colors ${
            isDateStep
              ? "border-zinc-700/60 bg-zinc-800/50"
              : "border-teal-500/25 bg-teal-500/12 shadow-[0_0_18px_rgba(20,184,166,0.12)]"
          }`}>
            <ClipboardList size={13} className={isDateStep ? "text-zinc-500" : "text-teal-400"} />
            <span className={`text-[11px] font-bold uppercase tracking-widest ${isDateStep ? "text-zinc-500" : "text-teal-300"}`}>
              {copy.steps.details}
            </span>
          </div>
        </motion.div>

        {selectedTourSlug ? (
          isDateStep ? (
            <motion.div
              key="booking-calendar"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mx-auto max-w-7xl rounded-3xl border border-white/[0.07] bg-white/[0.025] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm"
            >
              <CalendarSection />
            </motion.div>
          ) : (
            <motion.div
              key="booking-details"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-7xl"
            >
              <div className="mb-4 flex justify-start">
                <button
                  type="button"
                  onClick={() => selectDay(null)}
                  className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-teal-300 transition hover:bg-teal-500/15"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  {changeDateLabel}
                </button>
              </div>
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                <ReservationSection preselectedTourSlug={selectedTourSlug} />
              </div>
            </motion.div>
          )
        ) : (
          <div className="mx-auto max-w-2xl rounded-3xl border border-teal-500/20 bg-teal-500/8 px-6 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.32)]">
            <p className="text-sm font-semibold text-teal-300">
              {lang === "es"
                ? "Primero elegí el tour que querés reservar arriba."
                : "Choose the tour you want to book above first."}
            </p>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}

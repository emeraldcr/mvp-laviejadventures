"use client";

import { Award } from "lucide-react";
import ProposalMock from "./ProposalMock";
import { PROPOSALS, RULES } from "./proposals-data";
import type { Copy, Lang } from "./types";

export default function SignProposals({ lang }: { lang: Lang }) {
  const t = (copy: Copy) => copy[lang];

  return (
    <section className="mt-14 border-t border-white/10 pt-10">
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-300">
        {lang === "es" ? "Propuestas de diseño" : "Design proposals"}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
        {lang === "es"
          ? "Seis formatos probados en carretera"
          : "Six formats proven on the road"}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
        {lang === "es"
          ? "El rótulo que le pasaron funciona por una razón: está dividido en módulos y cada módulo dice una sola cosa. Abajo están ese formato y cinco más que usan los sistemas de señalización del mundo, con la nota de para cuál de sus seis puntos sirve cada uno."
          : "The sign you were sent works for one reason: it is split into modules and each module says exactly one thing. Below is that format plus five more drawn from signage systems around the world, noting which of your six spots each one fits."}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RULES.map((rule) => (
          <div
            key={rule.value}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xl font-black tracking-tight text-emerald-300">{rule.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">{t(rule.text)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {PROPOSALS.map((proposal) => (
          <article
            key={proposal.id}
            className={`flex flex-col overflow-hidden rounded-3xl border bg-zinc-900/60 shadow-xl shadow-black/40 ${
              proposal.recommended ? "border-emerald-300/40" : "border-white/10"
            }`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">
                  {proposal.id} &middot; {proposal.slots}
                </p>
                <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                  {t(proposal.name)}
                </h3>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${
                  proposal.recommended
                    ? "border-emerald-300/50 bg-emerald-400/20 text-emerald-100"
                    : "border-sky-300/40 bg-sky-400/10 text-sky-200"
                }`}
              >
                <Award className="h-3.5 w-3.5" aria-hidden />
                {proposal.recommended
                  ? lang === "es"
                    ? "Recomendado"
                    : "Recommended"
                  : lang === "es"
                    ? "Alternativa oficial"
                    : "Official alternative"}
              </span>
            </div>

            <div className="flex justify-center bg-zinc-950/50 px-5 py-6">
              <ProposalMock variant={proposal.variant} />
            </div>

            <div className="flex flex-1 flex-col gap-3 px-5 py-4">
              <p className="text-sm leading-relaxed text-zinc-300">{t(proposal.why)}</p>
              <ul className="space-y-1.5 border-t border-white/10 pt-3 text-sm text-zinc-400">
                {proposal.specs.map((spec) => (
                  <li key={spec.es} className="flex gap-2">
                    <span className="text-emerald-300">&middot;</span>
                    <span>{t(spec)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto border-t border-white/10 pt-3 text-xs text-zinc-500">
                <span className="font-black uppercase tracking-[0.14em] text-zinc-400">
                  {lang === "es" ? "Se usa en: " : "Used by: "}
                </span>
                {t(proposal.reference)}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-emerald-300/30 bg-emerald-400/10 p-5 md:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-200">
          {lang === "es" ? "Lo que yo haría" : "What I would do"}
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-emerald-50">
          <li>
            <span className="font-black">R-01 · </span>
            {lang === "es"
              ? "Portal de entrada (P-E). Es el único que aguanta foto, QR, teléfonos y redes, porque ahí el carro va lento."
              : "Gateway sign (P-E). The only one that can carry photo, QR, phones and socials, because cars are slow there."}
          </li>
          <li>
            <span className="font-black">R-02 y R-03 · </span>
            {lang === "es"
              ? "Café turístico (P-A), o el formato MOPT de la foto (P-B) si van dentro del derecho de vía. Sin foto, sin QR, sin redes: destino, flecha y distancia."
              : "Brown tourist sign (P-A), or the MOPT format from the photo (P-B) if they sit inside the right-of-way. No photo, no QR, no socials: destination, arrow, distance."}
          </li>
          <li>
            <span className="font-black">R-04 · </span>
            {lang === "es"
              ? "Azul de servicios (P-D). El que anda con hambre lo encuentra sin leer."
              : "Blue service sign (P-D). A hungry driver finds it without reading."}
          </li>
          <li>
            <span className="font-black">R-05 · </span>
            {lang === "es"
              ? "Paletas de madera (P-F). Adentro se camina, no se maneja."
              : "Wooden blades (P-F). Inside people walk, they do not drive."}
          </li>
          <li>
            <span className="font-black">R-06 · </span>
            {lang === "es"
              ? "Flecha mínima (P-C). Tres palabras, una flecha, los kilómetros."
              : "Minimal trailblazer (P-C). Three words, one arrow, the distance."}
          </li>
        </ul>
        <p className="mt-4 border-t border-emerald-200/20 pt-3 text-xs leading-relaxed text-emerald-100/80">
          {lang === "es"
            ? "Dos cosas antes de mandar a hacer nada: rotular dentro del derecho de vía de una ruta nacional requiere permiso del MOPT (Ley General de Caminos Públicos 5060 y el reglamento de publicidad exterior), así que conviene consultarlo; y pida la lámina retrorreflectiva por escrito en la cotización, porque es lo primero que el rotulero abarata."
            : "Two things before ordering anything: signage inside a national route right-of-way needs MOPT approval (Public Roads Act 5060 and the outdoor advertising regulation), so check first; and put the retroreflective sheeting in writing on the quote, because it is the first thing a sign maker cheapens."}
        </p>
      </div>
    </section>
  );
}

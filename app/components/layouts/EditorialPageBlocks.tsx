import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

type EditorialIntroProps = {
  eyebrow: string;
  title: string;
  promise: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  children?: ReactNode;
  dark?: boolean;
};

export function EditorialIntro({
  eyebrow,
  title,
  promise,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  children,
  dark = false,
}: EditorialIntroProps) {
  return (
    <header className={`rounded-[2rem] border p-6 shadow-sm sm:p-8 md:p-10 ${dark
      ? "border-white/10 bg-white/[0.045] text-white"
      : "border-emerald-100 bg-white/90 text-zinc-950 dark:border-white/10 dark:bg-white/[0.045] dark:text-white"}`}>
      <p className={`text-xs font-black uppercase tracking-[0.24em] ${dark ? "text-emerald-300" : "text-emerald-700 dark:text-emerald-300"}`}>
        {eyebrow}
      </p>
      <h1 className="mt-3 max-w-4xl text-balance text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
        {title}
      </h1>
      <p className={`mt-4 max-w-2xl text-base leading-7 sm:text-lg ${dark ? "text-white/70" : "text-zinc-600 dark:text-zinc-300"}`}>
        {promise}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={primaryHref} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
          {primaryLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        {secondaryHref && secondaryLabel && (
          <Link href={secondaryHref} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition ${dark ? "border-white/20 text-white hover:border-white/50 hover:bg-white/10" : "border-zinc-300 text-zinc-800 hover:border-emerald-500 hover:text-emerald-700 dark:border-white/15 dark:text-zinc-100"}`}>
            {secondaryLabel}
          </Link>
        )}
      </div>
      {children}
    </header>
  );
}

export function EditorialTrust({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6 ${dark ? "border-white/10 bg-white/[0.035] text-white/70" : "border-emerald-100 bg-emerald-50/80 text-zinc-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-zinc-300"}`}>
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

export function EditorialFinalCta({ title, body, label, href = "/reservar", dark = false }: { title: string; body: string; label: string; href?: string; dark?: boolean }) {
  return (
    <section className={`rounded-[2rem] border p-6 sm:p-8 ${dark ? "border-emerald-400/20 bg-emerald-400/[0.08] text-white" : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50 dark:border-emerald-900/50 dark:from-emerald-950/40 dark:to-amber-950/20"}`}>
      <h2 className="max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
      <p className={`mt-2 max-w-2xl text-sm leading-6 ${dark ? "text-white/70" : "text-zinc-600 dark:text-zinc-300"}`}>{body}</p>
      <Link href={href} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-500">
        {label}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}

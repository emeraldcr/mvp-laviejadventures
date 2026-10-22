import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

const buttonBase = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lva-focus)] disabled:pointer-events-none disabled:opacity-50";

export function PrimaryButton({ children, href, className = "", ...props }: ButtonProps) {
  const classes = `${buttonBase} bg-[var(--lva-accent-bright)] text-[var(--lva-accent-ink)] shadow-[var(--lva-shadow-accent)] hover:-translate-y-0.5 hover:bg-[var(--lva-accent)] hover:text-white ${className}`;
  return href ? <Link href={href} className={classes}>{children}</Link> : <button {...props} className={classes}>{children}</button>;
}

export function SecondaryButton({ children, href, className = "", ...props }: ButtonProps) {
  const classes = `${buttonBase} border border-[var(--lva-border-strong)] bg-[var(--lva-surface)] text-[var(--lva-ink)] hover:-translate-y-0.5 hover:border-[var(--lva-accent)] hover:text-[var(--lva-accent)] ${className}`;
  return href ? <Link href={href} className={classes}>{children}</Link> : <button {...props} className={classes}>{children}</button>;
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <div className="max-w-3xl">
    {eyebrow && <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--lva-accent)]">{eyebrow}</p>}
    <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--lva-ink)]">{title}</h2>
    {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--lva-ink-muted)]">{description}</p>}
  </div>;
}

export function PageHero({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return <section className="lva-page-hero"><div className="lva-container">
    {eyebrow && <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--lva-accent)]">{eyebrow}</p>}
    <h1 className="font-display text-[clamp(2.25rem,6vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight text-[var(--lva-ink)]">{title}</h1>
    {description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--lva-ink-muted)]">{description}</p>}
    {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
  </div></section>;
}

export function SafetyNotice({ children }: { children: ReactNode }) {
  return <aside className="lva-safety-notice" role="note">{children}</aside>;
}

export function TrustStrip({ children }: { children: ReactNode }) {
  return <div className="lva-trust-strip"><div className="lva-container grid gap-4 sm:grid-cols-3">{children}</div></div>;
}

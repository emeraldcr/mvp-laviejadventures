"use client";

import { ArrowRight } from "lucide-react";

type Props = {
  lang: "es" | "en";
  label: string;
  total: number;
  disabled?: boolean;
  onAction: () => void;
  secondaryLabel?: string;
};

export default function BookingStickyBar({
  lang,
  label,
  total,
  disabled,
  onAction,
  secondaryLabel,
}: Props) {
  const isEs = lang === "es";

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-stone-200 bg-white/95 px-3 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          {secondaryLabel && (
            <p className="truncate text-[11px] font-semibold text-stone-500">{secondaryLabel}</p>
          )}
          <p className="text-sm font-black text-stone-900">
            {isEs ? "Total est." : "Est. total"}{" "}
            <span className="text-emerald-700">${total.toFixed(2)}</span>
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onAction}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {label}
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
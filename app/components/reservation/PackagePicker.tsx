"use client";

import { Check } from "lucide-react";
import type { TourPackageOption } from "@/lib/tours/types";
import { getPackageDisplayName } from "@/lib/booking/packages/pricing";
import { getPackageIncludes } from "@/lib/booking/packages/copy";

type Props = {
  packages: TourPackageOption[];
  selectedPackageId: string;
  hasConfirmedSelection?: boolean;
  onSelect: (packageId: string) => void;
  lang: "es" | "en";
  dateIso?: string;
  isPackageDisabled?: (pkg: TourPackageOption) => boolean;
};

export default function PackagePicker({
  packages,
  selectedPackageId,
  hasConfirmedSelection = false,
  onSelect,
  lang,
  isPackageDisabled,
}: Props) {
  const isEs = lang === "es";

  if (packages.length <= 1) {
    const pkg = packages[0];
    if (!pkg) return null;
    const id = pkg.id ?? pkg.name;
    const disabled = isPackageDisabled?.(pkg) ?? false;
    return (
      <button
        type="button"
        disabled={disabled}
        aria-pressed={hasConfirmedSelection}
        onClick={() => onSelect(id!)}
        className={`flex min-h-32 w-full flex-wrap items-center justify-between gap-4 rounded-3xl border-2 p-5 text-left transition ${
          hasConfirmedSelection
            ? "border-[#00C4B0] bg-[#00C4B0]/10 shadow-lg shadow-[#00C4B0]/10"
            : "border-zinc-200 bg-white hover:border-[#00C4B0] dark:border-zinc-700 dark:bg-zinc-950/40"
        }`}
      >
        <span className="font-black text-zinc-900 dark:text-zinc-100">
          {getPackageDisplayName(pkg, isEs)}
          {disabled && <span className="mt-1 block text-xs text-amber-700">{isEs ? "No disponible esta fecha" : "Not available this date"}</span>}
        </span>
        <span className="text-xl font-black text-[#087d72] dark:text-[#66ddcf]">
          ${pkg.price} / {isEs ? "persona, antes de IVA" : "person, before tax"}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`grid gap-2 ${
        packages.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
      }`}
    >
      {packages.map((pkg) => {
        const id = pkg.id ?? pkg.name;
        const selected = hasConfirmedSelection && selectedPackageId === id;
        const disabled = isPackageDisabled?.(pkg) ?? false;
        const packageIncludes = getPackageIncludes(pkg, isEs);

        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onSelect(id!)}
            className={[
              "relative flex min-h-44 flex-col rounded-3xl border-2 p-5 text-left transition-all",
              disabled
                ? "cursor-not-allowed border-zinc-200 bg-zinc-100 opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
                : selected
                  ? "border-[#00C4B0] bg-[#00C4B0]/10 shadow-lg shadow-[#00C4B0]/15 dark:border-[#00C4B0] dark:bg-[#00C4B0]/10"
                  : "border-zinc-200 bg-white hover:border-[#00C4B0] dark:border-zinc-700 dark:bg-zinc-950/40",
            ].join(" ")}
          >
            {selected && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check size={12} />
              </span>
            )}
            <p className="pr-6 text-lg font-black leading-snug text-zinc-900 dark:text-zinc-50">
              {getPackageDisplayName(pkg, isEs)}
            </p>
            <p className="mt-2 text-2xl font-black text-[#087d72] dark:text-[#66ddcf]">
              ${pkg.price}
              <span className="text-xs font-semibold text-zinc-500"> / {isEs ? "persona, antes de IVA" : "person, before tax"}</span>
            </p>
            {(pkg.descriptionEs || pkg.descriptionEn) && (
              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {isEs ? pkg.descriptionEs ?? pkg.descriptionEn : pkg.descriptionEn ?? pkg.descriptionEs}
              </p>
            )}
            {packageIncludes.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-zinc-200 pt-3 text-xs font-semibold text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                {packageIncludes.slice(0, 3).map((item) => (
                  <li key={item} className="flex gap-1.5">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                    <span className="line-clamp-2">{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {disabled && (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                {isEs ? "No disponible esta fecha" : "Not available this date"}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

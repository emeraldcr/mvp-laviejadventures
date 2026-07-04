"use client";

import { Check } from "lucide-react";
import type { TourPackageOption } from "@/lib/types/index";
import { getPackageDisplayName } from "@/lib/reservation/pricing";

type Props = {
  packages: TourPackageOption[];
  selectedPackageId: string;
  onSelect: (packageId: string) => void;
  lang: "es" | "en";
  dateIso?: string;
  isPackageDisabled?: (pkg: TourPackageOption) => boolean;
};

export default function PackagePicker({
  packages,
  selectedPackageId,
  onSelect,
  lang,
  isPackageDisabled,
}: Props) {
  const isEs = lang === "es";

  if (packages.length <= 1) {
    const pkg = packages[0];
    if (!pkg) return null;
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm dark:border-emerald-800/50 dark:bg-emerald-950/20">
        <span className="font-bold text-emerald-900 dark:text-emerald-200">
          {getPackageDisplayName(pkg, isEs)}
        </span>
        <span className="ml-2 font-black text-emerald-800 dark:text-emerald-300">
          ${pkg.price} / {isEs ? "persona" : "person"}
        </span>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {packages.map((pkg) => {
        const id = pkg.id ?? pkg.name;
        const selected = selectedPackageId === id;
        const disabled = isPackageDisabled?.(pkg) ?? false;

        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(id!)}
            className={[
              "relative rounded-xl border-2 p-3 text-left transition-all",
              disabled
                ? "cursor-not-allowed border-zinc-200 bg-zinc-100 opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
                : selected
                  ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-900/10 dark:border-emerald-500 dark:bg-emerald-950/30"
                  : "border-zinc-200 bg-white hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-950/40",
            ].join(" ")}
          >
            {selected && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check size={12} />
              </span>
            )}
            <p className="pr-6 text-sm font-black text-zinc-900 dark:text-zinc-50">
              {getPackageDisplayName(pkg, isEs)}
            </p>
            <p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-300">
              ${pkg.price}
              <span className="text-xs font-semibold text-zinc-500"> / {isEs ? "pax" : "pax"}</span>
            </p>
            {(pkg.descriptionEs || pkg.descriptionEn) && (
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                {isEs ? pkg.descriptionEs ?? pkg.descriptionEn : pkg.descriptionEn ?? pkg.descriptionEs}
              </p>
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
"use client";

import { useState, type ReactNode } from "react";
import { Sigma, ChevronDown } from "lucide-react";

/** Bloque colapsable "cómo se calcula" — para exponer la matemática sin ruido. */
export function MethodNote({
  title = "Cómo se calcula",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/8 bg-black/25">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <Sigma size={13} className="text-zinc-500" />
        <span className="flex-1 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          {title}
        </span>
        <ChevronDown
          size={13}
          className={`text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-white/8 px-3 py-2.5 text-[11px] leading-5 text-zinc-400 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

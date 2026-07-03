"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { Lang } from "@/lib/LanguageContext";
import { currency, type Product } from "./store-data";

export type CartLine = Product & {
  quantity: number;
  lineTotal: number;
};

type StoreCartProps = {
  lang: Lang;
  cartDetails: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
  whatsappHref: string;
  onClose?: () => void;
  onChangeQuantity: (productId: number, delta: number) => void;
  onRemove: (productId: number) => void;
  variant: "sidebar" | "overlay";
};

export function StoreCart({
  lang,
  cartDetails,
  subtotal,
  shipping,
  total,
  whatsappHref,
  onClose,
  onChangeQuantity,
  onRemove,
  variant,
}: StoreCartProps) {
  const isEs = lang === "es";
  const isOverlay = variant === "overlay";

  const shellClass = isOverlay
    ? "flex max-h-[min(88vh,720px)] w-full flex-col overflow-hidden rounded-t-[1.35rem] border border-emerald-100/15 bg-[linear-gradient(180deg,#041612,#020807)] p-5 shadow-2xl sm:p-6 md:h-full md:max-h-none md:rounded-none md:border-l md:border-t-0"
    : "rounded-[14px] border border-emerald-100/15 bg-black/42 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl";

  return (
    <div className={shellClass}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-teal-300/80">
            {isEs ? "Tu pedido" : "Your order"}
          </p>
          <h2 className="text-xl font-black text-white sm:text-2xl">
            {isEs ? "Carrito" : "Cart"}
            {cartDetails.length > 0 && (
              <span className="ml-2 text-base font-bold text-white/40">
                ({cartDetails.reduce((sum, item) => sum + item.quantity, 0)})
              </span>
            )}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white transition hover:bg-white/10 active:scale-95"
            aria-label={isEs ? "Cerrar carrito" : "Close cart"}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className={`space-y-3 ${isOverlay ? "flex-1 overflow-y-auto pr-1" : ""}`}>
        {cartDetails.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-5 py-10 text-center">
            <ShoppingBag size={22} className="mx-auto mb-3 text-teal-300/80" />
            <p className="font-bold text-white">
              {isEs ? "Todavía vacío, mae" : "Still empty"}
            </p>
            <p className="mt-2 text-sm text-white/45">
              {isEs
                ? "Elegí gear para el río y lo armamos por WhatsApp."
                : "Pick your river gear and we'll sort it on WhatsApp."}
            </p>
          </div>
        ) : (
          cartDetails.map((item) => (
            <article
              key={item.id}
              className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10">
                <Image src={item.image} alt={item.name[lang]} fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-white">{item.name[lang]}</h3>
                    <p className="text-xs text-white/45">{currency.format(item.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="shrink-0 rounded-full border border-white/10 p-1.5 text-white/50 transition hover:bg-white/8 hover:text-white"
                    aria-label={isEs ? "Eliminar producto" : "Remove product"}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-white/10 bg-black/30">
                    <button
                      type="button"
                      onClick={() => onChangeQuantity(item.id, -1)}
                      className="p-2 text-white/70 transition hover:text-white"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="min-w-8 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onChangeQuantity(item.id, 1)}
                      className="p-2 text-white/70 transition hover:text-white"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="text-sm font-black text-teal-300">{currency.format(item.lineTotal)}</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-black/28 p-4">
        <div className="flex items-center justify-between text-sm text-white/55">
          <span>Subtotal</span>
          <span>{currency.format(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-white/55">
          <span>{isEs ? "Envío estimado" : "Est. shipping"}</span>
          <span>{currency.format(shipping)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-black text-white">
          <span>Total</span>
          <span>{currency.format(total)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2.5">
        <a
          href={cartDetails.length > 0 ? whatsappHref : "#catalogo"}
          target={cartDetails.length > 0 ? "_blank" : undefined}
          rel={cartDetails.length > 0 ? "noopener noreferrer" : undefined}
          className="emerald-wave-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-emerald-950 transition hover:bg-amber-300"
        >
          {isEs ? "Pedir por WhatsApp" : "Order on WhatsApp"}
          <ArrowRight size={15} />
        </a>
        <Link
          href="/reservar"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/12 px-4 py-2.5 text-sm font-bold text-white/75 transition hover:border-emerald-200/40 hover:bg-white/6 hover:text-white"
        >
          {isEs ? "Reservar tour primero" : "Book a tour first"}
        </Link>
      </div>
    </div>
  );
}
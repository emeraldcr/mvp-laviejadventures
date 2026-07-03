"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { Lang } from "@/lib/LanguageContext";
import type { StoreCatalogSettings } from "@/lib/hooks/useStoreProducts";
import { currency, formatProductPrice, type Product } from "./store-data";
import { StoreCartUpsell, StoreFreeShippingBar } from "./StoreConversionBlocks";
import { buildSingleProductWhatsAppHref, trackStoreAction } from "./store-conversion";

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
  settings: StoreCatalogSettings;
  upsellProduct?: Product | null;
  featuredProduct?: Product | null;
  onClose?: () => void;
  onChangeQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onUpsellAdd?: (productId: string) => void;
  formatPrice: (product: Pick<Product, "price" | "priceCRC" | "currency">) => string;
  variant: "sidebar" | "overlay";
};

export function StoreCart({
  lang,
  cartDetails,
  subtotal,
  shipping,
  total,
  whatsappHref,
  settings,
  upsellProduct,
  featuredProduct,
  onClose,
  onChangeQuantity,
  onRemove,
  onUpsellAdd,
  formatPrice,
  variant,
}: StoreCartProps) {
  const isEs = lang === "es";
  const isOverlay = variant === "overlay";
  const hasItems = cartDetails.length > 0;

  const shellClass = isOverlay
    ? "flex max-h-[min(88vh,720px)] w-full flex-col overflow-hidden rounded-t-[1.35rem] border border-emerald-100/15 bg-[linear-gradient(180deg,#041612,#020807)] p-5 shadow-2xl sm:p-6 md:h-full md:max-h-none md:rounded-none md:border-l md:border-t-0"
    : "rounded-[14px] border border-emerald-100/15 bg-black/42 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl";

  return (
    <div className={shellClass}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-teal-300/80">
            {isEs ? "Checkout rápido" : "Fast checkout"}
          </p>
          <h2 className="text-xl font-black text-white sm:text-2xl">
            {isEs ? "Tu pedido" : "Your order"}
            {hasItems && (
              <span className="ml-2 text-base font-bold text-white/40">
                ({cartDetails.reduce((sum, item) => sum + item.quantity, 0)})
              </span>
            )}
          </h2>
          <p className="mt-1 text-xs text-white/45">
            {isEs ? "Confirmación humana por WhatsApp en minutos" : "Human WhatsApp confirmation in minutes"}
          </p>
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

      {hasItems && <StoreFreeShippingBar lang={lang} subtotal={subtotal} settings={settings} />}

      {upsellProduct && onUpsellAdd && (
        <StoreCartUpsell lang={lang} product={upsellProduct} onAdd={onUpsellAdd} />
      )}

      <div className={`space-y-3 ${isOverlay ? "flex-1 overflow-y-auto pr-1" : ""}`}>
        {!hasItems ? (
          <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-5 py-10 text-center">
            <ShoppingBag size={22} className="mx-auto mb-3 text-teal-300/80" />
            <p className="font-bold text-white">{isEs ? "Empezá con un favorito" : "Start with a favorite"}</p>
            <p className="mt-2 text-sm text-white/45">
              {isEs
                ? "Elegí gear para el río y cerramos por WhatsApp sin vueltas."
                : "Pick river gear and we'll close your order on WhatsApp."}
            </p>
            <div className="mt-4 flex flex-col items-center gap-2">
              {featuredProduct?.inStock && (
                <a
                  href={buildSingleProductWhatsAppHref(featuredProduct, lang, settings.whatsappPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-black text-white transition hover:bg-[#1ebe5d]"
                >
                  <MessageCircle size={15} />
                  {isEs ? "Pedir favorito por WhatsApp" : "Order favorite on WhatsApp"}
                </a>
              )}
              <a
                href="#catalogo"
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-300 hover:text-teal-200"
              >
                {isEs ? "Ver catálogo" : "Browse catalog"}
                <ArrowRight size={14} />
              </a>
            </div>
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
                    <p className="text-xs text-white/45">{formatPrice(item)}</p>
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
          <span className={shipping === 0 && subtotal > 0 ? "font-bold text-teal-300" : ""}>
            {shipping === 0 && subtotal > 0
              ? isEs
                ? "Gratis"
                : "Free"
              : currency.format(shipping)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-black text-white">
          <span>Total</span>
          <span>{currency.format(total)}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold text-white/45">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1">
          <Clock3 size={11} className="text-teal-300" />
          {isEs ? "Respuesta rápida" : "Fast reply"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1">
          <BadgeCheck size={11} className="text-teal-300" />
          {isEs ? "Stock confirmado" : "Stock confirmed"}
        </span>
      </div>

      <div className="mt-4 grid gap-2.5">
        <a
          href={hasItems ? whatsappHref : "#catalogo"}
          target={hasItems ? "_blank" : undefined}
          rel={hasItems ? "noopener noreferrer" : undefined}
          onClick={() => hasItems && trackStoreAction("cart_whatsapp_click", { items: cartDetails.length, total })}
          className={[
            "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.1em] transition",
            hasItems
              ? "bg-[#25D366] text-white shadow-[0_12px_32px_rgba(37,211,102,0.28)] hover:bg-[#1ebe5d]"
              : "bg-white/10 text-white/50",
          ].join(" ")}
        >
          <MessageCircle size={16} />
          {isEs ? "Confirmar por WhatsApp" : "Confirm on WhatsApp"}
          <ArrowRight size={15} />
        </a>
        <Link
          href="/reservar"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/12 px-4 py-2.5 text-sm font-bold text-white/75 transition hover:border-emerald-200/40 hover:bg-white/6 hover:text-white"
        >
          {isEs ? "¿Primero el tour? Reservar aventura" : "Tour first? Book adventure"}
        </Link>
      </div>
    </div>
  );
}
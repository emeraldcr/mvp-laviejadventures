"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Clock3,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Star,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Lang } from "@/lib/LanguageContext";
import { currency, formatProductPrice, type Product } from "./store-data";
import type { StoreCatalogSettings } from "@/lib/hooks/useStoreProducts";
import { getFreeShippingProgress, trackStoreAction } from "./store-conversion";

export function StoreTrustStrip({ lang }: { lang: Lang }) {
  const isEs = lang === "es";
  return (
    <div className="border-y border-white/8 bg-black/40 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-center text-xs font-semibold text-white/62 md:text-sm">
        <span className="inline-flex items-center gap-1.5">
          <Star size={14} className="fill-amber-300 text-amber-300" />
          4.9 · {isEs ? "+500 aventureros" : "500+ adventurers"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={14} className="text-teal-300" />
          {isEs ? "Respuesta en minutos por WhatsApp" : "WhatsApp reply in minutes"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={14} className="text-teal-300" />
          {isEs ? "Retiro en San Carlos disponible" : "Pickup in San Carlos available"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck size={14} className="text-teal-300" />
          {isEs ? "Equipo curado por guías locales" : "Gear curated by local guides"}
        </span>
      </div>
    </div>
  );
}

export function StoreAddToast({
  lang,
  product,
  whatsappHref,
  onClose,
  onOpenCart,
}: {
  lang: Lang;
  product: Product;
  whatsappHref: string;
  onClose: () => void;
  onOpenCart: () => void;
}) {
  const isEs = lang === "es";

  return (
    <div className="fixed inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-[65] px-3 md:top-24 md:px-4">
      <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-emerald-200/25 bg-[#041612]/95 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="flex items-start gap-3 p-3.5">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10">
            <Image src={product.image} alt={product.name[lang]} fill sizes="56px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-teal-300">
              {isEs ? "Agregado al carrito" : "Added to cart"}
            </p>
            <p className="truncate text-sm font-black text-white">{product.name[lang]}</p>
            <p className="text-xs text-white/50">
              {isEs ? "¿Cerramos ya por WhatsApp?" : "Ready to checkout on WhatsApp?"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-1.5 text-white/50 hover:bg-white/8"
            aria-label={isEs ? "Cerrar" : "Close"}
          >
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-white/8 p-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#1ebe5d]"
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/6 px-3 text-xs font-bold text-white transition hover:bg-white/10"
          >
            <ShoppingBag size={15} />
            {isEs ? "Ver carrito" : "View cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StoreFloatingCartChip({
  lang,
  cartCount,
  total,
  onOpen,
}: {
  lang: Lang;
  cartCount: number;
  total: number;
  onOpen: () => void;
}) {
  if (cartCount <= 0) return null;
  const isEs = lang === "es";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed right-4 top-[calc(4.25rem+env(safe-area-inset-top,0px))] z-40 hidden items-center gap-2 rounded-full border border-emerald-200/30 bg-emerald-400 px-4 py-2.5 text-sm font-black text-emerald-950 shadow-[0_12px_36px_rgba(16,185,129,0.38)] transition hover:bg-amber-300 md:inline-flex lg:top-24"
    >
      <ShoppingBag size={16} />
      {isEs ? "Carrito" : "Cart"} ({cartCount}) · {currency.format(total)}
    </button>
  );
}

export function StoreStickyCheckout({
  lang,
  cartCount,
  subtotal,
  total,
  whatsappHref,
  settings,
  onOpenCart,
}: {
  lang: Lang;
  cartCount: number;
  subtotal: number;
  total: number;
  whatsappHref: string;
  settings: StoreCatalogSettings;
  onOpenCart: () => void;
}) {
  if (cartCount <= 0) return null;
  const isEs = lang === "es";
  const shippingProgress = getFreeShippingProgress(subtotal, settings);

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] z-40 px-3 md:hidden">
      <div className="overflow-hidden rounded-2xl border border-emerald-200/25 bg-[#041612]/95 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        {shippingProgress && !shippingProgress.unlocked && (
          <div className="border-b border-white/8 px-4 py-2 text-center text-[11px] font-bold text-teal-100">
            {isEs
              ? `+${currency.format(shippingProgress.remaining)} para envío gratis`
              : `${currency.format(shippingProgress.remaining)} to free shipping`}
          </div>
        )}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackStoreAction("sticky_whatsapp_click", { cartCount, total })}
          className="flex min-h-12 items-center justify-between gap-3 bg-[#25D366] px-4 py-3.5 text-emerald-950 transition active:scale-[0.99]"
        >
          <span className="flex items-center gap-2 text-sm font-black text-white">
            <MessageCircle size={17} />
            {isEs ? "Pedir por WhatsApp" : "Order on WhatsApp"}
          </span>
          <span className="text-sm font-black text-white">{currency.format(total)}</span>
        </a>
        <button
          type="button"
          onClick={onOpenCart}
          className="flex w-full items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white/65 transition hover:bg-white/5 hover:text-white"
        >
          <ShoppingBag size={14} />
          {isEs ? "Ver detalle del carrito" : "View cart details"} ({cartCount})
        </button>
      </div>
    </div>
  );
}

export function StoreFreeShippingBar({
  lang,
  subtotal,
  settings,
}: {
  lang: Lang;
  subtotal: number;
  settings: StoreCatalogSettings;
}) {
  const progress = getFreeShippingProgress(subtotal, settings);
  if (!progress || subtotal <= 0) return null;
  const isEs = lang === "es";

  return (
    <div className="mb-4 rounded-xl border border-teal-400/20 bg-teal-500/10 p-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs font-bold">
        <span className="inline-flex items-center gap-1.5 text-teal-100">
          <Truck size={14} />
          {progress.unlocked
            ? isEs
              ? "¡Envío estimado gratis!"
              : "Estimated free shipping unlocked!"
            : isEs
              ? `Te faltan ${currency.format(progress.remaining)} para envío gratis`
              : `${currency.format(progress.remaining)} away from free shipping`}
        </span>
        <span className="text-white/45">{Math.round(progress.progress)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/35">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-300 transition-all duration-500"
          style={{ width: `${progress.progress}%` }}
        />
      </div>
    </div>
  );
}

export function StoreCartUpsell({
  lang,
  product,
  onAdd,
}: {
  lang: Lang;
  product: Product;
  onAdd: (id: string) => void;
}) {
  const isEs = lang === "es";
  if (!product.inStock) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-200/20 bg-amber-300/8 p-3">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">
        {isEs ? "Completá tu kit" : "Complete your kit"}
      </p>
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10">
          <Image src={product.image} alt={product.name[lang]} fill sizes="48px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-white">{product.name[lang]}</p>
          <p className="text-xs text-white/50">{formatProductPrice(product)}</p>
        </div>
        <button
          type="button"
          onClick={() => onAdd(product.id)}
          className="shrink-0 rounded-lg bg-emerald-400 px-3 py-2 text-xs font-black text-emerald-950 transition hover:bg-amber-300"
        >
          {isEs ? "+ Agregar" : "+ Add"}
        </button>
      </div>
    </div>
  );
}

export function StoreMiniReviews({ lang }: { lang: Lang }) {
  const isEs = lang === "es";
  const reviews = isEs
    ? [
        {
          name: "María G.",
          tour: "Cañón Ciudad Esmeralda",
          text: "La mochila aguantó todo el rappel y el cruce de río. Pedí por WhatsApp y me confirmaron en 10 min.",
        },
        {
          name: "Jake R.",
          tour: "Pozas Cristalinas",
          text: "Quick WhatsApp checkout, gear showed up ready for wet trails. Solid picks for this area.",
        },
        {
          name: "Andrés M.",
          tour: "Cloud Forest",
          text: "Me armé el kit completo acá. Retiro en San Carlos y pura vida — todo cuadró para el tour.",
        },
      ]
    : [
        {
          name: "María G.",
          tour: "Ciudad Esmeralda Canyon",
          text: "The pack survived rappel and river crossings. WhatsApp order confirmed in 10 minutes.",
        },
        {
          name: "Jake R.",
          tour: "Crystal Pools",
          text: "Quick WhatsApp checkout, gear was ready for wet trails. Great local picks.",
        },
        {
          name: "Andrés M.",
          tour: "Cloud Forest",
          text: "Built my full kit here. San Carlos pickup was easy — perfect for the tour.",
        },
      ];

  return (
    <section className="border-t border-white/8 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.28em] text-teal-300/80">
          {isEs ? "Lo que dicen en campo" : "What adventurers say"}
        </p>
        <h2 className="mb-8 text-center text-2xl font-black text-white md:text-3xl">
          {isEs ? "Gear probado en nuestros tours" : "Gear tested on our tours"}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="rounded-[14px] border border-white/10 bg-black/30 p-5"
            >
              <div className="mb-3 flex items-center gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={12} className="fill-amber-300 text-amber-300" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-white/62">&ldquo;{review.text}&rdquo;</p>
              <p className="mt-4 text-sm font-black text-white">{review.name}</p>
              <p className="text-xs text-teal-300/75">{review.tour}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StoreObjectionFaq({ lang }: { lang: Lang }) {
  const isEs = lang === "es";
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = isEs
    ? [
        {
          q: "¿Cómo compro?",
          a: "Armá el carrito acá y tocá «Pedir por WhatsApp». Allan o Verónica te confirman stock, envío y pago en minutos.",
        },
        {
          q: "¿Envían a todo Costa Rica?",
          a: "Sí, coordinamos envío nacional. También podés retirar en San Carlos si te queda más fácil.",
        },
        {
          q: "¿Qué métodos de pago aceptan?",
          a: "SINPE, transferencia y opciones que acordemos por WhatsApp. Sin enredos.",
        },
        {
          q: "¿Este gear sirve para los tours de La Vieja?",
          a: "Sí, mae. Cada pieza está pensada para río, cañón y clima cambiante de la zona.",
        },
      ]
    : [
        {
          q: "How do I buy?",
          a: "Build your cart here and tap «Order on WhatsApp». Our team confirms stock, shipping, and payment in minutes.",
        },
        {
          q: "Do you ship across Costa Rica?",
          a: "Yes, we coordinate national shipping. Pickup in San Carlos is also available.",
        },
        {
          q: "What payment methods do you accept?",
          a: "SINPE, bank transfer, and options we agree on via WhatsApp.",
        },
        {
          q: "Is this gear good for La Vieja tours?",
          a: "Yes — every piece is chosen for river, canyon, and fast-changing local weather.",
        },
      ];

  return (
    <section className="border-t border-white/8 bg-[#03100d] px-4 py-14 md:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.28em] text-teal-300/80">
          {isEs ? "Sin dudas, sin fricción" : "No friction, no doubts"}
        </p>
        <h2 className="mb-8 text-center text-2xl font-black text-white md:text-3xl">
          {isEs ? "Preguntas antes de pedir" : "Questions before you order"}
        </h2>
        <div className="space-y-2">
          {faqs.map((item, index) => {
            const open = openIndex === index;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-xl border border-white/10 bg-black/30"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                >
                  <span className="font-bold text-white">{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-white/45 transition ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <p className="border-t border-white/8 px-4 pb-4 text-sm leading-relaxed text-white/58">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/preguntas-frecuentes"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-300 transition hover:text-teal-200"
          >
            {isEs ? "Ver más preguntas" : "More FAQs"}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
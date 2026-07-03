"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import SiteFooter from "@/app/components/sections/SiteFooter";
import { useLanguage } from "@/lib/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Backpack,
  Footprints,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Wind,
} from "lucide-react";
import { StoreCart, type CartLine } from "./StoreCart";
import {
  CART_STORAGE_KEY,
  HERO_STRIP,
  currency,
  products,
  type CartItem,
  type Product,
  type ProductCategory,
} from "./store-data";

const categoryMeta: Record<
  ProductCategory,
  { icon: typeof Backpack; es: string; en: string }
> = {
  all: { icon: Sparkles, es: "Todo", en: "All" },
  packs: { icon: Backpack, es: "Mochilas", en: "Packs" },
  footwear: { icon: Footprints, es: "Calzado", en: "Footwear" },
  apparel: { icon: Shirt, es: "Ropa técnica", en: "Apparel" },
  essentials: { icon: Package, es: "Esenciales", en: "Essentials" },
};

const bentoLayout = [
  "md:col-span-2 md:row-span-2",
  "",
  "",
  "md:col-span-2",
  "",
  "",
] as const;

function ProductCard({
  product,
  lang,
  layoutClass,
  onAdd,
}: {
  product: Product;
  lang: "es" | "en";
  layoutClass?: string;
  onAdd: (id: number) => void;
}) {
  const isEs = lang === "es";
  const isFeaturedLayout = layoutClass?.includes("row-span");

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-[14px] border border-white/10 bg-[#07110e] shadow-[0_20px_60px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200/30 hover:shadow-[0_28px_80px_rgba(16,185,129,0.12)]",
        layoutClass ?? "",
      ].join(" ")}
    >
      <div className={`relative overflow-hidden ${isFeaturedLayout ? "min-h-[320px] md:min-h-full md:h-full" : "h-56 md:h-60"}`}>
        <Image
          src={product.image}
          alt={product.name[lang]}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,7,0.05),rgba(2,8,7,0.22)_38%,rgba(2,8,7,0.94))]" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-amber-200/25 bg-amber-300/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-100 backdrop-blur-md">
            {product.tag[lang]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur-md">
            <Star size={10} className="fill-amber-300 text-amber-300" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAdd(product.id)}
          className="emerald-wave-button absolute bottom-3 right-3 hidden items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-950 opacity-0 transition duration-300 group-hover:opacity-100 md:inline-flex"
        >
          <ShoppingBag size={14} />
          {isEs ? "Agregar" : "Add"}
        </button>
      </div>

      <div className={`space-y-3 p-4 ${isFeaturedLayout ? "md:p-5" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-teal-300/75">
              {product.useCase[lang]}
            </p>
            <h3 className={`font-black leading-tight text-white ${isFeaturedLayout ? "text-2xl md:text-3xl" : "text-lg"}`}>
              {product.name[lang]}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
              {isEs ? "Desde" : "From"}
            </p>
            <p className={`font-black text-teal-300 ${isFeaturedLayout ? "text-2xl" : "text-xl"}`}>
              {currency.format(product.price)}
            </p>
          </div>
        </div>

        <p className={`leading-relaxed text-white/58 ${isFeaturedLayout ? "text-sm md:text-base" : "line-clamp-2 text-sm"}`}>
          {product.description[lang]}
        </p>

        <button
          type="button"
          onClick={() => onAdd(product.id)}
          className="emerald-wave-button inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-emerald-200/20 bg-emerald-300/10 px-4 py-3 text-sm font-black text-emerald-50 transition hover:bg-emerald-300/18 md:hidden"
        >
          <ShoppingBag size={15} />
          {isEs ? "Agregar al carrito" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

export default function StorePage() {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("all");
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!cartOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [cartOpen]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const featuredProduct = products.find((product) => product.featured) ?? products[0];

  const cartDetails = useMemo<CartLine[]>(() => {
    return cart
      .map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product) return null;
        return {
          ...product,
          quantity: item.quantity,
          lineTotal: item.quantity * product.price,
        };
      })
      .filter((item): item is CartLine => Boolean(item));
  }, [cart]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const subtotal = useMemo(
    () => cartDetails.reduce((total, item) => total + item.lineTotal, 0),
    [cartDetails],
  );

  const shipping = subtotal > 0 ? 12 : 0;
  const total = subtotal + shipping;

  const whatsappMessage = encodeURIComponent(
    `${
      isEs
        ? "Hola La Vieja Adventures, quiero pedir este equipo de la tienda:"
        : "Hi La Vieja Adventures, I'd like to order this gear from the store:"
    }\n${cartDetails.map((item) => `• ${item.name[lang]} x${item.quantity}`).join("\n")}\n${
      isEs ? "Total estimado" : "Estimated total"
    }: ${currency.format(total)}`,
  );

  const whatsappHref = `https://wa.me/50662332535?text=${whatsappMessage}`;

  const addToCart = (productId: number) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const changeQuantity = (productId: number, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020807] text-white">
      <DynamicHeroHeader showHeroSlider={false} />

      {/* ── Hero editorial ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/8 pt-24 md:pt-28">
        <div className="absolute inset-0">
          <Image
            src={featuredProduct.image}
            alt={featuredProduct.name[lang]}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(2,8,7,0.97),rgba(2,8,7,0.82)_42%,rgba(2,8,7,0.55)),linear-gradient(180deg,rgba(2,8,7,0.55),rgba(2,8,7,0.98))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(16,185,129,0.22),transparent_36%),linear-gradient(90deg,rgba(94,234,212,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-end lg:py-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100/25 bg-black/35 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.28em] text-teal-50 backdrop-blur-xl">
              <MapPin size={12} className="text-emerald-300" />
              San Carlos · Costa Rica
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-balance font-black leading-[0.9] text-white text-[clamp(2.4rem,8vw,5.2rem)]">
                {isEs ? "Equipo real para el río y el cañón." : "Real gear for river and canyon."}
              </h1>
              <p className="max-w-2xl text-base font-semibold leading-relaxed text-white/68 md:text-lg">
                {isEs
                  ? "Mochilas, calzado y capas curadas por el equipo de La Vieja para senderos húmedos, pozas cristalinas y clima que cambia rápido. Pedí por carrito y cerramos por WhatsApp."
                  : "Packs, footwear, and layers curated by the La Vieja crew for wet trails, crystal pools, and fast-changing weather. Build your cart and checkout on WhatsApp."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#catalogo"
                className="emerald-wave-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 py-3.5 text-sm font-black uppercase tracking-[0.16em] text-emerald-950 shadow-[0_16px_44px_rgba(16,185,129,0.35)] transition hover:bg-amber-300"
              >
                {isEs ? "Ver catálogo" : "Browse catalog"}
                <ArrowRight size={15} />
              </a>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/18 bg-white/6 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xl transition hover:border-emerald-200/40 hover:bg-white/10"
              >
                <ShoppingBag size={16} />
                {isEs ? "Carrito" : "Cart"}
                <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs font-black text-teal-200">
                  {cartCount}
                </span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: isEs ? "Curado en campo" : "Field-tested",
                  text: isEs ? "Piezas pensadas para nuestros tours." : "Pieces chosen for our own tours.",
                },
                {
                  icon: Wind,
                  title: isEs ? "Clima San Carlos" : "San Carlos weather",
                  text: isEs ? "Listo para lluvia, río y montaña." : "Ready for rain, river, and mountain.",
                },
                {
                  icon: MessageCircle,
                  title: isEs ? "Checkout humano" : "Human checkout",
                  text: isEs ? "Confirmás stock y envío por WhatsApp." : "Confirm stock and shipping on WhatsApp.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-[10px] border border-white/10 bg-black/32 p-4 backdrop-blur-md"
                >
                  <Icon size={16} className="mb-2 text-teal-300" />
                  <p className="text-sm font-black text-white">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="overflow-hidden rounded-[14px] border border-emerald-100/20 bg-black/45 shadow-[0_36px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
              <div className="relative h-72">
                <Image
                  src={featuredProduct.image}
                  alt={featuredProduct.name[lang]}
                  fill
                  sizes="480px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(2,8,7,0.92))]" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">
                    {featuredProduct.tag[lang]}
                  </p>
                  <h2 className="mt-1 text-2xl font-black">{featuredProduct.name[lang]}</h2>
                  <p className="mt-2 text-sm text-white/60">{featuredProduct.description[lang]}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-black text-teal-300">
                      {currency.format(featuredProduct.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(featuredProduct.id)}
                      className="emerald-wave-button rounded-full bg-emerald-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-950 transition hover:bg-amber-300"
                    >
                      {isEs ? "Agregar" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/8 bg-black/35 py-3 backdrop-blur-md">
          <div
            className="flex gap-3 px-3"
            style={{ animation: "lva-store-marquee 48s linear infinite" }}
          >
            {[...HERO_STRIP, ...HERO_STRIP].map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="relative h-24 w-36 shrink-0 overflow-hidden rounded-[10px] border border-white/8 md:h-28 md:w-44"
              >
                <Image src={src} alt="" fill sizes="176px" className="object-cover opacity-70" />
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes lva-store-marquee {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </section>

      {/* ── Catálogo ─────────────────────────────────────────────────────── */}
      <section id="catalogo" className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-teal-300/85">
              {isEs ? "Catálogo curado" : "Curated catalog"}
            </p>
            <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
              {isEs ? "Gear con alma de aventura local" : "Gear with local adventure soul"}
            </h2>
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
            {(Object.keys(categoryMeta) as ProductCategory[]).map((category) => {
              const { icon: Icon } = categoryMeta[category];
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition active:scale-95",
                    active
                      ? "bg-emerald-400 text-emerald-950 shadow-[0_8px_24px_rgba(16,185,129,0.28)]"
                      : "border border-white/12 bg-white/[0.04] text-white/70 hover:border-emerald-200/30 hover:bg-white/8 hover:text-white",
                  ].join(" ")}
                >
                  <Icon size={15} />
                  {isEs ? categoryMeta[category].es : categoryMeta[category].en}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid auto-rows-fr gap-4 md:grid-cols-2 md:gap-5">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                layoutClass={activeCategory === "all" ? bentoLayout[index] : undefined}
                onAdd={addToCart}
              />
            ))}
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <StoreCart
                lang={lang}
                cartDetails={cartDetails}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                whatsappHref={whatsappHref}
                onChangeQuantity={changeQuantity}
                onRemove={removeFromCart}
                variant="sidebar"
              />
            </div>
          </aside>
        </div>
      </section>

      {/* ── CTA tours ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/8 bg-[linear-gradient(180deg,#03100d,#020807)] px-4 py-14 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center rounded-[14px] border border-emerald-100/15 bg-black/35 px-6 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:px-10">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-teal-300/80">
            {isEs ? "Siguiente paso" : "Next step"}
          </p>
          <h2 className="max-w-2xl text-balance text-2xl font-black text-white md:text-3xl">
            {isEs
              ? "¿Ya tenés el gear? Ahora reservá la aventura."
              : "Got your gear? Now book the adventure."}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
            {isEs
              ? "Cañón, pozas o bosque nuboso — elegí el tour y nosotros te guiamos con pura vida y seguridad primero."
              : "Canyon, pools, or cloud forest — pick your tour and we'll guide you safely."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/reservar"
              className="emerald-wave-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 py-3 text-sm font-black uppercase tracking-[0.14em] text-emerald-950 transition hover:bg-amber-300"
            >
              {isEs ? "Reservar tour" : "Book a tour"}
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/tours"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-7 py-3 text-sm font-bold text-white/80 transition hover:border-emerald-200/35 hover:text-white"
            >
              {isEs ? "Ver experiencias" : "View experiences"}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* ── Mobile cart bar ────────────────────────────────────────────────── */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] z-40 px-3 md:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="emerald-wave-button flex w-full items-center justify-between rounded-2xl border border-emerald-200/25 bg-emerald-400 px-4 py-3.5 text-left shadow-[0_12px_40px_rgba(16,185,129,0.35)] transition active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 text-sm font-black text-emerald-950">
              <ShoppingBag size={16} />
              {isEs ? "Ver carrito" : "View cart"} ({cartCount})
            </span>
            <span className="text-sm font-black text-emerald-950">{currency.format(total)}</span>
          </button>
        </div>
      )}

      {/* ── Cart drawer / sheet ────────────────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-black/65 backdrop-blur-[3px]"
            aria-label={isEs ? "Cerrar carrito" : "Close cart"}
          />
          <div className="absolute inset-x-0 bottom-0 flex md:inset-y-0 md:left-auto md:right-0 md:w-full md:max-w-md">
            <StoreCart
              lang={lang}
              cartDetails={cartDetails}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
              whatsappHref={whatsappHref}
              onClose={() => setCartOpen(false)}
              onChangeQuantity={changeQuantity}
              onRemove={removeFromCart}
              variant="overlay"
            />
          </div>
        </div>
      )}
    </main>
  );
}
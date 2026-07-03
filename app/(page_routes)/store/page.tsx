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
  Droplets,
  Footprints,
  LifeBuoy,
  MapPin,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Tent,
  Watch,
  Wind,
  X,
} from "lucide-react";
import { useStoreProducts } from "@/lib/hooks/useStoreProducts";
import { StoreCart, type CartLine } from "./StoreCart";
import {
  StoreAddToast,
  StoreFloatingCartChip,
  StoreMiniReviews,
  StoreObjectionFaq,
  StoreStickyCheckout,
  StoreTrustStrip,
} from "./StoreConversionBlocks";
import {
  buildCartWhatsAppHref,
  buildSingleProductWhatsAppHref,
  computeShipping,
  filterProductsByQuery,
  getMinProductPrice,
  isLowStock,
  trackStoreAction,
} from "./store-conversion";
import {
  CART_STORAGE_KEY,
  HERO_STRIP,
  currency,
  formatProductPrice,
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
  hydration: { icon: Droplets, es: "Hidratación", en: "Hydration" },
  safety: { icon: LifeBuoy, es: "Seguridad", en: "Safety" },
  camping: { icon: Tent, es: "Camping", en: "Camping" },
  accessories: { icon: Watch, es: "Accesorios", en: "Accessories" },
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
  whatsappHref,
  onAdd,
}: {
  product: Product;
  lang: "es" | "en";
  layoutClass?: string;
  whatsappHref: string;
  onAdd: (id: string) => void;
}) {
  const isEs = lang === "es";
  const isFeaturedLayout = layoutClass?.includes("row-span");
  const canAdd = product.inStock;
  const lowStock = isLowStock(product);

  return (
    <article
      id={`product-${product.slug}`}
      className={[
        "group relative scroll-mt-28 overflow-hidden rounded-[14px] border border-white/10 bg-[#07110e] shadow-[0_20px_60px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200/30 hover:shadow-[0_28px_80px_rgba(16,185,129,0.12)]",
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
          {product.brand && (
            <span className="rounded-full border border-white/25 bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
              {product.brand}
            </span>
          )}
          {product.featured && (
            <span className="rounded-full border border-teal-300/30 bg-teal-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-teal-100 backdrop-blur-md">
              {isEs ? "Top ventas" : "Best seller"}
            </span>
          )}
          <span className="rounded-full border border-amber-200/25 bg-amber-300/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-100 backdrop-blur-md">
            {product.tag[lang]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur-md">
            <Star size={10} className="fill-amber-300 text-amber-300" />
            {product.rating.toFixed(1)}
          </span>
          {lowStock && (
            <span className="rounded-full border border-orange-300/35 bg-orange-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-orange-100 backdrop-blur-md">
              {isEs ? `Quedan ${product.stockCount}` : `${product.stockCount} left`}
            </span>
          )}
        </div>

        {!product.inStock && (
          <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/70">
            {isEs ? "Consultar stock" : "Check stock"}
          </span>
        )}
      </div>

      <div className={`space-y-3 p-4 ${isFeaturedLayout ? "md:p-5" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-teal-300/75">
              {product.brand ? `${product.brand} · ` : ""}
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
              {formatProductPrice(product)}
            </p>
          </div>
        </div>

        <p className={`leading-relaxed text-white/58 ${isFeaturedLayout ? "text-sm md:text-base" : "line-clamp-2 text-sm"}`}>
          {product.description[lang]}
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.2fr_0.8fr]">
          <a
            href={canAdd ? whatsappHref : "#catalogo"}
            target={canAdd ? "_blank" : undefined}
            rel={canAdd ? "noopener noreferrer" : undefined}
            onClick={() => trackStoreAction("product_whatsapp_click", { productId: product.id, slug: product.slug })}
            className={[
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-4 py-3 text-sm font-black transition",
              canAdd
                ? "bg-[#25D366] text-white hover:bg-[#1ebe5d]"
                : "cursor-not-allowed bg-white/8 text-white/40",
            ].join(" ")}
          >
            <MessageCircle size={15} />
            {canAdd
              ? isEs
                ? "Pedir por WhatsApp"
                : "Order on WhatsApp"
              : isEs
                ? "Consultar stock"
                : "Check stock"}
          </a>
          <button
            type="button"
            onClick={() => onAdd(product.id)}
            disabled={!canAdd}
            className="emerald-wave-button inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-emerald-200/20 bg-emerald-300/10 px-4 py-3 text-sm font-black text-emerald-50 transition hover:bg-emerald-300/18 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag size={15} />
            {isEs ? "+ Carrito" : "+ Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function StorePage() {
  const { lang } = useLanguage();
  const isEs = lang === "es";
  const { products, settings, loading, error } = useStoreProducts();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
  const [toastProduct, setToastProduct] = useState<Product | null>(null);

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

  useEffect(() => {
    if (products.length === 0) return;
    setCart((current) =>
      current.filter((item) => products.some((product) => product.id === item.productId)),
    );
  }, [products]);

  useEffect(() => {
    trackStoreAction("page_view");
  }, []);

  useEffect(() => {
    if (!toastProduct) return;
    const timer = window.setTimeout(() => setToastProduct(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toastProduct]);

  const availableCategories = useMemo(() => {
    const counts = new Map<ProductCategory, number>([["all", products.length]]);
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const byCategory =
      activeCategory === "all"
        ? products
        : products.filter((product) => product.category === activeCategory);
    return filterProductsByQuery(byCategory, searchQuery, lang);
  }, [activeCategory, products, searchQuery, lang]);

  const featuredProduct =
    products.find((product) => product.featured) ?? products[0] ?? null;

  const galleryStrip = useMemo(() => {
    const fromDb = products.map((product) => product.image).filter(Boolean);
    return fromDb.length > 0 ? fromDb : HERO_STRIP;
  }, [products]);

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
  }, [cart, products]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const subtotal = useMemo(
    () => cartDetails.reduce((total, item) => total + item.lineTotal, 0),
    [cartDetails],
  );

  const shipping = computeShipping(subtotal, settings);
  const total = subtotal + shipping;
  const minPrice = getMinProductPrice(products);
  const whatsappHref = buildCartWhatsAppHref(cartDetails, total, lang, settings.whatsappPhone);

  const upsellProduct = useMemo(() => {
    const inCart = new Set(cart.map((item) => item.productId));
    return (
      products.find((product) => product.featured && !inCart.has(product.id) && product.inStock) ??
      products.find((product) => !inCart.has(product.id) && product.inStock) ??
      null
    );
  }, [cart, products]);

  const addToCart = (productId: string) => {
    const product = products.find((entry) => entry.id === productId);
    if (!product?.inStock) return;

    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
    setToastProduct(product);
    trackStoreAction("add_to_cart", { productId, slug: product.slug });
  };

  const changeQuantity = (productId: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const heroImage = featuredProduct?.image ?? HERO_STRIP[0];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020807] text-white">
      <DynamicHeroHeader showHeroSlider={false} />

      {/* ── Hero editorial ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/8 pt-24 md:pt-28">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={featuredProduct?.name[lang] ?? "La Vieja Store"}
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
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-100">
                <Star size={12} className="fill-amber-300 text-amber-300" />
                {isEs ? "4.9 · +500 aventureros confían en nosotros" : "4.9 · 500+ adventurers trust us"}
              </div>
              <h1 className="max-w-3xl text-balance font-black leading-[0.9] text-white text-[clamp(2.4rem,8vw,5.2rem)]">
                {isEs ? "Equipo real para el río y el cañón." : "Real gear for river and canyon."}
              </h1>
              <p className="max-w-2xl text-base font-semibold leading-relaxed text-white/68 md:text-lg">
                {isEs
                  ? "Nike, Adidas Terrex, Hi-Tec, Patagonia, Columbia y más marcas de montaña disponibles en Costa Rica, curadas por guías de La Vieja para senderos húmedos, pozas y clima cambiante. Pedí en 1 toque por WhatsApp o armá carrito — te confirmamos hoy."
                  : "Nike, Adidas Terrex, Hi-Tec, Patagonia, Columbia, and more mountain brands available in Costa Rica, curated by La Vieja guides for wet trails, pools, and changing weather. One-tap WhatsApp order or build a cart — we confirm today."}
              </p>
              {minPrice != null && (
                <p className="text-sm font-black text-teal-300">
                  {isEs ? "Desde" : "From"} {currency.format(minPrice)}
                  {settings.freeShippingThresholdUSD > 0 && (
                    <span className="ml-2 font-semibold text-white/45">
                      · {isEs ? "Envío gratis desde" : "Free shipping from"}{" "}
                      {currency.format(settings.freeShippingThresholdUSD)}
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {featuredProduct && featuredProduct.inStock ? (
                <a
                  href={buildSingleProductWhatsAppHref(featuredProduct, lang, settings.whatsappPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackStoreAction("hero_whatsapp_click", { productId: featuredProduct.id })}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_44px_rgba(37,211,102,0.32)] transition hover:bg-[#1ebe5d]"
                >
                  <MessageCircle size={16} />
                  {isEs ? "Pedir favorito por WhatsApp" : "Order favorite on WhatsApp"}
                </a>
              ) : (
                <a
                  href="#catalogo"
                  className="emerald-wave-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 py-3.5 text-sm font-black uppercase tracking-[0.16em] text-emerald-950 shadow-[0_16px_44px_rgba(16,185,129,0.35)] transition hover:bg-amber-300"
                >
                  {isEs ? "Ver catálogo" : "Browse catalog"}
                  <ArrowRight size={15} />
                </a>
              )}
              <a
                href="#catalogo"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/18 bg-white/6 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xl transition hover:border-emerald-200/40 hover:bg-white/10"
              >
                {isEs ? "Ver todo el catálogo" : "View full catalog"}
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

          {featuredProduct && (
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
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <a
                        href={buildSingleProductWhatsAppHref(featuredProduct, lang, settings.whatsappPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-[#1ebe5d]"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => addToCart(featuredProduct.id)}
                        disabled={!featuredProduct.inStock}
                        className="emerald-wave-button rounded-full bg-emerald-400 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isEs ? "+ Carrito" : "+ Cart"}
                      </button>
                    </div>
                    <p className="mt-3 text-lg font-black text-teal-300">{formatProductPrice(featuredProduct)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative border-t border-white/8 bg-black/35 py-3 backdrop-blur-md">
          <div
            className="flex gap-3 px-3"
            style={{ animation: "lva-store-marquee 48s linear infinite" }}
          >
            {[...galleryStrip, ...galleryStrip].map((src, index) => (
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

      <StoreTrustStrip lang={lang} />

      {featuredProduct && (
        <section className="border-b border-white/8 px-4 py-5 lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3 rounded-[14px] border border-emerald-100/15 bg-black/40 p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image src={featuredProduct.image} alt={featuredProduct.name[lang]} fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-200">
                {featuredProduct.tag[lang]}
              </p>
              <p className="truncate font-black text-white">{featuredProduct.name[lang]}</p>
              <p className="text-sm font-black text-teal-300">{formatProductPrice(featuredProduct)}</p>
            </div>
            <a
              href={buildSingleProductWhatsAppHref(featuredProduct, lang, settings.whatsappPhone)}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-black text-white"
            >
              WhatsApp
            </a>
          </div>
        </section>
      )}

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

          <div className="flex w-full flex-col gap-3 lg:max-w-xl">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={isEs ? "Buscar gear, marca o uso..." : "Search gear, brand, or use case..."}
                className="w-full rounded-full border border-white/12 bg-white/[0.05] py-3 pl-11 pr-10 text-sm font-semibold text-white placeholder:text-white/35 outline-none transition focus:border-emerald-200/35 focus:bg-white/[0.08]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:bg-white/8 hover:text-white"
                  aria-label={isEs ? "Limpiar búsqueda" : "Clear search"}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
              {(Object.keys(categoryMeta) as ProductCategory[])
                .filter((category) => category === "all" || (availableCategories.get(category) ?? 0) > 0)
                .map((category) => {
                  const { icon: Icon } = categoryMeta[category];
                  const active = activeCategory === category;
                  const count = availableCategories.get(category) ?? 0;
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
                      <span className={`text-xs ${active ? "text-emerald-900/70" : "text-white/35"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-[14px] border border-red-400/25 bg-red-500/10 px-5 py-4 text-sm text-red-100">
            {isEs
              ? "No pudimos cargar el catálogo desde la base de datos."
              : "We could not load the catalog from the database."}{" "}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-bold underline underline-offset-4"
            >
              {isEs ? "Reintentar" : "Retry"}
            </button>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid auto-rows-fr gap-4 md:grid-cols-2 md:gap-5">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="h-[360px] animate-pulse rounded-[14px] border border-white/8 bg-white/[0.04]"
                  />
                ))
              : filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    lang={lang}
                    layoutClass={activeCategory === "all" ? bentoLayout[index] : undefined}
                    whatsappHref={buildSingleProductWhatsAppHref(product, lang, settings.whatsappPhone)}
                    onAdd={addToCart}
                  />
                ))}
            {!loading && filteredProducts.length === 0 && (
              <div className="md:col-span-2 rounded-[14px] border border-dashed border-white/12 bg-white/[0.03] px-6 py-14 text-center text-white/55">
                {searchQuery
                  ? isEs
                    ? `No encontramos resultados para «${searchQuery}».`
                    : `No results for "${searchQuery}".`
                  : isEs
                    ? "No hay productos en esta categoría por ahora."
                    : "No products in this category right now."}
                {(searchQuery || activeCategory !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                    className="mt-4 text-sm font-bold text-teal-300 hover:text-teal-200"
                  >
                    {isEs ? "Ver todo el catálogo" : "View full catalog"}
                  </button>
                )}
              </div>
            )}
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
                settings={settings}
                upsellProduct={upsellProduct}
                featuredProduct={featuredProduct}
                onChangeQuantity={changeQuantity}
                onRemove={removeFromCart}
                onUpsellAdd={addToCart}
                formatPrice={formatProductPrice}
                variant="sidebar"
              />
            </div>
          </aside>
        </div>
      </section>

      <StoreMiniReviews lang={lang} />

      <StoreObjectionFaq lang={lang} />

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

      <StoreFloatingCartChip
        lang={lang}
        cartCount={cartCount}
        total={total}
        onOpen={() => setCartOpen(true)}
      />

      {!cartOpen && (
        <StoreStickyCheckout
          lang={lang}
          cartCount={cartCount}
          subtotal={subtotal}
          total={total}
          whatsappHref={whatsappHref}
          settings={settings}
          onOpenCart={() => setCartOpen(true)}
        />
      )}

      {toastProduct && (
        <StoreAddToast
          lang={lang}
          product={toastProduct}
          whatsappHref={buildSingleProductWhatsAppHref(toastProduct, lang, settings.whatsappPhone)}
          onClose={() => setToastProduct(null)}
          onOpenCart={() => {
            setToastProduct(null);
            setCartOpen(true);
          }}
        />
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
              settings={settings}
              upsellProduct={upsellProduct}
              featuredProduct={featuredProduct}
              onClose={() => setCartOpen(false)}
              onChangeQuantity={changeQuantity}
              onRemove={removeFromCart}
              onUpsellAdd={addToCart}
              formatPrice={formatProductPrice}
              variant="overlay"
            />
          </div>
        </div>
      )}
    </main>
  );
}
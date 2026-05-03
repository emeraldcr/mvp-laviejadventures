"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Backpack,
  BadgeCheck,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  TentTree,
  Trash2,
} from "lucide-react";

type ProductCategory = "all" | "packs" | "footwear" | "apparel" | "essentials";

type Product = {
  id: number;
  category: Exclude<ProductCategory, "all">;
  image: string;
  price: number;
  rating: number;
  tag: { es: string; en: string };
  name: { es: string; en: string };
  description: { es: string; en: string };
};

type CartItem = {
  productId: number;
  quantity: number;
};

const products: Product[] = [
  {
    id: 1,
    category: "packs",
    image: "/image/IMG_6814.jpg",
    price: 89,
    rating: 4.9,
    tag: { es: "Top seller", en: "Top seller" },
    name: { es: "Backpack Canyon 28L", en: "Canyon Backpack 28L" },
    description: {
      es: "Mochila ligera con soporte lumbar, funda impermeable y acceso rapido para senderos largos.",
      en: "Lightweight backpack with lumbar support, rain cover, and quick-access storage for long trail days.",
    },
  },
  {
    id: 2,
    category: "footwear",
    image: "/image/IMG_5592.jpg",
    price: 124,
    rating: 4.8,
    tag: { es: "Trail ready", en: "Trail ready" },
    name: { es: "Botas Rio Grip", en: "River Grip Boots" },
    description: {
      es: "Botas de aventura con traccion profunda, secado rapido y refuerzo frontal para terreno humedo.",
      en: "Adventure boots with deep traction, quick-dry panels, and reinforced toe protection for wet terrain.",
    },
  },
  {
    id: 3,
    category: "apparel",
    image: "/image/IMG_6810.jpg",
    price: 52,
    rating: 4.7,
    tag: { es: "Nuevo drop", en: "New drop" },
    name: { es: "Capa StormShell", en: "StormShell Layer" },
    description: {
      es: "Capa exterior respirable para lluvia tropical, empacable y lista para cambios de clima rapidos.",
      en: "Breathable outer shell for tropical rain, packable and built for quick weather shifts.",
    },
  },
  {
    id: 4,
    category: "essentials",
    image: "/image/IMG_6806.jpg",
    price: 36,
    rating: 4.9,
    tag: { es: "Travel pick", en: "Travel pick" },
    name: { es: "Kit Explorer", en: "Explorer Kit" },
    description: {
      es: "Botella termica, dry bag y multi-tool basico para mantenerte listo durante toda la aventura.",
      en: "Thermal bottle, dry bag, and a compact multi-tool so you're ready for the whole adventure.",
    },
  },
  {
    id: 5,
    category: "footwear",
    image: "/image/IMG_4523.jpg",
    price: 74,
    rating: 4.6,
    tag: { es: "Ultralight", en: "Ultralight" },
    name: { es: "Sandalia Jungle Flow", en: "Jungle Flow Sandal" },
    description: {
      es: "Sandalia anfibia para agua y roca con agarre flexible y correas de ajuste rapido.",
      en: "Amphibious sandal for water and rock with flexible grip and quick-adjust straps.",
    },
  },
  {
    id: 6,
    category: "packs",
    image: "/image/IMG_4672.jpg",
    price: 58,
    rating: 4.8,
    tag: { es: "Crew favorite", en: "Crew favorite" },
    name: { es: "Hip Pack Sendero", en: "Trail Hip Pack" },
    description: {
      es: "Rinonera tecnica para celular, snacks y documentos con tela repelente al agua.",
      en: "Technical hip pack for phone, snacks, and travel docs with water-resistant fabric.",
    },
  },
];

const cartStorageKey = "lavieja-store-cart";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function StorePage() {
  const { lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("all");
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(cartStorageKey);
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }, [cart]);

  const categoryLabels: Record<ProductCategory, string> = {
    all: lang === "es" ? "Todo" : "All",
    packs: lang === "es" ? "Mochilas" : "Packs",
    footwear: lang === "es" ? "Calzado" : "Footwear",
    apparel: lang === "es" ? "Ropa tecnica" : "Apparel",
    essentials: lang === "es" ? "Esenciales" : "Essentials",
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const cartDetails = useMemo(() => {
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
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [cart]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cartDetails.reduce((total, item) => total + item.lineTotal, 0),
    [cartDetails]
  );

  const shipping = subtotal > 0 ? 12 : 0;
  const total = subtotal + shipping;

  const whatsappMessage = encodeURIComponent(
    `${
      lang === "es"
        ? "Hola La Vieja Adventures, quiero comprar estos productos de la tienda:"
        : "Hi La Vieja Adventures, I want to buy these store items:"
    }\n${cartDetails
      .map((item) => `- ${item.name[lang]} x${item.quantity}`)
      .join("\n")}\n${
      lang === "es" ? "Total estimado" : "Estimated total"
    }: ${currency.format(total)}`
  );

  const addToCart = (productId: number) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
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
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const highlights = [
    {
      icon: ShieldCheck,
      title: lang === "es" ? "Gear curado para aventura real" : "Curated for real adventure",
      text:
        lang === "es"
          ? "Seleccion pensada para senderos humedos, rios, montana y clima cambiante."
          : "Picked for wet trails, river crossings, mountain terrain, and changing weather.",
    },
    {
      icon: TentTree,
      title: lang === "es" ? "Listo para tours y travel" : "Ready for tours and travel",
      text:
        lang === "es"
          ? "Productos que combinan rendimiento, peso ligero y estilo outdoor moderno."
          : "Pieces that balance performance, light weight, and modern outdoor style.",
    },
    {
      icon: BadgeCheck,
      title: lang === "es" ? "Checkout simple por carrito" : "Simple cart-based checkout",
      text:
        lang === "es"
          ? "Arma tu pedido, revisa el resumen y continua con el equipo por WhatsApp."
          : "Build your order, review the summary, and continue with the team on WhatsApp.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#061411] text-white">
      <DynamicHeroHeader showHeroSlider={false} />

      <section className="relative overflow-hidden border-b border-white/10 pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.16),_transparent_30%),linear-gradient(180deg,_#08201a_0%,_#061411_55%,_#04100d_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              <Sparkles size={14} />
              <span>La Vieja Store</span>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-black leading-none tracking-tight sm:text-6xl lg:text-7xl">
                {lang === "es"
                  ? "Tu basecamp digital para gear de aventura"
                  : "Your digital basecamp for adventure gear"}
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-emerald-50/70">
                {lang === "es"
                  ? "Explora mochilas, botas, capas, accesorios y esenciales disenados para vivir senderos, lluvia, piedra y rio con estilo moderno."
                  : "Explore packs, boots, shells, accessories, and essentials designed for trails, rain, rock, and river days with a modern feel."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                {lang === "es" ? "Comprar ahora" : "Shop now"}
                <ArrowRight size={16} />
              </a>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/6 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <ShoppingCart size={16} />
                {lang === "es" ? "Ver carrito" : "View cart"} ({cartCount})
              </button>
            </div>

            <div className="grid gap-4 pt-4 md:grid-cols-3">
              {highlights.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <Icon size={18} className="mb-3 text-emerald-300" />
                  <h2 className="mb-2 text-sm font-semibold">{title}</h2>
                  <p className="text-sm leading-relaxed text-emerald-50/65">{text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {products.slice(0, 4).map((product, index) => (
              <article
                key={product.id}
                className={`overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 shadow-[0_28px_90px_rgba(0,0,0,0.35)] ${index === 0 ? "sm:col-span-2" : ""}`}
              >
                <div className={`relative ${index === 0 ? "h-72" : "h-56"}`}>
                  <Image
                    src={product.image}
                    alt={product.name[lang]}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {product.tag[lang]}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm font-medium text-emerald-200">{categoryLabels[product.category]}</p>
                    <h2 className="text-2xl font-black">{product.name[lang]}</h2>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Shop the collection
            </p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              {lang === "es"
                ? "Equipo outdoor con look moderno"
                : "Outdoor equipment with a modern edge"}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(categoryLabels) as ProductCategory[]).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === category
                    ? "bg-emerald-400 text-black"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1b17] shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
              >
                <div className="relative h-64">
                  <Image
                    src={product.image}
                    alt={product.name[lang]}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 30vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                    <Star size={12} className="fill-amber-300 text-amber-300" />
                    {product.rating.toFixed(1)}
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                        {categoryLabels[product.category]}
                      </p>
                      <h3 className="text-xl font-bold">{product.name[lang]}</h3>
                    </div>
                    <span className="whitespace-nowrap rounded-full bg-white/6 px-3 py-1 text-sm font-semibold text-emerald-100">
                      {currency.format(product.price)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-emerald-50/65">
                    {product.description[lang]}
                  </p>
                  <button
                    type="button"
                    onClick={() => addToCart(product.id)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
                  >
                    <Backpack size={16} />
                    {lang === "es" ? "Agregar al carrito" : "Add to cart"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.32)] xl:sticky xl:top-28">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Cart preview
                </p>
                <h2 className="text-2xl font-black">
                  {lang === "es" ? "Tu carrito" : "Your cart"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="rounded-full border border-white/15 px-3 py-1 text-sm font-semibold text-white transition hover:bg-white/10 xl:hidden"
              >
                {lang === "es" ? "Abrir" : "Open"}
              </button>
            </div>

            {cartDetails.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 px-5 py-10 text-center">
                <ShoppingCart size={24} className="mx-auto mb-3 text-emerald-300" />
                <p className="text-base font-semibold">
                  {lang === "es" ? "Tu carrito esta vacio" : "Your cart is empty"}
                </p>
                <p className="mt-2 text-sm text-emerald-50/65">
                  {lang === "es"
                    ? "Agrega gear para ver tu pedido aqui."
                    : "Add some gear to see your order here."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartDetails.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{item.name[lang]}</h3>
                        <p className="text-sm text-emerald-50/60">
                          {currency.format(item.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-full border border-white/10 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                        aria-label={lang === "es" ? "Eliminar producto" : "Remove product"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5">
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, -1)}
                          className="p-2 text-white/80 transition hover:text-white"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, 1)}
                          className="p-2 text-white/80 transition hover:text-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-emerald-200">
                        {currency.format(item.lineTotal)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-3 rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between text-sm text-emerald-50/70">
                <span>Subtotal</span>
                <span>{currency.format(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-emerald-50/70">
                <span>{lang === "es" ? "Envio estimado" : "Estimated shipping"}</span>
                <span>{currency.format(shipping)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-bold">
                <span>Total</span>
                <span>{currency.format(total)}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <a
                href={
                  cartDetails.length > 0
                    ? `https://wa.me/50662332535?text=${whatsappMessage}`
                    : "#shop"
                }
                target={cartDetails.length > 0 ? "_blank" : undefined}
                rel={cartDetails.length > 0 ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                {lang === "es" ? "Continuar pedido" : "Continue order"}
                <ArrowRight size={16} />
              </a>
              <Link
                href="/info"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {lang === "es" ? "Ver contacto y ayuda" : "View contact and help"}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {cartOpen && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="absolute inset-0"
            aria-label={lang === "es" ? "Cerrar carrito" : "Close cart"}
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#071512] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Quick cart
                </p>
                <h2 className="text-2xl font-black">
                  {lang === "es" ? "Resumen de compra" : "Order summary"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full border border-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                {lang === "es" ? "Cerrar" : "Close"}
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {cartDetails.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 px-5 py-10 text-center">
                  <ShoppingCart size={24} className="mx-auto mb-3 text-emerald-300" />
                  <p className="font-semibold">
                    {lang === "es" ? "Aun no agregas productos" : "You have not added products yet"}
                  </p>
                </div>
              ) : (
                cartDetails.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{item.name[lang]}</h3>
                        <p className="text-sm text-emerald-50/60">
                          {currency.format(item.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-full border border-white/10 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                        aria-label={lang === "es" ? "Eliminar producto" : "Remove product"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-white/10 bg-black/20">
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, -1)}
                          className="p-2 text-white/80 transition hover:text-white"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, 1)}
                          className="p-2 text-white/80 transition hover:text-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-semibold text-emerald-200">
                        {currency.format(item.lineTotal)}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
              <div className="mb-2 flex items-center justify-between text-sm text-emerald-50/70">
                <span>Subtotal</span>
                <span>{currency.format(subtotal)}</span>
              </div>
              <div className="mb-3 flex items-center justify-between text-sm text-emerald-50/70">
                <span>{lang === "es" ? "Envio estimado" : "Estimated shipping"}</span>
                <span>{currency.format(shipping)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-bold">
                <span>Total</span>
                <span>{currency.format(total)}</span>
              </div>
              <a
                href={
                  cartDetails.length > 0
                    ? `https://wa.me/50662332535?text=${whatsappMessage}`
                    : "#shop"
                }
                target={cartDetails.length > 0 ? "_blank" : undefined}
                rel={cartDetails.length > 0 ? "noopener noreferrer" : undefined}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                {lang === "es" ? "Finalizar por WhatsApp" : "Checkout on WhatsApp"}
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

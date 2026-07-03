export type ProductCategory = "all" | "packs" | "footwear" | "apparel" | "essentials";

export type Product = {
  id: number;
  category: Exclude<ProductCategory, "all">;
  image: string;
  price: number;
  rating: number;
  featured?: boolean;
  tag: { es: string; en: string };
  name: { es: string; en: string };
  description: { es: string; en: string };
  useCase: { es: string; en: string };
};

export type CartItem = {
  productId: number;
  quantity: number;
};

export const CART_STORAGE_KEY = "lavieja-store-cart";

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const HERO_STRIP = [
  "/image/IMG_6814.jpg",
  "/image/IMG_5592.jpg",
  "/image/IMG_6810.jpg",
  "/image/IMG_6806.jpg",
  "/image/IMG_4523.jpg",
  "/image/IMG_4672.jpg",
  "/image/IMG_4671.jpg",
  "/image/IMG_4257.jpg",
];

export const products: Product[] = [
  {
    id: 1,
    category: "packs",
    image: "/image/IMG_6814.jpg",
    price: 89,
    rating: 4.9,
    featured: true,
    tag: { es: "Favorito del cañón", en: "Canyon favorite" },
    name: { es: "Mochila Río 28L", en: "River Pack 28L" },
    description: {
      es: "Mochila ligera con soporte lumbar, funda impermeable y bolsillos rápidos para días largos en sendero y poza.",
      en: "Lightweight pack with lumbar support, rain cover, and quick pockets for long trail and pool days.",
    },
    useCase: { es: "Cañón · Pozas · Trekking", en: "Canyon · Pools · Trekking" },
  },
  {
    id: 2,
    category: "footwear",
    image: "/image/IMG_5592.jpg",
    price: 124,
    rating: 4.8,
    tag: { es: "Río y roca", en: "River & rock" },
    name: { es: "Bota Grip La Vieja", en: "La Vieja Grip Boot" },
    description: {
      es: "Tracción profunda, secado rápido y puntera reforzada para piedra mojada y cruces de río con confianza.",
      en: "Deep traction, quick-dry panels, and reinforced toe for wet rock and river crossings.",
    },
    useCase: { es: "Ciudad Esmeralda · Rappel", en: "Ciudad Esmeralda · Rappel" },
  },
  {
    id: 3,
    category: "apparel",
    image: "/image/IMG_6810.jpg",
    price: 52,
    rating: 4.7,
    tag: { es: "Lluvia tropical", en: "Tropical rain" },
    name: { es: "Capa Esmeralda", en: "Emerald Shell" },
    description: {
      es: "Capa respirable para lluvia de montaña, empacable y lista cuando el clima cambia en San Carlos.",
      en: "Breathable shell for mountain rain, packable when San Carlos weather shifts fast.",
    },
    useCase: { es: "Bosque nuboso · Cañón", en: "Cloud forest · Canyon" },
  },
  {
    id: 4,
    category: "essentials",
    image: "/image/IMG_6806.jpg",
    price: 36,
    rating: 4.9,
    tag: { es: "Kit base", en: "Base kit" },
    name: { es: "Kit Explorador", en: "Explorer Kit" },
    description: {
      es: "Botella térmica, dry bag y multi-tool compacto para mantenerte listo en toda la aventura.",
      en: "Thermal bottle, dry bag, and compact multi-tool to stay ready on every adventure.",
    },
    useCase: { es: "Día completo · Familia", en: "Full day · Family" },
  },
  {
    id: 5,
    category: "footwear",
    image: "/image/IMG_4523.jpg",
    price: 74,
    rating: 4.6,
    tag: { es: "Agua + piedra", en: "Water + stone" },
    name: { es: "Sandalia Pozas", en: "Pool Sandal" },
    description: {
      es: "Sandalia anfibia con agarre flexible y correas de ajuste rápido para pozas cristalinas.",
      en: "Amphibious sandal with flexible grip and quick-adjust straps for crystal pools.",
    },
    useCase: { es: "Pozas · Kayak · Relax", en: "Pools · Kayak · Chill" },
  },
  {
    id: 6,
    category: "packs",
    image: "/image/IMG_4672.jpg",
    price: 58,
    rating: 4.8,
    tag: { es: "Ligera", en: "Lightweight" },
    name: { es: "Riñonera Sendero", en: "Trail Hip Pack" },
    description: {
      es: "Riñonera técnica para celular, snacks y documentos con tela repelente al agua.",
      en: "Technical hip pack for phone, snacks, and docs with water-resistant fabric.",
    },
    useCase: { es: "ATV · Caballo · Corto", en: "ATV · Horse · Short" },
  },
];


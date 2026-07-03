import { getDb } from "@/lib/helpers/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";
import { getStoreSettings, type StoreSettings } from "@/lib/models/store-settings";

export type StoreProductCategory = "packs" | "footwear" | "apparel" | "essentials";

export type StoreProductDoc = {
  _id?: unknown;
  slug: string;
  category: StoreProductCategory;
  image: string;
  price: number;
  priceCRC?: number;
  currency?: "USD" | "CRC";
  rating: number;
  featured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  stock?: number | null;
  tagEs: string;
  tagEn: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  useCaseEs: string;
  useCaseEn: string;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  category: StoreProductCategory;
  image: string;
  price: number;
  priceCRC?: number;
  currency: "USD" | "CRC";
  rating: number;
  featured: boolean;
  inStock: boolean;
  tag: { es: string; en: string };
  name: { es: string; en: string };
  description: { es: string; en: string };
  useCase: { es: string; en: string };
};

export type StoreCatalogResponse = {
  products: StoreProduct[];
  settings: Pick<StoreSettings, "shippingFeeUSD" | "currency" | "whatsappPhone">;
};

export const DEFAULT_STORE_PRODUCTS: Omit<StoreProductDoc, "_id">[] = [
  {
    slug: "mochila-rio-28l",
    category: "packs",
    image: "/image/IMG_6814.jpg",
    price: 89,
    rating: 4.9,
    featured: true,
    isActive: true,
    sortOrder: 1,
    stock: null,
    tagEs: "Favorito del cañón",
    tagEn: "Canyon favorite",
    nameEs: "Mochila Río 28L",
    nameEn: "River Pack 28L",
    descriptionEs:
      "Mochila ligera con soporte lumbar, funda impermeable y bolsillos rápidos para días largos en sendero y poza.",
    descriptionEn:
      "Lightweight pack with lumbar support, rain cover, and quick pockets for long trail and pool days.",
    useCaseEs: "Cañón · Pozas · Trekking",
    useCaseEn: "Canyon · Pools · Trekking",
  },
  {
    slug: "bota-grip-la-vieja",
    category: "footwear",
    image: "/image/IMG_5592.jpg",
    price: 124,
    rating: 4.8,
    featured: false,
    isActive: true,
    sortOrder: 2,
    stock: null,
    tagEs: "Río y roca",
    tagEn: "River & rock",
    nameEs: "Bota Grip La Vieja",
    nameEn: "La Vieja Grip Boot",
    descriptionEs:
      "Tracción profunda, secado rápido y puntera reforzada para piedra mojada y cruces de río con confianza.",
    descriptionEn:
      "Deep traction, quick-dry panels, and reinforced toe for wet rock and river crossings.",
    useCaseEs: "Ciudad Esmeralda · Rappel",
    useCaseEn: "Ciudad Esmeralda · Rappel",
  },
  {
    slug: "capa-esmeralda",
    category: "apparel",
    image: "/image/IMG_6810.jpg",
    price: 52,
    rating: 4.7,
    featured: false,
    isActive: true,
    sortOrder: 3,
    stock: null,
    tagEs: "Lluvia tropical",
    tagEn: "Tropical rain",
    nameEs: "Capa Esmeralda",
    nameEn: "Emerald Shell",
    descriptionEs:
      "Capa respirable para lluvia de montaña, empacable y lista cuando el clima cambia en San Carlos.",
    descriptionEn:
      "Breathable shell for mountain rain, packable when San Carlos weather shifts fast.",
    useCaseEs: "Bosque nuboso · Cañón",
    useCaseEn: "Cloud forest · Canyon",
  },
  {
    slug: "kit-explorador",
    category: "essentials",
    image: "/image/IMG_6806.jpg",
    price: 36,
    rating: 4.9,
    featured: false,
    isActive: true,
    sortOrder: 4,
    stock: null,
    tagEs: "Kit base",
    tagEn: "Base kit",
    nameEs: "Kit Explorador",
    nameEn: "Explorer Kit",
    descriptionEs:
      "Botella térmica, dry bag y multi-tool compacto para mantenerte listo en toda la aventura.",
    descriptionEn:
      "Thermal bottle, dry bag, and compact multi-tool to stay ready on every adventure.",
    useCaseEs: "Día completo · Familia",
    useCaseEn: "Full day · Family",
  },
  {
    slug: "sandalia-pozas",
    category: "footwear",
    image: "/image/IMG_4523.jpg",
    price: 74,
    rating: 4.6,
    featured: false,
    isActive: true,
    sortOrder: 5,
    stock: null,
    tagEs: "Agua + piedra",
    tagEn: "Water + stone",
    nameEs: "Sandalia Pozas",
    nameEn: "Pool Sandal",
    descriptionEs:
      "Sandalia anfibia con agarre flexible y correas de ajuste rápido para pozas cristalinas.",
    descriptionEn:
      "Amphibious sandal with flexible grip and quick-adjust straps for crystal pools.",
    useCaseEs: "Pozas · Kayak · Relax",
    useCaseEn: "Pools · Kayak · Chill",
  },
  {
    slug: "rinonera-sendero",
    category: "packs",
    image: "/image/IMG_4672.jpg",
    price: 58,
    rating: 4.8,
    featured: false,
    isActive: true,
    sortOrder: 6,
    stock: null,
    tagEs: "Ligera",
    tagEn: "Lightweight",
    nameEs: "Riñonera Sendero",
    nameEn: "Trail Hip Pack",
    descriptionEs:
      "Riñonera técnica para celular, snacks y documentos con tela repelente al agua.",
    descriptionEn:
      "Technical hip pack for phone, snacks, and docs with water-resistant fabric.",
    useCaseEs: "ATV · Caballo · Corto",
    useCaseEn: "ATV · Horse · Short",
  },
];

const VALID_CATEGORIES = new Set<StoreProductCategory>([
  "packs",
  "footwear",
  "apparel",
  "essentials",
]);

export function serializeStoreProduct(doc: StoreProductDoc): StoreProduct {
  const stock = doc.stock;
  const inStock = stock == null || stock > 0;

  return {
    id: String(doc._id ?? doc.slug),
    slug: doc.slug,
    category: doc.category,
    image: doc.image,
    price: Number(doc.price) || 0,
    priceCRC: typeof doc.priceCRC === "number" ? doc.priceCRC : undefined,
    currency: doc.currency === "CRC" ? "CRC" : "USD",
    rating: Number(doc.rating) || 0,
    featured: Boolean(doc.featured),
    inStock,
    tag: { es: doc.tagEs, en: doc.tagEn },
    name: { es: doc.nameEs, en: doc.nameEn },
    description: { es: doc.descriptionEs, en: doc.descriptionEn },
    useCase: { es: doc.useCaseEs, en: doc.useCaseEn },
  };
}

export function normalizeStoreProductInput(body: Record<string, unknown>) {
  const slug = String(body.slug ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) return { error: "slug is required" as const };

  const category = String(body.category ?? "").trim() as StoreProductCategory;
  if (!VALID_CATEGORIES.has(category)) {
    return { error: "category must be packs, footwear, apparel, or essentials" as const };
  }

  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) {
    return { error: "price must be a non-negative number" as const };
  }

  const rating = Number(body.rating ?? 5);
  const priceCRC = body.priceCRC == null ? undefined : Number(body.priceCRC);
  const stock = body.stock == null ? null : Number(body.stock);
  const now = new Date().toISOString();

  return {
    slug,
    category,
    image: String(body.image ?? "/image/IMG_6810.jpg").trim(),
    price,
    priceCRC: Number.isFinite(priceCRC) ? priceCRC : undefined,
    currency: body.currency === "CRC" ? "CRC" : "USD",
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 5,
    featured: Boolean(body.featured),
    isActive: body.isActive !== false,
    sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 100,
    stock: stock == null || !Number.isFinite(stock) ? null : Math.max(0, stock),
    tagEs: String(body.tagEs ?? "").trim(),
    tagEn: String(body.tagEn ?? body.tagEs ?? "").trim(),
    nameEs: String(body.nameEs ?? "").trim(),
    nameEn: String(body.nameEn ?? body.nameEs ?? "").trim(),
    descriptionEs: String(body.descriptionEs ?? "").trim(),
    descriptionEn: String(body.descriptionEn ?? body.descriptionEs ?? "").trim(),
    useCaseEs: String(body.useCaseEs ?? "").trim(),
    useCaseEn: String(body.useCaseEn ?? body.useCaseEs ?? "").trim(),
    updatedAt: now,
  } satisfies Omit<StoreProductDoc, "_id">;
}

async function getProductsCollection() {
  const db = await getDb();
  return db.collection<StoreProductDoc>(COLLECTIONS.STORE_PRODUCTS);
}

export async function seedStoreProductsIfEmpty() {
  const collection = await getProductsCollection();
  const count = await collection.countDocuments();
  if (count > 0) return;

  const now = new Date().toISOString();
  await collection.insertMany(
    DEFAULT_STORE_PRODUCTS.map((product) => ({
      ...product,
      currency: "USD" as const,
      createdAt: now,
      updatedAt: now,
    })),
  );
}

export async function readActiveStoreCatalog(): Promise<StoreCatalogResponse> {
  await seedStoreProductsIfEmpty();

  const [collection, settings] = await Promise.all([
    getProductsCollection(),
    getStoreSettings(),
  ]);

  const docs = await collection
    .find({ isActive: { $ne: false } })
    .sort({ featured: -1, sortOrder: 1, price: 1 })
    .toArray();

  return {
    products: docs.map(serializeStoreProduct),
    settings: {
      shippingFeeUSD: settings.shippingFeeUSD,
      currency: settings.currency,
      whatsappPhone: settings.whatsappPhone,
    },
  };
}

export async function readAllStoreProducts() {
  await seedStoreProductsIfEmpty();
  const collection = await getProductsCollection();
  const docs = await collection.find({}).sort({ sortOrder: 1, price: 1 }).toArray();
  return docs.map((doc) => ({
    ...doc,
    _id: String(doc._id),
  }));
}

export async function createStoreProduct(body: Record<string, unknown>) {
  const normalized = normalizeStoreProductInput(body);
  if ("error" in normalized) return normalized;

  const collection = await getProductsCollection();
  const existing = await collection.findOne({ slug: normalized.slug });
  if (existing) return { error: "Product slug already exists." as const };

  const now = new Date().toISOString();
  await collection.insertOne({
    ...normalized,
    createdAt: now,
  });

  return { ok: true as const };
}

export async function updateStoreProduct(slug: string, body: Record<string, unknown>) {
  const collection = await getProductsCollection();
  const existing = await collection.findOne({ slug });
  if (!existing) return { error: "Product not found." as const };

  const patch = normalizeStoreProductInput({ ...existing, ...body, slug });
  if ("error" in patch) return patch;

  await collection.updateOne({ slug }, { $set: patch });
  return { ok: true as const };
}

export async function deleteStoreProduct(slug: string) {
  const collection = await getProductsCollection();
  const result = await collection.updateOne(
    { slug },
    { $set: { isActive: false, updatedAt: new Date().toISOString() } },
  );

  if (result.matchedCount === 0) return { error: "Product not found." as const };
  return { ok: true as const };
}
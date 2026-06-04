import type { Document, WithId } from "mongodb";

export const MOTO_PART_CATEGORIES = [
  "frenos",
  "aceites",
  "llantas",
  "cadena",
  "electrico",
  "motor",
  "suspension",
  "escape",
  "carroceria",
  "luces",
  "bateria",
  "embrague",
  "direccion",
  "asientos",
  "espejos",
  "plasticos",
  "combustible",
  "refrigeracion",
  "herramientas",
  "accesorios",
] as const;

export const MOTO_PART_STOCK_LEVELS = ["high", "medium", "low"] as const;

export type MotoPartCategory = (typeof MOTO_PART_CATEGORIES)[number];
export type MotoPartCategoryFilter = "all" | MotoPartCategory;
export type MotoPartStockLevel = "high" | "medium" | "low";

export type MotoCartItem = { partId: string; quantity: number };

export type MotoPartInput = {
  name: string;
  category: MotoPartCategory;
  brand: string;
  model: string;
  price: number;
  stock: string;
  stockLevel: MotoPartStockLevel;
  description: string;
  image: string;
  isActive: boolean;
};

export type MotoPartDocument = MotoPartInput & {
  createdAt: string;
  updatedAt: string;
};

export type SerializedMotoPart = MotoPartDocument & {
  _id: string;
  id: string;
};

export type MotoPartCatalogItem = Omit<MotoPartInput, "isActive"> & {
  id: string;
  _id?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export const motoPartCategoryLabels: Record<MotoPartCategoryFilter, string> = {
  all: "Todos",
  frenos: "Frenos",
  aceites: "Aceites y filtros",
  llantas: "Llantas",
  cadena: "Cadena y transmision",
  electrico: "Electrico",
  motor: "Motor",
  suspension: "Suspension",
  escape: "Escape",
  carroceria: "Carroceria",
  luces: "Luces",
  bateria: "Bateria",
  embrague: "Embrague",
  direccion: "Direccion",
  asientos: "Asientos",
  espejos: "Espejos",
  plasticos: "Plasticos",
  combustible: "Combustible",
  refrigeracion: "Refrigeracion",
  herramientas: "Herramientas",
  accesorios: "Accesorios",
};

export const motoPartStockLevelLabels: Record<MotoPartStockLevel, string> = {
  high: "Alto",
  medium: "Medio",
  low: "Bajo",
};

const CATEGORIES = new Set<MotoPartCategory>(MOTO_PART_CATEGORIES);
const STOCK_LEVELS = new Set<MotoPartStockLevel>(MOTO_PART_STOCK_LEVELS);

function normalizeCategory(value: unknown): MotoPartCategory {
  const category = String(value ?? "").trim() as MotoPartCategory;
  return CATEGORIES.has(category) ? category : "frenos";
}

function normalizeStockLevel(value: unknown): MotoPartStockLevel {
  const stockLevel = String(value ?? "").trim() as MotoPartStockLevel;
  return STOCK_LEVELS.has(stockLevel) ? stockLevel : "high";
}

export function normalizeMotoPart(body: Record<string, unknown>): MotoPartInput | { error: string } {
  const name = String(body.name ?? "").trim();
  const brand = String(body.brand ?? "").trim();
  const model = String(body.model ?? "").trim();
  const price = Number(body.price ?? 0);

  if (!name) return { error: "name is required" };
  if (!brand) return { error: "brand is required" };
  if (!model) return { error: "model is required" };
  if (!Number.isFinite(price) || price < 0) return { error: "price must be a valid positive number" };

  return {
    name,
    category: normalizeCategory(body.category),
    brand,
    model,
    price,
    stock: String(body.stock ?? "").trim(),
    stockLevel: normalizeStockLevel(body.stockLevel),
    description: String(body.description ?? "").trim(),
    image: String(body.image ?? "").trim(),
    isActive: body.isActive !== false,
  };
}

export function serializeMotoPart(part: WithId<Document>): SerializedMotoPart {
  const id = part._id.toString();

  return {
    _id: id,
    id,
    name: String(part.name ?? ""),
    category: normalizeCategory(part.category),
    brand: String(part.brand ?? ""),
    model: String(part.model ?? ""),
    price: Number(part.price ?? 0),
    stock: String(part.stock ?? ""),
    stockLevel: normalizeStockLevel(part.stockLevel),
    description: String(part.description ?? ""),
    image: String(part.image ?? ""),
    isActive: part.isActive !== false,
    createdAt: String(part.createdAt ?? ""),
    updatedAt: String(part.updatedAt ?? ""),
  };
}

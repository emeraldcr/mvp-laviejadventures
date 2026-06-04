import type { Document, WithId } from "mongodb";

export type MotoPartCategory = "frenos" | "aceites" | "llantas" | "cadena" | "electrico";
export type MotoPartStockLevel = "high" | "medium" | "low";

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

const CATEGORIES = new Set<MotoPartCategory>(["frenos", "aceites", "llantas", "cadena", "electrico"]);
const STOCK_LEVELS = new Set<MotoPartStockLevel>(["high", "medium", "low"]);

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

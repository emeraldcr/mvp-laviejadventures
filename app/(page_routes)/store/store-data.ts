import type { StoreProduct, StoreProductCategory } from "@/lib/store/products";

export type ProductCategory = "all" | StoreProductCategory;
export type Product = StoreProduct;

export type CartItem = {
  productId: string;
  quantity: number;
};

export const CART_STORAGE_KEY = "lavieja-store-cart";

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const crcCurrency = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  maximumFractionDigits: 0,
});

export function formatProductPrice(product: Pick<Product, "price" | "priceCRC" | "currency">) {
  if (product.currency === "CRC" && typeof product.priceCRC === "number") {
    return crcCurrency.format(product.priceCRC);
  }
  return currency.format(product.price);
}

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
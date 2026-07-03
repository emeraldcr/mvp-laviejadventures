import { currency } from "./store-data";
import type { Product } from "./store-data";
import type { CartLine } from "./StoreCart";
import type { StoreCatalogSettings } from "@/lib/hooks/useStoreProducts";

export const LOW_STOCK_THRESHOLD = 5;

export function getMinProductPrice(products: Product[]) {
  if (products.length === 0) return null;
  return Math.min(...products.map((product) => product.price));
}

export function isLowStock(product: Pick<Product, "inStock" | "stockCount">) {
  return (
    product.inStock &&
    product.stockCount != null &&
    product.stockCount > 0 &&
    product.stockCount <= LOW_STOCK_THRESHOLD
  );
}

export function getStoreOrigin() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

function productStoreUrl(slug: string) {
  const origin = getStoreOrigin();
  return origin ? `${origin}/store#product-${slug}` : `/store#product-${slug}`;
}

export function filterProductsByQuery(products: Product[], query: string, lang: "es" | "en") {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return products;

  return products.filter((product) => {
    const haystack = [
      product.name[lang],
      product.name.es,
      product.name.en,
      product.description[lang],
      product.useCase[lang],
      product.tag[lang],
      product.brand ?? "",
      product.slug,
      product.category,
    ]
      .join(" ")
      .toLowerCase();

    return normalized.split(/\s+/).every((token) => haystack.includes(token));
  });
}

export function computeShipping(subtotal: number, settings: StoreCatalogSettings) {
  if (subtotal <= 0) return 0;
  if (
    settings.freeShippingThresholdUSD > 0 &&
    subtotal >= settings.freeShippingThresholdUSD
  ) {
    return 0;
  }
  return settings.shippingFeeUSD;
}

export function getFreeShippingProgress(subtotal: number, settings: StoreCatalogSettings) {
  const threshold = settings.freeShippingThresholdUSD;
  if (threshold <= 0) return null;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);
  return { threshold, remaining, progress, unlocked: remaining <= 0 };
}

export function buildCartWhatsAppHref(
  cartDetails: CartLine[],
  total: number,
  lang: "es" | "en",
  phone: string,
) {
  const isEs = lang === "es";
  const lines = cartDetails.map((item) => `• ${item.name[lang]} x${item.quantity}`).join("\n");
  const storeLink = getStoreOrigin() ? `${getStoreOrigin()}/store` : "/store";
  const message = encodeURIComponent(
    `${
      isEs
        ? "Hola La Vieja Adventures 👋 Quiero confirmar este pedido de la tienda:"
        : "Hi La Vieja Adventures 👋 I'd like to confirm this store order:"
    }\n\n${lines}\n\n${isEs ? "Total estimado" : "Estimated total"}: ${currency.format(total)}\n${
      isEs ? "Catálogo" : "Catalog"
    }: ${storeLink}\n\n${
      isEs
        ? "¿Me confirman stock, envío y forma de pago? ¡Pura vida!"
        : "Can you confirm stock, shipping, and payment options? Thanks!"
    }`,
  );
  return `https://wa.me/${phone}?text=${message}`;
}

export function buildSingleProductWhatsAppHref(
  product: Product,
  lang: "es" | "en",
  phone: string,
  quantity = 1,
) {
  const isEs = lang === "es";
  const lineTotal = product.price * quantity;
  const message = encodeURIComponent(
    `${
      isEs
        ? "Hola La Vieja Adventures 👋 Me interesa este producto:"
        : "Hi La Vieja Adventures 👋 I'm interested in this product:"
    }\n\n• ${product.name[lang]} x${quantity}\n${isEs ? "Precio ref." : "Ref. price"}: ${currency.format(lineTotal)}\n${
      isEs ? "Ver en tienda" : "View in store"
    }: ${productStoreUrl(product.slug)}\n\n${
      isEs
        ? "¿Está disponible? ¿Cómo coordinamos envío o retiro en San Carlos?"
        : "Is it available? How can we arrange shipping or pickup in San Carlos?"
    }`,
  );
  return `https://wa.me/${phone}?text=${message}`;
}

export function trackStoreAction(action: string, metadata: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  void import("@/lib/analytics/client").then(({ trackAnalyticsEvent }) => {
    trackAnalyticsEvent("click", {
      path: "/store",
      metadata: { surface: "store", action, ...metadata },
    });
  });
}
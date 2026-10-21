import type { Metadata } from "next";
import { localizeHref, type Locale } from "./i18n";
import { BUSINESS_NAME, SITE_URL } from "./site-config";

export function pageMetadata(path: string, title: string, description: string, locale: Locale = "es", image = "/hero/ciudad-esmeralda-poster.jpg"): Metadata {
  description = description.length > 155 ? `${description.slice(0, 152).replace(/\s+\S*$/, "")}…` : description;
  const es = `${SITE_URL}${localizeHref(path, "es")}`;
  const en = `${SITE_URL}${localizeHref(path, "en")}`;
  const canonical = locale === "en" ? en : es;
  const absoluteTitle = path === "/" || title.includes(BUSINESS_NAME) ? title : `${title} | ${BUSINESS_NAME}`;
  const imageUrl = new URL(image, SITE_URL).href;
  return {
    title: { absolute: absoluteTitle }, description,
    alternates: { canonical, languages: { es, en, "x-default": es } },
    openGraph: { type: "website", title: absoluteTitle, description, url: canonical, siteName: BUSINESS_NAME, locale: locale === "es" ? "es_CR" : "en_US", images: [{ url: imageUrl, alt: title }] },
    twitter: { card: "summary_large_image", title: absoluteTitle, description, images: [imageUrl] },
  };
}

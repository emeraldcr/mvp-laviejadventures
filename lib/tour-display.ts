export const TOUR_IMAGE_BY_SLUG: Record<string, string> = {
  "tour-ciudad-esmeralda": "/image/IMG_4671.jpg",
  "ciudad-esmeralda": "/image/IMG_4671.jpg",
  "aventuras-cataratas": "/image/IMG_6812.jpg",
  "pozas-cristalinas": "/image/IMG_4257.jpg",
  "caminata-volcanes-dormidos": "/ads/IMG_5666.jpg",
  "avistamiento-aves": "/ads/IMG_5668.jpg",
  "avistamiento-aves-norteno": "/ads/IMG_5668.jpg",
  "lluvia-en-la-naturaleza": "/ads/IMG_5669.jpg",
  "tour-gastronomico-local": "/ads/IMG_5670.jpg",
  "tour-nocturno-la-vieja": "/ads/IMG_5671.jpg",
  "cuadra-tours-aventura": "/ads/IMG_5672.jpg",
  "rapel-canon-del-rio": "/ads/IMG_5673.jpg",
};

export const TOUR_GALLERY_FALLBACK = [
  "/image/IMG_4671.jpg",
  "/image/IMG_6812.jpg",
  "/image/IMG_4257.jpg",
  "/image/IMG_6810.jpg",
];

export function getTourImage(slug?: string | null) {
  return (slug && TOUR_IMAGE_BY_SLUG[slug]) || "/image/IMG_6810.jpg";
}

export function getTourGallery(slug?: string | null) {
  const hero = getTourImage(slug);
  return [hero, ...TOUR_GALLERY_FALLBACK.filter((image) => image !== hero)].slice(0, 4);
}

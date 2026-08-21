import {
  ArrowLeft,
  ArrowRight,
  Binoculars,
  CornerDownRight,
  Droplets,
  MapPin,
  Mountain,
  ParkingCircle,
  Ruler,
  Signpost,
  TreePine,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { ArrowKey, Copy, PictogramKey, RotuloKind, Social } from "./types";

/** Tipo de cambio referencial, solo para leer el presupuesto en dólares. */
export const CRC_PER_USD = 505;

/** Datos que van impresos en cada lámina. Un solo lugar para corregirlos. */
export const BUSINESS = {
  name: "La Vieja Adventures",
  place: "Sucre de Ciudad Quesada, San Carlos",
  web: "www.laviejaadventures.com",
  email: "info@laviejaadventures.com",
  whatsapp: "6233-2535",
  phone: "8643-0807",
  handle: "@laviejaadventures",
};

/** El QR manda a la pagina. */
export const QR_TARGET = `https://${BUSINESS.web}`;

/** Marcas de redes: lucide no trae TikTok ni X, se usan los paths de la página /info. */
export const SOCIALS: Social[] = [
  {
    label: "Instagram",
    handle: "@laviejaadventures",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "Facebook",
    handle: "/laviejaadventures",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "YouTube",
    handle: "@laviejaadventures",
    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "TikTok",
    handle: "@la.vieja.adventur",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  {
    label: "X",
    handle: "@adventuresvieja",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25z",
  },
];

/** Categoría de rótulo: ícono, etiqueta bilingüe y color de la píldora. */
export const KIND_META: Record<
  RotuloKind,
  { icon: LucideIcon; label: Copy; tone: string }
> = {
  entrada: {
    icon: Signpost,
    label: { es: "Entrada principal", en: "Main entrance" },
    tone: "border-emerald-300/40 bg-emerald-400/10 text-emerald-200",
  },
  anticipo: {
    icon: Ruler,
    label: { es: "Anticipo en ruta", en: "Advance warning" },
    tone: "border-sky-300/40 bg-sky-400/10 text-sky-200",
  },
  destino: {
    icon: UtensilsCrossed,
    label: { es: "Destino", en: "Destination" },
    tone: "border-amber-300/40 bg-amber-400/10 text-amber-200",
  },
  indicador: {
    icon: ParkingCircle,
    label: { es: "Indicador interno", en: "Internal wayfinding" },
    tone: "border-violet-300/40 bg-violet-400/10 text-violet-200",
  },
  par: {
    icon: MapPin,
    label: { es: "Par de láminas", en: "Panel pair" },
    tone: "border-rose-300/40 bg-rose-400/10 text-rose-200",
  },
};

export const ARROWS: Record<ArrowKey, LucideIcon> = {
  left: ArrowLeft,
  right: ArrowRight,
  "down-right": CornerDownRight,
};

/** Pictogramas de norma: se decodifican antes de leer una sola letra. */
export const PICTOGRAMS: Record<PictogramKey, LucideIcon> = {
  canon: Mountain,
  cascada: Droplets,
  rio: Waves,
  comida: UtensilsCrossed,
  parqueo: ParkingCircle,
  mirador: Binoculars,
  sendero: TreePine,
};

// ── Vidrio y recorte de fotos ────────────────────────────────────────────────

/** Cuánto se inclina el corte diagonal entre el borde de arriba y el de abajo. */
export const PHOTO_SKEW = 14;

/** Encuadre de cada banda diagonal, en orden. */
export const PHOTO_FOCUS = ["center 40%", "center 55%", "center 30%"];

/**
 * Tintes de vidrio. Se conserva el código de color de la señalización (verde
 * destino, azul distancia, amarillo acción) pero translúcido, para que la foto
 * siga viéndose debajo. El gris muy transparente es el que sostiene las letras.
 */
export const GLASS = {
  gray: "rgba(24,24,27,0.42)",
  green: "rgba(15,122,61,0.44)",
  blue: "rgba(11,78,162,0.46)",
  yellow: "rgba(245,197,24,0.80)",
  yellowEdge: "rgba(138,107,0,0.7)",
};

/** Vidrio: desenfoque, borde claro y brillo interno arriba. */
export const GLASS_BASE =
  "rounded-xl border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_30px_-16px_rgba(0,0,0,0.8)]";

/** Sombra de texto: lo que hace legible una letra blanca sobre foto. */
export const TEXT_SHADOW = "drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]";

/**
 * Colores de norma, no de marca: son los que la gente ya sabe leer sin pensar.
 * Verde destino y azul servicios vienen del Manual Centroamericano (SIECA) y de
 * la Convencion de Viena; el cafe de atractivo turistico es el mismo que usan
 * MUTCD (EE.UU.), Reino Unido, Alemania y Mexico.
 */
export const SIGN_COLORS = {
  green: "#0F7A3D",
  blue: "#0B4EA2",
  brown: "#5C3B1E",
  yellow: "#F5C518",
  wood: "#2A1E14",
};

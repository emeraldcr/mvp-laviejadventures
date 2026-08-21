"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CornerDownRight,
  LayoutPanelTop,
  MapPin,
  ParkingCircle,
  Printer,
  Ruler,
  Signpost,
  UtensilsCrossed,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

/** Tipo de cambio referencial, solo para leer el presupuesto en dólares. */
const CRC_PER_USD = 505;

/** Datos que van impresos en cada lámina. Un solo lugar para corregirlos. */
const BUSINESS = {
  name: "La Vieja Adventures",
  place: "Sucre de Ciudad Quesada, San Carlos",
  web: "www.laviejaadventures.com",
  email: "info@laviejaadventures.com",
  whatsapp: "6233-2535",
  phone: "8643-0807",
  handle: "@laviejaadventures",
};

/** Marcas de redes: lucide no trae TikTok ni X, se usan los paths de la página /info. */
const SOCIALS = [
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

type Brand = "lva" | "organics";

type Panel = {
  /** Línea corta arriba del título. */
  kicker?: string;
  /** Título rotulado, en español: es el que se lee desde la calle. */
  title: string;
  /** Mismo título en inglés, impreso chiquito debajo. Bilingüe sin gritar. */
  titleEn: string;
  subtitle?: string;
  /** Frase de acción, la que tiene que pegar desde la calle. */
  cta: { es: string; en: string };
  /** Distancia o referencia impresa en el rótulo. */
  distance?: string;
  brands: Brand[];
  arrow?: "right" | "down-right";
  /** Fotos que se recortan en diagonal dentro del borde interno. */
  photos: string[];
  /** Precio de la lámina en colones. */
  price: number;
};

type Rotulo = {
  id: number;
  code: string;
  name: string;
  kind: "entrada" | "anticipo" | "destino" | "indicador" | "par";
  placement: { es: string; en: string };
  purpose: { es: string; en: string };
  panels: Panel[];
};

const ROTULOS: Rotulo[] = [
  {
    id: 1,
    code: "R-01",
    name: "Entrada Vuelta Principal",
    kind: "entrada",
    placement: {
      es: "Vuelta principal, entrada a la finca",
      en: "Main turn, entrance to the property",
    },
    purpose: {
      es: "Rótulo madre: doble marca, es el que confirma que ya llegaron.",
      en: "Flagship sign: dual brand, the one that confirms guests arrived.",
    },
    panels: [
      {
        kicker: "Bienvenidos · Welcome",
        title: "La Vieja Adventures",
        titleEn: "Cañón del Río La Vieja",
        subtitle: "La Vieja Organics",
        cta: {
          es: "Entre aquí: cañón, cascadas y café orgánico",
          en: "Turn in here: canyon, waterfalls & organic coffee",
        },
        brands: ["lva", "organics"],
        arrow: "right",
        photos: ["/image/IMG_4671.jpg", "/image/IMG_6810.jpg", "/image/IMG_4257.jpg"],
        price: 50000,
      },
    ],
  },
  {
    id: 2,
    code: "R-02",
    name: "Anticipo Puente La Vieja",
    kind: "anticipo",
    placement: {
      es: "300 metros antes del Puente La Vieja",
      en: "300 meters before the La Vieja bridge",
    },
    purpose: {
      es: "Aviso anticipado para que bajen la velocidad antes del puente.",
      en: "Advance warning so drivers slow down before the bridge.",
    },
    panels: [
      {
        kicker: "Puente La Vieja",
        title: "Su aventura empieza en 300 m",
        titleEn: "Your adventure starts in 300 m",
        subtitle: "Cañón del Río La Vieja",
        cta: {
          es: "Baje la velocidad: la entrada es a la derecha",
          en: "Slow down: the entrance is on your right",
        },
        distance: "300 m",
        brands: ["lva"],
        arrow: "right",
        photos: ["/image/IMG_4200.jpg", "/image/IMG_5592.jpg"],
        price: 50000,
      },
    ],
  },
  {
    id: 3,
    code: "R-03",
    name: "Anticipo Vuelta Chicharronera",
    kind: "anticipo",
    placement: {
      es: "Antes de la vuelta de la chicharronera",
      en: "Before the chicharronera turn",
    },
    purpose: {
      es: "El punto de referencia más usado por los clientes que llaman perdidos.",
      en: "The landmark most quoted by guests who call in lost.",
    },
    panels: [
      {
        kicker: "Vuelta Chicharronera",
        title: "Cascadas y pozas a la vuelta",
        titleEn: "Waterfalls & pools around the bend",
        subtitle: "Tours guiados todo el año",
        cta: {
          es: "No siga de largo: el cañón está aquí cerquita",
          en: "Do not drive past: the canyon is right here",
        },
        brands: ["lva"],
        arrow: "right",
        photos: ["/image/IMG_4376.jpg", "/image/IMG_4210.jpg"],
        price: 50000,
      },
    ],
  },
  {
    id: 4,
    code: "R-04",
    name: "Restaurante y Mirador La Vieja",
    kind: "destino",
    placement: {
      es: "Acceso al restaurante y mirador",
      en: "Access to restaurant and lookout",
    },
    purpose: {
      es: "Captura al que solo va pasando: comida y vista, no solo tour.",
      en: "Catches drive-by traffic: food and view, not only tours.",
    },
    panels: [
      {
        kicker: "Restaurante y Mirador",
        title: "Coma con vista al cañón",
        titleEn: "Eat with a canyon view",
        subtitle: "La Vieja",
        cta: {
          es: "Pare, tómese un café y asómese al mirador",
          en: "Stop, grab a coffee and step out to the lookout",
        },
        brands: ["lva"],
        arrow: "down-right",
        photos: ["/image/IMG_5686.jpg", "/image/IMG_6812.jpg"],
        price: 50000,
      },
    ],
  },
  {
    id: 5,
    code: "R-05",
    name: "Parqueo + Recepción",
    kind: "indicador",
    placement: {
      es: "Dentro de la propiedad, bifurcación de acceso",
      en: "Inside the property, at the access fork",
    },
    purpose: {
      es: "Indicador interno: ordena el flujo de carros y evita preguntas.",
      en: "Internal wayfinding: orders car flow and prevents questions.",
    },
    panels: [
      {
        kicker: "Parqueo · Parking",
        title: "Recepción",
        titleEn: "Check-in & tours",
        subtitle: "Registro de tours",
        cta: {
          es: "Parquee aquí y pregunte por su tour del día",
          en: "Park here and ask about today's tours",
        },
        brands: ["lva"],
        arrow: "right",
        photos: ["/image/IMG_4523.jpg", "/image/IMG_2443.jpg"],
        price: 50000,
      },
    ],
  },
  {
    id: 6,
    code: "R-06",
    name: "Anticipos Lajas + CQ",
    kind: "par",
    placement: {
      es: "Lajas y Ciudad Quesada (dos láminas de media)",
      en: "Lajas and Ciudad Quesada (two half-size panels)",
    },
    purpose: {
      es: "Dos anticipos lejanos: siembran la marca desde antes de la ruta.",
      en: "Two far-out teasers: plant the brand before the route even starts.",
    },
    panels: [
      {
        kicker: "Lajas",
        title: "El cañón lo espera",
        titleEn: "The canyon is waiting",
        cta: {
          es: "Siga rumbo a Sucre: vale cada kilómetro",
          en: "Keep heading to Sucre: worth every kilometer",
        },
        brands: ["lva"],
        arrow: "right",
        photos: ["/image/IMG_4671.jpg"],
        price: 25000,
      },
      {
        kicker: "Ciudad Quesada",
        title: "Cañón del Río La Vieja",
        titleEn: "La Vieja River Canyon",
        cta: {
          es: "Su próxima aventura queda saliendo a Sucre",
          en: "Your next adventure is on the road to Sucre",
        },
        brands: ["lva"],
        arrow: "right",
        photos: ["/image/IMG_4257.jpg"],
        price: 25000,
      },
    ],
  },
];

const KIND_META: Record<
  Rotulo["kind"],
  { icon: typeof Signpost; label: { es: string; en: string }; tone: string }
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

function formatCRC(value: number) {
  return new Intl.NumberFormat("es-CR").format(value);
}

function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Dónde arranca el bloque de fotos (%) y cuánto se inclina la diagonal. */
const PHOTO_START = 34;
const PHOTO_SKEW = 16;

/**
 * Recorte diagonal de cada foto: la imagen va a sangre con object-cover
 * (se expande y se corta, nunca se deforma) y solo se muestra su banda.
 */
function diagonalClip(index: number, total: number) {
  const span = (100 - PHOTO_START) / total;
  const topStart = PHOTO_START + span * index;
  const topEnd = index === total - 1 ? 102 : topStart + span;
  const bottomStart = topStart - PHOTO_SKEW;
  const bottomEnd = index === total - 1 ? 102 : topEnd - PHOTO_SKEW;
  return `polygon(${topStart}% -2%, ${topEnd}% -2%, ${bottomEnd}% 102%, ${bottomStart}% 102%)`;
}

const PHOTO_FOCUS = ["center 40%", "center 55%", "center 30%"];

function SocialMark({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={path} />
    </svg>
  );
}

/** Vista previa de una lámina, tal y como iría rotulada e impresa. */
function SignPanel({
  panel,
  large,
  eager,
}: {
  panel: Panel;
  large?: boolean;
  /** Solo la primera lámina de la página: evita el aviso de LCP. */
  eager?: boolean;
}) {
  const Arrow = panel.arrow === "down-right" ? CornerDownRight : ArrowRight;

  return (
    <div
      className={`relative flex-1 overflow-hidden rounded-2xl border-[5px] border-white/90 bg-[linear-gradient(150deg,#065f46,#047857_45%,#064e3b)] p-1 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)] ${
        large ? "min-h-[350px]" : "min-h-[300px]"
      }`}
    >
      {/* Borde interno: todo lo que va adentro se recorta contra este marco. */}
      <div className="relative h-full overflow-hidden rounded-xl border border-white/35">
        <div className="absolute inset-0">
          {panel.photos.map((photo, index) => (
            <div
              key={photo}
              className="absolute inset-0"
              style={{ clipPath: diagonalClip(index, panel.photos.length) }}
            >
              <Image
                src={photo}
                alt=""
                fill
                sizes="(max-width: 1024px) 92vw, 46vw"
                priority={eager && index === 0}
                className="scale-[1.08] object-cover"
                style={{ objectPosition: PHOTO_FOCUS[index % PHOTO_FOCUS.length] }}
              />
            </div>
          ))}
          {/* Filo blanco de la diagonal, como el corte del vinil. */}
          <div
            className="absolute inset-0 bg-white/70"
            style={{
              clipPath: `polygon(${PHOTO_START}% -2%, ${PHOTO_START + 1.2}% -2%, ${
                PHOTO_START + 1.2 - PHOTO_SKEW
              }% 102%, ${PHOTO_START - PHOTO_SKEW}% 102%)`,
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,#064e3b_0%,rgba(6,78,59,0.97)_30%,rgba(6,78,59,0.55)_46%,rgba(6,78,59,0.12)_62%,rgba(2,44,34,0.45)_100%)]" />
        </div>

        <div className="relative flex h-full flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {panel.brands.map((brand) => (
                <Image
                  key={brand}
                  src={brand === "lva" ? "/logo2.jpg" : "/logo1.jpg"}
                  alt={brand === "lva" ? "La Vieja Adventures" : "La Vieja Organics"}
                  width={large ? 58 : 44}
                  height={large ? 58 : 44}
                  className="rounded-lg border border-white/60 object-cover shadow-md shadow-black/50"
                />
              ))}
            </div>
            {panel.distance ? (
              <span className="rounded-full border border-white/70 bg-black/35 px-3 py-1 text-xs font-black tracking-wide text-white backdrop-blur-sm">
                {panel.distance}
              </span>
            ) : null}
          </div>

          <div className="mt-3 max-w-[70%]">
            {panel.kicker ? (
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-200/90">
                {panel.kicker}
              </p>
            ) : null}
            <p
              className={`mt-1 font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] ${
                large ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
              }`}
            >
              {panel.title}
            </p>
            {/* Bilingüe sutil: el inglés va debajo, más chico y menos peso. */}
            <p
              className={`mt-0.5 font-semibold uppercase tracking-[0.16em] text-emerald-100/70 ${
                large ? "text-xs md:text-sm" : "text-[9px] md:text-[10px]"
              }`}
            >
              {panel.titleEn}
            </p>
            {panel.subtitle ? (
              <p
                className={`mt-1.5 font-bold uppercase tracking-[0.18em] text-emerald-100/90 ${
                  large ? "text-sm" : "text-[10px] md:text-xs"
                }`}
              >
                {panel.subtitle}
              </p>
            ) : null}

            <p
              className={`mt-3 inline-block rounded-md bg-amber-300 px-2 py-1 font-black uppercase leading-tight tracking-tight text-emerald-950 ${
                large ? "text-sm md:text-base" : "text-[11px] md:text-xs"
              }`}
            >
              {panel.cta.es}
            </p>
            <p
              className={`mt-1 font-semibold italic text-white/80 ${
                large ? "text-xs md:text-sm" : "text-[9px] md:text-[10px]"
              }`}
            >
              {panel.cta.en}
            </p>
          </div>

          {/* Faja de contacto: lo que la gente anota o busca después. */}
          <div className="mt-4 rounded-lg border border-white/25 bg-black/45 px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={`truncate font-black tracking-tight text-white ${
                    large ? "text-base" : "text-xs md:text-sm"
                  }`}
                >
                  {BUSINESS.web}
                </p>
                <p
                  className={`mt-0.5 truncate font-bold text-emerald-100/90 ${
                    large ? "text-sm" : "text-[10px] md:text-xs"
                  }`}
                >
                  WhatsApp {BUSINESS.whatsapp} &middot; Tel {BUSINESS.phone}
                </p>
                <p
                  className={`mt-0.5 truncate text-emerald-100/70 ${
                    large ? "text-xs" : "text-[9px] md:text-[10px]"
                  }`}
                >
                  {BUSINESS.email}
                </p>
              </div>
              {panel.arrow ? (
                <Arrow
                  className={`shrink-0 text-white ${large ? "h-9 w-9" : "h-7 w-7"}`}
                  strokeWidth={3}
                  aria-hidden
                />
              ) : null}
            </div>

            <div className="mt-2 flex items-center gap-2 border-t border-white/15 pt-2">
              {SOCIALS.map((social) => (
                <span
                  key={social.label}
                  title={`${social.label} ${social.handle}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-950 shadow-sm"
                >
                  <SocialMark path={social.path} className="h-3.5 w-3.5" />
                </span>
              ))}
              <span
                className={`ml-1 truncate font-black uppercase tracking-[0.12em] text-white ${
                  large ? "text-xs" : "text-[9px] md:text-[10px]"
                }`}
              >
                {BUSINESS.handle}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RotulosPage() {
  const { lang, toggle } = useLanguage();
  const [currency, setCurrency] = useState<"crc" | "usd">("crc");
  const [selected, setSelected] = useState<number[]>(ROTULOS.map((r) => r.id));

  const isSelected = (id: number) => selected.includes(id);

  const toggleRotulo = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].sort((a, b) => a - b),
    );

  const totals = useMemo(() => {
    const chosen = ROTULOS.filter((r) => selected.includes(r.id));
    const panels = chosen.reduce((acc, r) => acc + r.panels.length, 0);
    const amount = chosen.reduce(
      (acc, r) => acc + r.panels.reduce((sum, p) => sum + p.price, 0),
      0,
    );
    return { count: chosen.length, panels, amount };
  }, [selected]);

  /** El plan se cotiza en colones; el USD es solo referencia de lectura. */
  const price = (crc: number) =>
    currency === "crc"
      ? `₡${formatCRC(crc)}`
      : formatUSD(Math.round(crc / CRC_PER_USD));

  const t = (es: string, en: string) => (lang === "es" ? es : en);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/85 backdrop-blur-2xl print:hidden">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo2.jpg"
              alt="La Vieja Adventures Logo"
              width={40}
              height={40}
              className="rounded-md object-cover shadow-md shadow-black/30"
              priority
            />
            <span className="hidden text-sm font-black tracking-tight text-white sm:inline md:text-base">
              La Vieja Adventures
            </span>
          </Link>

          <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-200 md:gap-4 md:text-sm">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 transition hover:border-emerald-200 hover:text-white sm:inline-flex"
            >
              <Printer className="h-4 w-4" aria-hidden />
              {t("Imprimir", "Print")}
            </button>
            <button
              type="button"
              onClick={() => setCurrency((c) => (c === "crc" ? "usd" : "crc"))}
              className="min-w-14 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 font-bold text-emerald-200 transition hover:bg-emerald-400/20"
              aria-label={t("Cambiar moneda", "Switch currency")}
            >
              {currency === "crc" ? "₡ CRC" : "$ USD"}
            </button>
            <button
              type="button"
              onClick={toggle}
              className="min-w-10 rounded-full border border-zinc-500/80 bg-white/10 px-3 py-1 text-center font-bold text-white transition hover:border-emerald-200 hover:bg-emerald-400/20"
              aria-label={lang === "es" ? "Switch to English" : "Cambiar a Español"}
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
          </nav>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {ROTULOS.map((rotulo) => {
            const meta = KIND_META[rotulo.kind];
            const Icon = meta.icon;
            const subtotal = rotulo.panels.reduce((sum, p) => sum + p.price, 0);
            const active = isSelected(rotulo.id);

            return (
              <article
                key={rotulo.id}
                className={`flex flex-col overflow-hidden rounded-3xl border bg-zinc-900/60 shadow-xl shadow-black/40 transition ${
                  active ? "border-emerald-300/30" : "border-white/10 opacity-55 grayscale"
                }`}
              >
                <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">
                      {rotulo.code}
                    </p>
                    <h2 className="mt-1 text-xl font-black tracking-tight text-white">
                      {rotulo.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleRotulo(rotulo.id)}
                    aria-pressed={active}
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black transition ${
                      active
                        ? "border-emerald-300/50 bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/30"
                        : "border-white/20 bg-white/5 text-zinc-300 hover:border-emerald-200/50"
                    }`}
                  >
                    {active ? t("Incluido", "Included") : t("Excluido", "Excluded")}
                  </button>
                </div>

                <div className="flex flex-col gap-3 bg-zinc-950/40 p-5 sm:flex-row">
                  {rotulo.panels.map((panel, index) => (
                    <SignPanel
                      key={`${rotulo.id}-${index}`}
                      panel={panel}
                      large={rotulo.kind === "entrada"}
                      eager={rotulo.id === 1}
                    />
                  ))}
                </div>

                <div className="flex flex-1 flex-col gap-3 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${meta.tone}`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {meta.label[lang]}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold text-zinc-300">
                      <LayoutPanelTop className="h-3.5 w-3.5" aria-hidden />
                      {rotulo.panels.length}{" "}
                      {rotulo.panels.length === 1
                        ? t("lámina", "panel")
                        : t("láminas", "panels")}
                    </span>
                  </div>

                  <p className="flex items-start gap-2 text-sm text-zinc-300">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
                    {rotulo.placement[lang]}
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-400">{rotulo.purpose[lang]}</p>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                      {t("Frase de calle", "Street hook")}
                    </p>
                    <ul className="mt-1.5 space-y-1.5 text-sm text-zinc-200">
                      {rotulo.panels.map((panel, index) => (
                        <li key={`${rotulo.id}-cta-${index}`} className="flex gap-2">
                          <span className="text-emerald-300">&rarr;</span>
                          <span>
                            {panel.cta.es}
                            <span className="block text-xs italic text-zinc-400">
                              {panel.cta.en}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-3">
                    <div className="text-xs text-zinc-400">
                      {rotulo.panels.length > 1
                        ? rotulo.panels.map((p) => price(p.price)).join(" + ")
                        : t("Precio unitario", "Unit price")}
                    </div>
                    <div className="text-2xl font-black tracking-tight text-white">
                      {price(subtotal)}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 overflow-x-auto rounded-3xl border border-white/10 bg-zinc-900/60">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-white/5 text-[11px] uppercase tracking-[0.16em] text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-black">{t("Rótulo", "Sign")}</th>
                <th className="px-4 py-3 font-black">{t("Ubicación", "Location")}</th>
                <th className="px-4 py-3 text-right font-black">{t("Monto", "Amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {ROTULOS.map((rotulo) => {
                const subtotal = rotulo.panels.reduce((sum, p) => sum + p.price, 0);
                return (
                  <tr
                    key={rotulo.id}
                    className={
                      isSelected(rotulo.id) ? "text-zinc-200" : "text-zinc-500 line-through"
                    }
                  >
                    <td className="px-4 py-3 font-bold">
                      <span className="text-emerald-300">{rotulo.code}</span> {rotulo.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{rotulo.placement[lang]}</td>
                    <td className="px-4 py-3 text-right font-black text-white">
                      {price(subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-emerald-400/10 text-emerald-100">
              <tr>
                <td className="px-4 py-4 font-black uppercase tracking-[0.16em]" colSpan={2}>
                  {t("Total seleccionado", "Selected total")}
                </td>
                <td className="px-4 py-4 text-right text-xl font-black text-white">
                  {price(totals.amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          {BUSINESS.name} &middot; {BUSINESS.place} &middot; {BUSINESS.web}
        </p>
      </section>
    </main>
  );
}

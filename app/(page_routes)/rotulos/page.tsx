"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Binoculars,
  CornerDownRight,
  Droplets,
  LayoutPanelTop,
  MapPin,
  Mountain,
  ParkingCircle,
  Printer,
  Ruler,
  Signpost,
  TreePine,
  UtensilsCrossed,
  Waves,
} from "lucide-react";
import { create as createQrMatrix } from "qrcode";
import { useLanguage } from "@/lib/LanguageContext";
import SignProposals from "@/app/components/rotulos/SignProposals";

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

type Brand = "lva" | "lva-turquoise";

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
  arrow?: "left" | "right" | "down-right";
  /** Pictograma de norma: se decodifica antes de leer una sola letra. */
  pictogram: "canon" | "cascada" | "rio" | "comida" | "parqueo" | "mirador";
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
        brands: ["lva", "lva-turquoise"],
        arrow: "right",
        pictogram: "canon",
        photos: ["/image/IMG_4946.JPG"],
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
          es: "Baje la velocidad: la entrada es a la izquierda",
          en: "Slow down: the entrance is on your left",
        },
        distance: "300 m",
        brands: ["lva"],
        arrow: "left",
        pictogram: "rio",
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
        pictogram: "cascada",
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
        pictogram: "comida",
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
        pictogram: "parqueo",
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
        pictogram: "canon",
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
        pictogram: "mirador",
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

/** Cuánto se inclina el corte diagonal entre el borde de arriba y el de abajo. */
const PHOTO_SKEW = 14;

/**
 * Bandas diagonales a sangre: las fotos ocupan la lámina entera y solo se ven
 * cortadas, nunca deformadas. Encima van los módulos de vidrio, así que la
 * imagen se sigue leyendo debajo del texto.
 */
function diagonalBand(index: number, total: number) {
  const span = 100 / total;
  const topStart = index === 0 ? -2 : span * index;
  const topEnd = index === total - 1 ? 102 : span * (index + 1);
  const bottomStart = index === 0 ? -2 : topStart - PHOTO_SKEW;
  const bottomEnd = index === total - 1 ? 102 : topEnd - PHOTO_SKEW;
  return `polygon(${topStart}% -2%, ${topEnd}% -2%, ${bottomEnd}% 102%, ${bottomStart}% 102%)`;
}

/** Filo blanco entre banda y banda, como el corte del vinil. */
function diagonalEdge(index: number, total: number) {
  const cut = (100 / total) * (index + 1);
  return `polygon(${cut}% -2%, ${cut + 0.9}% -2%, ${cut + 0.9 - PHOTO_SKEW}% 102%, ${
    cut - PHOTO_SKEW
  }% 102%)`;
}

const PHOTO_FOCUS = ["center 40%", "center 55%", "center 30%"];

function SocialMark({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={path} />
    </svg>
  );
}

/** El QR manda a la pagina. Calculo puro: mismo resultado en server y cliente. */
const QR_TARGET = `https://${BUSINESS.web}`;

const QR = (() => {
  const { modules } = createQrMatrix(QR_TARGET, { errorCorrectionLevel: "M" });
  const { size, data } = modules;
  let path = "";
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (data[y * size + x]) path += `M${x} ${y}h1v1h-1z`;
    }
  }
  return { size, path };
})();

/** Negro sobre blanco y con margen: asi es como de verdad escanea un telefono. */
function QrCode({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`-2 -2 ${QR.size + 4} ${QR.size + 4}`}
      shapeRendering="crispEdges"
      className={className}
      role="img"
      aria-label={`Codigo QR a ${BUSINESS.web}`}
    >
      <rect x={-2} y={-2} width={QR.size + 4} height={QR.size + 4} fill="#ffffff" />
      <path d={QR.path} fill="#052e16" />
    </svg>
  );
}

/**
 * El portal de entrada se consulta con el carro lento o detenido. Puede usar
 * una sola foto amplia, más aire y datos completos sin copiar el formato de
 * los anticipos que se leen a velocidad.
 */
function EntranceSignPanel({ panel, eager }: { panel: Panel; eager?: boolean }) {
  const Arrow = ARROWS[panel.arrow ?? "right"];

  return (
    <div className="relative flex-1 overflow-hidden rounded-[22px] border-[6px] border-white/95 bg-[#2E2A25] p-1.5 shadow-[0_24px_54px_-20px_rgba(0,0,0,0.95)]">
      <div className="relative flex min-h-[840px] overflow-hidden rounded-[14px] border-2 border-[#00C4B0]/80 sm:min-h-[760px] lg:min-h-[690px]">
        <Image
          src={panel.photos[0]}
          alt=""
          fill
          sizes="(max-width: 1024px) 94vw, 1180px"
          priority={eager}
          className="object-cover brightness-[1.08] saturate-[1.08]"
          style={{ objectPosition: "48% 50%" }}
        />

        {/* El degradado cambia de dirección para conservar la toma en cada formato. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(46,42,37,0.32)_0%,rgba(46,42,37,0.08)_27%,rgba(46,42,37,0.52)_58%,rgba(46,42,37,0.86)_86%)] lg:hidden" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(46,42,37,0.84)_0%,rgba(46,42,37,0.58)_43%,rgba(46,42,37,0.16)_73%,rgba(46,42,37,0.02)_100%)] lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[#2E2A25]/72 to-transparent" />

        <div className="relative flex w-full flex-col p-3 min-[380px]:p-5 sm:p-7 lg:p-9">
          {/* La flecha queda absoluta para no empujar los logos fuera del centro. */}
          <div className="relative flex min-h-[104px] items-start justify-center sm:min-h-[132px]">
            <div className="flex items-center gap-3 min-[380px]:gap-4 sm:gap-5">
              {panel.brands.map((brand) => (
                <Image
                  key={brand}
                  src={brand === "lva" ? "/logo2.jpg" : "/logo1.jpg"}
                  alt={
                    brand === "lva"
                      ? "La Vieja Adventures, logo oscuro"
                      : "La Vieja Adventures, logo turquesa"
                  }
                  width={128}
                  height={128}
                  className="h-16 w-16 rounded-xl border-[3px] border-white object-cover shadow-xl shadow-black/60 min-[380px]:h-20 min-[380px]:w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32"
                />
              ))}
            </div>

            {panel.arrow ? (
              <Arrow
                className="absolute right-0 top-[70px] h-8 w-8 text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.75)] min-[380px]:top-1 min-[380px]:h-9 min-[380px]:w-9 sm:h-14 sm:w-14 lg:h-16 lg:w-16"
                strokeWidth={3.25}
                aria-hidden
              />
            ) : null}
          </div>

          <div className="mt-5 max-w-[680px] rounded-2xl bg-[#2E2A25]/52 p-4 shadow-lg shadow-black/25 backdrop-blur-md sm:p-5 lg:mt-3 lg:max-w-[59%] lg:rounded-2xl lg:bg-[#2E2A25]/38 lg:p-5 lg:shadow-lg lg:backdrop-blur-md">
            {panel.kicker ? (
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7DE7DC] min-[380px]:text-xs min-[380px]:tracking-[0.2em] sm:text-sm">
                {panel.kicker}
              </p>
            ) : null}
            <p className="mt-2 text-2xl font-black uppercase leading-[0.94] tracking-tight text-white drop-shadow-[0_2px_7px_rgba(0,0,0,0.65)] min-[380px]:text-3xl sm:text-4xl lg:text-5xl">
              {panel.title}
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.02em] text-[#A8F0E8] min-[380px]:text-sm min-[380px]:tracking-[0.08em] sm:text-base lg:text-lg">
              {panel.titleEn}
            </p>
            {panel.subtitle ? (
              <p className="mt-2 text-sm font-black uppercase tracking-[0.06em] text-white/90 min-[380px]:text-base min-[380px]:tracking-[0.12em] lg:text-lg">
                {panel.subtitle}
              </p>
            ) : null}

            <p className="mt-5 block w-full max-w-2xl rounded-lg bg-[#F5C518] px-3 py-3 text-base font-black uppercase leading-tight tracking-tight text-[#2E2A25] shadow-lg shadow-black/25 min-[380px]:inline-block min-[380px]:w-auto min-[380px]:px-4 min-[380px]:text-lg sm:text-xl lg:text-2xl">
              {panel.cta.es}
            </p>
            <p className="mt-2 break-words text-xs font-semibold italic text-white/90 min-[380px]:text-sm sm:text-base lg:text-lg">
              {panel.cta.en}
            </p>
          </div>

          {/* Sin truncate: sitio, teléfonos y usuario quedan completos. */}
          <div className="mt-7 grid grid-cols-1 items-center gap-5 rounded-2xl border border-white/25 bg-[#2E2A25]/58 p-3 shadow-2xl shadow-black/45 backdrop-blur-lg min-[380px]:p-5 sm:grid-cols-[minmax(0,1fr)_auto] lg:mt-auto lg:p-6">
            <div className="min-w-0">
              <p className="break-all text-lg font-black leading-none tracking-[-0.04em] text-white min-[380px]:break-words min-[380px]:text-[clamp(1.35rem,4vw,2.75rem)] lg:whitespace-nowrap">
                {BUSINESS.web}
              </p>

              <div className="mt-3 grid gap-1 lg:grid-cols-2 lg:gap-5">
                <p className="text-base font-black leading-tight text-white sm:text-xl lg:text-2xl">
                  WhatsApp {BUSINESS.whatsapp}
                </p>
                <p className="text-base font-black leading-tight text-white sm:text-xl lg:text-2xl">
                  Tel. {BUSINESS.phone}
                </p>
              </div>

              <p className="mt-2 break-all text-[10px] font-semibold text-[#A8F0E8] min-[380px]:break-words min-[380px]:text-xs sm:text-base">
                {BUSINESS.email}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-white/15 pt-4 min-[380px]:gap-1.5 sm:gap-2.5">
                {SOCIALS.map((social) => (
                  <span
                    key={social.label}
                    title={`${social.label} ${social.handle}`}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#2E2A25] shadow-sm min-[380px]:h-7 min-[380px]:w-7 sm:h-10 sm:w-10"
                  >
                    <SocialMark path={social.path} className="h-3.5 w-3.5 min-[380px]:h-4 min-[380px]:w-4 sm:h-6 sm:w-6" />
                  </span>
                ))}
                <span className="basis-full break-words text-xs font-black uppercase tracking-[0.1em] text-white sm:text-sm md:ml-1 md:basis-auto">
                  {BUSINESS.handle}
                </span>
              </div>
            </div>

            <div className="mx-auto flex shrink-0 flex-col items-center gap-2 rounded-xl bg-white p-3 shadow-xl shadow-black/40">
              <QrCode className="h-36 w-36 lg:h-40 lg:w-40" />
              <span className="text-[10px] font-black uppercase leading-none tracking-[0.12em] text-[#2E2A25] lg:text-xs">
                Escanee &middot; Scan
              </span>
            </div>

            <p className="border-t border-white/15 pt-3 text-[10px] font-semibold leading-relaxed text-white/70 sm:col-span-2 sm:text-xs">
              Tours sujetos al clima, nivel del río y valoración del guía &middot; Tours subject
              to weather, river level and guide assessment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Tintes de vidrio. Se conserva el código de color de la señalización (verde
 * destino, azul distancia, amarillo acción) pero translúcido, para que la foto
 * siga viéndose debajo. El gris muy transparente es el que sostiene las letras.
 */
const GLASS = {
  gray: "rgba(24,24,27,0.42)",
  green: "rgba(15,122,61,0.44)",
  blue: "rgba(11,78,162,0.46)",
  yellow: "rgba(245,197,24,0.80)",
  yellowEdge: "rgba(138,107,0,0.7)",
};

/** Vidrio: desenfoque, borde claro y brillo interno arriba. */
const GLASS_BASE =
  "rounded-xl border border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_30px_-16px_rgba(0,0,0,0.8)]";

/** Sombra de texto: lo que hace legible una letra blanca sobre foto. */
const TEXT_SHADOW = "drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]";

const ARROWS = {
  left: ArrowLeft,
  right: ArrowRight,
  "down-right": CornerDownRight,
};

/** Pictogramas de norma: se decodifican antes de leer una sola letra. */
const PICTOGRAMS = {
  canon: Mountain,
  cascada: Droplets,
  rio: Waves,
  comida: UtensilsCrossed,
  parqueo: ParkingCircle,
  mirador: Binoculars,
  sendero: TreePine,
};

/**
 * Vista previa de una lámina: la foto va a sangre en toda la lámina y los
 * módulos flotan encima en vidrio. Se mantiene la división en módulos de las
 * propuestas — cada uno dice una sola cosa — pero ahora se ve la imagen debajo.
 */
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
  const Arrow = ARROWS[panel.arrow ?? "right"];
  const Picto = PICTOGRAMS[panel.pictogram];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border-[6px] border-white/90 bg-emerald-950 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.95)]">
      {/* Foto a sangre: ocupa la lámina entera, cortada en diagonal. */}
      <div className="absolute inset-0">
        {panel.photos.map((photo, index) => (
          <div
            key={photo}
            className="absolute inset-0"
            style={{ clipPath: diagonalBand(index, panel.photos.length) }}
          >
            <Image
              src={photo}
              alt=""
              fill
              sizes="(max-width: 1024px) 94vw, 60vw"
              priority={eager && index === 0}
              className="scale-[1.05] object-cover"
              style={{ objectPosition: PHOTO_FOCUS[index % PHOTO_FOCUS.length] }}
            />
          </div>
        ))}
        {panel.photos.slice(0, -1).map((photo, index) => (
          <div
            key={`edge-${photo}`}
            className="absolute inset-0 bg-white/70"
            style={{ clipPath: diagonalEdge(index, panel.photos.length) }}
          />
        ))}
        {/* Velo suave: apenas lo justo para que el vidrio tenga sobre qué apoyarse. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,32,24,0.28)_0%,rgba(3,32,24,0.12)_38%,rgba(3,32,24,0.42)_100%)]" />
      </div>

      <div className="relative flex flex-col gap-2 p-2">
        {/* MÓDULO 1 · marca: los logos flotan sobre la foto, sin taparla. */}
        <div className="flex items-start justify-between gap-3 p-1">
          <div className="flex items-center gap-3">
            {panel.brands.map((brand) => (
              <Image
                key={brand}
                src={brand === "lva" ? "/logo2.jpg" : "/logo1.jpg"}
                alt={brand === "lva" ? "La Vieja Adventures" : "La Vieja Organics"}
                width={large ? 150 : 116}
                height={large ? 150 : 116}
                className="rounded-2xl border-[3px] border-white/90 object-cover shadow-2xl shadow-black/70"
              />
            ))}
          </div>
          {panel.kicker ? (
            <span
              className={`${GLASS_BASE} rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white md:text-xs`}
              style={{ backgroundColor: GLASS.gray }}
            >
              {panel.kicker}
            </span>
          ) : null}
        </div>

        {/* MÓDULO 2 · destino: el renglón que se lee de lejos, con pictograma. */}
        <div
          className={`${GLASS_BASE} flex items-center gap-4 px-4 py-3`}
          style={{ backgroundColor: GLASS.green }}
        >
          <Picto
            className={`shrink-0 text-white ${TEXT_SHADOW} ${
              large ? "h-20 w-20" : "h-14 w-14"
            }`}
            strokeWidth={2.5}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p
              className={`font-black uppercase leading-[0.92] tracking-tight text-white ${TEXT_SHADOW} ${
                large ? "text-4xl md:text-6xl" : "text-2xl md:text-4xl"
              }`}
            >
              {panel.title}
            </p>
            {/* Bilingüe sutil: el inglés va debajo, más chico y con menos peso. */}
            <p
              className={`mt-1.5 font-semibold uppercase tracking-[0.16em] text-white/80 ${TEXT_SHADOW} ${
                large ? "text-base md:text-lg" : "text-[11px] md:text-sm"
              }`}
            >
              {panel.titleEn}
            </p>
            {panel.subtitle ? (
              <p
                className={`mt-2 border-t border-white/30 pt-2 font-black uppercase tracking-[0.14em] text-white ${TEXT_SHADOW} ${
                  large ? "text-xl md:text-2xl" : "text-sm md:text-lg"
                }`}
              >
                {panel.subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {/* MÓDULO 3 · flecha y distancia en azul, acción en amarillo. */}
        <div className="flex gap-2">
          <div
            className={`${GLASS_BASE} flex shrink-0 flex-col items-center justify-center px-4 py-3`}
            style={{ backgroundColor: GLASS.blue }}
          >
            <Arrow
              className={`text-white ${TEXT_SHADOW} ${large ? "h-24 w-24" : "h-16 w-16"}`}
              strokeWidth={3.5}
              aria-hidden
            />
            {panel.distance ? (
              <span
                className={`mt-1 font-black leading-none text-white ${TEXT_SHADOW} ${
                  large ? "text-3xl" : "text-xl"
                }`}
              >
                {panel.distance}
              </span>
            ) : null}
          </div>

          <div
            className={`${GLASS_BASE} flex min-w-0 flex-1 flex-col justify-center px-4 py-3`}
            style={{ backgroundColor: GLASS.yellow, borderColor: GLASS.yellowEdge }}
          >
            <p
              className={`font-black uppercase leading-tight tracking-tight text-zinc-900 ${
                large ? "text-2xl md:text-3xl" : "text-base md:text-xl"
              }`}
            >
              {panel.cta.es}
            </p>
            <p
              className={`mt-1 font-bold italic leading-tight text-zinc-900/75 ${
                large ? "text-base" : "text-[11px] md:text-sm"
              }`}
            >
              {panel.cta.en}
            </p>
          </div>
        </div>

        {/* MÓDULO 4 · contacto y QR sobre gris muy transparente. */}
        <div
          className={`${GLASS_BASE} flex flex-wrap items-stretch gap-3 p-3`}
          style={{ backgroundColor: GLASS.gray }}
        >
          <div className="flex min-w-[200px] flex-1 flex-col justify-center">
            <p
              className={`truncate font-black leading-none tracking-tight text-white ${TEXT_SHADOW} ${
                large ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
              }`}
            >
              {BUSINESS.web}
            </p>
            <p
              className={`mt-2.5 truncate font-black leading-tight text-white ${TEXT_SHADOW} ${
                large ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
              }`}
            >
              WhatsApp {BUSINESS.whatsapp}
            </p>
            <p
              className={`truncate font-black leading-tight text-white ${TEXT_SHADOW} ${
                large ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
              }`}
            >
              Tel. {BUSINESS.phone}
            </p>
            <p
              className={`mt-1 truncate font-semibold text-emerald-50/85 ${TEXT_SHADOW} ${
                large ? "text-base" : "text-xs md:text-sm"
              }`}
            >
              {BUSINESS.email}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/25 pt-3">
              {SOCIALS.map((social) => (
                <span
                  key={social.label}
                  title={`${social.label} ${social.handle}`}
                  className={`flex items-center justify-center rounded-full bg-white text-emerald-950 shadow-lg shadow-black/40 ${
                    large ? "h-11 w-11" : "h-9 w-9"
                  }`}
                >
                  <SocialMark path={social.path} className={large ? "h-6 w-6" : "h-5 w-5"} />
                </span>
              ))}
              <span
                className={`ml-1 truncate font-black uppercase tracking-[0.12em] text-white ${TEXT_SHADOW} ${
                  large ? "text-lg" : "text-sm"
                }`}
              >
                {BUSINESS.handle}
              </span>
            </div>
          </div>

          {/* El QR sí va opaco: sobre vidrio o foto sencillamente no escanea. */}
          <div className="mx-auto flex shrink-0 flex-col items-center gap-1.5 rounded-xl bg-white p-2.5 shadow-xl shadow-black/50">
            <QrCode className={large ? "h-48 w-48" : "h-36 w-36"} />
            <span
              className={`font-black uppercase leading-none tracking-[0.1em] text-emerald-950 ${
                large ? "text-sm" : "text-xs"
              }`}
            >
              Escanee &middot; Scan
            </span>
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

      <section className="mx-auto w-full max-w-7xl px-2 pb-16 sm:px-4 md:px-8">
        <div className="grid gap-8">
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

                <div
                  className={`grid gap-5 ${
                    rotulo.kind === "entrada"
                      ? "p-2 min-[380px]:p-3 sm:p-5"
                      : "p-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.6fr)]"
                  }`}
                >
                  <div
                    className={`flex flex-col gap-4 rounded-2xl bg-zinc-950/40 xl:flex-row ${
                      rotulo.kind === "entrada" ? "p-1 min-[380px]:p-2 sm:p-4" : "p-4"
                    }`}
                  >
                    {rotulo.panels.map((panel, index) =>
                      rotulo.kind === "entrada" ? (
                        <EntranceSignPanel
                          key={`${rotulo.id}-${index}`}
                          panel={panel}
                          eager={rotulo.id === 1}
                        />
                      ) : (
                        <SignPanel
                          key={`${rotulo.id}-${index}`}
                          panel={panel}
                          eager={rotulo.id === 1}
                        />
                      ),
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3">
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

        <SignProposals lang={lang} />

        <p className="mt-10 text-center text-xs text-zinc-500">
          {BUSINESS.name} &middot; {BUSINESS.place} &middot; {BUSINESS.web}
        </p>
      </section>
    </main>
  );
}

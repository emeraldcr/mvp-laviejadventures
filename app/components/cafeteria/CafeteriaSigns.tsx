import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Coffee,
  CupSoda,
  Eye,
  HandCoins,
  Sandwich,
  Smartphone,
  Snowflake,
  Target,
  TriangleAlert,
  UtensilsCrossed,
  Wheat,
  Zap,
  type LucideIcon,
} from "lucide-react";
import PrintButton from "./PrintButton";
import styles from "./CafeteriaSigns.module.css";

const SINPE_PHONE = "6233-2535";

type SignId = "menu" | "calientes" | "frias" | "comidas" | "sinpe" | "proposito";

type SignDefinition = {
  id: SignId;
  code: string;
  title: string;
  description: string;
  placement: string;
  pending: string[];
  Artwork: ComponentType;
};

function ArtworkBrand({ darkText = false }: { darkText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div className="shrink-0 bg-[#2E2A25] p-1.5">
        <Image
          src="/logo2.jpg"
          alt=""
          width={64}
          height={64}
          className="h-11 w-11 object-contain sm:h-14 sm:w-14"
        />
      </div>
      <div className={darkText ? "text-[#2E2A25]" : "text-white"}>
        <p className="font-display text-[clamp(0.9rem,2.1vw,1.2rem)] font-black uppercase leading-none tracking-tight">
          Cafetería
        </p>
        <p className="mt-1 text-[clamp(0.52rem,1.25vw,0.7rem)] font-extrabold uppercase tracking-[0.16em] opacity-70">
          La Vieja Adventures
        </p>
      </div>
    </div>
  );
}

function SignCode({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[clamp(0.5rem,1.2vw,0.65rem)] font-black uppercase tracking-[0.2em] ${
        dark
          ? "border-[#2E2A25]/20 bg-[#2E2A25]/5 text-[#2E2A25]"
          : "border-white/25 bg-white/10 text-white"
      }`}
    >
      {children}
    </span>
  );
}

function PriceBlank({ inverse = false }: { inverse?: boolean }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[clamp(0.58rem,1.45vw,0.78rem)] font-black tracking-[0.08em] ${
        inverse
          ? "border-white/35 bg-white/10 text-white"
          : "border-[#2E2A25]/20 bg-white/65 text-[#2E2A25]"
      }`}
      aria-label="Precio por definir"
    >
      ₡ ____
    </span>
  );
}

function MenuArtwork() {
  const categories: Array<{ icon: LucideIcon; title: string; items: string }> = [
    {
      icon: Coffee,
      title: "Bebidas calientes",
      items: "Café · Chocolate · Agua dulce",
    },
    {
      icon: CupSoda,
      title: "Bebidas frías",
      items: "Gaseosas · Powerade · Monster",
    },
    {
      icon: UtensilsCrossed,
      title: "Algo para comer",
      items: "Empanadas · Sándwiches · Tortillas",
    },
  ];

  return (
    <div
      className={`${styles.artboard} ${styles.menuTexture} bg-[#2E2A25] text-white`}
      role="img"
      aria-label="Propuesta de rótulo para el menú general de la cafetería"
    >
      <div className="absolute -right-[12%] -top-[24%] h-[72%] w-[44%] rotate-12 rounded-[50%] bg-[#00C4B0]" />
      <div className="absolute -bottom-[46%] -left-[18%] h-[70%] w-[75%] -rotate-6 rounded-[50%] border-[clamp(1rem,4vw,2.5rem)] border-[#00C4B0]/25" />

      <div className="absolute inset-0 flex flex-col p-[clamp(1.1rem,4vw,2.8rem)]">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <ArtworkBrand />
          <SignCode dark>C-01</SignCode>
        </div>

        <div className="relative z-10 mt-auto pt-5">
          <p className="text-[clamp(0.56rem,1.45vw,0.8rem)] font-black uppercase tracking-[0.24em] text-[#8EF2E6]">
            Un gustico en el camino
          </p>
          <h2 className="font-display text-[clamp(4rem,15vw,8.8rem)] font-black uppercase leading-[0.72] tracking-[-0.07em]">
            Menú
          </h2>
        </div>

        <div className="relative z-10 mt-[clamp(1rem,3vw,2rem)] grid gap-2 sm:grid-cols-3 sm:gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="flex items-center gap-3 border border-white/15 bg-white/[0.07] px-3 py-2.5 backdrop-blur-sm sm:block sm:p-4"
              >
                <Icon
                  className="h-7 w-7 shrink-0 text-[#00C4B0] sm:h-9 sm:w-9"
                  strokeWidth={2.2}
                  aria-hidden
                />
                <div className="min-w-0 sm:mt-4">
                  <p className="font-display text-[clamp(0.8rem,2.3vw,1.2rem)] font-black uppercase leading-none">
                    {category.title}
                  </p>
                  <p className="mt-1.5 text-[clamp(0.58rem,1.35vw,0.76rem)] font-semibold leading-snug text-white/65">
                    {category.items}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative z-10 mt-3 flex items-center justify-between gap-3 border-t border-white/15 pt-3 text-[clamp(0.56rem,1.35vw,0.72rem)] font-bold uppercase tracking-[0.14em] text-white/65">
          <span>Vea cada sección</span>
          <span>Pagos por SINPE Móvil</span>
        </div>
      </div>
    </div>
  );
}

function HotDrinksArtwork() {
  const drinks = ["Café", "Chocolate", "Agua dulce"];

  return (
    <div
      className={`${styles.artboard} border-[clamp(0.7rem,2.2vw,1.25rem)] border-[#00C4B0] bg-[#F7F0E5] text-[#2E2A25]`}
      role="img"
      aria-label="Propuesta de rótulo para café, chocolate y agua dulce"
    >
      <div className="absolute -right-[10%] top-[12%] h-[45%] w-[24%] rounded-l-full bg-[#00C4B0]/18" />
      <div className="absolute inset-0 flex flex-col p-[clamp(1rem,3.5vw,2.5rem)]">
        <div className="flex items-start justify-between gap-3">
          <ArtworkBrand darkText />
          <SignCode dark>C-02</SignCode>
        </div>

        <div className="mt-auto grid min-h-0 grid-cols-[0.82fr_1.18fr] items-center gap-[clamp(0.8rem,3vw,2.4rem)] py-4 sm:py-7">
          <div className="relative flex aspect-square items-center justify-center rounded-full bg-[#2E2A25] text-white shadow-[0_24px_60px_rgba(46,42,37,0.22)]">
            <div className="absolute -top-[18%] left-[28%] h-[30%] w-[9%] -rotate-12 rounded-full border-l-[3px] border-[#00C4B0]/70" />
            <div className="absolute -top-[23%] left-[48%] h-[37%] w-[9%] rotate-6 rounded-full border-l-[3px] border-[#00C4B0]/70" />
            <div className="absolute -top-[17%] left-[66%] h-[28%] w-[9%] rotate-12 rounded-full border-l-[3px] border-[#00C4B0]/70" />
            <Coffee className="h-[48%] w-[48%]" strokeWidth={1.65} aria-hidden />
          </div>

          <div className="min-w-0">
            <p className="text-[clamp(0.55rem,1.4vw,0.78rem)] font-black uppercase tracking-[0.25em] text-[#006F65]">
              Bebidas calientes
            </p>
            <h2 className="mt-2 font-display text-[clamp(2.1rem,7vw,5rem)] font-black uppercase leading-[0.83] tracking-[-0.055em]">
              Calientito
              <span className="block text-[#006F65]">cae bien</span>
            </h2>
          </div>
        </div>

        <div className="grid divide-y divide-[#2E2A25]/15 border-y-2 border-[#2E2A25] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {drinks.map((drink) => (
            <div key={drink} className="flex items-center justify-between gap-2 px-2.5 py-2.5 sm:block sm:px-4 sm:py-4">
              <p className="font-display text-[clamp(0.85rem,2.8vw,1.6rem)] font-black uppercase leading-none">
                {drink}
              </p>
              <div className="sm:mt-3">
                <PriceBlank />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ColdDrinksArtwork() {
  const drinks: Array<{ icon: LucideIcon; name: string; note: string; tone: string }> = [
    { icon: CupSoda, name: "Gaseosas", note: "Opciones por confirmar", tone: "bg-white text-[#123044]" },
    { icon: Snowflake, name: "Powerade", note: "Sabores por confirmar", tone: "bg-[#00C4B0] text-[#092333]" },
    { icon: Zap, name: "Monster", note: "Presentación por confirmar", tone: "bg-[#F3A712] text-[#2E2A25]" },
  ];

  return (
    <div
      className={`${styles.artboard} ${styles.coldBubbles} bg-[#092333] text-white`}
      role="img"
      aria-label="Propuesta de rótulo para gaseosas, Powerade y Monster"
    >
      <div className="absolute -left-[8%] top-[18%] h-[55%] w-[18%] skew-x-[-9deg] bg-[#00C4B0]" />
      <div className="absolute inset-0 flex flex-col p-[clamp(1.1rem,4vw,2.8rem)]">
        <div className="flex items-start justify-between gap-3">
          <ArtworkBrand />
          <SignCode>C-03</SignCode>
        </div>

        <div className="mt-auto pt-4">
          <p className="text-[clamp(0.55rem,1.45vw,0.78rem)] font-black uppercase tracking-[0.26em] text-[#76EBDE]">
            Frías y listas para el paseo
          </p>
          <h2 className="mt-2 font-display text-[clamp(2.6rem,9vw,6.4rem)] font-black uppercase leading-[0.82] tracking-[-0.055em]">
            Para
            <span className="block text-[#00C4B0]">refrescarse</span>
          </h2>
        </div>

        <div className="mt-[clamp(0.9rem,2.6vw,1.7rem)] grid gap-2 sm:grid-cols-3 sm:gap-3">
          {drinks.map((drink) => {
            const Icon = drink.icon;
            return (
              <div key={drink.name} className={`${drink.tone} flex items-center gap-3 p-3 sm:block sm:p-4`}>
                <Icon className="h-7 w-7 shrink-0 sm:h-9 sm:w-9" strokeWidth={2.2} aria-hidden />
                <div className="min-w-0 flex-1 sm:mt-4">
                  <p className="font-display text-[clamp(0.95rem,3vw,1.65rem)] font-black uppercase leading-none">
                    {drink.name}
                  </p>
                  <p className="mt-1 text-[clamp(0.5rem,1.15vw,0.66rem)] font-bold uppercase tracking-[0.09em] opacity-60">
                    {drink.note}
                  </p>
                </div>
                <div className="sm:mt-3">
                  <PriceBlank inverse={drink.name === "Powerade"} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FoodArtwork() {
  const foods: Array<{ icon: LucideIcon; name: string; accent: string }> = [
    { icon: UtensilsCrossed, name: "Empanadas", accent: "#00C4B0" },
    { icon: Sandwich, name: "Sándwiches", accent: "#F3A712" },
    { icon: Wheat, name: "Tortillas", accent: "#00C4B0" },
  ];

  return (
    <div
      className={`${styles.artboard} bg-[#2E2A25] text-white`}
      role="img"
      aria-label="Propuesta de rótulo para empanadas, sándwiches y tortillas"
    >
      <div className="absolute right-0 top-0 h-full w-[23%] bg-[#F3A712]" />
      <div className="absolute -right-[7%] top-[8%] h-[42%] w-[25%] rotate-12 rounded-full border-[clamp(0.8rem,2.8vw,1.8rem)] border-[#2E2A25]/18" />
      <div className="absolute inset-0 flex flex-col p-[clamp(1.1rem,4vw,2.8rem)]">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <ArtworkBrand />
          <SignCode dark>C-04</SignCode>
        </div>

        <div className="relative z-10 mt-auto pt-4">
          <p className="text-[clamp(0.55rem,1.45vw,0.78rem)] font-black uppercase tracking-[0.26em] text-[#76EBDE]">
            Algo rico para comer
          </p>
          <h2 className="mt-2 max-w-[82%] font-display text-[clamp(2.4rem,8.5vw,6rem)] font-black uppercase leading-[0.82] tracking-[-0.055em]">
            ¿Le pegó
            <span className="block text-[#F3A712]">el hambre?</span>
          </h2>
        </div>

        <div className="relative z-10 mt-[clamp(1rem,3vw,2rem)] grid grid-cols-3 gap-2 sm:gap-3">
          {foods.map((food) => {
            const Icon = food.icon;
            return (
              <div key={food.name} className="bg-[#F7F0E5] p-2.5 text-[#2E2A25] sm:p-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full sm:h-12 sm:w-12"
                  style={{ backgroundColor: food.accent }}
                >
                  <Icon className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={2.1} aria-hidden />
                </div>
                <p className="mt-3 break-words font-display text-[clamp(0.78rem,2.7vw,1.55rem)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
                  {food.name}
                </p>
                <p className="mt-2 text-[clamp(0.48rem,1.1vw,0.64rem)] font-bold uppercase tracking-[0.08em] text-[#2E2A25]/70">
                  Opciones por definir
                </p>
                <div className="mt-3">
                  <PriceBlank />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SinpeArtwork() {
  return (
    <div
      className={`${styles.artboard} border-[clamp(0.75rem,2.4vw,1.35rem)] border-[#00C4B0] bg-white text-[#2E2A25]`}
      role="img"
      aria-label={`Propuesta de rótulo SINPE Móvil al número ${SINPE_PHONE}`}
    >
      <div className="absolute inset-0 flex flex-col p-[clamp(1rem,3.5vw,2.5rem)]">
        <div className="flex items-start justify-between gap-3">
          <ArtworkBrand darkText />
          <SignCode dark>C-05</SignCode>
        </div>

        <div className="mt-auto grid min-h-0 grid-cols-[0.75fr_1.25fr] items-center gap-[clamp(0.9rem,3vw,2.4rem)] py-4 sm:py-7">
          <div
            className={`${styles.qrPlaceholder} flex aspect-square flex-col items-center justify-center border-[3px] border-dashed border-[#2E2A25]/25 bg-[#F3FBF9] p-3 text-center`}
          >
            <Smartphone className="h-[30%] w-[30%] text-[#006F65]" strokeWidth={1.8} aria-hidden />
            <p className="mt-3 text-[clamp(0.58rem,1.45vw,0.78rem)] font-black uppercase tracking-[0.12em]">
              QR pendiente
            </p>
            <p className="mt-1 max-w-32 text-[clamp(0.48rem,1vw,0.6rem)] font-semibold leading-tight text-[#2E2A25]/70">
              Se genera cuando estén confirmados los datos
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[clamp(0.54rem,1.35vw,0.75rem)] font-black uppercase tracking-[0.25em] text-[#006F65]">
              Pague aquí
            </p>
            <h2 className="mt-2 font-display text-[clamp(2.2rem,7.5vw,5.4rem)] font-black uppercase leading-[0.8] tracking-[-0.055em]">
              SINPE
              <span className="block text-[#006F65]">Móvil</span>
            </h2>
            <p className="mt-[clamp(0.8rem,2.4vw,1.5rem)] font-display text-[clamp(1.25rem,4vw,2.6rem)] font-black tracking-[-0.035em]">
              {SINPE_PHONE}
            </p>
            <div className="mt-3 border-l-4 border-[#F3A712] bg-[#F7F0E5] px-3 py-2">
              <p className="text-[clamp(0.48rem,1.05vw,0.62rem)] font-black uppercase tracking-[0.14em] text-[#2E2A25]/70">
                Verifique que aparezca
              </p>
              <p className="mt-1 text-[clamp(0.68rem,1.7vw,0.92rem)] font-black uppercase">
                [Titular por confirmar]
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t-2 border-[#2E2A25] pt-3">
          <div className="flex items-center gap-2 text-[clamp(0.53rem,1.2vw,0.68rem)] font-black uppercase tracking-[0.12em]">
            <HandCoins className="h-4 w-4 text-[#006F65]" aria-hidden />
            Gracias por su compra · Pura vida
          </div>
          <span className="bg-[#F3A712] px-2.5 py-1 text-[clamp(0.48rem,1.1vw,0.62rem)] font-black uppercase tracking-[0.14em]">
            Borrador
          </span>
        </div>
      </div>
    </div>
  );
}

function PurposeArtwork() {
  return (
    <div
      className={`${styles.artboard} bg-[#171512] text-white`}
      role="img"
      aria-label="Propuesta de rótulo con borradores de misión y visión"
    >
      <Image
        src="/image/IMG_4946.JPG"
        alt=""
        fill
        sizes="(min-width: 1100px) 70vw, 100vw"
        className="object-cover object-center"
      />
      <div className={`absolute inset-0 ${styles.photoOverlay}`} />

      <div className="absolute inset-0 flex flex-col p-[clamp(1.1rem,4vw,2.8rem)]">
        <div className="relative z-10 flex items-start justify-between gap-3">
          <ArtworkBrand />
          <SignCode>C-06</SignCode>
        </div>

        <div className="relative z-10 mt-auto pt-4">
          <p className="text-[clamp(0.55rem,1.45vw,0.78rem)] font-black uppercase tracking-[0.26em] text-[#76EBDE]">
            Borrador para aprobación
          </p>
          <h2 className="mt-2 max-w-[82%] font-display text-[clamp(2.4rem,8vw,5.7rem)] font-black uppercase leading-[0.82] tracking-[-0.055em]">
            Nuestro
            <span className="block text-[#00C4B0]">propósito</span>
          </h2>
        </div>

        <div className="relative z-10 mt-[clamp(0.9rem,2.5vw,1.5rem)] grid gap-2 sm:grid-cols-2 sm:gap-3">
          <div className="bg-[#00C4B0] p-3 text-[#16302C] sm:p-5">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 shrink-0" strokeWidth={2.4} aria-hidden />
              <h3 className="font-display text-[clamp(0.9rem,2.4vw,1.35rem)] font-black uppercase">
                Misión
              </h3>
            </div>
            <p className="mt-2 text-[clamp(0.58rem,1.35vw,0.77rem)] font-bold leading-relaxed sm:mt-3">
              Crear una pausa cálida para quienes visitan La Vieja, con atención cercana y una
              experiencia que invite a disfrutar el entorno.
            </p>
          </div>

          <div className="border border-white/25 bg-[#2E2A25]/90 p-3 backdrop-blur-sm sm:p-5">
            <div className="flex items-center gap-2 text-[#8EF2E6]">
              <Eye className="h-5 w-5 shrink-0" strokeWidth={2.4} aria-hidden />
              <h3 className="font-display text-[clamp(0.9rem,2.4vw,1.35rem)] font-black uppercase">
                Visión
              </h3>
            </div>
            <p className="mt-2 text-[clamp(0.58rem,1.35vw,0.77rem)] font-bold leading-relaxed text-white/82 sm:mt-3">
              Convertir la cafetería en un punto de encuentro querido por visitantes y comunidad,
              reconocido por su hospitalidad y respeto por la naturaleza.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const SIGNS: SignDefinition[] = [
  {
    id: "menu",
    code: "C-01",
    title: "Menú general",
    description:
      "La pieza de entrada: presenta las tres familias de productos y dirige a los rótulos específicos.",
    placement: "Entrada o pared principal de la cafetería.",
    pending: ["Definir medida física y ubicación exacta.", "Confirmar si el menú llevará el nombre “Cafetería”."],
    Artwork: MenuArtwork,
  },
  {
    id: "calientes",
    code: "C-02",
    title: "Café, chocolate y agua dulce",
    description:
      "Una carta cálida y clara, con los tres productos visibles desde lejos y espacio reservado para precio.",
    placement: "Sobre la estación de bebidas calientes.",
    pending: ["Precios.", "Tamaños y presentaciones disponibles."],
    Artwork: HotDrinksArtwork,
  },
  {
    id: "frias",
    code: "C-03",
    title: "Gaseosas, Powerade y Monster",
    description:
      "Tres bandas de alto contraste; nombra las marcas sin reconstruir ni alterar sus logotipos comerciales.",
    placement: "Cerca de la refrigeradora o punto de entrega.",
    pending: ["Precios.", "Sabores, tamaños y presentaciones reales."],
    Artwork: ColdDrinksArtwork,
  },
  {
    id: "comidas",
    code: "C-04",
    title: "Empanadas, sándwiches y tortillas",
    description:
      "Rótulo apetitoso y directo, organizado en tres tarjetas para que el cliente decida rápido.",
    placement: "Mostrador de alimentos o pared contigua.",
    pending: ["Opciones y rellenos exactos.", "Precios e ingredientes que deban informarse."],
    Artwork: FoodArtwork,
  },
  {
    id: "sinpe",
    code: "C-05",
    title: "SINPE Móvil",
    description:
      `Usa el número ${SINPE_PHONE}, ya configurado para SINPE en el checkout actual. El QR todavía no se genera.`,
    placement: "Junto a la caja, a distancia cómoda para leer y escanear.",
    pending: ["Nombre exacto del titular.", "Generar y probar el QR después de confirmar los datos."],
    Artwork: SinpeArtwork,
  },
  {
    id: "proposito",
    code: "C-06",
    title: "Misión y visión",
    description:
      "Una pieza institucional con dos textos breves propuestos; no se presentan todavía como declaraciones oficiales.",
    placement: "Pared de permanencia o zona de mesas.",
    pending: ["Aprobar o reemplazar la misión propuesta.", "Aprobar o reemplazar la visión propuesta."],
    Artwork: PurposeArtwork,
  },
];

export default function CafeteriaSigns() {
  return (
    <main className={styles.page} lang="es">
      <header
        className={`${styles.screenOnly} sticky top-0 z-40 border-b border-white/10 bg-[#171512]/90 backdrop-blur-xl`}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-3 text-white transition hover:text-[#8EF2E6]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            <div className="shrink-0 bg-[#2E2A25] p-1">
              <Image src="/logo2.jpg" alt="La Vieja Adventures" width={36} height={36} className="h-8 w-8 object-contain" priority />
            </div>
            <span className="truncate text-sm font-black sm:text-base">Rótulos de cafetería</span>
          </Link>

          <PrintButton target="all" variant="header" />
        </div>
      </header>

      <div
        className={`${styles.pageInner} mx-auto max-w-7xl px-3 pb-20 pt-8 sm:px-5 md:px-8 md:pt-12`}
      >
        <section className={`${styles.screenOnly} grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end`}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#76EBDE]">
              Primera propuesta · 6 piezas
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl md:text-7xl">
              Una cafetería que se entiende de una mirada.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/65 sm:text-base">
              Seis rótulos distintos, unidos por la marca de La Vieja: menú, bebidas calientes,
              bebidas frías, comidas, SINPE y propósito. Todo está en español y pensado para verse
              bien en pantalla o imprimirse por separado.
            </p>
          </div>

          <aside className="border border-[#F3A712]/35 bg-[#F3A712]/10 p-4 text-sm leading-relaxed text-amber-50 sm:p-5">
            <div className="flex items-center gap-2 font-black text-[#FFD67A]">
              <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden />
              Antes de mandar a producir
            </div>
            <p className="mt-2 text-amber-50/75">
              Faltan precios, opciones exactas, titular y QR de SINPE, medidas finales, y aprobar la
              misión y la visión. Los espacios en blanco son intencionales: aquí no se inventó ningún dato.
            </p>
          </aside>
        </section>

        <nav className={`${styles.screenOnly} mt-8 flex gap-2 overflow-x-auto pb-3`} aria-label="Ir a un rótulo">
          {SIGNS.map((sign) => (
            <a
              key={sign.id}
              href={`#${sign.id}`}
              className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/70 transition hover:border-[#00C4B0]/60 hover:text-white"
            >
              <span className="mr-1.5 text-[#76EBDE]">{sign.code}</span>
              {sign.title}
            </a>
          ))}
        </nav>

        <section className={`${styles.signList} mt-7`} aria-label="Seis propuestas de rótulos">
          {SIGNS.map((sign) => {
            const Artwork = sign.Artwork;
            return (
              <article
                key={sign.id}
                id={sign.id}
                data-sign-id={sign.id}
                className={styles.signCard}
              >
                <div className={styles.signLayout}>
                  <div className={styles.artboardFrame}>
                    <Artwork />
                  </div>

                  <aside className={styles.details}>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#76EBDE]">
                        {sign.code}
                      </p>
                      <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-white">
                        {sign.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-white/60">{sign.description}</p>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                        Ubicación sugerida
                      </p>
                      <p className="mt-1.5 text-sm font-semibold leading-relaxed text-white/75">
                        {sign.placement}
                      </p>
                    </div>

                    <div className="border border-[#F3A712]/20 bg-[#F3A712]/[0.07] p-3.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFD67A]">
                        Falta completar
                      </p>
                      <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-amber-50/65">
                        {sign.pending.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="text-[#F3A712]">·</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <PrintButton target={sign.id} variant="card" />
                  </aside>
                </div>
              </article>
            );
          })}
        </section>

        <footer className={`${styles.screenOnly} mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/35`}>
          La Vieja Adventures · Propuesta interna de rótulos · Medidas y materiales por definir
        </footer>
      </div>
    </main>
  );
}

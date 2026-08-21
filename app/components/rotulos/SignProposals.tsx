"use client";

import Image from "next/image";
import {
  ArrowUp,
  ArrowUpRight,
  Award,
  Binoculars,
  Car,
  Mountain,
  ParkingCircle,
  Trees,
  UtensilsCrossed,
  Waves,
} from "lucide-react";

type Lang = "es" | "en";
type Copy = { es: string; en: string };

/**
 * Colores de norma, no de marca: son los que la gente ya sabe leer sin pensar.
 * Verde destino y azul servicios vienen del Manual Centroamericano (SIECA) y de
 * la Convencion de Viena; el cafe de atractivo turistico es el mismo que usan
 * MUTCD (EE.UU.), Reino Unido, Alemania y Mexico.
 */
const SIGN_COLORS = {
  green: "#0F7A3D",
  blue: "#0B4EA2",
  brown: "#5C3B1E",
  yellow: "#F5C518",
  wood: "#2A1E14",
};

type Variant = "mopt" | "turistico" | "servicios" | "flecha" | "portal" | "blades";

type Proposal = {
  id: string;
  variant: Variant;
  name: Copy;
  /** De donde sale el formato: sistemas reales que lo usan. */
  reference: Copy;
  /** Para cual de los seis puntos sirve. */
  slots: string;
  why: Copy;
  specs: Copy[];
  recommended: boolean;
};

const PROPOSALS: Proposal[] = [
  {
    id: "P-A",
    variant: "turistico",
    name: {
      es: "Café turístico con pictograma",
      en: "Brown tourist sign with pictogram",
    },
    reference: {
      es: "MUTCD (EE.UU.), TSRGD (Reino Unido), Unterrichtungstafel (Alemania), SECTUR (México)",
      en: "MUTCD (US), TSRGD (UK), Unterrichtungstafel (Germany), SECTUR (Mexico)",
    },
    slots: "R-02 · R-03 · R-06",
    why: {
      es: "El café es el color que el mundo entero reserva para atractivo turístico y recreativo. El conductor lo decodifica antes de leer una sola letra: sabe que ahí hay algo que visitar, no un negocio cualquiera. Pictograma + destino + distancia: tres unidades, ni una más.",
      en: "Brown is the color the whole world reserves for tourist and recreational attractions. Drivers decode it before reading a single letter. Pictogram, destination, distance: three units, no more.",
    },
    specs: [
      {
        es: "Pictograma silueta, nunca foto: a 60 km/h una foto es una mancha.",
        en: "Silhouette pictogram, never a photo: at 60 km/h a photo is just a smudge.",
      },
      {
        es: "Máximo 3 renglones. El nombre del cañón manda, la marca va chiquita abajo.",
        en: "Three lines max. The canyon name leads, the brand sits small underneath.",
      },
      {
        es: "Letra de 18–20 cm para leerse cómodo a 70–80 m.",
        en: "18–20 cm cap height to read comfortably at 70–80 m.",
      },
    ],
    recommended: true,
  },
  {
    id: "P-B",
    variant: "mopt",
    name: {
      es: "MOPT dividido con franja de distancia",
      en: "MOPT banded sign with distance strip",
    },
    reference: {
      es: "El que le pasaron: norma MOPT / SIECA, con bloque de marca patrocinadora",
      en: "The one you were sent: MOPT / SIECA standard, with a sponsor brand block",
    },
    slots: "R-02 · R-03",
    why: {
      es: "Exactamente el formato de la foto: franja azul con flecha y kilometraje, bloque de marca en amarillo y panel verde de destino. Se ve oficial porque lo es, y esa autoridad prestada le da confianza al turista. Ojo: el bloque amarillo funciona porque el color pega contra el verde, no por llevar mucha información.",
      en: "Exactly the format in the photo: blue strip with arrow and distance, yellow brand block, green destination panel. It looks official because it is, and that borrowed authority reassures visitors. The yellow block works because of the color contrast, not because it holds lots of information.",
    },
    specs: [
      {
        es: "Tres módulos separados por 2–3 cm: la división es lo que lo hace legible.",
        en: "Three modules split by 2–3 cm: the division is what makes it readable.",
      },
      {
        es: "Verde destino + azul distancia + amarillo marca. Nada de degradados ni sombras.",
        en: "Green destination, blue distance, yellow brand. No gradients, no shadows.",
      },
      {
        es: "Sobre ruta nacional necesita permiso del MOPT dentro del derecho de vía.",
        en: "On a national route it needs MOPT approval inside the right-of-way.",
      },
    ],
    recommended: false,
  },
  {
    id: "P-C",
    variant: "flecha",
    name: {
      es: "Flecha direccional mínima",
      en: "Minimal directional trailblazer",
    },
    reference: {
      es: "Trailblazer del MUTCD, fingerboard de Nueva Zelanda y Australia",
      en: "MUTCD trailblazer, New Zealand and Australia fingerboards",
    },
    slots: "R-06 (Lajas y CQ)",
    why: {
      es: "Para los anticipos lejanos donde solo hay que sembrar el rumbo. Tres palabras y una flecha. En Lajas y Ciudad Quesada el conductor no va a decidir nada todavía: solo tiene que registrar que existe y hacia dónde queda.",
      en: "For the far-out teasers where you only need to plant a direction. Three words and an arrow. In Lajas and Ciudad Quesada the driver is not deciding anything yet, they just need to register that it exists and which way it is.",
    },
    specs: [
      {
        es: "Media lámina alcanza: es la mitad de precio y el doble de legible.",
        en: "A half panel is enough: half the price, twice the legibility.",
      },
      {
        es: "La flecha ocupa un tercio del rótulo, no es un adorno.",
        en: "The arrow takes a third of the sign, it is not decoration.",
      },
      {
        es: "Sin teléfono ni redes: a esa distancia nadie los anota.",
        en: "No phone, no socials: nobody writes them down from that far out.",
      },
    ],
    recommended: true,
  },
  {
    id: "P-D",
    variant: "servicios",
    name: {
      es: "Azul de servicios con placas de marca",
      en: "Blue service sign with logo panels",
    },
    reference: {
      es: "Specific Service (LOGO) signs del MUTCD, paneles azules de servicios en Europa",
      en: "MUTCD Specific Service (LOGO) signs, blue service panels across Europe",
    },
    slots: "R-04 (restaurante y mirador)",
    why: {
      es: "El azul es el código universal de servicios al conductor: comida, combustible, hospedaje. Para el restaurante y mirador dice más que cualquier frase, porque el que tiene hambre lo busca sin leer. Cada servicio va en su placa blanca con pictograma.",
      en: "Blue is the universal code for driver services: food, fuel, lodging. For the restaurant and lookout it says more than any sentence, because a hungry driver scans for it without reading. Each service gets its own white tile with a pictogram.",
    },
    specs: [
      {
        es: "Placas blancas independientes: se cambian sin rehacer el rótulo entero.",
        en: "Independent white tiles: swap one without remaking the whole sign.",
      },
      {
        es: "Pictogramas de norma (cubiertos, mirador), no íconos de moda.",
        en: "Standard pictograms (cutlery, lookout), not trendy icons.",
      },
      {
        es: "Máximo cuatro placas por rótulo.",
        en: "Four tiles per sign, maximum.",
      },
    ],
    recommended: true,
  },
  {
    id: "P-E",
    variant: "portal",
    name: {
      es: "Portal de entrada con foto y QR",
      en: "Gateway sign with photo and QR",
    },
    reference: {
      es: "Gateway signs de parques nacionales (NPS de EE.UU., DOC de Nueva Zelanda)",
      en: "National park gateway signs (US NPS, New Zealand DOC)",
    },
    slots: "R-01 (entrada)",
    why: {
      es: "Aquí sí van la foto, el QR, los teléfonos y las redes: es el único punto donde el carro va lento o parqueado y la gente tiene tiempo de mirar. Todo lo que quitamos de los rótulos de ruta se concentra en este, que es el que remata la venta.",
      en: "This is where the photo, QR, phones and socials belong: the only spot where the car is slow or parked and people have time to look. Everything stripped from the highway signs concentrates here, the one that closes the sale.",
    },
    specs: [
      {
        es: "Es el rótulo que ya está diseñado arriba, con las dos marcas.",
        en: "This is the sign already designed above, carrying both brands.",
      },
      {
        es: "El QR solo tiene sentido con el carro detenido. En ruta es papel botado.",
        en: "The QR only makes sense with the car stopped. On the highway it is wasted print.",
      },
      {
        es: "Buen momento para iluminarlo: es el que se busca de noche.",
        en: "Worth lighting: this is the one people hunt for after dark.",
      },
    ],
    recommended: true,
  },
  {
    id: "P-F",
    variant: "blades",
    name: {
      es: "Paletas de madera para adentro",
      en: "Wooden blade signs for inside",
    },
    reference: {
      es: "Fingerpost británico y señalética de senderos (parques nacionales, Camino de Santiago)",
      en: "British fingerpost and trail signage (national parks, Camino de Santiago)",
    },
    slots: "R-05 (parqueo y recepción)",
    why: {
      es: "Adentro de la finca el problema ya no es velocidad, es orientación. Una paleta por destino, apiladas en un poste: parqueo, recepción, restaurante, sendero. Madera y crema pegan con el entorno y se leen a pie, que es como se recorre.",
      en: "Inside the property the problem is no longer speed, it is orientation. One blade per destination stacked on a post: parking, reception, restaurant, trail. Wood and cream fit the setting and read on foot, which is how people move there.",
    },
    specs: [
      {
        es: "Se agregan paletas después sin tocar el poste.",
        en: "Add blades later without touching the post.",
      },
      {
        es: "Bilingüe en la misma paleta: español grande, inglés debajo.",
        en: "Bilingual on the same blade: Spanish large, English underneath.",
      },
      {
        es: "Sale más barato que una lámina metálica grande.",
        en: "Cheaper than one large metal panel.",
      },
    ],
    recommended: true,
  },
];

/** Reglas duras de legibilidad, con la fuente a la par para poder discutirlas. */
const RULES: { value: string; text: Copy }[] = [
  {
    value: "2,5 cm ≈ 10 m",
    text: {
      es: "Regla de altura de letra del FHWA: cada 2,5 cm de altura da unos 10 m de lectura. Para que se lea a 80 m hay que ir en 20 cm.",
      en: "FHWA letter height rule: every 2.5 cm of cap height buys about 10 m of legibility. To read at 80 m you need 20 cm.",
    },
  },
  {
    value: "3 unidades",
    text: {
      es: "Máximo tres unidades de información por rótulo (destino, flecha, distancia). La cuarta ya no se lee, estorba.",
      en: "Three information units per sign, max (destination, arrow, distance). The fourth one is not read, it gets in the way.",
    },
  },
  {
    value: "6 segundos",
    text: {
      es: "A 60 km/h el conductor cubre 100 m en 6 segundos y solo un tercio lo dedica al rótulo. Todo tiene que caber en esos 2 segundos.",
      en: "At 60 km/h a driver covers 100 m in 6 seconds and spends only a third of that on the sign. Everything has to fit in those 2 seconds.",
    },
  },
  {
    value: "Tipo IV",
    text: {
      es: "Lámina retrorreflectiva ASTM D4956 tipo IV o superior. Sin retrorreflectivo el rótulo desaparece de noche, que es cuando más se busca.",
      en: "ASTM D4956 Type IV retroreflective sheeting or better. Without it the sign vanishes at night, exactly when people look hardest.",
    },
  },
];

function SignFrame({
  children,
  color,
  className = "",
}: {
  children: React.ReactNode;
  color: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[3px] border-[3px] border-white p-2 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.9)] ${className}`}
      style={{ backgroundColor: color }}
    >
      {children}
    </div>
  );
}

/** Maqueta de cada propuesta: colores planos, cero degradado, como se imprime. */
function ProposalMock({ variant }: { variant: Variant }) {
  if (variant === "mopt") {
    return (
      <div className="w-full max-w-[380px]">
        <div className="flex gap-1.5">
          <div
            className="flex w-[70px] flex-col items-center justify-center rounded-[3px] border-[3px] border-white py-2"
            style={{ backgroundColor: SIGN_COLORS.blue }}
          >
            <ArrowUp className="h-8 w-8 text-white" strokeWidth={3} aria-hidden />
            <span className="mt-1 text-sm font-black text-white">3 km</span>
          </div>
          <div
            className="flex flex-1 items-center justify-center gap-2 rounded-[3px] border-[3px] px-3 py-2"
            style={{ backgroundColor: SIGN_COLORS.yellow, borderColor: "#8a6b00" }}
          >
            <Image
              src="/logo2.jpg"
              alt=""
              width={38}
              height={38}
              className="rounded-sm object-cover"
            />
            <span className="text-lg font-black uppercase leading-none tracking-tight text-zinc-900">
              La Vieja
              <span className="block text-[10px] font-bold tracking-[0.18em]">ADVENTURES</span>
            </span>
          </div>
        </div>
        <SignFrame color={SIGN_COLORS.green} className="mt-1.5 text-center">
          <p className="text-2xl font-black uppercase tracking-wide text-white md:text-3xl">
            Cañón La Vieja
          </p>
        </SignFrame>
      </div>
    );
  }

  if (variant === "turistico") {
    return (
      <SignFrame color={SIGN_COLORS.brown} className="w-full max-w-[380px]">
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="flex flex-col items-center gap-1">
            <Waves className="h-12 w-12 text-white" strokeWidth={2.5} aria-hidden />
            <Mountain className="h-8 w-8 text-white" strokeWidth={2.5} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-black uppercase leading-none tracking-tight text-white">
              Cañón del Río
              <span className="block">La Vieja</span>
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
              La Vieja River Canyon
            </p>
            <p className="mt-2 text-sm font-black uppercase tracking-wide text-white">
              La Vieja Adventures
            </p>
          </div>
          <div className="flex flex-col items-center border-l-2 border-white/60 pl-3">
            <ArrowUpRight className="h-9 w-9 text-white" strokeWidth={3} aria-hidden />
            <span className="mt-1 text-lg font-black text-white">3 km</span>
          </div>
        </div>
      </SignFrame>
    );
  }

  if (variant === "servicios") {
    return (
      <SignFrame color={SIGN_COLORS.blue} className="w-full max-w-[380px]">
        <p className="pb-2 text-center text-sm font-black uppercase tracking-[0.2em] text-white">
          Restaurante y Mirador
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { icon: UtensilsCrossed, es: "Comida", en: "Food" },
            { icon: Binoculars, es: "Mirador", en: "Lookout" },
            { icon: Car, es: "Parqueo", en: "Parking" },
          ].map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.es}
                className="flex flex-col items-center gap-1 rounded-[2px] bg-white px-1 py-2"
              >
                <Icon className="h-7 w-7 text-zinc-900" strokeWidth={2.5} aria-hidden />
                <span className="text-[10px] font-black uppercase leading-none text-zinc-900">
                  {tile.es}
                </span>
                <span className="text-[8px] font-bold uppercase leading-none text-zinc-500">
                  {tile.en}
                </span>
              </div>
            );
          })}
        </div>
        <p className="pt-2 text-center text-xs font-black uppercase tracking-[0.16em] text-white">
          La Vieja Adventures &middot; 300 m
        </p>
      </SignFrame>
    );
  }

  if (variant === "flecha") {
    return (
      <SignFrame color={SIGN_COLORS.green} className="w-full max-w-[380px]">
        <div className="flex items-center gap-3 px-1 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-black uppercase leading-none tracking-tight text-white">
              La Vieja
            </p>
            <p className="text-2xl font-black uppercase leading-none tracking-tight text-white">
              Adventures
            </p>
            <p className="mt-2 text-lg font-black text-white">12 km</p>
          </div>
          <ArrowUpRight className="h-20 w-20 shrink-0 text-white" strokeWidth={3} aria-hidden />
        </div>
      </SignFrame>
    );
  }

  if (variant === "portal") {
    return (
      <div className="w-full max-w-[380px] overflow-hidden rounded-[3px] border-[3px] border-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.9)]">
        <div className="relative h-[120px]">
          <Image
            src="/image/IMG_4671.jpg"
            alt=""
            fill
            sizes="380px"
            className="object-cover"
            style={{ objectPosition: "center 40%" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,78,59,0.95)_0%,rgba(6,78,59,0.35)_60%,transparent_100%)]" />
          <div className="absolute inset-0 flex items-center gap-2 p-3">
            <Image
              src="/logo2.jpg"
              alt=""
              width={52}
              height={52}
              className="rounded-lg border-2 border-white/80 object-cover"
            />
            <Image
              src="/logo1.jpg"
              alt=""
              width={52}
              height={52}
              className="rounded-lg border-2 border-white/80 object-cover"
            />
          </div>
        </div>
        <div style={{ backgroundColor: SIGN_COLORS.green }} className="px-3 py-3">
          <p className="text-xl font-black uppercase leading-none tracking-tight text-white">
            La Vieja Adventures
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
            Welcome &middot; Bienvenidos
          </p>
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/30 pt-2">
            <span className="text-sm font-black text-white">www.laviejaadventures.com</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-white text-[7px] font-black leading-none text-zinc-900">
              QR
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[380px] flex-col items-start gap-1.5">
      {[
        { icon: ParkingCircle, es: "Parqueo", en: "Parking" },
        { icon: Award, es: "Recepción", en: "Check-in" },
        { icon: UtensilsCrossed, es: "Restaurante", en: "Restaurant" },
        { icon: Trees, es: "Sendero al cañón", en: "Canyon trail" },
      ].map((blade, index) => {
        const Icon = blade.icon;
        return (
          <div
            key={blade.es}
            className="flex items-center gap-3 rounded-[3px] border-2 border-amber-100/40 px-3 py-2 shadow-[0_8px_18px_-12px_rgba(0,0,0,0.9)]"
            style={{
              backgroundColor: SIGN_COLORS.wood,
              width: `${100 - index * 6}%`,
            }}
          >
            <Icon className="h-6 w-6 shrink-0 text-amber-100" strokeWidth={2.5} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-base font-black uppercase leading-none tracking-tight text-amber-50">
                {blade.es}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-100/60">
                {blade.en}
              </p>
            </div>
            <ArrowUpRight className="h-6 w-6 shrink-0 text-amber-100" strokeWidth={3} aria-hidden />
          </div>
        );
      })}
    </div>
  );
}

export default function SignProposals({ lang }: { lang: Lang }) {
  const t = (copy: Copy) => copy[lang];

  return (
    <section className="mt-14 border-t border-white/10 pt-10">
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-300">
        {lang === "es" ? "Propuestas de diseño" : "Design proposals"}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
        {lang === "es"
          ? "Seis formatos probados en carretera"
          : "Six formats proven on the road"}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 md:text-base">
        {lang === "es"
          ? "El rótulo que le pasaron funciona por una razón: está dividido en módulos y cada módulo dice una sola cosa. Abajo están ese formato y cinco más que usan los sistemas de señalización del mundo, con la nota de para cuál de sus seis puntos sirve cada uno."
          : "The sign you were sent works for one reason: it is split into modules and each module says exactly one thing. Below is that format plus five more drawn from signage systems around the world, noting which of your six spots each one fits."}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RULES.map((rule) => (
          <div
            key={rule.value}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-xl font-black tracking-tight text-emerald-300">{rule.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">{t(rule.text)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {PROPOSALS.map((proposal) => (
          <article
            key={proposal.id}
            className={`flex flex-col overflow-hidden rounded-3xl border bg-zinc-900/60 shadow-xl shadow-black/40 ${
              proposal.recommended ? "border-emerald-300/40" : "border-white/10"
            }`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">
                  {proposal.id} &middot; {proposal.slots}
                </p>
                <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                  {t(proposal.name)}
                </h3>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${
                  proposal.recommended
                    ? "border-emerald-300/50 bg-emerald-400/20 text-emerald-100"
                    : "border-sky-300/40 bg-sky-400/10 text-sky-200"
                }`}
              >
                <Award className="h-3.5 w-3.5" aria-hidden />
                {proposal.recommended
                  ? lang === "es"
                    ? "Recomendado"
                    : "Recommended"
                  : lang === "es"
                    ? "Alternativa oficial"
                    : "Official alternative"}
              </span>
            </div>

            <div className="flex justify-center bg-zinc-950/50 px-5 py-6">
              <ProposalMock variant={proposal.variant} />
            </div>

            <div className="flex flex-1 flex-col gap-3 px-5 py-4">
              <p className="text-sm leading-relaxed text-zinc-300">{t(proposal.why)}</p>
              <ul className="space-y-1.5 border-t border-white/10 pt-3 text-sm text-zinc-400">
                {proposal.specs.map((spec) => (
                  <li key={spec.es} className="flex gap-2">
                    <span className="text-emerald-300">&middot;</span>
                    <span>{t(spec)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto border-t border-white/10 pt-3 text-xs text-zinc-500">
                <span className="font-black uppercase tracking-[0.14em] text-zinc-400">
                  {lang === "es" ? "Se usa en: " : "Used by: "}
                </span>
                {t(proposal.reference)}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-emerald-300/30 bg-emerald-400/10 p-5 md:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-200">
          {lang === "es" ? "Lo que yo haría" : "What I would do"}
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-emerald-50">
          <li>
            <span className="font-black">R-01 · </span>
            {lang === "es"
              ? "Portal de entrada (P-E). Es el único que aguanta foto, QR, teléfonos y redes, porque ahí el carro va lento."
              : "Gateway sign (P-E). The only one that can carry photo, QR, phones and socials, because cars are slow there."}
          </li>
          <li>
            <span className="font-black">R-02 y R-03 · </span>
            {lang === "es"
              ? "Café turístico (P-A), o el formato MOPT de la foto (P-B) si van dentro del derecho de vía. Sin foto, sin QR, sin redes: destino, flecha y distancia."
              : "Brown tourist sign (P-A), or the MOPT format from the photo (P-B) if they sit inside the right-of-way. No photo, no QR, no socials: destination, arrow, distance."}
          </li>
          <li>
            <span className="font-black">R-04 · </span>
            {lang === "es"
              ? "Azul de servicios (P-D). El que anda con hambre lo encuentra sin leer."
              : "Blue service sign (P-D). A hungry driver finds it without reading."}
          </li>
          <li>
            <span className="font-black">R-05 · </span>
            {lang === "es"
              ? "Paletas de madera (P-F). Adentro se camina, no se maneja."
              : "Wooden blades (P-F). Inside people walk, they do not drive."}
          </li>
          <li>
            <span className="font-black">R-06 · </span>
            {lang === "es"
              ? "Flecha mínima (P-C). Tres palabras, una flecha, los kilómetros."
              : "Minimal trailblazer (P-C). Three words, one arrow, the distance."}
          </li>
        </ul>
        <p className="mt-4 border-t border-emerald-200/20 pt-3 text-xs leading-relaxed text-emerald-100/80">
          {lang === "es"
            ? "Dos cosas antes de mandar a hacer nada: rotular dentro del derecho de vía de una ruta nacional requiere permiso del MOPT (Ley General de Caminos Públicos 5060 y el reglamento de publicidad exterior), así que conviene consultarlo; y pida la lámina retrorreflectiva por escrito en la cotización, porque es lo primero que el rotulero abarata."
            : "Two things before ordering anything: signage inside a national route right-of-way needs MOPT approval (Public Roads Act 5060 and the outdoor advertising regulation), so check first; and put the retroreflective sheeting in writing on the quote, because it is the first thing a sign maker cheapens."}
        </p>
      </div>
    </section>
  );
}

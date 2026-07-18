"use client";

import { useEffect, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  AudioLines,
  BadgePercent,
  Cable,
  CheckCircle2,
  Drum,
  ExternalLink,
  Facebook,
  GraduationCap,
  Guitar,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Music2,
  Phone,
  Piano,
  Radio,
  Speaker,
  Sparkles,
  Timer,
  Twitter,
  X,
  Youtube,
} from "lucide-react";

const PHONE = "2461-1316";
const MOBILE = "8714-8993";
const WHATSAPP = "https://wa.me/50687148993?text=Hola%20JESS%20Music%2C%20quiero%20consultar%20por%20equipo%20musical.";
const PRODUCT_WHATSAPP = "https://wa.me/50687148993?text=Hola%20JESS%20Music%2C%20quiero%20informaci%C3%B3n%20sobre%20la%20bater%C3%ADa%20junior%20de%205%20piezas%20con%2022%25%20de%20descuento.";
const MAPS = "https://www.google.com/maps/search/?api=1&query=Jess+Music+Ciudad+Quesada+Costa+Rica";
const MAP_EMBED = "https://www.openstreetmap.org/export/embed.html?bbox=-84.43768%2C10.31812%2C-84.42168%2C10.33012&layer=mapnik&marker=10.32412%2C-84.42968";
const INSTAGRAM = "https://www.instagram.com/jessmusiccr/";

const socialLinks: Array<{
  label: string;
  detail: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  verified: boolean;
}> = [
  { label: "Instagram", detail: "@jessmusiccr", href: INSTAGRAM, icon: Instagram, verified: true },
  { label: "Facebook", detail: "Jess Music", href: "https://www.facebook.com/jessmusiccr", icon: Facebook, verified: true },
  { label: "YouTube", detail: "Buscar canal", href: "https://www.youtube.com/results?search_query=Jess+Music+Sound+Systems+Costa+Rica", icon: Youtube, verified: false },
  { label: "TikTok", detail: "Buscar cuenta", href: "https://www.tiktok.com/search?q=Jess%20Music%20Costa%20Rica", icon: Music2, verified: false },
  { label: "X", detail: "Buscar cuenta", href: "https://x.com/search?q=Jess%20Music%20Costa%20Rica&src=typed_query", icon: Twitter, verified: false },
];

const categories: Array<{
  title: string;
  eyebrow: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  glow: string;
  ring: string;
}> = [
  {
    title: "Cuerdas",
    eyebrow: "Guitarras · Bajos · Accesorios",
    description: "El instrumento que se siente suyo desde el primer acorde.",
    icon: Guitar,
    accent: "from-[#0a4fd4]/70 via-[#0d61ff]/25 to-transparent",
    glow: "group-hover:shadow-[0_0_48px_rgba(13,97,255,.35)]",
    ring: "group-hover:border-[#3d8bff]/50",
  },
  {
    title: "Vientos & teclas",
    eyebrow: "Pianos · Teclados · Instrumentos de viento",
    description: "Melodías para todos los niveles, formatos y estilos musicales.",
    icon: Piano,
    accent: "from-[#1ac8d4]/55 via-[#26dce5]/20 to-transparent",
    glow: "group-hover:shadow-[0_0_48px_rgba(38,220,229,.3)]",
    ring: "group-hover:border-[#4ce7eb]/45",
  },
  {
    title: "Percusión",
    eyebrow: "Baterías · Percusión · Ritmo",
    description: "Todo empieza con el pulso. Haga que cada golpe cuente.",
    icon: Drum,
    accent: "from-[#4dbf3a]/50 via-[#79df66]/18 to-transparent",
    glow: "group-hover:shadow-[0_0_48px_rgba(121,223,102,.28)]",
    ring: "group-hover:border-[#7ce66d]/45",
  },
  {
    title: "Audio pro",
    eyebrow: "Sonido · Micrófonos · Monitoreo",
    description: "Soluciones para ensayo, estudio, eventos y sonido en vivo.",
    icon: Speaker,
    accent: "from-[#8fd428]/45 via-[#b5ec42]/15 to-transparent",
    glow: "group-hover:shadow-[0_0_48px_rgba(169,237,80,.25)]",
    ring: "group-hover:border-[#a9ed50]/40",
  },
];

const businessUnits = [
  {
    icon: Guitar,
    number: "01",
    name: "Jess Store",
    kicker: "Tienda musical",
    text: "Instrumentos de cuerdas, percusión y vientos; repuestos, amplificadores, iluminación, mezcladores, parlantes, micrófonos y audífonos.",
    accent: "text-[#5eb0ff]",
    bar: "from-[#0d61ff] to-[#27dce5]",
  },
  {
    icon: GraduationCap,
    number: "02",
    name: "eXpression",
    kicker: "Academia de artes",
    text: "Clases personalizadas para aprender un instrumento con profesores capacitados y una experiencia cercana.",
    accent: "text-[#4ce7eb]",
    bar: "from-[#27dce5] to-[#79df66]",
  },
  {
    icon: AudioLines,
    number: "03",
    name: "SCena",
    kicker: "Producción de eventos",
    text: "Paquetes para eventos privados y públicos, desde encuentros pequeños hasta producciones de gran formato.",
    accent: "text-[#a9ed50]",
    bar: "from-[#79df66] to-[#eff35c]",
  },
  {
    icon: Cable,
    number: "04",
    name: "Pross Electronics",
    kicker: "Taller especializado",
    text: "Revisión y reparación de sistemas de audio y video, mezcladoras, parlantes, pantallas, adaptadores y luces.",
    accent: "text-[#b8f06a]",
    bar: "from-[#0d61ff] via-[#27dce5] to-[#a9ed50]",
  },
];

const brands = ["D.A.S.", "Ibanez", "TAMA", "QSC Audio", "Yamaha", "D’Addario", "audio-technica", "JBL"];

const academyPrograms = ["Guitarra", "Violín", "Viola", "Cello", "Piano", "Percusión", "Canto", "Bajo", "Saxofón", "Trompeta", "Flauta traversa"];

const eventTypes = ["Bodas y quince años", "Corporativos y congresos", "Culturales y artísticos", "Ferias y lanzamientos", "Graduaciones", "Fiestas privadas", "Eventos deportivos", "Infantiles y familiares"];

const bars = [12, 25, 18, 36, 23, 48, 30, 58, 34, 43, 26, 54, 39, 62, 44, 28, 51, 34, 20, 39, 17, 29, 13, 41, 22, 47, 33];

export default function GrupoJessClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050818] text-white selection:bg-[#1fdbe4] selection:text-[#050818]">
      {/* Ambient brand wash */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[#0d61ff]/12 blur-[120px]" />
        <div className="absolute right-[-10%] top-[30%] h-[420px] w-[420px] rounded-full bg-[#27dce5]/08 blur-[110px]" />
        <div className="absolute bottom-[-10%] left-[30%] h-[380px] w-[380px] rounded-full bg-[#a9ed50]/06 blur-[100px]" />
      </div>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-[#1f65ff]/25 bg-[#050818]/88 shadow-[0_8px_40px_rgba(0,0,0,.45)] backdrop-blur-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#inicio" className="group flex items-center gap-3" aria-label="JESS Music, inicio">
            <JessMark compact />
          </a>
          <nav className="hidden items-center gap-1 lg:flex">
            {[["#categorias", "Tienda"], ["#oferta", "Oferta"], ["#experiencia", "Grupo"], ["#academia", "Academia"], ["#contacto", "Contacto"]].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60 transition hover:bg-white/[0.06] hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <a href={`tel:+506${PHONE.replace("-", "")}`} className="text-sm font-semibold text-white/65 transition hover:text-white">
              {PHONE}
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#0d61ff] to-[#27dce5] px-5 text-xs font-black uppercase tracking-[0.15em] shadow-[0_0_24px_rgba(31,219,228,.2)] transition hover:scale-[1.03] hover:shadow-[0_0_36px_rgba(31,219,228,.4)]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition group-hover:opacity-100" />
              <MessageCircle className="relative h-4 w-4" />
              <span className="relative">Consultar</span>
            </a>
          </div>
          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/40 backdrop-blur sm:hidden"
            aria-label="Abrir menú"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/10 bg-[#050818]/97 px-5 py-5 backdrop-blur-2xl sm:hidden">
            <div className="grid gap-1">
              {[["#categorias", "Tienda"], ["#oferta", "Oferta"], ["#experiencia", "Grupo"], ["#academia", "Academia"], ["#contacto", "Contacto"]].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3.5 text-sm font-bold text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  {label}
                </a>
              ))}
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0d61ff] to-[#27dce5] px-5 py-3.5 text-xs font-black uppercase tracking-[0.15em]"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section id="inicio" className="relative flex min-h-[100svh] items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/propuestas/grupo-jess/hero-cinematic-v2.png"
          alt="Guitarra, batería, teclado y equipo de audio con iluminación azul y verde JESS"
          className="absolute inset-0 h-full w-full scale-105 object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(3,6,20,.98)_0%,rgba(3,6,20,.88)_28%,rgba(3,6,20,.35)_58%,rgba(3,6,20,.55)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(13,97,255,.18)_0%,transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#050818] via-[#050818]/80 to-transparent" />

        {/* Decorative ring */}
        <div className="absolute right-[6%] top-[16%] hidden lg:block" aria-hidden="true">
          <div className="relative h-32 w-32">
            <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-dashed border-white/20" />
            <div className="absolute inset-3 grid place-items-center rounded-full border border-[#24dce6]/30 bg-[#050818]/40 text-center text-[10px] font-black uppercase tracking-[0.22em] text-[#80edf2]/80 backdrop-blur-sm">
              Música
              <br />
              que
              <br />
              conecta
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-16 pt-32 sm:px-8 lg:px-12 lg:pb-20">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-5xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ce7eb] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4ce7eb]" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.26em] text-[#4ce7eb]">Ciudad Quesada · San Carlos</span>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8">
              <h1 className="sr-only">Jess Music &amp; Sound Systems</h1>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/propuestas/grupo-jess/logo.svg"
                alt="Jess Music & Sound Systems"
                className="h-auto w-[min(36rem,90vw)] drop-shadow-[0_0_40px_rgba(39,220,229,.25)]"
              />
            </motion.div>

            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-2xl font-semibold leading-[1.15] text-white sm:text-4xl lg:text-[2.75rem]">
              Música que{" "}
              <span className="relative inline-block font-serif italic">
                <span className="bg-gradient-to-r from-[#a9ef4f] via-[#7ce66d] to-[#27dce5] bg-clip-text text-transparent">conecta.</span>
                <span className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-[#a9ef4f]/80 to-transparent" />
              </span>
            </motion.p>

            <motion.p variants={fadeUp} className="mt-5 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
              Tienda musical, producción de eventos, academia de artes, estudio y servicio técnico: un grupo conectado por la música.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-3">
              <a
                href="#categorias"
                className="group inline-flex min-h-13 items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-black text-black shadow-[0_8px_32px_rgba(255,255,255,.12)] transition hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(255,255,255,.18)]"
              >
                Explorar equipo
                <ArrowDownRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </a>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-13 items-center gap-3 rounded-full border border-white/20 bg-white/[0.06] px-7 py-3.5 text-sm font-black backdrop-blur-md transition hover:border-[#36dfe7]/40 hover:bg-white/[0.12]"
              >
                Hablar con JESS
                <MessageCircle className="h-4 w-4 text-[#36dfe7]" />
              </a>
            </motion.div>
          </motion.div>

          {/* Animated EQ */}
          <div className="mt-16 flex h-16 items-end gap-[4px] overflow-hidden border-t border-white/10 pt-5" aria-hidden="true">
            {bars.map((height, index) => (
              <span
                key={index}
                className="w-1.5 origin-bottom rounded-full bg-gradient-to-t from-[#0d61ff] via-[#28dce6] to-[#b4ef45] opacity-90"
                style={{
                  height,
                  animation: `jessEq ${0.7 + (index % 5) * 0.18}s ease-in-out ${index * 0.05}s infinite alternate`,
                }}
              />
            ))}
            <span className="ml-4 self-center text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
              Calidad · tecnología · experiencia
            </span>
          </div>
        </div>
      </section>

      {/* ─── CATEGORÍAS ─── */}
      <section id="categorias" className="relative bg-[#e8f0f4] px-5 py-20 text-[#071136] sm:px-8 lg:px-12 lg:py-32">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(#0d61ff12_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative mx-auto max-w-[1500px]">
          <SectionIntro
            label="Jess Store"
            title={
              <>
                El instrumento
                <br />
                de sus sueños.
              </>
            }
            text="Cuerdas, percusión, vientos, teclas, repuestos y tecnología para ensayo, estudio y escenario."
            dark
          />
          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category, index) => (
              <motion.article
                key={category.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.07, duration: 0.5 }}
                className={`group relative min-h-[400px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0c0e18] p-7 text-white transition duration-500 ${category.glow} ${category.ring}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.accent} opacity-80 transition duration-500 group-hover:opacity-100`} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(255,255,255,.06)_0%,transparent_50%)]" />
                <div className="absolute -bottom-10 -right-12 opacity-[0.1] transition duration-700 group-hover:rotate-6 group-hover:scale-110 group-hover:opacity-[0.16]">
                  <category.icon className="h-64 w-64" />
                </div>
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-sm">
                      <category.icon className="h-6 w-6 text-[#7ce66d]" />
                    </span>
                    <span className="font-mono text-xs font-bold text-white/25">0{index + 1}</span>
                  </div>
                  <div className="mt-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{category.eyebrow}</p>
                    <h3 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{category.title}</h3>
                    <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">{category.description}</p>
                    <span className="mt-7 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] transition duration-300 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-[#0d61ff] group-hover:to-[#27dce5]">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          <p className="mt-6 text-xs text-[#071136]/40">Categorías de referencia. Marcas, modelos y disponibilidad se confirman directamente con la tienda.</p>
        </div>
      </section>

      {/* ─── MARCAS ─── */}
      <section className="border-y border-[#0f61ff]/10 bg-white px-5 py-16 text-[#071136] sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0b61de]">Sonido con respaldo</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">Marcas que han sido parte de JESS.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#071136]/50">
              Selección recuperada del material comercial histórico. Disponibilidad y distribución actual sujetas a confirmación.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {brands.map((brand, index) => (
              <div
                key={brand}
                className="group relative grid min-h-28 place-items-center overflow-hidden rounded-2xl border border-[#071136]/08 bg-gradient-to-b from-[#f6fafb] to-[#eef4f7] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#0b61de]/25 hover:shadow-[0_12px_40px_rgba(11,97,222,.1)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0d61ff]/30 to-transparent opacity-0 transition group-hover:opacity-100" />
                <span
                  className={`text-center font-black tracking-[-0.045em] text-[#071136]/80 transition group-hover:text-[#0b61de] ${
                    index % 3 === 0 ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                  }`}
                >
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OFERTA ─── */}
      <section id="oferta" className="relative overflow-hidden border-y border-[#1d6cff]/20 bg-[#040716]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/propuestas/grupo-jess/bateria-junior-featured.png"
          alt="Batería junior color vino de cinco piezas"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(3,6,20,.99)_0%,rgba(3,6,20,.95)_32%,rgba(3,6,20,.5)_58%,rgba(3,6,20,.2)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(169,237,80,.08)_0%,transparent_50%)]" />
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#176cff] via-[#28dce6] to-[#a9ed50]" />

        <div className="relative mx-auto flex min-h-[720px] max-w-[1500px] items-center px-6 py-24 sm:px-10 lg:px-14">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xl rounded-[2rem] border border-white/10 bg-[#050818]/55 p-7 shadow-[0_30px_80px_rgba(0,0,0,.4)] backdrop-blur-xl sm:p-9"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#35e0e8]/30 bg-[#1167ff]/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#63e8ed]">
              <BadgePercent className="h-4 w-4" /> Oferta destacada
            </div>

            <div className="mt-8 flex items-end gap-4">
              <span className="relative">
                <span className="absolute -inset-3 rounded-2xl bg-[#27dce5]/10 blur-xl" />
                <span className="relative bg-gradient-to-br from-[#2fdfe8] via-[#7ce66d] to-[#a8ee51] bg-clip-text text-7xl font-black leading-none tracking-[-0.07em] text-transparent sm:text-8xl">
                  22%
                </span>
              </span>
              <span className="pb-2 text-sm font-black uppercase tracking-[0.18em] text-white/50">de descuento</span>
            </div>

            <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-[#a7ed50]">Batería junior · 5 piezas</p>
            <h2 className="mt-4 text-4xl font-black leading-[0.92] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Su primer gran
              <br />
              ritmo empieza aquí.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/55">
              Ideal para que los niños inicien en la música y desarrollen coordinación, ritmo y creatividad de una forma divertida y educativa.
            </p>
            <div className="mt-7 grid gap-3 text-sm font-semibold text-white/75 sm:grid-cols-2">
              {["Aprendizaje desde casa", "Disciplina y creatividad", "Formato junior", "Set de cinco piezas"].map((item) => (
                <span key={item} className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#36dfe7]/15">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#36dfe7]" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={PRODUCT_WHATSAPP}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center gap-3 rounded-full bg-gradient-to-r from-[#0d61ff] to-[#27dce5] px-7 text-sm font-black shadow-[0_0_28px_rgba(39,220,229,.25)] transition hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(39,220,229,.4)]"
              >
                Consultar oferta <ArrowRight className="h-4 w-4" />
              </a>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/40">
                <Timer className="h-4 w-4 text-[#a9ed50]" /> Hasta agotar existencias
              </span>
            </div>
            <p className="mt-5 max-w-md text-[11px] leading-5 text-white/30">
              Oferta por tiempo limitado o hasta agotar existencias. Precio y disponibilidad se confirman directamente con JESS Music.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── GRUPO ─── */}
      <section id="experiencia" className="relative px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="relative mx-auto max-w-[1500px]">
          <SectionIntro
            label="Bienvenido a Jess Group"
            title={
              <>
                Cuatro equipos.
                <br />
                <span className="bg-gradient-to-r from-white/40 to-white/15 bg-clip-text text-transparent">Una misma pasión.</span>
              </>
            }
            text="Cada departamento está enfocado en una etapa diferente: encontrar el equipo, aprender, producir un evento o devolverle vida a la tecnología."
          />
          <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {businessUnits.map((unit, index) => (
              <motion.article
                key={unit.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-7 transition duration-400 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.055] hover:shadow-[0_20px_50px_rgba(0,0,0,.3)]"
              >
                <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${unit.bar} opacity-70`} />
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <unit.icon className={`h-6 w-6 ${unit.accent}`} />
                  </span>
                  <span className="font-mono text-xs text-white/20">{unit.number}</span>
                </div>
                <p className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-[#a9ed50]">{unit.kicker}</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight">{unit.name}</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/45">{unit.text}</p>
              </motion.article>
            ))}
          </div>

          {/* SCena spotlight */}
          <div className="relative mt-20 overflow-hidden rounded-[2.5rem] border border-[#176cff]/25 bg-gradient-to-br from-[#0b1538] via-[#081028] to-[#061021] p-7 sm:p-10 lg:p-14">
            <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-[#0d61ff]/15 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-[#27dce5]/10 blur-[70px]" />
            <div className="relative grid gap-12 lg:grid-cols-[.75fr_1fr] lg:items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#176cff]/25 bg-[#176cff]/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#48e2e9]">
                  <AudioLines className="h-4 w-4" /> SCena · Eventos
                </div>
                <h3 className="mt-6 text-4xl font-black leading-[0.94] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                  Su evento merece
                  <br />
                  <span className="font-serif italic text-[#a9ed50]">sentirse inolvidable.</span>
                </h3>
                <p className="mt-6 max-w-xl text-base leading-7 text-white/50">
                  Producción para eventos pequeños y de gran formato, privados o públicos, con personal capacitado para acompañar la experiencia.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {["Tarimas", "Luces y sonido", "DJ y discomóvil"].map((service) => (
                    <span
                      key={service}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center text-sm font-black transition hover:border-[#34dfe7]/30 hover:bg-white/[0.07]"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">Tipos de eventos</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {eventTypes.map((event) => (
                    <span
                      key={event}
                      className="rounded-full border border-[#34dfe7]/15 bg-[#34dfe7]/[0.06] px-4 py-2.5 text-xs font-semibold text-white/65 transition hover:border-[#34dfe7]/35 hover:bg-[#34dfe7]/12 hover:text-white"
                    >
                      {event}
                    </span>
                  ))}
                </div>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex min-h-13 items-center gap-3 rounded-full bg-gradient-to-r from-[#0d61ff] to-[#27dce5] px-7 text-sm font-black shadow-[0_0_24px_rgba(39,220,229,.2)] transition hover:scale-[1.03]"
                >
                  Pedir presupuesto <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ACADEMIA ─── */}
      <section id="academia" className="px-5 py-10 sm:px-8 lg:px-12 lg:py-20">
        <div className="relative mx-auto min-h-[560px] max-w-[1500px] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0b55dc] via-[#1ab8d8] to-[#9ee558] p-7 text-[#050818] shadow-[0_40px_100px_rgba(13,97,255,.25)] sm:p-12 lg:p-20">
          <div className="absolute -right-24 -top-24 h-[520px] w-[520px] rounded-full border-[80px] border-[#071136]/12" />
          <div className="absolute -bottom-32 -left-16 h-[360px] w-[360px] rounded-full border-[50px] border-white/10" />
          <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(#06102f_1.2px,transparent_1.2px)] [background-size:18px_18px]" />
          <div className="absolute bottom-0 right-0 flex h-48 items-end gap-1.5 pr-8 opacity-25" aria-hidden="true">
            {bars.slice(0, 18).map((height, i) => (
              <span
                key={i}
                className="w-2.5 rounded-t-full bg-[#071136]"
                style={{
                  height: height * 2.4,
                  animation: `jessEq ${0.8 + (i % 4) * 0.15}s ease-in-out ${i * 0.04}s infinite alternate`,
                }}
              />
            ))}
          </div>
          <div className="relative z-10 flex min-h-[400px] max-w-5xl flex-col justify-between">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#071136]/15 bg-[#071136]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] backdrop-blur-sm">
              <GraduationCap className="h-4 w-4" /> eXpression · Academia de artes
            </div>
            <div>
              <p className="font-serif text-3xl italic text-[#071136]/55 sm:text-5xl">La música se aprende</p>
              <h2 className="mt-1 text-5xl font-black uppercase leading-[0.85] tracking-[-0.06em] text-[#050818] sm:text-7xl lg:text-8xl">
                tocándola.
              </h2>
              <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-[#071136]/65">
                Clases personalizadas para compartir la pasión por la música y aprender a ejecutar un instrumento con profesores capacitados.
              </p>
              <div className="mt-8 flex max-w-4xl flex-wrap gap-2">
                {academyPrograms.map((program) => (
                  <span
                    key={program}
                    className="rounded-full border border-[#071136]/12 bg-white/25 px-4 py-2 text-xs font-black text-[#071136]/75 shadow-sm backdrop-blur-sm transition hover:bg-white/40"
                  >
                    {program}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-[11px] font-semibold text-[#071136]/45">
                Cursos, profesores, horarios y matrícula sujetos a confirmación de la academia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROSS + ESTUDIO ─── */}
      <section className="bg-[#e8f0f4] px-5 py-20 text-[#071136] sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-2">
          <article className="group relative overflow-hidden rounded-[2.5rem] bg-[#071136] p-7 text-white shadow-xl sm:p-10 lg:p-12">
            <div className="absolute -right-10 top-0 h-48 w-48 rounded-full bg-[#27dce5]/10 blur-[60px] transition group-hover:bg-[#27dce5]/18" />
            <Cable className="absolute -bottom-16 -right-12 h-72 w-72 text-[#2bdde6]/[0.08] transition duration-700 group-hover:scale-105" />
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#49e3e9]">Pross Electronics</p>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl">
                Reparar también es
                <br />
                mantener viva la música.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/50">Revisión y reparación especializada para sistemas de audio y video.</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Parlantes activos y pasivos", "Mezcladoras", "Pantallas", "Adaptadores", "Iluminación"].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/65">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
          <article className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0d61ff] via-[#17addd] to-[#70de76] p-7 shadow-xl sm:p-10 lg:p-12">
            <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/15 blur-[50px]" />
            <AudioLines className="absolute -bottom-12 -right-10 h-64 w-64 text-[#071136]/10 transition duration-700 group-hover:scale-105" />
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#071136]/55">Estudio de grabación</p>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] text-[#050818] sm:text-5xl">
                De una idea
                <br />
                a una producción.
              </h2>
              <p className="mt-5 max-w-xl text-sm font-semibold leading-7 text-[#071136]/60">
                Un espacio dentro del ecosistema JESS para presentar servicios de grabación y producción musical cuando se confirme la oferta vigente.
              </p>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#050818] px-6 text-sm font-black text-white shadow-lg transition hover:scale-[1.03] hover:shadow-xl"
              >
                Consultar servicios <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </article>
        </div>
      </section>

      {/* ─── CONTACTO ─── */}
      <section id="contacto" className="relative px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-[#35e0e8]/20 bg-[#35e0e8]/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#35e0e8]">
                <Radio className="h-4 w-4" /> Estamos en frecuencia
              </div>
              <h2 className="mt-7 text-5xl font-black leading-[0.9] tracking-[-0.055em] sm:text-7xl">
                Hablemos de
                <br />
                <span className="font-serif italic text-[#a9ed50]">su sonido.</span>
              </h2>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/45">
                Consulte por tienda, academia, eventos, estudio o reparación. Inventario, precios, horarios y disponibilidad se confirman directamente con JESS Group.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-14 items-center gap-3 rounded-full bg-gradient-to-r from-[#0d61ff] to-[#27dce5] px-7 text-sm font-black shadow-[0_0_28px_rgba(39,220,229,.25)] transition hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(39,220,229,.4)]"
                >
                  <MessageCircle className="h-5 w-5" /> WhatsApp {MOBILE}
                </a>
                <a
                  href={`tel:+506${PHONE.replace("-", "")}`}
                  className="inline-flex min-h-14 items-center gap-3 rounded-full border border-white/15 bg-white/[0.03] px-7 text-sm font-black transition hover:border-white/30 hover:bg-white/[0.08]"
                >
                  <Phone className="h-5 w-5" /> {PHONE}
                </a>
              </div>
              <div className="mt-9 rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 backdrop-blur-sm sm:px-7">
                <ContactItem icon={MapPin} label="Visítenos" value="Ciudad Quesada, frente a la sucursal del INA" href={MAPS} />
                <ContactItem icon={Mail} label="Correo" value="info@jessmusic.cr" href="mailto:info@jessmusic.cr" />
                <ContactItem icon={Phone} label="Teléfonos" value={`WhatsApp ${MOBILE} · Central ${PHONE}`} last />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-2 shadow-[0_30px_90px_rgba(0,0,0,.35)]">
              <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/5" />
              <iframe
                title="Mapa de Jess Music en Ciudad Quesada"
                src={MAP_EMBED}
                className="h-[600px] w-full rounded-[2rem] border-0 grayscale-[.15] contrast-[1.08] saturate-[.85]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-[#050818]/92 p-5 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:max-w-sm">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ce4ea] opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4ce4ea]" />
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4ce4ea]">Jess Music &amp; Sound Systems</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-white/70">Frente a la sucursal del INA, Ciudad Quesada, San Carlos.</p>
                <a
                  href={MAPS}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto mt-4 inline-flex items-center gap-2 text-xs font-black text-white transition hover:text-[#a9ed50]"
                >
                  Abrir en Google Maps <ExternalLink className="h-3.5 w-3.5 text-[#a9ed50]" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-white/10 pt-10">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#36dfe7]">Siga el ritmo</p>
                <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">JESS en sus redes.</h3>
              </div>
              <p className="max-w-md text-xs leading-5 text-white/30">
                Instagram y Facebook están confirmados. Los demás accesos abren una búsqueda específica hasta validar la cuenta oficial.
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-36 flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1.5 hover:border-[#34dfe7]/40 hover:bg-gradient-to-b hover:from-[#1167ff]/15 hover:to-transparent hover:shadow-[0_16px_40px_rgba(13,97,255,.2)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-[#1167ff]/12 transition group-hover:border-[#34dfe7]/30 group-hover:bg-[#1167ff]/25">
                      <social.icon className="h-5 w-5 text-[#45e3e9]" />
                    </span>
                    <ExternalLink className="h-4 w-4 text-white/15 transition group-hover:text-[#a9ed50]" />
                  </div>
                  <div>
                    <p className="font-black">{social.label}</p>
                    <p className="mt-1 text-xs text-white/35">{social.detail}</p>
                    <span
                      className={`mt-3 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] ${
                        social.verified ? "text-[#a9ed50]" : "text-white/25"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${social.verified ? "bg-[#a9ed50]" : "bg-white/25"}`} />
                      {social.verified ? "Perfil confirmado" : "Búsqueda preparada"}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#030612] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <JessMark />
            <p className="mt-5 max-w-md text-xs leading-5 text-white/30">
              Jess Store · eXpression · SCena · Pross Electronics. Información comercial, cursos, marcas y disponibilidad sujetos a validación del negocio.
            </p>
          </div>
          <div className="text-left text-xs font-semibold text-white/30 sm:text-right">
            <p>Ciudad Quesada · San Carlos · Costa Rica</p>
            <p className="mt-2">© {new Date().getFullYear()} JESS Music &amp; Sound Systems</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={WHATSAPP}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50 flex h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#0d61ff] to-[#27dce5] px-5 text-sm font-black text-white shadow-[0_8px_32px_rgba(39,220,229,.4)] transition hover:scale-105 hover:shadow-[0_12px_40px_rgba(39,220,229,.55)] sm:bottom-7 sm:right-7"
        aria-label="Escribir por WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      <style jsx global>{`
        @keyframes jessEq {
          0% {
            transform: scaleY(0.45);
            opacity: 0.55;
          }
          100% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}

function JessMark({ compact = false }: { compact?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/propuestas/grupo-jess/logo.svg"
      alt="Jess Music & Sound Systems"
      className={
        compact
          ? "h-11 w-auto drop-shadow-[0_0_12px_rgba(39,220,229,.2)] transition group-hover:drop-shadow-[0_0_18px_rgba(39,220,229,.35)] sm:h-12"
          : "h-14 w-auto sm:h-16"
      }
    />
  );
}

function SectionIntro({
  label,
  title,
  text,
  dark = false,
}: {
  label: string;
  title: React.ReactNode;
  text: string;
  dark?: boolean;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_.7fr] lg:items-end">
      <div>
        <p className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] ${dark ? "text-[#0b61de]" : "text-[#38e0e8]"}`}>
          <Sparkles className="h-3.5 w-3.5" />
          {label}
        </p>
        <h2 className="mt-6 text-4xl font-black leading-[0.96] tracking-[-0.05em] sm:text-5xl lg:text-6xl">{title}</h2>
      </div>
      <p className={`max-w-xl text-base leading-7 ${dark ? "text-[#071136]/55" : "text-white/45"}`}>{text}</p>
    </div>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
  last = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
  last?: boolean;
}) {
  const content = (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-[#1167ff]/15">
        <Icon className="h-5 w-5 text-[#40e1e9]" />
      </span>
      <span>
        <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/30">{label}</span>
        <span className="mt-2 block text-sm font-semibold leading-6 text-white/80">{value}</span>
      </span>
    </>
  );
  const className = `flex gap-4 py-6 ${last ? "" : "border-b border-white/10"}`;
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={`${className} transition hover:translate-x-1`}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

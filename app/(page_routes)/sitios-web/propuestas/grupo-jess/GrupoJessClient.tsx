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
  color: string;
}> = [
  {
    title: "Cuerdas",
    eyebrow: "Guitarras · Bajos · Accesorios",
    description: "El instrumento que se siente suyo desde el primer acorde.",
    icon: Guitar,
    color: "from-[#0d61ff]/45 to-[#071136]/20",
  },
  {
    title: "Vientos & teclas",
    eyebrow: "Pianos · Teclados · Instrumentos de viento",
    description: "Melodías para todos los niveles, formatos y estilos musicales.",
    icon: Piano,
    color: "from-[#26dce5]/35 to-[#071136]/20",
  },
  {
    title: "Percusión",
    eyebrow: "Baterías · Percusión · Ritmo",
    description: "Todo empieza con el pulso. Haga que cada golpe cuente.",
    icon: Drum,
    color: "from-[#79df66]/35 to-[#071136]/20",
  },
  {
    title: "Audio pro",
    eyebrow: "Sonido · Micrófonos · Monitoreo",
    description: "Soluciones para ensayo, estudio, eventos y sonido en vivo.",
    icon: Speaker,
    color: "from-[#b5ec42]/30 to-[#071136]/20",
  },
];

const businessUnits = [
  {
    icon: Guitar,
    number: "01",
    name: "Jess Store",
    kicker: "Tienda musical",
    text: "Instrumentos de cuerdas, percusión y vientos; repuestos, amplificadores, iluminación, mezcladores, parlantes, micrófonos y audífonos.",
  },
  {
    icon: GraduationCap,
    number: "02",
    name: "eXpression",
    kicker: "Academia de artes",
    text: "Clases personalizadas para aprender un instrumento con profesores capacitados y una experiencia cercana.",
  },
  {
    icon: AudioLines,
    number: "03",
    name: "SCena",
    kicker: "Producción de eventos",
    text: "Paquetes para eventos privados y públicos, desde encuentros pequeños hasta producciones de gran formato.",
  },
  {
    icon: Cable,
    number: "04",
    name: "Pross Electronics",
    kicker: "Taller especializado",
    text: "Revisión y reparación de sistemas de audio y video, mezcladoras, parlantes, pantallas, adaptadores y luces.",
  },
];

const brands = ["D.A.S.", "Ibanez", "TAMA", "QSC Audio", "Yamaha", "D’Addario", "audio-technica", "JBL"];

const academyPrograms = ["Guitarra", "Violín", "Viola", "Cello", "Piano", "Percusión", "Canto", "Bajo", "Saxofón", "Trompeta", "Flauta traversa"];

const eventTypes = ["Bodas y quince años", "Corporativos y congresos", "Culturales y artísticos", "Ferias y lanzamientos", "Graduaciones", "Fiestas privadas", "Eventos deportivos", "Infantiles y familiares"];

const bars = [12, 25, 18, 36, 23, 48, 30, 58, 34, 43, 26, 54, 39, 62, 44, 28, 51, 34, 20, 39, 17, 29, 13];

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
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-[#1f65ff]/20 bg-[#050818]/90 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#inicio" className="group flex items-center gap-3" aria-label="JESS Music, inicio">
            <JessMark compact />
          </a>
          <nav className="hidden items-center gap-8 lg:flex">
            {[["#categorias", "Tienda"], ["#oferta", "Oferta"], ["#experiencia", "Grupo"], ["#academia", "Academia"], ["#contacto", "Contacto"]].map(([href, label]) => (
              <a key={href} href={href} className="text-xs font-bold uppercase tracking-[0.2em] text-white/65 transition hover:text-white">{label}</a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <a href={`tel:+506${PHONE.replace("-", "")}`} className="text-sm font-semibold text-white/70 transition hover:text-white">{PHONE}</a>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#0d61ff] to-[#27dce5] px-5 text-xs font-black uppercase tracking-[0.15em] transition hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(31,219,228,.35)]">
              <MessageCircle className="h-4 w-4" /> Consultar
            </a>
          </div>
          <button onClick={() => setMenuOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/30 sm:hidden" aria-label="Abrir menú">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/10 bg-black/95 px-5 py-5 backdrop-blur-xl sm:hidden">
            <div className="grid gap-2">
              {[["#categorias", "Tienda"], ["#oferta", "Oferta"], ["#experiencia", "Grupo"], ["#academia", "Academia"], ["#contacto", "Contacto"]].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-white/80 hover:bg-white/5">{label}</a>
              ))}
            </div>
          </div>
        )}
      </header>

      <section id="inicio" className="relative flex min-h-[100svh] items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/propuestas/grupo-jess/hero-cinematic-v2.png" alt="Guitarra, batería, teclado y equipo de audio con iluminación azul y verde JESS" className="absolute inset-0 h-full w-full object-cover object-[62%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,6,20,.99)_0%,rgba(3,6,20,.82)_34%,rgba(3,6,20,.18)_72%,rgba(3,6,20,.38)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#050818] to-transparent" />
        <div className="absolute right-[7%] top-[18%] hidden h-28 w-28 rounded-full border border-white/15 lg:block">
          <div className="absolute inset-3 grid place-items-center rounded-full border border-[#24dce6]/25 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#80edf2]/70">Música<br />que<br />conecta</div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-16 pt-32 sm:px-8 lg:px-12 lg:pb-20">
          <motion.div initial="show" animate="show" transition={{ staggerChildren: 0.1 }} className="max-w-5xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.28em] text-[#4ce7eb]">
              <span className="h-px w-10 bg-gradient-to-r from-[#1268ff] to-[#69e978]" /> Ciudad Quesada · San Carlos
            </motion.div>
            <motion.div variants={fadeUp} className="mt-7">
              <h1 className="sr-only">Jess Music &amp; Sound Systems</h1>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/propuestas/grupo-jess/logo.svg" alt="Jess Music & Sound Systems" className="h-auto w-[min(34rem,88vw)]" />
            </motion.div>
            <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-4xl">
              Música que <span className="font-serif italic text-[#a9ef4f]">conecta.</span>
            </motion.p>
            <motion.p variants={fadeUp} className="mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
              Tienda musical, producción de eventos, academia de artes, estudio y servicio técnico: un grupo conectado por la música.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
              <a href="#categorias" className="inline-flex min-h-13 items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:scale-[1.03]">
                Explorar equipo <ArrowDownRight className="h-4 w-4" />
              </a>
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="inline-flex min-h-13 items-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-black backdrop-blur transition hover:bg-white/12">
                Hablar con JESS <MessageCircle className="h-4 w-4 text-[#36dfe7]" />
              </a>
            </motion.div>
          </motion.div>

          <div className="mt-16 flex h-16 items-end gap-[5px] overflow-hidden border-t border-white/10 pt-5" aria-hidden="true">
            {bars.map((height, index) => <span key={index} className="w-1.5 rounded-full bg-gradient-to-t from-[#0d61ff] via-[#28dce6] to-[#b4ef45] opacity-90" style={{ height }} />)}
            <span className="ml-4 self-center text-[10px] font-black uppercase tracking-[0.24em] text-white/35">Calidad · tecnología · experiencia</span>
          </div>
        </div>
      </section>

      <section id="categorias" className="bg-[#eef5f7] px-5 py-20 text-[#071136] sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1500px]">
          <SectionIntro label="Jess Store" title={<>El instrumento<br />de sus sueños.</>} text="Cuerdas, percusión, vientos, teclas, repuestos y tecnología para ensayo, estudio y escenario." dark />
          <div className="mt-14 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category, index) => (
              <motion.article key={category.title} transition={{ delay: index * 0.06 }} className={`group relative min-h-[390px] overflow-hidden rounded-[2rem] bg-gradient-to-br ${category.color} bg-[#131313] p-7 text-white`}>
                <div className="absolute -bottom-10 -right-12 opacity-[0.12] transition duration-700 group-hover:rotate-6 group-hover:scale-110"><category.icon className="h-64 w-64" /></div>
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between"><category.icon className="h-9 w-9 text-[#7ce66d]" /><span className="text-xs font-black text-white/30">0{index + 1}</span></div>
                  <div className="mt-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">{category.eyebrow}</p>
                    <h3 className="mt-3 text-4xl font-black tracking-tight">{category.title}</h3>
                    <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">{category.description}</p>
                    <span className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition group-hover:border-[#26dce5] group-hover:bg-[#1268ff]"><ArrowRight className="h-4 w-4" /></span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          <p className="mt-5 text-xs text-black/45">Categorías de referencia. Marcas, modelos y disponibilidad se confirman directamente con la tienda.</p>
        </div>
      </section>

      <section className="border-y border-[#0f61ff]/15 bg-white px-5 py-16 text-[#071136] sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0b61de]">Sonido con respaldo</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-5xl">Marcas que han sido parte de JESS.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#071136]/55">Selección recuperada del material comercial histórico. Disponibilidad y distribución actual sujetas a confirmación.</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-[#071136]/10 bg-[#071136]/10 sm:grid-cols-4">
            {brands.map((brand, index) => (
              <div key={brand} className="group grid min-h-32 place-items-center bg-[#f4f8fa] p-5 transition hover:bg-white">
                <span className={`text-center font-black tracking-[-0.045em] text-[#071136] transition group-hover:text-[#0b61de] ${index % 3 === 0 ? "text-3xl" : "text-2xl"}`}>{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="oferta" className="relative overflow-hidden border-y border-[#1d6cff]/20 bg-[#040716]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/propuestas/grupo-jess/bateria-junior-featured.png"
          alt="Batería junior color vino de cinco piezas"
          className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,6,20,.99)_0%,rgba(3,6,20,.94)_34%,rgba(3,6,20,.42)_63%,rgba(3,6,20,.15)_100%)]" />
        <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-[#176cff] via-[#28dce6] to-[#a9ed50]" />
        <div className="relative mx-auto flex min-h-[720px] max-w-[1500px] items-center px-6 py-24 sm:px-10 lg:px-14">
          <motion.div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#35e0e8]/25 bg-[#1167ff]/12 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#63e8ed]">
              <BadgePercent className="h-4 w-4" /> Oferta destacada
            </div>
            <div className="mt-8 flex items-end gap-4">
              <span className="bg-gradient-to-r from-[#2fdfe8] to-[#a8ee51] bg-clip-text text-7xl font-black leading-none tracking-[-0.07em] text-transparent sm:text-8xl">22%</span>
              <span className="pb-2 text-sm font-black uppercase tracking-[0.18em] text-white/55">de descuento</span>
            </div>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-[#a7ed50]">Batería junior · 5 piezas</p>
            <h2 className="mt-4 text-4xl font-black leading-[0.92] tracking-[-0.045em] sm:text-6xl">Su primer gran<br />ritmo empieza aquí.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/60">Ideal para que los niños inicien en la música y desarrollen coordinación, ritmo y creatividad de una forma divertida y educativa.</p>
            <div className="mt-7 grid gap-3 text-sm font-semibold text-white/78 sm:grid-cols-2">
              {["Aprendizaje desde casa", "Disciplina y creatividad", "Formato junior", "Set de cinco piezas"].map((item) => (
                <span key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#36dfe7]" />{item}</span>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={PRODUCT_WHATSAPP}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center gap-3 rounded-full bg-gradient-to-r from-[#0d61ff] to-[#27dce5] px-6 text-sm font-black transition hover:scale-[1.03] hover:shadow-[0_0_34px_rgba(39,220,229,.3)]"
              >
                Consultar oferta <ArrowRight className="h-4 w-4" />
              </a>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/45"><Timer className="h-4 w-4 text-[#a9ed50]" /> Hasta agotar existencias</span>
            </div>
            <p className="mt-5 max-w-md text-[11px] leading-5 text-white/35">Oferta por tiempo limitado o hasta agotar existencias. Precio y disponibilidad se confirman directamente con JESS Music.</p>
          </motion.div>
        </div>
      </section>

      <section id="experiencia" className="relative px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative mx-auto max-w-[1500px]">
          <SectionIntro label="Bienvenido a Jess Group" title={<>Cuatro equipos.<br /><span className="text-white/28">Una misma pasión.</span></>} text="Cada departamento está enfocado en una etapa diferente: encontrar el equipo, aprender, producir un evento o devolverle vida a la tecnología." />
          <div className="mt-16 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {businessUnits.map((unit) => (
              <article key={unit.number} className="group rounded-3xl border border-white/10 bg-white/[0.025] p-7 transition hover:border-[#29dce5]/25 hover:bg-white/[0.045]">
                <div className="flex items-center justify-between"><unit.icon className="h-8 w-8 text-[#32dfe7]" /><span className="font-mono text-xs text-white/25">{unit.number}</span></div>
                <p className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-[#a9ed50]">{unit.kicker}</p>
                <h3 className="mt-3 text-2xl font-black">{unit.name}</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/50">{unit.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-20 overflow-hidden rounded-[2.5rem] border border-[#176cff]/20 bg-gradient-to-br from-[#0b1538] to-[#061021] p-7 sm:p-10 lg:p-14">
            <div className="grid gap-12 lg:grid-cols-[.75fr_1fr] lg:items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#176cff]/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#48e2e9]"><AudioLines className="h-4 w-4" /> SCena · Eventos</div>
                <h3 className="mt-6 text-4xl font-black leading-[0.94] tracking-[-0.045em] sm:text-6xl">Su evento merece<br /><span className="font-serif italic text-[#a9ed50]">sentirse inolvidable.</span></h3>
                <p className="mt-6 max-w-xl text-base leading-7 text-white/55">Producción para eventos pequeños y de gran formato, privados o públicos, con personal capacitado para acompañar la experiencia.</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {["Tarimas", "Luces y sonido", "DJ y discomóvil"].map((service) => <span key={service} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-black">{service}</span>)}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Tipos de eventos</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {eventTypes.map((event) => <span key={event} className="rounded-full border border-[#34dfe7]/15 bg-[#34dfe7]/[0.06] px-4 py-2.5 text-xs font-semibold text-white/70">{event}</span>)}
                </div>
                <a href={WHATSAPP} target="_blank" rel="noreferrer" className="mt-8 inline-flex min-h-13 items-center gap-3 rounded-full bg-gradient-to-r from-[#0d61ff] to-[#27dce5] px-6 text-sm font-black transition hover:scale-[1.03]">Pedir presupuesto <ArrowRight className="h-4 w-4" /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="academia" className="px-5 py-10 sm:px-8 lg:px-12 lg:py-20">
        <div className="relative mx-auto min-h-[560px] max-w-[1500px] overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0b55dc] via-[#19b8dc] to-[#9ee558] p-7 text-[#050818] sm:p-12 lg:p-20">
          <div className="absolute -right-24 -top-24 h-[520px] w-[520px] rounded-full border-[80px] border-[#071136]/15" />
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(#06102f_1.2px,transparent_1.2px)] [background-size:16px_16px]" />
          <div className="absolute bottom-0 right-0 flex h-44 items-end gap-2 pr-8 opacity-30" aria-hidden="true">{bars.slice(0, 15).map((height, i) => <span key={i} className="w-3 rounded-t-full bg-[#071136]" style={{ height: height * 2.2 }} />)}</div>
          <div className="relative z-10 flex min-h-[400px] max-w-5xl flex-col justify-between">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#071136]/15 bg-[#071136]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em]"><GraduationCap className="h-4 w-4" /> eXpression · Academia de artes</div>
            <div>
              <p className="font-serif text-3xl italic text-[#071136]/60 sm:text-5xl">La música se aprende</p>
              <h2 className="mt-1 text-5xl font-black uppercase leading-[0.85] tracking-[-0.06em] text-[#050818] sm:text-7xl lg:text-8xl">tocándola.</h2>
              <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-[#071136]/70">Clases personalizadas para compartir la pasión por la música y aprender a ejecutar un instrumento con profesores capacitados.</p>
              <div className="mt-7 flex max-w-4xl flex-wrap gap-2">
                {academyPrograms.map((program) => <span key={program} className="rounded-full border border-[#071136]/15 bg-white/20 px-4 py-2 text-xs font-black text-[#071136]/80">{program}</span>)}
              </div>
              <p className="mt-5 text-[11px] font-semibold text-[#071136]/50">Cursos, profesores, horarios y matrícula sujetos a confirmación de la academia.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef5f7] px-5 py-20 text-[#071136] sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-[2.5rem] bg-[#071136] p-7 text-white sm:p-10 lg:p-12">
            <Cable className="absolute -bottom-16 -right-12 h-72 w-72 text-[#2bdde6]/10" />
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#49e3e9]">Pross Electronics</p>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] sm:text-5xl">Reparar también es<br />mantener viva la música.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">Revisión y reparación especializada para sistemas de audio y video.</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Parlantes activos y pasivos", "Mezcladoras", "Pantallas", "Adaptadores", "Iluminación"].map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/70">{item}</span>)}
              </div>
            </div>
          </article>
          <article className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0d61ff] via-[#17addd] to-[#70de76] p-7 sm:p-10 lg:p-12">
            <AudioLines className="absolute -bottom-12 -right-10 h-64 w-64 text-[#071136]/10" />
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#071136]/60">Estudio de grabación</p>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] text-[#050818] sm:text-5xl">De una idea<br />a una producción.</h2>
              <p className="mt-5 max-w-xl text-sm font-semibold leading-7 text-[#071136]/65">Un espacio dentro del ecosistema JESS para presentar servicios de grabación y producción musical cuando se confirme la oferta vigente.</p>
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#050818] px-6 text-sm font-black text-white transition hover:scale-[1.03]">Consultar servicios <ArrowRight className="h-4 w-4" /></a>
            </div>
          </article>
        </div>
      </section>

      <section id="contacto" className="px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div>
            <div className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.25em] text-[#35e0e8]"><Radio className="h-4 w-4" /> Estamos en frecuencia</div>
            <h2 className="mt-7 text-5xl font-black leading-[0.9] tracking-[-0.055em] sm:text-7xl">Hablemos de<br /><span className="font-serif italic text-[#a9ed50]">su sonido.</span></h2>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/50">Consulte por tienda, academia, eventos, estudio o reparación. Inventario, precios, horarios y disponibilidad se confirman directamente con JESS Group.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center gap-3 rounded-full bg-gradient-to-r from-[#0d61ff] to-[#27dce5] px-6 text-sm font-black transition hover:scale-[1.03] hover:shadow-[0_0_34px_rgba(39,220,229,.3)]"><MessageCircle className="h-5 w-5" /> WhatsApp {MOBILE}</a>
              <a href={`tel:+506${PHONE.replace("-", "")}`} className="inline-flex min-h-14 items-center gap-3 rounded-full border border-white/15 px-6 text-sm font-black transition hover:bg-white/8"><Phone className="h-5 w-5" /> {PHONE}</a>
            </div>
            <div className="mt-9 rounded-[2rem] border border-white/10 bg-white/[0.035] px-6 sm:px-7">
              <ContactItem icon={MapPin} label="Visítenos" value="Ciudad Quesada, frente a la sucursal del INA" href={MAPS} />
              <ContactItem icon={Mail} label="Correo" value="info@jessmusic.cr" href="mailto:info@jessmusic.cr" />
              <ContactItem icon={Phone} label="Teléfonos" value={`WhatsApp ${MOBILE} · Central ${PHONE}`} last />
            </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-2 shadow-[0_30px_90px_rgba(0,0,0,.28)]">
              <iframe
                title="Mapa de Jess Music en Ciudad Quesada"
                src={MAP_EMBED}
                className="h-[600px] w-full rounded-[2rem] border-0 grayscale-[.1] contrast-[1.05]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-[#050818]/90 p-4 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:max-w-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4ce4ea]">Jess Music &amp; Sound Systems</p>
                <p className="mt-2 text-sm font-semibold text-white/75">Frente a la sucursal del INA, Ciudad Quesada, San Carlos.</p>
                <a href={MAPS} target="_blank" rel="noreferrer" className="pointer-events-auto mt-4 inline-flex items-center gap-2 text-xs font-black text-white">Abrir en Google Maps <ExternalLink className="h-3.5 w-3.5 text-[#a9ed50]" /></a>
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-white/10 pt-10">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#36dfe7]">Siga el ritmo</p><h3 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">JESS en sus redes.</h3></div>
              <p className="max-w-md text-xs leading-5 text-white/35">Instagram y Facebook están confirmados. Los demás accesos abren una búsqueda específica hasta validar la cuenta oficial.</p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="group flex min-h-36 flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-[#34dfe7]/35 hover:bg-[#1167ff]/10">
                  <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1167ff]/15"><social.icon className="h-5 w-5 text-[#45e3e9]" /></span><ExternalLink className="h-4 w-4 text-white/20 transition group-hover:text-[#a9ed50]" /></div>
                  <div><p className="font-black">{social.label}</p><p className="mt-1 text-xs text-white/40">{social.detail}</p><span className={`mt-3 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] ${social.verified ? "text-[#a9ed50]" : "text-white/25"}`}><span className={`h-1.5 w-1.5 rounded-full ${social.verified ? "bg-[#a9ed50]" : "bg-white/25"}`} />{social.verified ? "Perfil confirmado" : "Búsqueda preparada"}</span></div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-9 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div><JessMark /><p className="mt-5 max-w-md text-xs leading-5 text-white/35">Jess Store · eXpression · SCena · Pross Electronics. Información comercial, cursos, marcas y disponibilidad sujetos a validación del negocio.</p></div>
          <div className="text-left text-xs font-semibold text-white/35 sm:text-right"><p>Ciudad Quesada · San Carlos · Costa Rica</p><p className="mt-2">© {new Date().getFullYear()} JESS Music &amp; Sound Systems</p></div>
        </div>
      </footer>
    </main>
  );
}

function JessMark({ compact = false }: { compact?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/propuestas/grupo-jess/logo.svg"
      alt="Jess Music & Sound Systems"
      className={compact ? "h-12 w-auto" : "h-16 w-auto"}
    />
  );
}

function SectionIntro({ label, title, text, dark = false }: { label: string; title: React.ReactNode; text: string; dark?: boolean }) {
  return <div className="grid gap-8 lg:grid-cols-[1fr_.7fr] lg:items-end"><div><p className={`text-[10px] font-black uppercase tracking-[0.28em] ${dark ? "text-[#0b61de]" : "text-[#38e0e8]"}`}><Sparkles className="mr-2 inline h-3.5 w-3.5" />{label}</p><h2 className="mt-6 text-4xl font-black leading-[0.96] tracking-[-0.05em] sm:text-6xl">{title}</h2></div><p className={`max-w-xl text-base leading-7 ${dark ? "text-[#071136]/60" : "text-white/50"}`}>{text}</p></div>;
}

function ContactItem({ icon: Icon, label, value, href, last = false }: { icon: ComponentType<{ className?: string }>; label: string; value: string; href?: string; last?: boolean }) {
  const content = <><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1167ff]/15"><Icon className="h-5 w-5 text-[#40e1e9]" /></span><span><span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/30">{label}</span><span className="mt-2 block text-sm font-semibold leading-6 text-white/80">{value}</span></span></>;
  const className = `flex gap-4 py-6 ${last ? "" : "border-b border-white/10"}`;
  return href ? <a href={href} target="_blank" rel="noreferrer" className={`${className} transition hover:translate-x-1`}>{content}</a> : <div className={className}>{content}</div>;
}

const fadeUp = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.65 } } };

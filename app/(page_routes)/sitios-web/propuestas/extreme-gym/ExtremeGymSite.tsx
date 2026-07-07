"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Dumbbell,
  Facebook,
  Flame,
  HeartPulse,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
  Star,
  Timer,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Datos del negocio — editables para la propuesta                    */
/* ------------------------------------------------------------------ */

const GYM = {
  name: "Xtreme Gym",
  tagline: "Entrena sin límites",
  city: "Ciudad Quesada, San Carlos",
  address:
    "Barrio San Pablo, contiguo a la plaza de deportes, camino a Selva Verde, Buena Vista, Costa Rica",
  whatsapp: "50688984000",
  whatsappDisplay: "+506 8898 4000",
  phoneDisplay: "2461 2005",
  email: "xtremegymadm@gmail.com",
  instagram: "https://www.instagram.com/xtremegym_tan/",
  facebook: "https://www.facebook.com/xtremegym.cr/",
  maps: "https://maps.app.goo.gl/RxUmrxqqchH5men99",
  lat: 10.3430360,
  lng: -84.4288150,
};

const NAV = [
  { href: "#inicio", label: "Inicio" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#clases", label: "Clases" },
  { href: "#horarios", label: "Horarios" },
  { href: "#planes", label: "Planes" },
  { href: "#ubicacion", label: "Ubicación" },
];

const STATS = [
  { value: "500+", label: "Miembros activos" },
  { value: "10+", label: "Años de experiencia" },
  { value: "8", label: "Entrenadores certificados" },
  { value: "24/7", label: "Acceso a socios Xtreme" },
];

const FEATURES = [
  {
    icon: Dumbbell,
    title: "Equipo de primer nivel",
    text: "Máquinas de fuerza, peso libre y zona de cardio renovada para cada objetivo.",
  },
  {
    icon: Users,
    title: "Entrenadores certificados",
    text: "Acompañamiento personalizado y rutinas diseñadas según tu meta y nivel.",
  },
  {
    icon: HeartPulse,
    title: "Planes a tu medida",
    text: "Programas de tonificación, pérdida de grasa, fuerza e hipertrofia.",
  },
  {
    icon: Zap,
    title: "Ambiente que motiva",
    text: "Una comunidad que empuja, con música, energía y disciplina real.",
  },
];

const CLASSES = [
  {
    icon: Dumbbell,
    name: "Musculación",
    text: "Zona completa de peso libre y máquinas para fuerza e hipertrofia.",
    tag: "Todos los niveles",
  },
  {
    icon: Flame,
    name: "Entrenamiento funcional",
    text: "Circuitos de alta intensidad para quemar grasa y ganar resistencia.",
    tag: "Alta intensidad",
  },
  {
    icon: HeartPulse,
    name: "Cardio & HIIT",
    text: "Sesiones dinámicas para mejorar tu capacidad cardiovascular.",
    tag: "Quema calorías",
  },
  {
    icon: Trophy,
    name: "Preparación física",
    text: "Planes para atletas y quienes buscan competir o superar marcas.",
    tag: "Rendimiento",
  },
];

const SCHEDULE = [
  { day: "Lunes a Viernes", hours: "5:00 a.m. – 10:00 p.m." },
  { day: "Sábados", hours: "6:00 a.m. – 6:00 p.m." },
  { day: "Domingos", hours: "7:00 a.m. – 1:00 p.m." },
  { day: "Feriados", hours: "Horario especial" },
];

const PLANS = [
  {
    name: "Diario",
    price: "₡2.500",
    period: "por día",
    features: ["Acceso a todo el equipo", "Zona de cardio y pesas", "Sin compromiso"],
    highlight: false,
  },
  {
    name: "Mensual",
    price: "₡18.000",
    period: "por mes",
    features: [
      "Acceso ilimitado",
      "Rutina personalizada",
      "Asesoría de entrenadores",
      "Clases funcionales incluidas",
    ],
    highlight: true,
  },
  {
    name: "Trimestral",
    price: "₡45.000",
    period: "3 meses",
    features: [
      "Todo lo del plan mensual",
      "Evaluación física mensual",
      "Plan nutricional básico",
      "Ahorra ₡9.000",
    ],
    highlight: false,
  },
];

const TRAINERS = [
  { name: "Coach principal", role: "Fuerza & hipertrofia", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80" },
  { name: "Entrenador funcional", role: "HIIT & acondicionamiento", img: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&q=80" },
  { name: "Especialista cardio", role: "Resistencia & pérdida de grasa", img: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&q=80" },
];

const GALLERY = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  "https://images.unsplash.com/photo-1637666505879-2b5b6a09f1e5?w=800&q=80",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
  "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
  "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=800&q=80",
];

const TESTIMONIALS = [
  {
    name: "Andrés M.",
    text: "El mejor ambiente de Ciudad Quesada. Los entrenadores te ayudan de verdad y ya veo resultados.",
  },
  {
    name: "Karla V.",
    text: "Empecé desde cero y me sentí acompañada todo el tiempo. Equipo excelente y muy limpio.",
  },
  {
    name: "José R.",
    text: "Precios justos y horario amplio. Puedo entrenar temprano antes del trabajo. Recomendadísimo.",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const waLink = (msg: string) =>
  `https://wa.me/${GYM.whatsapp}?text=${encodeURIComponent(msg)}`;

const mapEmbed = `https://www.google.com/maps?q=${GYM.lat},${GYM.lng}&z=16&output=embed`;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative px-5 py-20 sm:px-8 md:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
      <Flame className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                              */
/* ------------------------------------------------------------------ */

export default function ExtremeGymSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-neutral-100 selection:bg-red-500/30">
      {/* ---------------- NAV ---------------- */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-[#0a0a0b]/90 backdrop-blur-lg"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#inicio" className="flex items-center gap-2 font-black tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30">
              <Dumbbell className="h-5 w-5" />
            </span>
            <span className="text-lg">
              XTREME<span className="text-red-500">GYM</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm font-medium text-neutral-300 transition-colors hover:text-white"
              >
                {n.label}
              </a>
            ))}
          </div>

          <a
            href={waLink(`Hola ${GYM.name}, quiero información sobre las membresías.`)}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition hover:scale-105 md:inline-flex"
          >
            Únete hoy
          </a>

          <button
            aria-label="Menú"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg border border-white/10 p-2 text-white md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#0a0a0b]/95 px-5 py-4 backdrop-blur-lg md:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-300 hover:bg-white/5 hover:text-white"
                >
                  {n.label}
                </a>
              ))}
              <a
                href={waLink(`Hola ${GYM.name}, quiero información sobre las membresías.`)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 text-center text-sm font-bold text-white"
              >
                Únete hoy
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ---------------- HERO ---------------- */}
      <section id="inicio" className="relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80"
            alt="Interior de gimnasio"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/85 to-[#0a0a0b]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-[#0a0a0b]/60" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-5 pt-24 sm:px-8">
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.12 }}
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Eyebrow>{GYM.city}</Eyebrow>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-6 text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl"
            >
              SUPERA TUS
              <br />
              <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                LÍMITES
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-6 max-w-lg text-lg text-neutral-300"
            >
              El gimnasio de Ciudad Quesada donde la disciplina se convierte en
              resultados. Musculación, funcional y clases con entrenadores que te
              acompañan en cada repetición.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <a
                href={waLink(`Hola ${GYM.name}, quiero probar una clase.`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-7 py-3.5 font-bold text-white shadow-xl shadow-red-500/30 transition hover:scale-105"
              >
                Prueba una clase gratis
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#planes"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/10"
              >
                Ver planes
              </a>
            </motion.div>
          </motion.div>
        </div>

        <a
          href="#nosotros"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-400 transition hover:text-white"
          aria-label="Bajar"
        >
          <ChevronDown className="h-7 w-7 animate-bounce" />
        </a>
      </section>

      {/* ---------------- MARQUEE ---------------- */}
      <div className="border-y border-white/10 bg-red-600/10 py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 text-sm font-bold uppercase tracking-widest text-neutral-300">
          {["Fuerza", "•", "Disciplina", "•", "Comunidad", "•", "Resultados", "•", "Energía"].map(
            (w, i) => (
              <span key={i} className={w === "•" ? "text-red-500" : ""}>
                {w}
              </span>
            ),
          )}
        </div>
      </div>

      {/* ---------------- STATS ---------------- */}
      <Section className="!py-16">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-neutral-400">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ---------------- NOSOTROS ---------------- */}
      <Section id="nosotros">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&q=80"
                alt="Entrenamiento en Xtreme Gym"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 rounded-2xl border border-white/10 bg-[#111113] p-5 shadow-2xl sm:-right-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
                  <Trophy className="h-5 w-5 text-white" />
                </span>
                <div>
                  <div className="text-lg font-black">#1 en San Carlos</div>
                  <div className="text-xs text-neutral-400">Comunidad fitness</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Eyebrow>Sobre nosotros</Eyebrow>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Más que un gimnasio,
              <br />
              una <span className="text-red-500">familia fitness</span>
            </h2>
            <p className="mt-5 text-neutral-300">
              En {GYM.name} creemos que cada persona tiene un potencial extremo por
              descubrir. Desde principiantes hasta atletas, te damos el equipo, el
              conocimiento y la energía para transformar tu cuerpo y tu mente.
            </p>
            <p className="mt-4 text-neutral-400">
              Ubicados en el corazón de Ciudad Quesada, somos el punto de encuentro
              de quienes no se conforman.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-red-500/40 hover:bg-white/[0.05]"
                >
                  <f.icon className="h-6 w-6 text-red-500" />
                  <h3 className="mt-3 font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-neutral-400">{f.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ---------------- CLASES ---------------- */}
      <Section id="clases" className="bg-[#0d0d0f]">
        <div className="text-center">
          <Eyebrow>Disciplinas</Eyebrow>
          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            Entrena a tu <span className="text-red-500">manera</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-400">
            Programas para cada objetivo, nivel y estilo de vida.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CLASSES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-500/10 blur-2xl transition group-hover:bg-red-500/20" />
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30">
                <c.icon className="h-6 w-6 text-white" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{c.name}</h3>
              <p className="mt-2 text-sm text-neutral-400">{c.text}</p>
              <span className="mt-4 inline-block rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-red-400">
                {c.tag}
              </span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ---------------- HORARIOS ---------------- */}
      <Section id="horarios">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Horarios</Eyebrow>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Abierto cuando <span className="text-red-500">tú puedes</span>
            </h2>
            <p className="mt-4 text-neutral-400">
              Horario amplio para que entrenes temprano en la mañana o después del
              trabajo. Sin excusas.
            </p>
            <a
              href={waLink(`Hola ${GYM.name}, ¿me confirman el horario de hoy?`)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white/10"
            >
              <Phone className="h-4 w-4" /> Consultar horario
            </a>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            {SCHEDULE.map((s, i) => (
              <div
                key={s.day}
                className={`flex items-center justify-between px-6 py-5 ${
                  i !== SCHEDULE.length - 1 ? "border-b border-white/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">{s.day}</span>
                </div>
                <span className="text-sm text-neutral-300">{s.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------------- PLANES ---------------- */}
      <Section id="planes" className="bg-[#0d0d0f]">
        <div className="text-center">
          <Eyebrow>Membresías</Eyebrow>
          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            Elige tu <span className="text-red-500">plan</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-400">
            Precios de referencia. Escríbenos por WhatsApp para promociones y planes
            anuales.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`relative flex flex-col rounded-3xl border p-8 ${
                p.highlight
                  ? "border-red-500/50 bg-gradient-to-b from-red-500/15 to-transparent shadow-2xl shadow-red-500/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Más popular
                </span>
              )}
              <h3 className="text-lg font-bold text-neutral-200">{p.name}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-black">{p.price}</span>
                <span className="mb-1 text-sm text-neutral-400">/ {p.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={waLink(`Hola ${GYM.name}, me interesa el plan ${p.name}.`)}
                target="_blank"
                rel="noreferrer"
                className={`mt-8 rounded-full py-3 text-center font-bold transition hover:scale-[1.02] ${
                  p.highlight
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30"
                    : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                Empezar ahora
              </a>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ---------------- ENTRENADORES ---------------- */}
      <Section>
        <div className="text-center">
          <Eyebrow>El equipo</Eyebrow>
          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            Entrenadores que te <span className="text-red-500">impulsan</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TRAINERS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
            >
              <div className="relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.img}
                  alt={t.name}
                  className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="font-bold">{t.name}</h3>
                <p className="text-sm text-red-400">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ---------------- GALERÍA ---------------- */}
      <Section id="galeria" className="bg-[#0d0d0f]">
        <div className="text-center">
          <Eyebrow>Galería</Eyebrow>
          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            Así se vive <span className="text-red-500">Xtreme</span>
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GALLERY.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
              className="group overflow-hidden rounded-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Xtreme Gym ${i + 1}`}
                className="aspect-square w-full object-cover transition duration-500 group-hover:scale-110"
              />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ---------------- TESTIMONIOS ---------------- */}
      <Section>
        <div className="text-center">
          <Eyebrow>Testimonios</Eyebrow>
          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            Lo que dice <span className="text-red-500">nuestra gente</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-7"
            >
              <div className="flex gap-1 text-orange-400">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-neutral-300">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 font-bold text-white">
                  {t.name.charAt(0)}
                </span>
                <span className="font-semibold">{t.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ---------------- UBICACIÓN ---------------- */}
      <Section id="ubicacion" className="bg-[#0d0d0f]">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Ubicación</Eyebrow>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Visítanos en <span className="text-red-500">Ciudad Quesada</span>
            </h2>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5">
                  <MapPin className="h-5 w-5 text-red-500" />
                </span>
                <div>
                  <div className="font-semibold">Dirección</div>
                  <p className="text-sm text-neutral-400">{GYM.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5">
                  <Phone className="h-5 w-5 text-red-500" />
                </span>
                <div>
                  <div className="font-semibold">Teléfono / WhatsApp</div>
                  <p className="text-sm text-neutral-400">
                    Tel: {GYM.phoneDisplay} · WhatsApp: {GYM.whatsappDisplay}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5">
                  <Mail className="h-5 w-5 text-red-500" />
                </span>
                <div>
                  <div className="font-semibold">Correo</div>
                  <a
                    href={`mailto:${GYM.email}`}
                    className="text-sm text-neutral-400 transition hover:text-white"
                  >
                    {GYM.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5">
                  <Timer className="h-5 w-5 text-red-500" />
                </span>
                <div>
                  <div className="font-semibold">Horario</div>
                  <p className="text-sm text-neutral-400">
                    Lun–Vie 5am–10pm · Sáb 6am–6pm · Dom 7am–1pm
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={GYM.maps}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-red-500/30 transition hover:scale-105"
              >
                <MapPin className="h-4 w-4" /> Cómo llegar
              </a>
              <a
                href={GYM.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white/10"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10">
            <iframe
              title="Ubicación Xtreme Gym"
              src={mapEmbed}
              className="h-full min-h-[340px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Section>

      {/* ---------------- CTA FINAL ---------------- */}
      <section className="relative overflow-hidden px-5 py-24 sm:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black leading-tight text-white sm:text-5xl">
            Tu mejor versión empieza hoy
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
            Da el primer paso. Escríbenos y reserva tu clase de prueba gratis en{" "}
            {GYM.name}.
          </p>
          <a
            href={waLink(`Hola ${GYM.name}, quiero mi clase de prueba gratis.`)}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0a0a0b] px-8 py-4 text-lg font-bold text-white transition hover:scale-105"
          >
            Reserva por WhatsApp
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-white/10 bg-[#0a0a0b] px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
            <div className="max-w-sm text-center md:text-left">
              <div className="flex items-center justify-center gap-2 font-black md:justify-start">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-white">
                  <Dumbbell className="h-5 w-5" />
                </span>
                <span className="text-lg">
                  XTREME<span className="text-red-500">GYM</span>
                </span>
              </div>
              <p className="mt-4 text-sm text-neutral-400">
                {GYM.tagline}. El gimnasio de {GYM.city}.
              </p>
              <div className="mt-5 flex justify-center gap-3 md:justify-start">
                <a
                  href={GYM.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-neutral-300 transition hover:border-red-500/40 hover:text-white"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href={GYM.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-neutral-300 transition hover:border-red-500/40 hover:text-white"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href={waLink(`Hola ${GYM.name}!`)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-neutral-300 transition hover:border-red-500/40 hover:text-white"
                >
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 md:items-end">
              <div className="text-sm font-semibold text-neutral-300">Enlaces</div>
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="text-sm text-neutral-400 transition hover:text-white"
                >
                  {n.label}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-neutral-500 sm:flex-row">
            <span>
              © {new Date().getFullYear()} {GYM.name}. Todos los derechos reservados.
            </span>
            <span>Propuesta de sitio web · demo</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Dumbbell,
  Flame,
  HeartPulse,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Timer,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Xtreme Gym | Gym premium en Ciudad Quesada",
  description:
    "Xtreme Gym en Ciudad Quesada, San Carlos. Fuerza, funcional, cardio, clases, reservas, rachas y app de socios con PIN.",
};

const BUSINESS = {
  whatsapp: "50688984000",
  phone: "2461 2005",
  email: "xtremegymadm@gmail.com",
  location: "Barrio San Pablo, Buena Vista, Ciudad Quesada",
  maps: "https://maps.app.goo.gl/RxUmrxqqchH5men99",
};

const waLink = (message: string) =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;

const HERO_STATS = [
  ["500+", "socios activos"],
  ["4", "zonas de entreno"],
  ["7", "dias por semana"],
  ["PIN", "app de socios"],
];

const TRAINING_ZONES = [
  {
    icon: Dumbbell,
    title: "Fuerza seria",
    tag: "Pesas / maquinas / tecnica",
    text: "Piso de fuerza para progresar cargas, construir musculo y entrenar con estructura.",
  },
  {
    icon: Zap,
    title: "Funcional Xtreme",
    tag: "HIIT / circuitos / condicion",
    text: "Clases con cupo, energia alta y bloques medibles para salir diciendo: hoy si le meti.",
  },
  {
    icon: HeartPulse,
    title: "Cardio inteligente",
    tag: "Resistencia / salud / quema",
    text: "Sesiones para mejorar condicion sin perder el norte: constancia, control y ritmo.",
  },
  {
    icon: Flame,
    title: "Lower Lab",
    tag: "Pierna / gluteo / estabilidad",
    text: "Trabajo tecnico de tren inferior, progresiones y seguimiento para resultados visibles.",
  },
];

const APP_STACK = [
  [CalendarCheck, "Reservas con cupo real", "El socio aparta clase y el cupo baja en vivo."],
  [CreditCard, "Estado de membresia", "Plan, dias restantes y aviso de vencimiento."],
  [Users, "Ocupacion del gym", "Para saber si esta tranquilo o a full antes de llegar."],
  [Trophy, "Rachas y ranking", "Gamificacion tica: no aflojar, mae, que la racha pesa."],
  [Timer, "Progreso corporal", "Peso, cintura y grafica simple para seguimiento."],
  [QrCode, "Carne digital", "Codigo de socio con acceso protegido por PIN."],
];

const PLANS = [
  {
    name: "Dia Xtreme",
    eyebrow: "Para probar",
    price: "Consultar",
    text: "Ideal para conocer el ambiente, hacer una clase o entrenar una sesion completa.",
    features: ["Acceso por dia", "Zonas de fuerza y cardio", "Orientacion inicial"],
  },
  {
    name: "Mensual Xtreme",
    eyebrow: "Mas elegido",
    price: "Consultar",
    highlighted: true,
    text: "La base para entrenar constante, reservar clases y sostener progreso sin complicarse.",
    features: ["Acceso recurrente", "App de reservas", "Rachas y check-in", "Seguimiento base"],
  },
  {
    name: "Xtreme Coach",
    eyebrow: "Mas acompanado",
    price: "Consultar",
    text: "Para socios que quieren estructura, medidas, rutina guiada y contacto mas cercano.",
    features: ["Rutinas guiadas", "Medidas corporales", "Objetivos por ciclo", "Soporte de coach"],
  },
];

const SCHEDULE = [
  { day: "Lunes a viernes", hours: "5:00 AM - 10:00 PM" },
  { day: "Sabados", hours: "6:00 AM - 6:00 PM" },
  { day: "Domingos", hours: "7:00 AM - 1:00 PM" },
];

const PROOF_POINTS = [
  "Reservas de clases",
  "Membresia visible",
  "Rachas por socio",
  "Rutinas guiadas",
  "Progreso corporal",
  "Pase para compas",
];

export default function ExtremeGymLandingPage() {
  return (
    <main className="min-h-screen bg-[#070707] text-white selection:bg-[#d8ff3e] selection:text-black">
      <section className="relative min-h-[92vh] overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=2400&q=88"
            alt="Entrenamiento premium en gimnasio moderno"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/58" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#070707_0%,rgba(7,7,7,.91)_42%,rgba(7,7,7,.28)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070707] to-transparent" />
        </div>

        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col px-5 py-5 sm:px-8">
          <header className="flex items-center justify-between gap-4">
            <Link href="/sitios-web/propuestas/extreme-gym" className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center bg-[#d8ff3e] text-black">
                <Dumbbell className="h-7 w-7" />
              </span>
              <span className="text-xl font-black uppercase tracking-tight">
                Xtreme<span className="text-[#d8ff3e]">Gym</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-7 text-xs font-black uppercase tracking-[0.18em] text-white/58 lg:flex">
              <a href="#experiencia" className="transition hover:text-white">Experiencia</a>
              <a href="#app" className="transition hover:text-white">App</a>
              <a href="#planes" className="transition hover:text-white">Planes</a>
              <a href="#contacto" className="transition hover:text-white">Contacto</a>
            </nav>

            <a
              href={waLink("Hola Xtreme Gym, quiero informacion para empezar a entrenar.")}
              className="hidden items-center gap-2 bg-white px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-[#d8ff3e] sm:inline-flex"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </header>

          <div className="grid flex-1 gap-10 py-14 lg:grid-cols-[1fr_430px] lg:items-end">
            <div className="pb-5">
              <div className="inline-flex items-center gap-2 border border-[#d8ff3e]/35 bg-[#d8ff3e]/10 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#eaff93]">
                <MapPin className="h-4 w-4" />
                Ciudad Quesada, San Carlos
              </div>
              <h1 className="mt-7 max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-tight sm:text-7xl lg:text-8xl">
                Gym de barrio.
                <span className="block text-[#d8ff3e]">Nivel cadena.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white/72">
                Entrene fuerza, funcional y cardio en un ambiente premium, directo y sin poses.
                Aqui la racha se respeta, el progreso se mide y el CTA es simple:
                escribanos y arranca, pura vida.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={waLink("Hola Xtreme Gym, quiero agendar una clase de prueba.")}
                  className="inline-flex items-center gap-2 bg-[#d8ff3e] px-6 py-4 font-black uppercase text-black transition hover:bg-white"
                >
                  Agendar clase
                  <ArrowRight className="h-5 w-5" />
                </a>
                <Link
                  href="/sitios-web/propuestas/extreme-gym/app"
                  className="inline-flex items-center gap-2 border border-white/20 bg-white/[0.07] px-6 py-4 font-black uppercase text-white transition hover:border-white/45 hover:bg-white/10"
                >
                  Ver app de socios
                  <Smartphone className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="border border-white/12 bg-black/62 p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d8ff3e]">Hoy se entrena</p>
                  <h2 className="mt-2 text-3xl font-black uppercase">HIIT Quemador</h2>
                  <p className="mt-2 text-sm font-bold text-white/55">6:00 PM - 35 min - cupos limitados</p>
                </div>
                <Flame className="h-9 w-9 text-orange-300" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {HERO_STATS.map(([value, label]) => (
                  <div key={label} className="flex items-center justify-between border border-white/10 bg-white/[0.045] p-4">
                    <span className="text-2xl font-black uppercase">{value}</span>
                    <span className="text-right text-xs font-black uppercase tracking-[0.16em] text-white/45">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#d8ff3e] px-5 py-4 text-black sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.16em]">
          {PROOF_POINTS.map((point) => <span key={point}>{point}</span>)}
        </div>
      </section>

      <section id="experiencia" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d8ff3e]">Experiencia Xtreme</p>
              <h2 className="mt-3 text-4xl font-black uppercase leading-none sm:text-6xl">
                Todo lo que ocupa para ponerse serio.
              </h2>
            </div>
            <p className="text-base font-semibold leading-8 text-white/58">
              La estetica es global, pero la experiencia es de aqui: saludo en recepcion,
              clases con energia, coaches atentos y una app que convierte la constancia en algo visible.
              Nada de prometer milagros, aqui se viene a sumar dias.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {TRAINING_ZONES.map((item) => (
              <article key={item.title} className="group border border-white/10 bg-white/[0.04] p-6 transition hover:border-[#d8ff3e]/45 hover:bg-white/[0.07]">
                <item.icon className="h-8 w-8 text-[#d8ff3e]" />
                <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-white/40">{item.tag}</p>
                <h3 className="mt-2 text-2xl font-black uppercase">{item.title}</h3>
                <p className="mt-4 text-sm font-semibold leading-6 text-white/58">{item.text}</p>
                <ChevronRight className="mt-6 h-5 w-5 text-white/25 transition group-hover:translate-x-1 group-hover:text-[#d8ff3e]" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="app" className="border-y border-white/10 bg-[#101010] px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Diferenciador real</p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none sm:text-6xl">
              Una app para que el socio vuelva manana.
            </h2>
            <p className="mt-5 text-base font-semibold leading-8 text-white/60">
              Xtreme Gym no se queda en un landing bonito. La app separada permite reservar,
              validar PIN, ver membresia, medir progreso, activar recordatorios y cuidar la racha.
              Moderno, elegante y util para recepcion.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/sitios-web/propuestas/extreme-gym/app"
                className="inline-flex items-center gap-2 bg-white px-5 py-3 font-black uppercase text-black transition hover:bg-[#d8ff3e]"
              >
                Abrir app
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={waLink("Hola Xtreme Gym, quiero activar la app de socios.")}
                className="inline-flex items-center gap-2 border border-white/15 px-5 py-3 font-black uppercase text-white transition hover:border-white/35"
              >
                Consultar demo
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {APP_STACK.map(([Icon, title, text]) => (
              <div key={title as string} className="border border-white/10 bg-black/28 p-5">
                <Icon className="h-7 w-7 text-[#d8ff3e]" />
                <h3 className="mt-5 font-black uppercase">{title as string}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/52">{text as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="planes" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d8ff3e]">Membresias</p>
              <h2 className="mt-3 text-4xl font-black uppercase leading-none sm:text-6xl">
                Planes claros. Entreno serio.
              </h2>
            </div>
            <p className="max-w-xl text-sm font-semibold leading-7 text-white/55">
              Precios y promociones se confirman por WhatsApp para mantener la informacion correcta.
              Nada de inventar numeros, mae.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`border p-7 ${
                  plan.highlighted
                    ? "border-[#d8ff3e]/55 bg-[#d8ff3e]/10"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/42">{plan.eyebrow}</p>
                <h3 className="mt-3 text-3xl font-black uppercase">{plan.name}</h3>
                <p className="mt-4 text-4xl font-black">{plan.price}</p>
                <p className="mt-4 min-h-16 text-sm font-semibold leading-6 text-white/55">{plan.text}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm font-bold text-white/70">
                      <CheckCircle2 className="h-5 w-5 text-[#d8ff3e]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={waLink(`Hola Xtreme Gym, quiero informacion del plan ${plan.name}.`)}
                  className={`mt-7 inline-flex w-full items-center justify-center gap-2 px-5 py-3 font-black uppercase transition ${
                    plan.highlighted ? "bg-[#d8ff3e] text-black hover:bg-white" : "bg-white text-black hover:bg-[#d8ff3e]"
                  }`}
                >
                  Consultar por WhatsApp
                  <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white px-5 py-16 text-black sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            [BadgeCheck, "Premium sin complicarse", "Diseno moderno, experiencia directa y lenguaje cercano."],
            [ShieldCheck, "Datos protegidos", "PIN por socio y perfil guardado en Mongo."],
            [Sparkles, "Aterrizado a CR", "Frases ticas, CTA completo y cero promesas raras."],
          ].map(([Icon, title, text]) => (
            <div key={title as string} className="border border-black/10 p-6">
              <Icon className="h-8 w-8" />
              <h3 className="mt-5 text-2xl font-black uppercase">{title as string}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-black/58">{text as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contacto" className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.92fr_1.08fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d8ff3e]">Contacto</p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none sm:text-6xl">
              Listo para entrenar en San Carlos.
            </h2>
            <p className="mt-5 text-base font-semibold leading-8 text-white/60">
              {BUSINESS.location}. Escriba por WhatsApp para confirmar membresias,
              horarios especiales o una clase de prueba. Llegue con ganas; del resto nos encargamos.
            </p>
            <div className="mt-7 grid gap-3">
              {SCHEDULE.map((item) => (
                <div key={item.day} className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-white/[0.04] p-4">
                  <span className="flex items-center gap-3 font-black uppercase">
                    <Clock className="h-5 w-5 text-[#d8ff3e]" />
                    {item.day}
                  </span>
                  <span className="text-sm font-bold text-white/58">{item.hours}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.04] p-6">
            <div className="grid min-h-[380px] place-items-center bg-black/32 p-6 text-center">
              <div>
                <MapPin className="mx-auto h-12 w-12 text-[#d8ff3e]" />
                <p className="mt-5 text-3xl font-black uppercase">Xtreme Gym</p>
                <p className="mt-2 text-sm font-semibold text-white/52">{BUSINESS.location}</p>
                <p className="mt-1 text-sm font-semibold text-white/42">{BUSINESS.phone} - {BUSINESS.email}</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <a
                    href={waLink("Hola Xtreme Gym, quiero informacion para entrenar.")}
                    className="inline-flex items-center gap-2 bg-[#d8ff3e] px-5 py-3 font-black uppercase text-black transition hover:bg-white"
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a
                    href={BUSINESS.maps}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-white/15 px-5 py-3 font-black uppercase text-white transition hover:border-white/35"
                  >
                    Como llegar
                    <MapPin className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-bold text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>Xtreme Gym - Ciudad Quesada</span>
          <span className="inline-flex items-center gap-2">
            <Star className="h-4 w-4 text-[#d8ff3e]" />
            Landing premium + app independiente de socios
          </span>
        </div>
      </footer>
    </main>
  );
}

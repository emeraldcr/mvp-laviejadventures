"use client";

import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { useLanguage } from "@/app/context/LanguageContext";
import { Users, GraduationCap, Store, Heart, MapPin, Handshake } from "lucide-react";

const content = {
  es: {
    title: "Programas de Comunidad",
    subtitle: "Guías locales, apoyo a escuelas, emprendimientos y alianzas comunitarias en San Carlos, Costa Rica.",
    badgeLabel: "Impacto Social",
    introTitle: "Compromiso con San Carlos",
    introParagraph:
      "La Vieja Adventures nació como un proyecto de turismo local. Nuestra operación está diseñada para que la mayor parte del valor económico se quede en la comunidad de San Carlos, fortaleciendo la economía local y promoviendo el orgullo por el patrimonio natural de la región.",
    programs: [
      {
        icon: "users",
        title: "Guías Locales",
        description: "Priorizamos la contratación de guías nacidos o residentes en San Carlos. Todos nuestros guías son costarricenses certificados por el ICT.",
        actions: [
          "100% de guías de la región de San Carlos y alrededores",
          "Salarios justos por encima del mínimo legal",
          "Capacitación continua financiada por la empresa",
          "Participación en decisiones operativas del tour",
          "Seguro social y beneficios de ley garantizados",
        ],
      },
      {
        icon: "school",
        title: "Programa Escolar",
        description: "Colaboramos con escuelas primarias y colegios de San Carlos para llevar educación ambiental y cultura de aventura a niños y jóvenes.",
        actions: [
          "Tours educativos a precios reducidos para grupos escolares",
          "Charlas gratuitas en aulas sobre biodiversidad del Río La Vieja",
          "Talleres de escalada y rappel como herramienta pedagógica",
          "Donación de materiales educativos ambientales",
          "Participación en ferias científicas locales",
        ],
      },
      {
        icon: "store",
        title: "Emprendimientos Locales",
        description: "Promovemos y apoyamos pequeños negocios y artesanos de la zona para complementar la experiencia turística.",
        actions: [
          "Venta y exhibición de artesanías locales en nuestro local",
          "Referidos a restaurantes y hospedajes locales para nuestros clientes",
          "Alianza con productores locales para snacks y refrigerios del tour",
          "Apoyo a proyectos de mujeres emprendedoras de la comunidad",
          "Directorio digital de negocios locales en el sitio web",
        ],
      },
      {
        icon: "heart",
        title: "Proyectos Sociales",
        description: "Dedicamos parte de nuestros ingresos a proyectos sociales y ambientales en la comunidad.",
        actions: [
          "Donación del 2% de utilidades a proyectos ambientales locales",
          "Organización de jornadas de limpieza del Río La Vieja",
          "Apoyo a asociaciones de desarrollo comunal de la zona",
          "Becas de capacitación técnica para jóvenes locales",
          "Participación en el Consejo Local de Turismo de San Carlos",
        ],
      },
    ],
    alliesTitle: "Aliados Comunitarios",
    allies: [
      { name: "Municipalidad de San Carlos", role: "Gestión territorial y permisos" },
      { name: "ASADA Local", role: "Gestión del recurso hídrico" },
      { name: "Asociación de Desarrollo Comunal", role: "Proyectos de inversión social" },
      { name: "Escuelas y Colegios de la Zona", role: "Programa educativo" },
      { name: "Red de Turismo Rural Comunitario", role: "Promoción conjunta" },
      { name: "Artesanas de San Carlos", role: "Comercio justo y cultura local" },
    ],
    impactTitle: "Impacto en Números",
    impactItems: [
      { value: "100%", label: "Guías locales" },
      { value: "12+", label: "Aliados comunitarios" },
      { value: "200+", label: "Estudiantes por año en programa escolar" },
      { value: "5+", label: "Emprendimientos apoyados" },
    ],
  },
  en: {
    title: "Community Programs",
    subtitle: "Local guides, school support, entrepreneurship and community partnerships in San Carlos, Costa Rica.",
    badgeLabel: "Social Impact",
    introTitle: "Commitment to San Carlos",
    introParagraph:
      "La Vieja Adventures was born as a local tourism project. Our operation is designed so that the greatest share of economic value stays in the San Carlos community, strengthening the local economy and promoting pride in the region's natural heritage.",
    programs: [
      {
        icon: "users",
        title: "Local Guides",
        description: "We prioritize hiring guides born or living in San Carlos. All our guides are Costa Rican, certified by ICT.",
        actions: [
          "100% of guides from the San Carlos region and surroundings",
          "Fair wages above the legal minimum",
          "Ongoing training funded by the company",
          "Participation in operational tour decisions",
          "Social security and legal benefits guaranteed",
        ],
      },
      {
        icon: "school",
        title: "School Program",
        description: "We collaborate with primary schools and high schools in San Carlos to bring environmental education and adventure culture to children and youth.",
        actions: [
          "Educational tours at reduced prices for school groups",
          "Free classroom talks on Río La Vieja biodiversity",
          "Climbing and rappel workshops as a pedagogical tool",
          "Environmental educational materials donation",
          "Participation in local science fairs",
        ],
      },
      {
        icon: "store",
        title: "Local Entrepreneurship",
        description: "We promote and support small businesses and artisans from the area to complement the tourism experience.",
        actions: [
          "Local crafts sold and exhibited at our premises",
          "Referrals to local restaurants and lodges for our clients",
          "Partnership with local producers for tour snacks and refreshments",
          "Support for women entrepreneurs community projects",
          "Digital directory of local businesses on the website",
        ],
      },
      {
        icon: "heart",
        title: "Social Projects",
        description: "We dedicate a portion of our income to social and environmental projects in the community.",
        actions: [
          "2% of profits donated to local environmental projects",
          "Organization of Río La Vieja clean-up days",
          "Support for local community development associations",
          "Technical training scholarships for local youth",
          "Participation in the San Carlos Local Tourism Council",
        ],
      },
    ],
    alliesTitle: "Community Allies",
    allies: [
      { name: "San Carlos Municipality", role: "Territorial management and permits" },
      { name: "Local ASADA", role: "Water resource management" },
      { name: "Community Development Association", role: "Social investment projects" },
      { name: "Local Schools and High Schools", role: "Educational program" },
      { name: "Rural Community Tourism Network", role: "Joint promotion" },
      { name: "San Carlos Artisans", role: "Fair trade and local culture" },
    ],
    impactTitle: "Impact by the Numbers",
    impactItems: [
      { value: "100%", label: "Local guides" },
      { value: "12+", label: "Community allies" },
      { value: "200+", label: "Students per year in school program" },
      { value: "5+", label: "Supported entrepreneurships" },
    ],
  },
};

const iconMap: Record<string, React.ReactNode> = {
  users: <Users size={20} className="text-emerald-600" />,
  school: <GraduationCap size={20} className="text-emerald-600" />,
  store: <Store size={20} className="text-emerald-600" />,
  heart: <Heart size={20} className="text-emerald-600" />,
};

export default function ProgramasComunidadPage() {
  const { lang } = useLanguage();
  const tr = content[lang];

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <DynamicHeroHeader showHeroSlider={false} />

      <div className="mx-auto w-full max-w-6xl space-y-6 pt-6">
        {/* Hero */}
        <section className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 md:p-10">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/20 dark:text-emerald-300">
            <Handshake size={14} />
            {tr.badgeLabel}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            <Users className="mr-3 inline-block text-emerald-600" size={36} />
            {tr.title}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">{tr.subtitle}</p>
        </section>

        {/* Intro */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white">{tr.introTitle}</h2>
          <p className="text-zinc-700 dark:text-zinc-300">{tr.introParagraph}</p>
        </section>

        {/* Programs */}
        <div className="grid gap-6 md:grid-cols-2">
          {tr.programs.map((prog, idx) => (
            <section key={idx} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                {iconMap[prog.icon]}
                {prog.title}
              </h2>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{prog.description}</p>
              <ul className="space-y-1.5">
                {prog.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                    {action}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Allies */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
            <MapPin size={20} className="text-emerald-600" />
            {tr.alliesTitle}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tr.allies.map((ally, i) => (
              <div key={i} className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-800/30 dark:bg-emerald-900/10">
                <p className="font-semibold text-zinc-900 dark:text-white">{ally.name}</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">{ally.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Impact */}
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm dark:border-emerald-800/30 dark:bg-emerald-900/20">
          <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-white">{tr.impactTitle}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {tr.impactItems.map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{item.value}</p>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Cloud,
  Code2,
  Database,
  GraduationCap,
  Github,
  Globe2,
  Languages as LanguagesIcon,
  Layers,
  Mail,
  MapPin,
  Phone,
  Printer,
  Server,
  Wrench,
} from "lucide-react";

const skills = [
  { label: "Languages", icon: Code2, items: "TypeScript, JavaScript, Java, PHP, Python, SQL" },
  { label: "Backend & APIs", icon: Server, items: "Spring Boot, Laravel, Eloquent ORM, Node.js, Express, REST, GraphQL" },
  { label: "Cloud & DevOps", icon: Cloud, items: "AWS (Lambda, ECS/EKS, EC2, S3, RDS), Docker, Kubernetes, Terraform" },
  { label: "Frontend", icon: Layers, items: "React, Next.js, Blade, Redux Toolkit, Tailwind CSS" },
  { label: "Data", icon: Database, items: "PostgreSQL, MySQL, Redis" },
  { label: "Testing & CI/CD", icon: Wrench, items: "Pest, Jest, Cypress, GitHub Actions, Jenkins" },
] as const;

const experience = [
  {
    role: "Senior Full-Stack Engineer",
    company: "La Vieja Adventures",
    period: "Apr 2026 – Present",
    location: "Remote, Costa Rica",
    bullets: [
      "Architect and deliver a cloud-native tourism platform using Spring Boot, React, Next.js, TypeScript, and GraphQL.",
      "Own booking, reservation, authentication, and payment systems end-to-end, from MySQL data models through AWS deployment and monitoring.",
      "Build AI-assisted tools for reservations, customer communication, and internal reporting.",
    ],
  },
  {
    role: "Cloud Software Engineer",
    company: "EXQ2 · client MCM (Midland Credit Management)",
    period: "Oct 2025 – Apr 2026",
    location: "Costa Rica",
    bullets: [
      "Delivered and maintained a cloud-based payment control and management system for client MCM.",
      "Operated as part of an embedded consulting engineering team under EXQ2.",
    ],
  },
  {
    role: "Senior Software Engineer",
    company: "Wind River",
    period: "Sept 2024 – Oct 2025",
    location: "Remote, Costa Rica",
    bullets: [
      "Designed and maintained Spring Boot microservices and event-driven backend services on AWS (Lambda, Kubernetes).",
      "Built React and Redux Toolkit dashboards with real-time visualization for operational insights.",
      "Strengthened release consistency with GitHub Actions/Jenkins pipelines and production visibility with Prometheus/Grafana.",
    ],
  },
  {
    role: "Full-Stack Engineer",
    company: "Costa Rica Software Services (CRSS)",
    period: "Sept 2022 – Jun 2024",
    location: "Costa Rica",
    bullets: [
      "Built and maintained Laravel 8–13 apps (Eloquent ORM, Laravel Authentication, Query Builder, Blade, MySQL) with React front ends — including Kaptyn, a luxury ride-hailing platform.",
      "Designed RESTful APIs and system integrations for GPS tracking, payments, and real-time mobility.",
      "Optimized API and data-layer performance through SQL tuning and caching; validated with Pest, Jest, and Cypress.",
    ],
  },
  {
    role: "Software Engineer",
    company: "Intel (via Infosys / Amtek)",
    period: "Feb 2021 – May 2022",
    location: "Costa Rica",
    bullets: [
      "Delivered backend integration for a chemical management system using Node.js.",
      "Engaged via Infosys as client-facing partner, contracted through Amtek.",
    ],
  },
  {
    role: "Software Development Engineer I",
    company: "MicroVention - Terumo",
    period: "2016 – Feb 2020",
    location: "Costa Rica",
    bullets: [
      "Built Java and Python systems for FDA-regulated medical-device manufacturing operations, backed by SQL databases.",
      "Automated production reporting and equipment-monitoring dashboards with JavaScript and Chart.js under FDA/ISO 13485 quality controls.",
    ],
  },
  {
    role: "Technician II",
    company: "ImagineerCX",
    period: "2015 – 2016",
    location: "Costa Rica",
    bullets: [
      "Developed customer-facing web applications with PHP, JavaScript, and MySQL.",
      "Improved frontend rendering and backend performance across Agile delivery cycles.",
    ],
  },
];

export default function CvPage() {
  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-10 dark:bg-zinc-950 print:bg-white print:p-0">
      <style>{`@media print { @page { size: letter; margin: 0.4in; } }`}</style>

      <div className="mx-auto flex w-full max-w-4xl items-center justify-between print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-teal-600 dark:text-zinc-400 dark:hover:text-teal-400"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:border-teal-600 hover:bg-teal-600 hover:text-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <Printer size={16} />
          Print / Save PDF
        </button>
      </div>

      <article className="mx-auto mt-4 grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl md:grid-cols-[250px_1fr] dark:border-zinc-800 print:mt-0 print:w-full print:max-w-none print:grid-cols-[2.5in_1fr] print:rounded-none print:border-0 print:shadow-none">
        <aside className="cv-sidebar bg-teal-900 px-6 py-8 text-white print:[-webkit-print-color-adjust:exact] print:[color-adjust:exact] print:[print-color-adjust:exact]">
          <h1 className="text-2xl font-bold leading-tight tracking-tight">Allan Jose Rojas Duran</h1>
          <p className="mt-1 text-sm font-semibold text-teal-300">Senior Software Engineer</p>

          <div className="mt-6 space-y-2 text-[11px] leading-snug text-teal-50">
            <p className="flex items-start gap-1.5">
              <MapPin size={12} className="mt-0.5 shrink-0 text-teal-400" />
              Alajuela, Costa Rica (Remote)
            </p>
            <a href="tel:+50672252296" className="flex items-start gap-1.5 hover:text-white">
              <Phone size={12} className="mt-0.5 shrink-0 text-teal-400" />
              +506 7225 2296
            </a>
            <a href="mailto:allan4devs@gmail.com" className="flex items-start gap-1.5 hover:text-white">
              <Mail size={12} className="mt-0.5 shrink-0 text-teal-400" />
              allan4devs@gmail.com
            </a>
            <a
              href="https://github.com/emeraldcr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-1.5 hover:text-white"
            >
              <Github size={12} className="mt-0.5 shrink-0 text-teal-400" />
              github.com/emeraldcr
            </a>
          </div>

          <SidebarHeading icon={Wrench} title="Core Skills" />
          <div className="mt-2 space-y-2.5">
            {skills.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.label}>
                  <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-teal-300">
                    <Icon size={10} />
                    {group.label}
                  </p>
                  <p className="text-[11px] leading-snug text-teal-50">{group.items}</p>
                </div>
              );
            })}
          </div>

          <SidebarHeading icon={GraduationCap} title="Education" />
          <div className="mt-2 text-[11px] leading-snug text-teal-50">
            <p className="font-semibold text-white">B.S. Computer Engineering</p>
            <p>Instituto Tecnológico de Costa Rica (TEC), 2009–2015</p>
            <p className="mt-1.5">
              <span className="font-semibold text-white">Internship:</span> iTalent (Google Partner) — ITCR
              Práctica de Graduación / Proyecto de Graduación
            </p>
          </div>

          <SidebarHeading icon={LanguagesIcon} title="Languages" />
          <div className="mt-2 text-[11px] leading-snug text-teal-50">
            <p>Spanish — Native</p>
            <p>English — Professional Working Proficiency (C1)</p>
          </div>
        </aside>

        <div className="px-7 py-8 print:px-6 print:py-5">
          <SectionHeading icon={Globe2} title="Professional Summary" />
          <p className="mt-2 text-[12px] leading-relaxed text-zinc-700 dark:text-zinc-300 print:text-[10.5px]">
            Senior Software Engineer with 10+ years building production systems across enterprise, healthcare,
            consumer, and consultancy environments. Full-stack expertise in Java/Spring Boot, PHP/Laravel, and
            TypeScript/React on AWS, with hands-on delivery of RESTful APIs, Eloquent ORM data models,
            microservices, and CI/CD pipelines from architecture through production support.
          </p>

          <SectionHeading icon={Briefcase} title="Professional Experience" className="mt-5" />
          <div className="mt-2 space-y-4">
            {experience.map((job) => (
              <div key={`${job.role}-${job.company}`} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="text-[12.5px] font-semibold text-zinc-900 dark:text-white print:text-[11px]">
                    {job.role}{" "}
                    <span className="font-normal text-zinc-500 dark:text-zinc-400">| {job.company}</span>
                  </h3>
                  <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400 print:text-[9.5px]">
                    {job.period} · {job.location}
                  </span>
                </div>
                <ul className="mt-1 space-y-1">
                  {job.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-1.5 text-[11.5px] leading-snug text-zinc-700 dark:text-zinc-300 print:text-[10px]"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-600 dark:bg-teal-400" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}

function SidebarHeading({ icon: Icon, title }: { icon: typeof Wrench; title: string }) {
  return (
    <div className="mt-5 flex items-center gap-1.5 border-t border-teal-700/60 pt-3">
      <Icon size={12} className="text-teal-300" />
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-teal-200">{title}</h2>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  className = "",
}: {
  icon: typeof Briefcase;
  title: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Icon size={14} className="text-teal-700 dark:text-teal-400" />
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-zinc-900 dark:text-white print:text-[11.5px]">
        {title}
      </h2>
    </div>
  );
}

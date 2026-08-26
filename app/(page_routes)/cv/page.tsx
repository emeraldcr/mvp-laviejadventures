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
  Globe,
  Layers,
  Mail,
  MapPin,
  Phone,
  Printer,
  Server,
  Wrench,
} from "lucide-react";

const expertise = [
  "API design and backend service development using Java, Spring Boot, Node.js, Express, REST, GraphQL, authentication, and authorization.",
  "Cloud-native delivery on AWS using Lambda, ECS/EKS, EC2, S3, RDS, Docker, Kubernetes, and Terraform.",
  "Distributed-system integration using REST APIs, microservices, asynchronous processing, and event-driven architectures.",
  "Full-stack development with React, Next.js, TypeScript, Redux Toolkit, and operational dashboards with real-time data.",
  "Relational data modeling and performance optimization with PostgreSQL, MySQL, SQL tuning, Redis, and caching strategies.",
  "Modern software delivery with Git, GitHub Actions, Jenkins, automated testing, code review, monitoring, and production support.",
  "System design with practical evaluation of scalability, reliability, maintainability, security, and operational tradeoffs.",
];

const experience = [
  {
    role: "Senior Full-Stack Engineer",
    company: "La Vieja Adventures",
    location: "Remote | Costa Rica",
    bullets: [
      "Architected and shipped a cloud-native tourism platform with Spring Boot, React, Next.js, TypeScript, and GraphQL.",
      "Delivered booking workflows, administration consoles, reservation tools, authentication, and payment integrations end to end.",
      "Designed backend services and MySQL data models for responsive performance and operational reliability.",
      "Containerized services with Docker, ran production workloads on AWS, and owned deployment, monitoring, support, and continuous improvement.",
      "Built AI-assisted tools for reservations, customer communications, reporting, and internal operations.",
    ],
  },
  {
    role: "Senior Software Engineer",
    company: "Wind River",
    location: "Remote | Costa Rica",
    bullets: [
      "Designed and maintained Spring Boot microservices for cloud-native enterprise platforms.",
      "Delivered event-driven backend services on AWS using Lambda, Kubernetes, and scalable service patterns.",
      "Built React and Redux Toolkit dashboards with real-time visualization for operational insights.",
      "Strengthened delivery through GitHub Actions and Jenkins pipelines for consistent, repeatable releases.",
      "Improved production visibility with Prometheus and Grafana; contributed to design reviews, incident support, code quality, and mentoring.",
    ],
  },
  {
    role: "Full-Stack Engineer",
    company: "Costa Rica Software Services",
    location: "Costa Rica",
    bullets: [
      "Delivered full-stack web products with React, TypeScript, Node.js, and Express.",
      "Designed REST APIs and system integrations for GPS tracking, payments, and real-time mobility use cases.",
      "Improved API and data-layer performance through SQL tuning, caching, and request-path optimization.",
      "Increased reliability with Jest and Cypress automation and close collaboration across product, QA, and engineering.",
    ],
  },
  {
    role: "Software Engineer",
    company: "MicroVention - Terumo",
    location: "Costa Rica",
    bullets: [
      "Built Java systems for manufacturing operations in an FDA-regulated medical-device environment.",
      "Automated production reporting and delivered equipment-monitoring dashboards using JavaScript and Chart.js.",
      "Maintained enterprise software under FDA and ISO 13485 quality controls while partnering with manufacturing, quality, and business stakeholders.",
    ],
  },
  {
    role: "Software Engineer",
    company: "ImagineerCX",
    location: "Costa Rica",
    bullets: [
      "Developed and maintained customer-facing web applications with PHP, JavaScript, HTML/CSS, and MySQL.",
      "Improved frontend rendering and backend-processing performance and supported features through production deployment.",
      "Collaborated in Agile teams with design, QA, and project-management partners.",
    ],
  },
];

const skills = [
  { label: "Languages", icon: Code2, items: ["TypeScript", "JavaScript", "Java", "Python", "SQL"] },
  {
    label: "Backend & APIs",
    icon: Server,
    items: [
      "Spring Boot",
      "Node.js",
      "Express",
      "REST",
      "GraphQL",
      "Microservices",
      "Event-Driven Design",
      "AuthN/AuthZ",
    ],
  },
  {
    label: "Cloud & Platform",
    icon: Cloud,
    items: ["AWS Lambda", "ECS/EKS", "EC2", "S3", "RDS", "Docker", "Kubernetes", "Terraform", "Linux"],
  },
  {
    label: "Frontend",
    icon: Layers,
    items: ["React", "Next.js", "Redux Toolkit", "Tailwind CSS", "Material UI", "HTML5", "CSS3"],
  },
  {
    label: "Data",
    icon: Database,
    items: ["PostgreSQL", "MySQL", "Redis", "Schema Design", "Query Optimization", "Caching"],
  },
  {
    label: "Delivery & Operations",
    icon: Wrench,
    items: ["Git", "GitHub Actions", "Jenkins", "CI/CD", "Prometheus", "Grafana", "Jest", "Cypress"],
  },
];

export default function CvPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 via-zinc-50 to-white px-4 py-10 dark:from-black dark:via-zinc-950 dark:to-zinc-900 print:bg-white print:py-0">
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

      <article className="mx-auto mt-4 w-full max-w-4xl overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 print:mt-0 print:rounded-none print:border-0 print:shadow-none">
        <header className="border-b border-teal-100 bg-gradient-to-br from-teal-50 to-white px-8 py-10 dark:border-zinc-800 dark:from-teal-950/30 dark:to-zinc-950 print:bg-white print:py-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            Curriculum Vitae
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            Allan Jose Rojas Duran
          </h1>
          <p className="mt-1 text-lg font-semibold text-teal-700 dark:text-teal-400">
            Senior Software Engineer
          </p>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Cloud-Native APIs&nbsp;&nbsp;|&nbsp;&nbsp;Distributed Systems&nbsp;&nbsp;|&nbsp;&nbsp;AWS&nbsp;&nbsp;|&nbsp;&nbsp;Full-Stack Engineering
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} className="text-teal-600 dark:text-teal-400" />
              Alajuela, Costa Rica (Remote)
            </span>
            <a
              href="tel:+50672252296"
              className="inline-flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400"
            >
              <Phone size={15} className="text-teal-600 dark:text-teal-400" />
              +506 7225 2296
            </a>
            <a
              href="mailto:allan4devs@gmail.com"
              className="inline-flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400"
            >
              <Mail size={15} className="text-teal-600 dark:text-teal-400" />
              allan4devs@gmail.com
            </a>
            <a
              href="https://github.com/emeraldcr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400"
            >
              <Github size={15} className="text-teal-600 dark:text-teal-400" />
              github.com/emeraldcr
            </a>
          </div>
        </header>

        <section className="px-8 py-8">
          <SectionHeading icon={Globe} title="Professional Summary" />
          <p className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
            Senior Software Engineer with 10+ years delivering production systems across enterprise, healthcare,
            and consumer products. Designs and owns cloud-native applications, REST APIs, backend services, web
            clients, data models, and delivery infrastructure from architecture through production support.
            Strong in Java/Spring Boot and TypeScript/React stacks on AWS, with hands-on experience in
            microservices, asynchronous and event-driven patterns, SQL performance, CI/CD, Kubernetes,
            observability, and cross-functional technical leadership.
          </p>
        </section>

        <section className="border-t border-zinc-100 px-8 py-8 dark:border-zinc-900">
          <SectionHeading icon={Code2} title="Role-Aligned Expertise" />
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {expertise.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-700 dark:border-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-300 print:border-0 print:bg-transparent print:p-0"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600 dark:bg-teal-400" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-zinc-100 px-8 py-8 dark:border-zinc-900">
          <SectionHeading icon={Briefcase} title="Professional Experience" />
          <div className="mt-4 space-y-6">
            {experience.map((job) => (
              <div
                key={`${job.role}-${job.company}`}
                className="break-inside-avoid rounded-xl border border-zinc-100 p-4 dark:border-zinc-900 print:border-0 print:p-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                    {job.role} <span className="font-normal text-zinc-500 dark:text-zinc-400">| {job.company}</span>
                  </h3>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{job.location}</span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {job.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-100 px-8 py-8 dark:border-zinc-900">
          <SectionHeading icon={Wrench} title="Technical Skills" />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {skills.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.label}>
                  <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white">
                    <Icon size={14} className="text-teal-600 dark:text-teal-400" />
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 print:border-zinc-300 print:bg-transparent"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-t border-zinc-100 px-8 py-8 dark:border-zinc-900">
          <SectionHeading icon={GraduationCap} title="Education & Languages" />
          <div className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <p>
              <span className="font-semibold text-zinc-900 dark:text-white">B.S. Computer Engineering</span>{" "}
              | Instituto Tecnologico de Costa Rica (TEC)
            </p>
            <p>
              <span className="font-semibold text-zinc-900 dark:text-white">Languages:</span> Spanish - Native
              &nbsp;|&nbsp; English - Professional working proficiency (C1)
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: typeof Briefcase; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-teal-100 p-1.5 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
        <Icon size={16} />
      </div>
      <h2 className="text-lg font-semibold uppercase tracking-wide text-zinc-900 dark:text-white">{title}</h2>
    </div>
  );
}

// ───────────────────────────────────────────────
// Allan Rojas — portfolio content + constellation layout
// Framework-free on purpose: edit freely, the 3D scene and the
// document fallback both read from here.
// ───────────────────────────────────────────────

export type Section = "overview" | "experience" | "skills" | "contact";

export type Selection =
  | { type: "timeline"; id: string }
  | { type: "skill"; id: string };

export type Vec3 = [number, number, number];

export type Domain =
  | "Consumer"
  | "Healthcare"
  | "Enterprise"
  | "Consulting"
  | "Tourism";

export interface ContactLink {
  kind: "email" | "phone" | "github" | "location";
  label: string;
  value: string;
  href?: string;
}

export interface Profile {
  name: string;
  firstName: string;
  monogram: string;
  title: string;
  tagline: string;
  location: string;
  available: string;
  summary: string[];
  contact: ContactLink[];
  languages: { language: string; level: string }[];
  education: { degree: string; school: string; period: string; note: string };
}

export interface SkillCluster {
  id: string;
  label: string;
  blurb: string;
  color: string;
  items: string[];
  position: Vec3;
}

export interface TimelineNode {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  year: number;
  current?: boolean;
  domain: Domain;
  bullets: string[];
  stack: string[];
  position: Vec3;
}

export const profile: Profile = {
  name: "Allan José Rojas Durán",
  firstName: "Allan",
  monogram: "AJRD",
  title: "Senior Software Engineer",
  tagline: "I architect and ship cloud-native systems end to end",
  location: "Alajuela, Costa Rica · Remote",
  available: "Open to senior / staff full-stack & backend roles",
  summary: [
    "11+ years designing and delivering production software across enterprise, healthcare, consumer and consulting environments.",
    "Full-stack across Java / Spring Boot, PHP / Laravel and TypeScript / React — plus AWS, microservices, REST & GraphQL APIs, cloud infrastructure and CI/CD.",
    "Comfortable owning a system end to end: architecture, delivery, observability and the AI-assisted tooling around it.",
  ],
  contact: [
    { kind: "email", label: "Email", value: "allan4devs@gmail.com", href: "mailto:allan4devs@gmail.com" },
    { kind: "phone", label: "Phone", value: "+506 7225 2296", href: "tel:+50672252296" },
    { kind: "github", label: "GitHub", value: "github.com/emeraldcr", href: "https://github.com/emeraldcr" },
    { kind: "location", label: "Based in", value: "Alajuela, Costa Rica · Remote" },
  ],
  languages: [
    { language: "Spanish", level: "Native" },
    { language: "English", level: "Professional Working Proficiency · C1" },
  ],
  education: {
    degree: "Computer Engineering",
    school: "Instituto Tecnológico de Costa Rica (TEC)",
    period: "2009 – 2015",
    note: "Graduation project: iTalent (Google Partner)",
  },
};

export const stats: { value: string; label: string }[] = [
  { value: "11+", label: "Years shipping" },
  { value: "7", label: "Companies" },
  { value: "5", label: "Domains" },
  { value: "C1", label: "English" },
];

export const domainColor: Record<Domain, string> = {
  Consumer: "#a78bfa",
  Healthcare: "#2dd4bf",
  Enterprise: "#38bdf8",
  Consulting: "#fbbf24",
  Tourism: "#34d399",
};

// ── constellation layout ───────────────────────
const TAU = Math.PI * 2;

function skillPosition(i: number, total: number): Vec3 {
  const a = (i / total) * TAU + Math.PI / 6;
  const r = 5.4;
  return [Math.cos(a) * r, Math.sin(a) * 1.8 + 0.4, Math.sin(a) * r * 0.82];
}

function timelinePosition(i: number, total: number): Vec3 {
  const frac = total > 1 ? i / (total - 1) : 0.5;
  const angle = ((-158 + frac * 316) * Math.PI) / 180;
  const r = 9.6;
  const y = Math.sin(frac * Math.PI * 1.4 - 0.4) * 1.15;
  return [Math.cos(angle) * r, y, Math.sin(angle) * r];
}

const skillsRaw: Omit<SkillCluster, "position">[] = [
  {
    id: "languages",
    label: "Languages",
    color: "#34d399",
    blurb: "The core toolbox, sharpened over a decade.",
    items: ["TypeScript", "Java", "JavaScript", "Python", "PHP", "SQL"],
  },
  {
    id: "backend",
    label: "Backend & APIs",
    color: "#2dd4bf",
    blurb: "Services and contracts built to last.",
    items: ["Spring Boot", "Node.js", "Laravel", "Microservices", "REST", "GraphQL", "Eloquent ORM"],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    color: "#38bdf8",
    blurb: "Ship it, watch it, keep it up.",
    items: [
      "AWS",
      "Lambda",
      "ECS / EKS",
      "EC2",
      "S3",
      "RDS",
      "Docker",
      "Kubernetes",
      "Terraform",
      "Prometheus",
      "Grafana",
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    color: "#a78bfa",
    blurb: "Interfaces that make the backend make sense.",
    items: ["React", "Next.js", "Redux Toolkit", "Blade", "Tailwind CSS"],
  },
  {
    id: "data",
    label: "Data & Search",
    color: "#fbbf24",
    blurb: "Storage, retrieval and everything between.",
    items: ["PostgreSQL", "MySQL", "Redis", "MongoDB", "Elasticsearch", "Query DSL"],
  },
  {
    id: "quality",
    label: "Quality & CI/CD",
    color: "#fb7185",
    blurb: "Confidence on every merge.",
    items: ["Jest", "Pest", "Dusk", "Playwright", "Cypress", "GitHub Actions", "Jenkins"],
  },
];

export const skills: SkillCluster[] = skillsRaw.map((s, i) => ({
  ...s,
  position: skillPosition(i, skillsRaw.length),
}));

// oldest → newest, so ← / → and the ring both read as a trajectory
const timelineRaw: Omit<TimelineNode, "position">[] = [
  {
    id: "imagineercx",
    year: 2015,
    role: "Technician II",
    company: "ImagineerCX",
    period: "2015 – 2016",
    location: "Costa Rica",
    domain: "Consumer",
    bullets: [
      "Developed customer-facing web applications using PHP, JavaScript and MySQL.",
      "Improved frontend rendering and backend performance across Agile development cycles.",
    ],
    stack: ["PHP", "JavaScript", "MySQL", "Agile"],
  },
  {
    id: "microvention",
    year: 2016,
    role: "Software Development Engineer I",
    company: "MicroVention · Terumo",
    period: "2016 – Feb 2020",
    location: "Costa Rica",
    domain: "Healthcare",
    bullets: [
      "Built Java and Python systems supporting FDA-regulated medical-device manufacturing operations and SQL-backed production workflows.",
      "Automated production reporting and equipment-monitoring dashboards using JavaScript and Chart.js within FDA and ISO 13485 quality environments.",
    ],
    stack: ["Java", "Python", "SQL", "JavaScript", "Chart.js", "FDA / ISO 13485"],
  },
  {
    id: "intel",
    year: 2021,
    role: "Software Engineer",
    company: "Intel · via Infosys / Amstek",
    period: "Feb 2021 – May 2022",
    location: "Costa Rica",
    domain: "Enterprise",
    bullets: [
      "Delivered backend integrations for a chemical management system using Node.js.",
      "Worked in a client-facing engineering capacity through Infosys, contracted via Amtek.",
    ],
    stack: ["Node.js", "REST", "Integrations"],
  },
  {
    id: "crss",
    year: 2022,
    role: "Full-Stack Engineer",
    company: "Costa Rica Software Services (CRSS)",
    period: "Sept 2022 – Jun 2024",
    location: "Costa Rica",
    domain: "Consumer",
    bullets: [
      "Built and maintained Laravel applications with React frontends, including Kaptyn, a luxury ride-hailing platform.",
      "Designed RESTful APIs and integrations for GPS tracking, payments and real-time mobility.",
      "Optimized API and database performance through SQL tuning and caching, validated with automated testing.",
    ],
    stack: ["Laravel", "React", "REST", "SQL tuning", "Caching", "Playwright"],
  },
  {
    id: "windriver",
    year: 2024,
    role: "Senior Software Engineer",
    company: "Wind River",
    period: "Sept 2024 – Oct 2025",
    location: "Remote · Costa Rica",
    domain: "Enterprise",
    bullets: [
      "Designed and maintained Spring Boot microservices and event-driven backend services across AWS and Kubernetes environments.",
      "Built React and Redux Toolkit dashboards with real-time visualization for operational monitoring and decision support.",
      "Improved deployment consistency through GitHub Actions and Jenkins while strengthening production observability with Prometheus and Grafana.",
    ],
    stack: [
      "Spring Boot",
      "Microservices",
      "AWS",
      "Kubernetes",
      "React",
      "Redux Toolkit",
      "GitHub Actions",
      "Jenkins",
      "Prometheus",
      "Grafana",
    ],
  },
  {
    id: "exq2",
    year: 2025,
    role: "Cloud Software Engineer",
    company: "EXQ2 · Client: Midland Credit Management",
    period: "Oct 2025 – Apr 2026",
    location: "Costa Rica",
    domain: "Consulting",
    bullets: [
      "Delivered and maintained a cloud-based payment control and management platform supporting client MCM operations.",
      "Worked as part of an embedded consulting engineering team, contributing to production software delivery and cloud-based systems.",
    ],
    stack: ["Cloud", "Payments", "REST", "Elasticsearch", "Datadog", "Consulting"],
  },
  {
    id: "laviej",
    year: 2026,
    role: "Senior Full-Stack Engineer",
    company: "La Vieja Adventures",
    period: "Apr 2026 – Present",
    location: "Remote · Costa Rica",
    current: true,
    domain: "Tourism",
    bullets: [
      "Architect and deliver a cloud-native tourism platform spanning booking, reservations, authentication, payments and operational workflows.",
      "Build end-to-end services with Spring Boot, React, Next.js, TypeScript, GraphQL and MySQL, deployed and monitored on AWS.",
      "Develop AI-assisted tools for reservations, customer communication, internal reporting and business operations.",
    ],
    stack: ["Spring Boot", "React", "Next.js", "TypeScript", "GraphQL", "MySQL", "AWS", "AI tooling"],
  },
];

export const timeline: TimelineNode[] = timelineRaw.map((t, i) => ({
  ...t,
  position: timelinePosition(i, timelineRaw.length),
}));

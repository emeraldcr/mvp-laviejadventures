import { Github, Mail, MapPin, Phone } from "lucide-react";

export const personalInfo = {
  name: "Allan José Rojas Durán",
  title: "Senior Software Engineer",
};

export const contactInfo = [
  {
    icon: MapPin,
    text: "Alajuela, Costa Rica · Remote",
  },
  {
    icon: Phone,
    text: "+506 7225 2296",
    href: "tel:+50672252296",
  },
  {
    icon: Mail,
    text: "allan4devs@gmail.com",
    href: "mailto:allan4devs@gmail.com",
  },
  {
    icon: Github,
    text: "github.com/emeraldcr",
    href: "https://github.com/emeraldcr",
    external: true,
  },
];

export const primarySkills = [
  {
    label: "Languages",
    items: [
      "TypeScript",
      "Java",
      "JavaScript",
      "Python",
      "PHP",
      "SQL",
    ],
  },
  {
    label: "Backend & APIs",
    items: [
      "Spring Boot",
      "Node.js",
      "Laravel",
      "REST",
      "GraphQL",
      "Eloquent ORM",
    ],
  },
  {
    label: "Cloud & DevOps",
    items: [
      "AWS",
      "Lambda",
      "ECS/EKS",
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
    label: "Frontend",
    items: [
      "React",
      "Next.js",
      "Redux Toolkit",
      "Blade",
      "Tailwind CSS",
    ],
  },
] as const;

export const secondarySkills = [
  { label: "Data", items: ["PostgreSQL", "MySQL", "Redis"] },
  {
    label: "Testing & CI/CD",
    items: ["Jest", "Pest", "Dusk", "Playwright", "Cypress", "GitHub Actions", "Jenkins"],
  },
];

export const education = {
  degree: "Computer Engineering",
  school: "Instituto Tecnológico de Costa Rica (TEC)",
  period: "2009–2015",
  internshipLabel: "Graduation Project:",
  internship: "iTalent (Google Partner)",
};

export const languages = [
  {
    language: "Spanish",
    level: "Native",
  },
  {
    language: "English",
    level: "Professional Working Proficiency · C1",
  },
];

export type SummarySegment = {
  text: string;
  bold?: boolean;
  accent?: boolean;
};

export const summary: SummarySegment[][] = [
  [
    { text: "11+ years", bold: true, accent: true },
    {
      text: " designing and delivering production software across enterprise, healthcare, consumer, and consulting environments.",
    },
  ],
  [
    {
      text: "Full-stack expertise spanning ",
    },
    { text: "Java/Spring Boot", bold: true },
    { text: ", " },
    { text: "PHP/Laravel", bold: true },
    { text: ", " },
    { text: "TypeScript/React", bold: true },
    {
      text: ", AWS, microservices, APIs, cloud infrastructure, and CI/CD.",
    },
  ],
];

export const experience: {
  role: string;
  company: string;
  period: string;
  location: string;
  current?: boolean;
  bullets: string[];
}[] = [
  {
    role: "Senior Full-Stack Engineer",
    company: "La Vieja Adventures",
    period: "Apr 2026 – Present",
    location: "Remote · Costa Rica",
    current: true,
    bullets: [
      "Architect and deliver a cloud-native tourism platform spanning booking, reservations, authentication, payments, and operational workflows.",
      "Build end-to-end services with Spring Boot, React, Next.js, TypeScript, GraphQL, and MySQL, deployed and monitored on AWS.",
      "Develop AI-assisted tools for reservations, customer communication, internal reporting, and business operations.",
    ],
  },

  {
    role: "Cloud Software Engineer",
    company: "EXQ2 · Client: Midland Credit Management (MCM)",
    period: "Oct 2025 – Apr 2026",
    location: "Costa Rica",
    bullets: [
      "Delivered and maintained a cloud-based payment control and management platform supporting client MCM operations.",
      "Worked as part of an embedded consulting engineering team, contributing to production software delivery and cloud-based systems.",
    ],
  },

  {
    role: "Senior Software Engineer",
    company: "Wind River",
    period: "Sept 2024 – Oct 2025",
    location: "Remote · Costa Rica",
    bullets: [
      "Designed and maintained Spring Boot microservices and event-driven backend services across AWS and Kubernetes environments.",
      "Built React and Redux Toolkit dashboards with real-time visualization for operational monitoring and decision support.",
      "Improved deployment consistency through GitHub Actions and Jenkins while strengthening production observability with Prometheus and Grafana.",
    ],
  },

  {
    role: "Full-Stack Engineer",
    company: "Costa Rica Software Services (CRSS)",
    period: "Sept 2022 – Jun 2024",
    location: "Costa Rica",
    bullets: [
      "Built and maintained Laravel applications with React frontends, including Kaptyn, a luxury ride-hailing platform.",
      "Designed RESTful APIs and integrations for GPS tracking, payments, and real-time mobility.",
      "Optimized API and database performance through SQL tuning and caching, validated with automated testing.",
    ],
  },

  {
    role: "Software Engineer",
    company: "Intel · via Infosys / Amstek",
    period: "Feb 2021 – May 2022",
    location: "Costa Rica",
    bullets: [
      "Delivered backend integrations for a chemical management system using Node.js.",
      "Worked in a client-facing engineering capacity through Infosys, contracted via Amtek.",
    ],
  },

  {
    role: "Software Development Engineer I",
    company: "MicroVention · Terumo",
    period: "2016 – Feb 2020",
    location: "Costa Rica",
    bullets: [
      "Built Java and Python systems supporting FDA-regulated medical-device manufacturing operations and SQL-backed production workflows.",
      "Automated production reporting and equipment-monitoring dashboards using JavaScript and Chart.js within FDA and ISO 13485 quality environments.",
    ],
  },

  {
    role: "Technician II",
    company: "ImagineerCX",
    period: "2015 – 2016",
    location: "Costa Rica",
    bullets: [
      "Developed customer-facing web applications using PHP, JavaScript, and MySQL.",
      "Improved frontend rendering and backend performance across Agile development cycles.",
    ],
  },
];
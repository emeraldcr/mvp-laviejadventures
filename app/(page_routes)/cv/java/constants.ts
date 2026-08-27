import { Github, Mail, MapPin, Phone } from "lucide-react";

export const personalInfo = {
  name: "Allan José Rojas Durán",
  title: "Senior Java Software Engineer",
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
    label: "Java & Backend",
    items: ["Java", "Spring Boot", "Microservices", "REST", "GraphQL"],
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
    label: "Databases",
    items: ["PostgreSQL", "MySQL", "Redis", "SQL"],
  },
] as const;

export const secondarySkills = [
  {
    label: "Other Languages & Frameworks",
    items: ["TypeScript", "JavaScript", "Python", "PHP", "Node.js", "Laravel", "React", "Next.js"],
  },
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
      text: " building production Java systems across enterprise, healthcare, consumer, and consulting environments.",
    },
  ],
  [
    {
      text: "Deep expertise in ",
    },
    { text: "Java and Spring Boot", bold: true },
    {
      text: " microservices on AWS, with additional full-stack delivery in ",
    },
    { text: "TypeScript/React", bold: true },
    { text: " and " },
    { text: "PHP/Laravel", bold: true },
    {
      text: ", covering RESTful APIs, cloud infrastructure, and CI/CD pipelines.",
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
      "Architect and deliver Spring Boot services powering a cloud-native tourism platform — booking, reservations, authentication, and payments.",
      "Build and deploy Java/Spring Boot backends on AWS, integrated with React/Next.js front ends and GraphQL APIs.",
      "Develop AI-assisted backend tools for reservations, customer communication, and internal reporting.",
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
      "Strengthened release consistency with GitHub Actions and Jenkins pipelines and production observability with Prometheus and Grafana.",
      "Built React and Redux Toolkit dashboards consuming those services for real-time operational monitoring.",
    ],
  },

  {
    role: "Full-Stack Engineer",
    company: "Costa Rica Software Services (CRSS)",
    period: "Sept 2022 – Jun 2024",
    location: "Costa Rica",
    bullets: [
      "Built and maintained backend applications with React front ends, including Kaptyn, a luxury ride-hailing platform.",
      "Designed RESTful APIs and integrations for GPS tracking, payments, and real-time mobility.",
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
      "Built Java systems supporting FDA-regulated medical-device manufacturing operations, backed by SQL databases.",
      "Automated production reporting and equipment-monitoring dashboards with Python and JavaScript under FDA and ISO 13485 quality controls.",
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

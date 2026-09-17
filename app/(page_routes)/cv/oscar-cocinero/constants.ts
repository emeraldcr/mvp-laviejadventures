// ─────────────────────────────────────────────────────────────
// Oscar Steve Vindas Campos — CV en español (Cocinero / Gastronomía).
//
// Persona distinta a las demás variantes (que son de Allan), por eso NO usa las
// definiciones compartidas (identity / education): define su propia identidad,
// formación y experiencia. `labels` traduce los encabezados de sección al
// español (los demás CV se quedan en inglés por defecto). Contacto: teléfono y
// correo quedan como marcador — se completan en el editor de /cv.
// ─────────────────────────────────────────────────────────────

import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import type { ContactEntry, CvData, CvLabels, SummarySegment } from "../types";

export const labels: Partial<CvLabels> = {
  coreSkills: "Habilidades",
  education: "Formación",
  languages: "Idiomas",
  summary: "Perfil",
  experience: "Experiencia Laboral",
  documentType: "Currículum",
};

export const personalInfo = {
  name: "Oscar Steve Vindas Campos",
  title: "Cocinero · Gastronomía",
};

export const contactInfo: ContactEntry[] = [
  { icon: MapPin, text: "San Carlos, Alajuela · Costa Rica" },
  { icon: Phone, text: "Teléfono — por completar" },
  { icon: Mail, text: "Correo — por completar" },
  { icon: GraduationCap, text: "Manipulación de Alimentos (certificado)" },
];

export const primarySkills = [
  {
    label: "Cocina",
    items: [
      "Preparación y cocción de alimentos",
      "Asistencia de cocina",
      "Mise en place / alistado de ingredientes",
      "Emplatado y montaje de platos",
      "Apoyo en línea durante el servicio",
    ],
  },
  {
    label: "Higiene y seguridad alimentaria",
    items: [
      "Manipulación de Alimentos (certificado)",
      "Buenas prácticas de higiene",
      "Limpieza y sanitización del área",
      "Rotación y control de producto",
    ],
  },
  {
    label: "Otras",
    items: [
      "Atención al cliente",
      "Acomodo de mercadería / góndolas",
      "Herramientas de cómputo básicas (INA · TIC)",
    ],
  },
] as const;

export const secondarySkills = [
  {
    label: "Aptitudes",
    items: [
      "Trabajo en equipo",
      "Responsabilidad y puntualidad",
      "Disposición para aprender",
      "Trabajo bajo presión",
      "Orden y limpieza",
    ],
  },
];

export const education = {
  degree: "Educación Secundaria (9.° año)",
  school: "Liceo San Carlos",
  period: "San Carlos, Costa Rica",
  internshipLabel: "INA:",
  internship: "Tecnologías de la Información y la Comunicación · Ago 2024 – Dic 2025",
} satisfies CvData["education"];

export const languages = [
  { language: "Español", level: "Nativo" },
  { language: "Inglés", level: "Básico" },
] as const;

export const summary: SummarySegment[][] = [
  [
    { text: "Cocinero", bold: true, accent: true },
    { text: " con experiencia en la " },
    { text: "preparación y cocción de alimentos", bold: true },
    { text: " en el sector hotelero, con certificado en " },
    { text: "Manipulación de Alimentos", bold: true },
    { text: " y formación técnica en el INA." },
  ],
  [
    { text: "Apoyo en " },
    { text: "mise en place", bold: true },
    { text: ", montaje de estaciones y servicio en línea, aplicando " },
    { text: "buenas prácticas de higiene", bold: true },
    { text: " y orden. Persona " },
    { text: "responsable, puntual y con disposición para aprender", bold: true },
    { text: ", cómoda trabajando en equipo y bajo presión." },
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
    role: "Cocinero",
    company: "Hotel Río Guanacaste",
    period: "Ene – Set 2026",
    location: "Guanacaste, Costa Rica",
    current: true,
    bullets: [
      "Preparación y cocción de platos en la línea de cocina del hotel, apoyando el servicio diario de alimentos.",
      "Alistado de ingredientes (mise en place), porcionado y montaje de las estaciones antes del servicio.",
      "Aplicación de buenas prácticas de manipulación de alimentos, higiene y limpieza del área de trabajo.",
    ],
  },
  {
    role: "Gondolero",
    company: "Supermercado El Parque",
    period: "Mar – Set 2024",
    location: "San Carlos, Costa Rica",
    bullets: [
      "Surtido y acomodo de mercadería en góndolas, manteniendo la exhibición ordenada y abastecida.",
      "Control de fechas de vencimiento y rotación de producto.",
      "Atención y orientación a los clientes en sala.",
    ],
  },
];

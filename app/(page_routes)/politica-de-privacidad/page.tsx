"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const privacyContent = {
  es: {
    title: "Política de Privacidad",
    sections: [
      {
        title: "1. Introducción",
        paragraphs: [
          "En La Vieja Adventures respetamos su privacidad y nos comprometemos a proteger la información personal que comparte con nosotros. Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos sus datos cuando utiliza nuestro sitio web y servicios de reservas de tours.",
          "Al utilizar nuestro sitio o servicios, usted acepta las prácticas descritas en esta Política de Privacidad. Si no está de acuerdo, por favor no utilice nuestros servicios.",
        ],
      },
      {
        title: "2. Información que Recopilamos",
        paragraphs: ["Podemos recopilar la siguiente información:"],
        bullets: [
          "Nombre completo, correo electrónico y número de teléfono para gestionar reservas.",
          "Información de pago procesada de forma segura por proveedores externos.",
          "Datos sobre preferencias de tours o servicios.",
          "Datos de uso del sitio, como dirección IP, navegador y comportamiento de navegación.",
        ],
      },
      {
        title: "3. Cómo Utilizamos su Información",
        paragraphs: ["Utilizamos la información recopilada para:"],
        bullets: [
          "Procesar y confirmar reservas de tours.",
          "Comunicarnos con usted sobre actualizaciones o cambios en su reserva.",
          "Mejorar nuestros servicios y experiencia en el sitio web.",
          "Cumplir con obligaciones legales o regulatorias.",
          "Enviar promociones o información relevante (solo si usted lo autoriza).",
        ],
      },
      {
        title: "4. Protección de Datos",
        paragraphs: [
          "Implementamos medidas de seguridad físicas, administrativas y técnicas para proteger su información personal contra accesos no autorizados, pérdida o alteración.",
          "La información de pago nunca es almacenada por nosotros; es procesada por plataformas externas con estándares internacionales de seguridad.",
        ],
      },
      {
        title: "5. Compartir Información",
        paragraphs: [
          "No vendemos ni alquilamos su información personal. Solo la compartimos cuando es necesario para:",
        ],
        bullets: [
          "Procesamiento de pagos con proveedores externos seguros.",
          "Cumplimiento de requisitos legales o autoridades competentes.",
          "Operación de actividades turísticas con guías autorizados cuando es estrictamente necesario.",
        ],
      },
      {
        title: "6. Derechos del Usuario",
        paragraphs: ["Usted tiene derecho a:"],
        bullets: [
          "Solicitar acceso a los datos personales que tenemos de usted.",
          "Solicitar la corrección o eliminación de su información.",
          "Retirar su consentimiento para comunicaciones promocionales.",
          "Solicitar detalles sobre cómo se procesan sus datos.",
        ],
      },
      {
        title: "7. Cookies y Tecnologías Similares",
        paragraphs: [
          "Utilizamos cookies para mejorar su experiencia en el sitio, analizar tráfico y recordar preferencias. Puede desactivar las cookies desde la configuración de su navegador, aunque algunas funciones podrían no funcionar correctamente.",
        ],
      },
      {
        title: "8. Cambios a esta Política",
        paragraphs: [
          "Podemos actualizar esta Política de Privacidad en cualquier momento. Las modificaciones serán publicadas en esta página con la fecha de actualización correspondiente.",
        ],
      },
      {
        title: "9. Contacto",
        paragraphs: ["Si tiene preguntas o desea ejercer sus derechos de privacidad, puede contactarnos a:"],
        bullets: ["info@laviejaadventures.com"],
      },
    ] as Section[],
    lastUpdated: "Última actualización: 15 de noviembre de 2025",
  },
  en: {
    title: "Privacy Policy",
    sections: [
      {
        title: "1. Introduction",
        paragraphs: [
          "At La Vieja Adventures, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, store, and protect your data when you use our website and tour booking services.",
          "By using our website or services, you accept the practices described in this Privacy Policy. If you do not agree, please do not use our services.",
        ],
      },
      {
        title: "2. Information We Collect",
        paragraphs: ["We may collect the following information:"],
        bullets: [
          "Full name, email address, and phone number to manage bookings.",
          "Payment information securely processed by third-party providers.",
          "Data about tour or service preferences.",
          "Website usage data such as IP address, browser, and navigation behavior.",
        ],
      },
      {
        title: "3. How We Use Your Information",
        paragraphs: ["We use the collected information to:"],
        bullets: [
          "Process and confirm tour bookings.",
          "Communicate with you about updates or changes to your booking.",
          "Improve our services and website experience.",
          "Comply with legal or regulatory obligations.",
          "Send promotions or relevant information (only if you authorize it).",
        ],
      },
      {
        title: "4. Data Protection",
        paragraphs: [
          "We implement physical, administrative, and technical security measures to protect your personal information against unauthorized access, loss, or alteration.",
          "Payment information is never stored by us; it is processed by external platforms with international security standards.",
        ],
      },
      {
        title: "5. Information Sharing",
        paragraphs: [
          "We do not sell or rent your personal information. We only share it when necessary for:",
        ],
        bullets: [
          "Payment processing with secure third-party providers.",
          "Compliance with legal requirements or competent authorities.",
          "Operation of tourism activities with authorized guides when strictly necessary.",
        ],
      },
      {
        title: "6. User Rights",
        paragraphs: ["You have the right to:"],
        bullets: [
          "Request access to the personal data we hold about you.",
          "Request correction or deletion of your information.",
          "Withdraw your consent for promotional communications.",
          "Request details about how your data is processed.",
        ],
      },
      {
        title: "7. Cookies and Similar Technologies",
        paragraphs: [
          "We use cookies to improve your experience on the site, analyze traffic, and remember preferences. You can disable cookies in your browser settings, although some features may not function properly.",
        ],
      },
      {
        title: "8. Changes to this Policy",
        paragraphs: [
          "We may update this Privacy Policy at any time. Any changes will be posted on this page with the corresponding update date.",
        ],
      },
      {
        title: "9. Contact",
        paragraphs: ["If you have questions or want to exercise your privacy rights, you can contact us at:"],
        bullets: ["info@laviejaadventures.com"],
      },
    ] as Section[],
    lastUpdated: "Last updated: November 15, 2025",
  },
} as const;

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const content = privacyContent[lang];

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex justify-center py-10 px-4">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-10 border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold mb-6 text-center">{content.title}</h1>

        {content.sections.map((section) => (
          <section key={section.title} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="text-zinc-700 dark:text-zinc-400 mb-4">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="text-center text-zinc-500 dark:text-zinc-500 mt-8">{content.lastUpdated}</p>
      </div>
    </main>
  );
}

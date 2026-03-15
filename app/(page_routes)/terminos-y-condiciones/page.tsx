"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const termsContent = {
  es: {
    title: "Términos y Condiciones",
    sections: [
      {
        title: "1. Introducción",
        paragraphs: [
          "Bienvenido a nuestro sitio de reservas de tours. Al acceder o utilizar nuestro sitio web y servicios, usted acepta cumplir con estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe usar nuestros servicios.",
          "Estos términos rigen su uso del sitio, las reservas de tours, pagos y cualquier interacción relacionada. Nos reservamos el derecho de modificar estos términos en cualquier momento, y las actualizaciones se publicarán en esta página.",
        ],
      },
      {
        title: "2. Reservas y Pagos",
        paragraphs: [
          "Todas las reservas están sujetas a disponibilidad. Al realizar una reserva, usted garantiza que tiene la autoridad legal para hacerlo y que la información proporcionada es precisa y completa.",
        ],
        bullets: [
          "Los pagos se procesan a través de proveedores de pago seguros. Aceptamos tarjetas de crédito/débito principales.",
          "Los precios incluyen impuestos aplicables, pero pueden excluir cargos adicionales como propinas o extras opcionales.",
          "Confirmaremos su reserva por correo electrónico una vez completado el pago.",
        ],
      },
      {
        title: "3. Responsabilidades del Usuario",
        paragraphs: ["Usted es responsable de:"],
        bullets: [
          "Proporcionar información precisa durante el proceso de reserva.",
          "Cumplir con todas las leyes y regulaciones aplicables durante el tour.",
          "Respetar las instrucciones del guía y las normas de seguridad.",
          "Notificar cualquier condición médica o requerimiento especial con antelación.",
        ],
      },
      {
        title: "4. Limitación de Responsabilidad",
        paragraphs: [
          "No nos hacemos responsables por pérdidas, daños, lesiones o inconvenientes causados por factores fuera de nuestro control, como clima, desastres naturales o acciones de terceros.",
          "Nuestra responsabilidad se limita al monto pagado por la reserva. No garantizamos la disponibilidad continua del sitio web.",
        ],
      },
      {
        title: "5. Propiedad Intelectual",
        paragraphs: [
          "Todo el contenido del sitio, incluyendo textos, imágenes y logos, es propiedad nuestra o de nuestros licenciantes. No puede reproducir, distribuir o modificar este contenido sin permiso escrito.",
        ],
      },
      {
        title: "6. Ley Aplicable",
        paragraphs: [
          "Estos términos se rigen por las leyes de Costa Rica. Cualquier disputa se resolverá en los tribunales de San José, Costa Rica.",
        ],
      },
    ] as Section[],
    lastUpdated: "Última actualización: 15 de noviembre de 2025",
  },
  en: {
    title: "Terms and Conditions",
    sections: [
      {
        title: "1. Introduction",
        paragraphs: [
          "Welcome to our tour booking website. By accessing or using our website and services, you agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, you should not use our services.",
          "These terms govern your use of the site, tour bookings, payments, and any related interactions. We reserve the right to modify these terms at any time, and updates will be posted on this page.",
        ],
      },
      {
        title: "2. Bookings and Payments",
        paragraphs: [
          "All bookings are subject to availability. By making a booking, you confirm that you have the legal authority to do so and that the information provided is accurate and complete.",
        ],
        bullets: [
          "Payments are processed through secure payment providers. We accept major credit/debit cards.",
          "Prices include applicable taxes, but may exclude additional charges such as tips or optional extras.",
          "We will confirm your booking by email once payment is completed.",
        ],
      },
      {
        title: "3. User Responsibilities",
        paragraphs: ["You are responsible for:"],
        bullets: [
          "Providing accurate information during the booking process.",
          "Complying with all applicable laws and regulations during the tour.",
          "Following guide instructions and safety rules.",
          "Informing us in advance about any medical condition or special requirement.",
        ],
      },
      {
        title: "4. Limitation of Liability",
        paragraphs: [
          "We are not responsible for losses, damages, injuries, or inconveniences caused by factors beyond our control, such as weather, natural disasters, or third-party actions.",
          "Our liability is limited to the amount paid for the booking. We do not guarantee continuous website availability.",
        ],
      },
      {
        title: "5. Intellectual Property",
        paragraphs: [
          "All website content, including text, images, and logos, is our property or that of our licensors. You may not reproduce, distribute, or modify this content without written permission.",
        ],
      },
      {
        title: "6. Governing Law",
        paragraphs: [
          "These terms are governed by the laws of Costa Rica. Any dispute will be resolved in the courts of San José, Costa Rica.",
        ],
      },
    ] as Section[],
    lastUpdated: "Last updated: November 15, 2025",
  },
} as const;

export default function TermsPage() {
  const { lang } = useLanguage();
  const content = termsContent[lang];

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

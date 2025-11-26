// pages/TermsPage.tsx (or app/terms/page.tsx if using Next.js App Router)

import React from "react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex justify-center py-10 px-4">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-10 border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold mb-6 text-center">Términos y Condiciones</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introducción</h2>
          <p className="text-zinc-700 dark:text-zinc-400 mb-4">
            Bienvenido a nuestro sitio de reservas de tours. Al acceder o utilizar nuestro sitio web y servicios, usted acepta cumplir con estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe usar nuestros servicios.
          </p>
          <p className="text-zinc-700 dark:text-zinc-400">
            Estos términos rigen su uso del sitio, las reservas de tours, pagos y cualquier interacción relacionada. Nos reservamos el derecho de modificar estos términos en cualquier momento, y las actualizaciones se publicarán en esta página.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Reservas y Pagos</h2>
          <p className="text-zinc-700 dark:text-zinc-400 mb-4">
            Todas las reservas están sujetas a disponibilidad. Al realizar una reserva, usted garantiza que tiene la autoridad legal para hacerlo y que la información proporcionada es precisa y completa.
          </p>
          <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-2">
            <li>Los pagos se procesan a través de proveedores de pago seguros. Aceptamos tarjetas de crédito/débito principales.</li>
            <li>Los precios incluyen impuestos aplicables, pero pueden excluir cargos adicionales como propinas o extras opcionales.</li>
            <li>Confirmaremos su reserva por correo electrónico una vez completado el pago.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Responsabilidades del Usuario</h2>
          <p className="text-zinc-700 dark:text-zinc-400 mb-4">
            Usted es responsable de:
          </p>
          <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-2">
            <li>Proporcionar información precisa durante el proceso de reserva.</li>
            <li>Cumplir con todas las leyes y regulaciones aplicables durante el tour.</li>
            <li>Respetar las instrucciones del guía y las normas de seguridad.</li>
            <li>Notificar cualquier condición médica o requerimiento especial con antelación.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Limitación de Responsabilidad</h2>
          <p className="text-zinc-700 dark:text-zinc-400 mb-4">
            No nos hacemos responsables por pérdidas, daños, lesiones o inconvenientes causados por factores fuera de nuestro control, como clima, desastres naturales o acciones de terceros.
          </p>
          <p className="text-zinc-700 dark:text-zinc-400">
            Nuestra responsabilidad se limita al monto pagado por la reserva. No garantizamos la disponibilidad continua del sitio web.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Propiedad Intelectual</h2>
          <p className="text-zinc-700 dark:text-zinc-400">
            Todo el contenido del sitio, incluyendo textos, imágenes y logos, es propiedad nuestra o de nuestros licenciantes. No puede reproducir, distribuir o modificar este contenido sin permiso escrito.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Ley Aplicable</h2>
          <p className="text-zinc-700 dark:text-zinc-400">
            Estos términos se rigen por las leyes de Costa Rica. Cualquier disputa se resolverá en los tribunales de San José, Costa Rica.
          </p>
        </section>

        <p className="text-center text-zinc-500 dark:text-zinc-500 mt-8">
          Última actualización: 15 de noviembre de 2025
        </p>
      </div>
    </main>
  );
}
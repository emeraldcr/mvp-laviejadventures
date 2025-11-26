// pages/PrivacyPage.tsx (o app/privacy/page.tsx)

import React from "react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex justify-center py-10 px-4">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-10 border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold mb-6 text-center">Política de Privacidad</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introducción</h2>
          <p className="text-zinc-700 dark:text-zinc-400 mb-4">
            En La Vieja Adventures respetamos su privacidad y nos comprometemos a proteger la información personal que comparte con nosotros. Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos sus datos cuando utiliza nuestro sitio web y servicios de reservas de tours.
          </p>
          <p className="text-zinc-700 dark:text-zinc-400">
            Al utilizar nuestro sitio o servicios, usted acepta las prácticas descritas en esta Política de Privacidad. Si no está de acuerdo, por favor no utilice nuestros servicios.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Información que Recopilamos</h2>
          <p className="text-zinc-700 dark:text-zinc-400 mb-4">Podemos recopilar la siguiente información:</p>
          <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-2">
            <li>Nombre completo, correo electrónico y número de teléfono para gestionar reservas.</li>
            <li>Información de pago procesada de forma segura por proveedores externos.</li>
            <li>Datos sobre preferencias de tours o servicios.</li>
            <li>Datos de uso del sitio, como dirección IP, navegador y comportamiento de navegación.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Cómo Utilizamos su Información</h2>
          <p className="text-zinc-700 dark:text-zinc-400 mb-4">
            Utilizamos la información recopilada para:
          </p>
          <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-2">
            <li>Procesar y confirmar reservas de tours.</li>
            <li>Comunicarnos con usted sobre actualizaciones o cambios en su reserva.</li>
            <li>Mejorar nuestros servicios y experiencia en el sitio web.</li>
            <li>Cumplir con obligaciones legales o regulatorias.</li>
            <li>Enviar promociones o información relevante (solo si usted lo autoriza).</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Protección de Datos</h2>
          <p className="text-zinc-700 dark:text-zinc-400 mb-4">
            Implementamos medidas de seguridad físicas, administrativas y técnicas para proteger su información personal contra accesos no autorizados, pérdida o alteración.
          </p>
          <p className="text-zinc-700 dark:text-zinc-400">
            La información de pago nunca es almacenada por nosotros; es procesada por plataformas externas con estándares internacionales de seguridad.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Compartir Información</h2>
          <p className="text-zinc-700 dark:text-zinc-400 mb-4">
            No vendemos ni alquilamos su información personal. Solo la compartimos cuando es necesario para:
          </p>
          <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-2">
            <li>Procesamiento de pagos con proveedores externos seguros.</li>
            <li>Cumplimiento de requisitos legales o autoridades competentes.</li>
            <li>Operación de actividades turísticas con guías autorizados cuando es estrictamente necesario.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Derechos del Usuario</h2>
          <p className="text-zinc-700 dark:text-zinc-400 mb-4">
            Usted tiene derecho a:
          </p>
          <ul className="list-disc ml-5 text-zinc-700 dark:text-zinc-400 space-y-2">
            <li>Solicitar acceso a los datos personales que tenemos de usted.</li>
            <li>Solicitar la corrección o eliminación de su información.</li>
            <li>Retirar su consentimiento para comunicaciones promocionales.</li>
            <li>Solicitar detalles sobre cómo se procesan sus datos.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Cookies y Tecnologías Similares</h2>
          <p className="text-zinc-700 dark:text-zinc-400">
            Utilizamos cookies para mejorar su experiencia en el sitio, analizar tráfico y recordar preferencias. Puede desactivar las cookies desde la configuración de su navegador, aunque algunas funciones podrían no funcionar correctamente.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Cambios a esta Política</h2>
          <p className="text-zinc-700 dark:text-zinc-400">
            Podemos actualizar esta Política de Privacidad en cualquier momento. Las modificaciones serán publicadas en esta página con la fecha de actualización correspondiente.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Contacto</h2>
          <p className="text-zinc-700 dark:text-zinc-400">
            Si tiene preguntas o desea ejercer sus derechos de privacidad, puede contactarnos a:<br />
            <strong>info@laviejaadventures.com</strong>
          </p>
        </section>

        <p className="text-center text-zinc-500 dark:text-zinc-500 mt-8">
          Última actualización: 15 de noviembre de 2025
        </p>
      </div>
    </main>
  );
}

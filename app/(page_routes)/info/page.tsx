import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import React from "react";

export default function InfoPage() {
  return (
    <div>
     
    
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex justify-center py-10 px-4">
      <DynamicHeroHeader></DynamicHeroHeader>
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-10 border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold mb-8 text-center">Información General - La Vieja Adventures</h1>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Sobre Nosotros</h2>
          <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed">
            La Vieja Adventures es una empresa dedicada a experiencias de naturaleza en la zona norte de Costa Rica. Operamos tours guiados en el Cañón del Río La Vieja, Ciudad Esmeralda, volcanes dormidos del Parque Nacional del Agua Juan Castro Blanco y más. Nuestro equipo está conformado por guías certificados, personal de operaciones, logística y atención al cliente.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Tours Principales</h2>
          <ul className="space-y-3 text-zinc-700 dark:text-zinc-400">
            <li>• Ciudad Esmeralda – nuestro tour estrella en el cañón del río.</li>
            <li>• Cuadra-tours por senderos privados.</li>
            <li>• Caminatas a cascadas escondidas.</li>
            <li>• Tour gastronómico con cocina local.</li>
            <li>• Experiencia "Lluvia en la Naturaleza".</li>
            <li>• Avistamiento de aves.</li>
            <li>• Tour nocturno.</li>
            <li>• Rapel en cañón.</li>
            <li>• Caminata a volcanes dormidos.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Tarifas</h2>
          <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed">
            Todos los tours tienen un rango de precios entre <strong>₡19.990</strong> (fines de semana en grupos) y <strong>₡34.990</strong> (reservas individuales entre semana). Los precios pueden variar según condiciones operativas, temporada o requerimientos especiales.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Condiciones Climáticas</h2>
          <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed">
            Todos los tours dependen de las condiciones del clima para garantizar la seguridad. En caso de lluvias fuertes, crecientes del río o inestabilidad en el terreno, podríamos mover, reprogramar o cancelar la experiencia según la política de reembolsos.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Política de Reembolsos</h2>
          <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed">
            Cada tour cuenta con su propia política de reembolso según el tipo de actividad y la logística requerida. Normalmente trabajamos con opciones de reprogramación, créditos para futuras visitas o reembolsos parciales si aplica.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contacto y Reservas</h2>
          <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed mb-4">
            Para reservas, grupos, eventos privados o preguntas especiales, contáctanos:
          </p>

          <ul className="text-zinc-700 dark:text-zinc-400 space-y-1">
            <li><strong>Teléfono:</strong> +506 8643-0807</li>
            <li><strong>Email:</strong> ciudadesmeraldacr@gmail.com</li>
            <li><strong>WhatsApp:</strong> Disponible 24/7</li>
            <li><strong>Ubicación:</strong> Zona Norte, Costa Rica</li>
          </ul>
        </section>
        {/* REDES SOCIALES */}
<div className="mt-8">
  <h3 className="text-xl font-semibold mb-3">Síguenos en Redes Sociales</h3>

  <div className="grid sm:grid-cols-2 gap-4">
<a
  href="https://wa.me/50662332535"
  target="_blank"
  rel="noopener noreferrer"
  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-lg font-semibold shadow-lg transition"
>
  Abrir WhatsApp
</a>
    {/* Facebook */}
    <a
      href="https://www.facebook.com/laviejaadventures"
      target="_blank"
      rel="noopener noreferrer"
      className="w-full text-center bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold shadow-md transition"
    >
      Facebook
    </a>

    {/* Instagram */}
    <a
      href="https://www.instagram.com/laviejaadventures"
      target="_blank"
      rel="noopener noreferrer"
      className="w-full text-center bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-semibold shadow-md transition"
    >
      Instagram
    </a>

    {/* TikTok */}
    <a
      href="https://www.tiktok.com/@la.vieja.adventur"
      target="_blank"
      rel="noopener noreferrer"
      className="w-full text-center bg-black hover:bg-zinc-800 text-white py-3 rounded-xl font-semibold shadow-md transition"
    >
      TikTok
    </a>

    {/* X */}
    <a
      href="https://x.com/adventuresvieja"
      target="_blank"
      rel="noopener noreferrer"
      className="w-full text-center bg-zinc-900 hover:bg-black text-white py-3 rounded-xl font-semibold shadow-md transition"
    >
      X (Twitter)
    </a>

    {/* YouTube */}
    <a
      href="https://www.youtube.com/@laviejaadventures"
      target="_blank"
      rel="noopener noreferrer"
      className="w-full text-center bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold shadow-md transition"
    >
      YouTube
    </a>
  </div>
</div>

      </div>
      
    </main>
    </div>
  );
}
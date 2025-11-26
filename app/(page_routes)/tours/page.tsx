import CalendarSection from "@/app/components/sections/CalendarSection";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import React from "react";

// Datos de tours alternativos (puedes conectar esto a una DB luego)
const alternativeTours = [
  {
    title: "Cuadra-Tours Aventura",
    description:
      "Recorre senderos exclusivos en cuadra, atravesando bosques, fincas y miradores naturales de la zona norte.",
    duration: "1.5 a 2 horas",
    difficulty: "Intermedio",
    price: "Desde 19.990 por persona",
  },
  {
    title: "Cascadas Secretas del Río La Vieja",
    description:
      "Caminata guiada hacia hermosas cascadas escondidas, perfectas para fotografías y para conectar con la naturaleza.",
    duration: "2 a 3 horas",
    difficulty: "Moderado",
    price: "Desde 19.990 por persona",
  },
  {
    title: "Tour Gastronómico Local",
    description:
      "Una experiencia culinaria completa probando platillos tradicionales preparados por cocineros locales.",
    duration: "1.5 horas",
    difficulty: "Fácil",
    price: "Desde 24.990 por persona",
  },
  {
    title: "Lluvia en la Naturaleza",
    description:
      "Explora el bosque bajo la magia de la lluvia con equipo especial. Una experiencia sensorial inolvidable.",
    duration: "1 hora",
    difficulty: "Fácil",
    price: "Desde 19.990 por persona",
  },
  {
    title: "Avistamiento de Aves Norteño",
    description:
      "Observa especies únicas del corredor biológico del Parque Nacional del Agua Juan Castro Blanco.",
    duration: "2 horas",
    difficulty: "Fácil",
    price: "Desde 22.990 por persona",
  },
  {
    title: "Tour Nocturno La Vieja Adventures",
    description:
      "Descubre la vida nocturna del bosque: insectos, anfibios, mamíferos y sonidos de la montaña.",
    duration: "1.5 horas",
    difficulty: "Fácil",
    price: "Desde 22.990 por persona",
  },
  {
    title: "Rapel en Cañón del Río",
    description:
      "Descenso controlado en secciones del cañón con guías certificados y equipo profesional.",
    duration: "2 horas",
    difficulty: "Intermedio a avanzado",
    price: "Desde 29.990 por persona",
  },
  {
    title: "Caminata a Volcanes Dormidos",
    description:
      "Explora cráteres antiguos y miradores únicos del Parque Nacional del Agua Juan Castro Blanco.",
    duration: "3 a 4 horas",
    difficulty: "Moderado",
    price: "Desde 34.990 por persona",
  },
];

export default function AlternativeToursCards() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex justify-center py-10 px-4">
      <DynamicHeroHeader></DynamicHeroHeader>
      
      <div className="w-full max-w-6xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-10 border border-zinc-200 dark:border-zinc-800">
        
        <h1 className="text-3xl font-bold mb-10 text-center">Tours Alternativos - Detalle Completo</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {alternativeTours.map((tour, idx) => (
            <div
              key={idx}
              className="p-6 bg-zinc-100 dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-300 dark:border-zinc-700 hover:scale-[1.01] transition-transform flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-bold mb-2">{tour.title}</h2>
                <p className="text-zinc-700 dark:text-zinc-400 mb-4">{tour.description}</p>

                <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                  <li><strong>Duración:</strong> {tour.duration}</li>
                  <li><strong>Dificultad:</strong> {tour.difficulty}</li>
                  <li><strong>Precio:</strong> {tour.price}</li>
                </ul>
              </div>

              <button className="mt-6 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold">
                Reservar
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
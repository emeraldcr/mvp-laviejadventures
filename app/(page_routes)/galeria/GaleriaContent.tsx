"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/translations";

type Props = {
  images: string[];
};

export function GaleriaContent({ images }: Props) {
  const { lang } = useLanguage();
  const tr = translations[lang].gallery;

  return (
    <>
      <h1 className="text-3xl font-bold mb-10 text-center">{tr.title}</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((src, index) => (
          <div
            key={index}
            className="w-full h-60 bg-zinc-200 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform"
          >
            <Image
              src={src}
              alt={`Tour La Vieja Adventures ${index + 1}`}
              width={800}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </section>

      <p className="text-center text-zinc-600 dark:text-zinc-400 mt-10 text-sm">
        {tr.description}
      </p>
    </>
  );
}

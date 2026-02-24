import React from "react";
import { getImages } from "@/lib/getImages";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { GaleriaContent } from "./GaleriaContent";

export default function GalleryPage() {
  const galleryImages = getImages();

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex justify-center py-10 px-4">
      <div className="w-full max-w-6xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-10 border border-zinc-200 dark:border-zinc-800">
        <DynamicHeroHeader />
        <GaleriaContent images={galleryImages} />
      </div>
    </main>
  );
}

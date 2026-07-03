import React from "react";
import { getImages } from "@/lib/helpers/getImages";
import { GaleriaContent } from "./GaleriaContent";

export default function GalleryPage() {
  const galleryImages = getImages();

  return <GaleriaContent images={galleryImages} />;
}

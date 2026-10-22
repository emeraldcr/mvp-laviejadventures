import { getImages } from "@/lib/site/media/getImages";
import { GaleriaContent } from "./GaleriaContent";

export default function GalleryPage() {
  const galleryImages = getImages();

  return <GaleriaContent images={galleryImages} />;
}

// app/carousel/page.tsx (Server Component by default)
import { getImages } from '@/lib/getImages';
import Image from 'next/image'; // For optimized images

export default function CarouselPage() {
  const carouselImages = getImages();

  return (
    <div>
      {carouselImages.map((src, index) => (
        <Image
          key={index}
          src={src}
          alt={`Image ${index + 1}`}
          width={800} // Adjust as needed
          height={600}
          priority={index < 3} // Optional: Prioritize first few
        />
      ))}
    </div>
  );
}
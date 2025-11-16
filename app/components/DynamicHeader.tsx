// components/DynamicHeroHeader.tsx

'use client'; // Required for hooks

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image'; // For optimized images

// --- 1. Scroll-Adaptive Header ---
const ScrollAdaptiveHeader: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const isScrolled = scrollY > 80;

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out 
                  ${isScrolled 
                    ? 'bg-teal-700 shadow-xl' 
                    : 'bg-transparent text-white'
                  }`}
    >
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        {/* Brand/Logo */}
        <div className="text-3xl font-black tracking-tight">
          La Vieja Adventures
        </div>

        {/* Navigation Links */}
        <nav className="space-x-8 hidden md:flex font-semibold">
          <a href="#tours" className="hover:text-teal-200 transition duration-300">Tours</a>
          <a href="#galeria" className="hover:text-teal-200 transition duration-300">Galería</a>
          <a href="#contacto" className="px-4 py-2 border border-white rounded-full hover:bg-white hover:text-teal-700 transition duration-300">
            Reserva
          </a>
        </nav>
      </div>
    </header>
  );
};

// --- 2. Hero Carousel ---
const HeroCarousel: React.FC = () => {
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch dynamic images from API
  useEffect(() => {
    fetch('/api/images')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch images');
        return res.json();
      })
      .then(data => setCarouselImages(data.images))
      .catch(err => setError(err.message));
  }, []);

  // Auto-cycle images
  useEffect(() => {
    if (carouselImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages]);

  if (error) return <div className="text-red-500">Error loading images: {error}</div>;
  if (carouselImages.length === 0) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Image Layer - Carousel with Next.js Image */}
      {carouselImages.map((src, index) => (
        <Image
          key={index}
          src={src}
          alt={`Carousel image ${index + 1}`}
          fill
          className={`object-cover transition-opacity duration-1000 ease-in-out 
                      ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          priority={index < 3} // Prioritize first few for faster load
          quality={85} // Balance quality and performance
        />
      ))}

      {/* Fading Overlay */}
      <div className="absolute inset-0 z-10">
        {/* Top fade for text contrast */}
        <div className="w-full h-1/2 absolute top-0 bg-gradient-to-b from-black/60 to-transparent"></div>
        {/* Bottom fade for smooth scroll transition */}
        <div className="w-full h-1/3 absolute bottom-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
      </div>

      {/* Text Overlay */}
      <div className="relative w-full h-full flex flex-col justify-center items-center text-center p-4 z-20 text-white">
        <h1 className="text-6xl md:text-8xl font-black mb-4 drop-shadow-lg">
          Ciudad Esmeralda
        </h1>
        <p className="text-2xl md:text-3xl font-light max-w-3xl drop-shadow-md mt-4">
          Selecciona tu fecha para **vivir la aventura**.
        </p>

        {/* Scroll Down Indicator */}
        <a 
          href="#main-content" 
          className="absolute bottom-12 animate-bounce p-3 rounded-full bg-white/20 hover:bg-white/40 focus:bg-white/40 transition"
          aria-label="Scroll down to main content"
        >
          <ChevronDown size={32} className="text-white" />
        </a>
      </div>
    </section>
  );
};

// --- 3. Wrapper Component ---
export default function DynamicHeroHeader() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <ScrollAdaptiveHeader scrollY={scrollY} />
      <HeroCarousel />
      {/* Ensure your page content starts with id="main-content" */}
    </>
  );
}
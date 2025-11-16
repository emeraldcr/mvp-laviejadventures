// components/DynamicHeroHeader.tsx

'use client'; // Required for using useState and useEffect hooks

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react'; // Icon for scroll guidance

// --- DATA ---
const carouselImages = [
  '/images/ciudadesmeralda_1.jpg', 
  '/images/ciudadesmeralda_2.jpg',
  '/images/ciudadesmeralda_3.jpg',
];

// --- 1. Scroll-Adaptive Header (The Fixed Navbar) ---
const ScrollAdaptiveHeader: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  // Navbar transitions to solid background after 80px scroll
  const isScrolled = scrollY > 80;

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out 
                  ${isScrolled 
                    ? 'bg-teal-700 shadow-xl' // Solid background when scrolled
                    : 'bg-transparent text-white' // Transparent background at the very top
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


// --- 2. Hero Carousel (The Stunning Visual Background) ---
const HeroCarousel: React.FC = () => {
    // State for auto-cycling images
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full h-screen overflow-hidden">
            {/* Image Layer - Carousel Fade Effect */}
            {carouselImages.map((src, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out`}
                    style={{ 
                        backgroundImage: `url(${src})`,
                        opacity: index === currentIndex ? 1 : 0, 
                    }}
                />
            ))}

            {/* Fading Overlay (Solid Difumination Transition) */}
            <div className="absolute inset-0 z-10">
                {/* Top fade: Darkens image for text contrast and seamless integration with transparent navbar */}
                <div className="w-full h-1/2 absolute top-0 bg-gradient-to-b from-black/60 to-transparent"></div>
                
                {/* Bottom fade: Creates the smooth 'fading when you scroll down' transition into the page content */}
                <div className="w-full h-1/3 absolute bottom-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
            </div>

            {/* Text Overlay (Your original text, centered and emphasized) */}
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
                    className="absolute bottom-12 animate-bounce p-3 rounded-full bg-white/20 hover:bg-white/40 transition"
                >
                    <ChevronDown size={32} className="text-white" />
                </a>
            </div>
        </section>
    );
};


// --- 3. Wrapper Component (What you will export and place on your page) ---
export default function DynamicHeroHeader() {
  const [scrollY, setScrollY] = useState(0);

  // Hook to track vertical scroll position for header transparency
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    // Cleanup function to remove the listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <ScrollAdaptiveHeader scrollY={scrollY} />
      <HeroCarousel />
      {/* You must ensure the rest of your page content starts with id="main-content" */}
    </>
  );
}
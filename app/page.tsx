"use client";
import React, { JSX, useMemo } from "react";
// Components
import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import ErrorBoundary from "@/lib/errorBoundary";
import { CalendarProvider } from "@/app/context/CalendarContext";
// Utilities
import { cn } from "@/lib/utils";
import { motion } from "framer-motion"; // Added motion for subtle entry animation
// --- Home Content Component (Optimized) ---
interface HomeContentProps {
  // Keeping interface clean
}
const HomeContent: React.FC<HomeContentProps> = React.memo(() => {
  // Define grid structure within useMemo for stability
  const mainSections = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      id="booking-interface"
      className={cn(
        "container mx-auto p-4 md:p-8", // Added padding for better mobile spacing
        "grid grid-cols-1 lg:grid-cols-7 gap-4", // ⭐️ CHANGED: Reduced gap from gap-8 to gap-4
        "min-h-[60vh] -mt-16 md:-mt-24 relative z-10"
      )}
    >
      {/* 1. Calendar/Details Section (Left-Hand Side) */}
      {/* On Mobile (cols-1), takes full width. On Desktop (lg:cols-5), takes 4/5 width. */}
      <section className="lg:col-span-4 w-full"> {/* ⭐️ CHANGED: col-span-3 to col-span-4, added w-full */}
        <CalendarSection />
      </section>
      
      {/* 2. Reservation Summary Section (Right-Hand Side) */}
      {/* On Mobile, stacks below. On Desktop (lg:cols-5), takes 1/5 width. */}
      <aside className="lg:col-span-3 sticky top-8 self-start"> {/* ⭐️ CHANGED: col-span-2 to col-span-1 */}
        <ReservationSection />
      </aside>
    </motion.div>
  ), []);
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black overflow-x-hidden">
      <DynamicHeroHeader />
      {mainSections}
    </main>
  );
});
HomeContent.displayName = 'HomeContent';
// --- Root Page Component (Safest Structure) ---
export default function Home(): JSX.Element {
  return (
    // The ErrorBoundary correctly wraps the context provider, protecting the whole flow.
    <ErrorBoundary fallback={
      <div className="flex justify-center items-center h-screen text-xl text-red-600 bg-black">
        ⚠️ Critical System Failure: Cannot load the booking engine.
      </div>
    }>
      <CalendarProvider>
        <HomeContent />
      </CalendarProvider>
    </ErrorBoundary>
  );
}
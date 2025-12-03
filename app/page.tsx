"use client";

import React, { JSX } from "react";

import CalendarSection from "@/app/components/sections/CalendarSection";
import ReservationSection from "@/app/components/sections/ReservationSection";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { CalendarProvider } from "@/app/context/CalendarContext";

function HomeContent(): JSX.Element {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <DynamicHeroHeader>
     
      </DynamicHeroHeader>
         <CalendarSection />
        <ReservationSection />
    </main>

  );
}

export default function Home(): JSX.Element {
  return (
    <CalendarProvider>
      <HomeContent />
    </CalendarProvider>
  );
}

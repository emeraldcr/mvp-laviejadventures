"use client";

import { Suspense } from "react";
import { useCarConfigurator } from "./auto-context";
import { GarageScene } from "./auto-garage-scene";
import { BottomStats, ConfigSidebar, GarageHeader } from "./auto-sidebar";
import { GarageLoading } from "./auto-loading"; // Create this small component

export default function CarCustomizer() {
  const configurator = useCarConfigurator({
    initialAccessories: ["leds"],
    initialWithInstall: true,
    // persistKey: "car-customizer-v1", // ← Uncomment to enable persistence
  });

  // Safe access to preset data (thanks to improved hook)
  const currentCarName = configurator.preset?.name ?? "Custom Vehicle";

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#171717] select-none">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_440px] lg:grid-rows-1">
        
        {/* ========== 3D VIEWPORT ========== */}
        <div className="relative flex min-h-[620px] flex-col overflow-hidden bg-[#10141b] text-white lg:min-h-screen">
          
          <GarageHeader currentCarName={currentCarName} />

          {/* 3D Scene with Suspense boundary */}
          <div className="absolute inset-0 z-0">
            <Suspense fallback={<GarageLoading />}>
              <GarageScene
                preset={configurator.preset}
                selected={configurator.selectedSet}
                paint={configurator.paint}
              />
            </Suspense>
          </div>

          <BottomStats
            selectedCount={configurator.selectedAccessories.length}
            total={configurator.total}
            grandTotal={configurator.grandTotal}
            hasChanges={configurator.hasChanges}
          />
        </div>

        {/* ========== CONFIGURATION SIDEBAR ========== */}
        <ConfigSidebar
          {...configurator}
          currentCarName={currentCarName}
        />
      </div>
    </main>
  );
}

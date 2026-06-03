"use client";

import { useCarConfigurator } from "./auto-context";
import { GarageScene } from "./auto-garage-scene";
import { BottomStats, ConfigSidebar, GarageHeader } from "./auto-sidebar";
import { carPresets } from "./cars";

export default function CarCustomizer() {
  const configurator = useCarConfigurator({ initialAccessories: ["leds"] });
  const currentCarName = carPresets[configurator.currentPreset].name;

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#171717]">
      <section className="grid min-h-screen grid-rows-[auto_1fr] lg:grid-cols-[minmax(0,1fr)_440px] lg:grid-rows-1">
        <div className="relative flex min-h-[620px] flex-col overflow-hidden bg-[#10141b] text-white lg:min-h-screen">
          <GarageHeader currentCarName={currentCarName} />
          <div className="absolute inset-0">
            <GarageScene params={configurator.params} selected={configurator.selectedSet} paint={configurator.paint} />
          </div>
          <BottomStats selectedCount={configurator.selectedAccessories.length} total={configurator.total} />
        </div>

        <ConfigSidebar {...configurator} />
      </section>
    </main>
  );
}

"use client";

import {
  Car,
  Check,
  CircleDollarSign,
  Gauge,
  PackagePlus,
  Paintbrush,
  Rotate3D,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { useCarConfigurator, type UseCarConfiguratorReturn } from "./auto-context";
import { accessoryLineTotal } from "./auto-math";
import { carPresets } from "./cars";
import type { CarPresetId } from "./cars";
import { accessories, currency, paints } from "./auto-types";
import type { AccessoryId, PaintId } from "./auto-types";

// =====================================================
// GARAGE HEADER
// =====================================================

export function GarageHeader({ currentCarName }: { currentCarName: string }) {
  return (
    <div className="absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-400 text-black shadow-inner">
            <Car size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">AUTO CUSTOM GARAGE</p>
            <h1 className="text-xl font-black leading-none tracking-[-0.02em] sm:text-[26px]">{currentCarName}</h1>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white/70 sm:flex">
          <Rotate3D size={15} />
          Arrastra para rotar • Scroll para zoom
        </div>
      </div>
    </div>
  );
}

// =====================================================
// BOTTOM STATS
// =====================================================

export function BottomStats({
  selectedCount,
  total,
  grandTotal,
  hasChanges,
}: {
  selectedCount: number;
  total: number;
  grandTotal?: number;
  hasChanges?: boolean;
}) {
  return (
    <div className="pointer-events-none relative z-10 mt-auto hidden gap-3 p-4 sm:grid sm:grid-cols-3 sm:p-6 lg:p-8">
      {[
        { icon: Gauge, label: "Motor 3D", value: "Procedural + Math" },
        { icon: PackagePlus, label: "Accesorios", value: selectedCount },
        {
          icon: CircleDollarSign,
          label: "Total",
          value: currency.format(grandTotal ?? total),
        },
      ].map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="rounded-2xl border border-white/10 bg-black/45 p-4 shadow-2xl backdrop-blur-2xl"
        >
          <Icon size={18} className="mb-3 text-amber-300" />
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">{label}</p>
          <p className="mt-1 text-2xl font-black tracking-tighter">{value}</p>
        </div>
      ))}
    </div>
  );
}

// =====================================================
// MODEL SELECTOR
// =====================================================

function ModelSelector({
  currentPreset,
  changePreset,
}: {
  currentPreset: CarPresetId;
  changePreset: (preset: CarPresetId) => void;
}) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center gap-2 text-zinc-700">
        <Car size={17} />
        <h3 className="text-sm font-black uppercase tracking-[0.12em]">Modelo de vehículo</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(carPresets) as CarPresetId[]).map((key) => (
          <button
            key={key}
            onClick={() => changePreset(key)}
            className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all active:scale-[0.985] ${
              currentPreset === key
                ? "border-amber-500 bg-white text-zinc-950 shadow-sm"
                : "border-zinc-200 bg-white hover:border-zinc-400 active:bg-zinc-50"
            }`}
          >
            {carPresets[key].name}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] leading-snug text-zinc-500">
        Cambiar de modelo actualiza toda la geometría 3D mediante parámetros matemáticos.
      </p>
    </section>
  );
}

// =====================================================
// PAINT SELECTOR
// =====================================================

function PaintSelector({ paint, setPaint }: { paint: PaintId; setPaint: (paint: PaintId) => void }) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center gap-2 text-zinc-700">
        <Paintbrush size={17} />
        <h3 className="text-sm font-black uppercase tracking-[0.12em]">Pintura</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(paints) as [PaintId, (typeof paints)[PaintId]][]).map(([id, item]) => (
          <button
            key={id}
            onClick={() => setPaint(id)}
            className={`flex min-h-[58px] items-center gap-3 rounded-2xl border px-3.5 text-left text-sm font-bold transition-all active:scale-[0.985] ${
              paint === id
                ? "border-zinc-950 bg-white shadow-sm"
                : "border-zinc-200 bg-white hover:border-zinc-400 active:bg-zinc-50"
            }`}
          >
            <span
              className="h-6 w-6 shrink-0 rounded-full border border-black/20"
              style={{ backgroundColor: item.color }}
            />
            <span className="leading-tight">{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// =====================================================
// ACCESSORIES SELECTOR
// =====================================================

function AccessoriesSelector({
  selectedSet,
  toggleAccessory,
}: {
  selectedSet: Set<AccessoryId>;
  toggleAccessory: (id: AccessoryId) => void;
}) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-center gap-2 text-zinc-700">
        <Sparkles size={17} />
        <h3 className="text-sm font-black uppercase tracking-[0.12em]">Inventario de accesorios</h3>
      </div>

      <div className="grid gap-2.5">
        {accessories.map((item) => {
          const active = selectedSet.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggleAccessory(item.id)}
              className={`group rounded-2xl border p-4 text-left transition-all active:scale-[0.985] ${
                active
                  ? "border-amber-500 bg-white shadow-sm"
                  : "border-zinc-200 bg-white hover:border-zinc-400 active:bg-zinc-50"
              }`}
            >
              <div className="mb-2.5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">
                    {item.category}
                  </p>
                  <h4 className="text-[15px] font-black leading-tight tracking-[-0.01em]">{item.name}</h4>
                </div>
                <div
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl border transition ${
                    active
                      ? "border-amber-500 bg-amber-400 text-black"
                      : "border-zinc-300 bg-white text-transparent group-hover:border-zinc-400"
                  }`}
                >
                  <Check size={15} strokeWidth={3.5} />
                </div>
              </div>

              <p className="mb-3 text-sm leading-snug text-zinc-600">{item.description}</p>

              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-lg bg-zinc-900 px-2.5 py-1 text-white">
                  Pieza {currency.format(item.price)}
                </span>
                <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-amber-900">
                  Instalación {currency.format(item.install)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// =====================================================
// PRICE SUMMARY (Improved)
// =====================================================

function PriceSummary({
  selectedAccessories,
  withInstall,
  setWithInstall,
  partsTotal,
  installTotal,
  total,
  grandTotal,
  basePrice,
  hasChanges,
  resetToDefault,
}: {
  selectedAccessories: UseCarConfiguratorReturn["selectedAccessories"];
  withInstall: boolean;
  setWithInstall: (value: boolean) => void;
  partsTotal: number;
  installTotal: number;
  total: number;
  grandTotal?: number;
  basePrice?: number;
  hasChanges?: boolean;
  resetToDefault?: () => void;
}) {
  const showVehiclePrice = basePrice && basePrice > 0;

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={17} />
          <h3 className="text-sm font-black uppercase tracking-[0.12em]">Resumen del pedido</h3>
        </div>

        <button
          onClick={() => setWithInstall(!withInstall)}
          className={`inline-flex h-9 items-center gap-1.5 rounded-2xl border px-3 text-xs font-bold transition active:scale-[0.985] ${
            withInstall
              ? "border-emerald-600 bg-emerald-50 text-emerald-800"
              : "border-zinc-200 bg-zinc-50 text-zinc-600"
          }`}
        >
          <Wrench size={14} /> {withInstall ? "Con instalación" : "Solo piezas"}
        </button>
      </div>

      {/* Vehicle base price */}
      {showVehiclePrice && (
        <div className="mb-3 flex justify-between border-b border-dashed border-zinc-200 pb-3 text-sm">
          <span className="font-medium text-zinc-600">Vehículo base</span>
          <span className="font-black">{currency.format(basePrice!)}</span>
        </div>
      )}

      {selectedAccessories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
          <p className="text-sm font-semibold text-zinc-500">Selecciona accesorios para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {selectedAccessories.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-xs text-zinc-500">{withInstall ? "Con instalación" : "Solo pieza"}</p>
              </div>
              <p className="font-black tabular-nums">{currency.format(accessoryLineTotal(item, withInstall))}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-sm">
        <div className="flex justify-between text-zinc-600">
          <span>Repuestos</span>
          <span className="font-medium tabular-nums">{currency.format(partsTotal)}</span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>Instalación</span>
          <span className="font-medium tabular-nums">{currency.format(installTotal)}</span>
        </div>

        {showVehiclePrice && (
          <div className="flex justify-between pt-1 text-zinc-600">
            <span>Vehículo</span>
            <span className="font-medium tabular-nums">{currency.format(basePrice!)}</span>
          </div>
        )}

        <div className="flex justify-between border-t border-zinc-200 pt-3 text-xl font-black tracking-tighter">
          <span>Total</span>
          <span>{currency.format(grandTotal ?? total)}</span>
        </div>
      </div>

      {/* Reset button */}
      {hasChanges && resetToDefault && (
        <button
          onClick={resetToDefault}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white py-2.5 text-xs font-bold text-zinc-600 transition hover:bg-zinc-50 active:bg-zinc-100"
        >
          <RotateCcw size={15} /> Restablecer configuración
        </button>
      )}

      <button
        disabled={selectedAccessories.length === 0}
        className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 text-sm font-black text-white transition active:bg-black disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        <Zap size={17} /> Generar orden + PDF
      </button>
    </section>
  );
}

// =====================================================
// CONFIG SIDEBAR (Improved)
// =====================================================

export function ConfigSidebar(props: UseCarConfiguratorReturn & { currentCarName?: string }) {
  const {
    currentPreset,
    paint,
    withInstall,
    selectedSet,
    selectedAccessories,
    partsTotal,
    installTotal,
    total,
    grandTotal,
    basePrice,
    hasChanges,
    setPaint,
    setWithInstall,
    toggleAccessory,
    changePreset,
    resetToDefault,
  } = props;

  return (
    <aside className="border-l border-black/10 bg-[#f8f4ec] px-4 py-6 sm:px-6 lg:h-screen lg:overflow-y-auto lg:px-7">
      <div className="mb-7">
        <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-amber-700">CONFIGURADOR AVANZADO</p>
        <h2 className="text-3xl font-black tracking-[-0.025em]">Diseña tu vehículo</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Modelo procedural con matemáticas paramétricas. Cambia de auto o agrega accesorios. Fácil de extender.
        </p>
      </div>

      <ModelSelector currentPreset={currentPreset} changePreset={changePreset} />
      <PaintSelector paint={paint} setPaint={setPaint} />
      <AccessoriesSelector selectedSet={selectedSet} toggleAccessory={toggleAccessory} />

      <PriceSummary
        selectedAccessories={selectedAccessories}
        withInstall={withInstall}
        setWithInstall={setWithInstall}
        partsTotal={partsTotal}
        installTotal={installTotal}
        total={total}
        grandTotal={grandTotal}
        basePrice={basePrice}
        hasChanges={hasChanges}
        resetToDefault={resetToDefault}
      />

      <div className="mt-5 text-center text-[10px] text-zinc-500">
        Sistema 100% procedural • Matemáticas paramétricas • Fácil de extender
        {hasChanges && (
      <button 
        onClick={resetToDefault}
        className="mt-4 w-full rounded-lg border border-white/20 py-2.5 text-sm tracking-widest transition hover:bg-white/5"
      >
        RESET CONFIGURATION
      </button>
    )}
      </div>
    </aside>
  );
}

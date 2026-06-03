"use client";

import {
  Car,
  Check,
  CircleDollarSign,
  Gauge,
  PackagePlus,
  Paintbrush,
  Rotate3D,
  ShoppingCart,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { useCarConfigurator } from "./auto-context";
import { accessoryLineTotal } from "./auto-math";
import { carPresets } from "./cars";
import type { CarPresetId } from "./cars";
import {
  accessories,
  currency,
  paints,
} from "./auto-types";
import type {
  Accessory,
  AccessoryId,
  PaintId,
} from "./auto-types";

export function GarageHeader({ currentCarName }: { currentCarName: string }) {
  return (
    <div className="absolute inset-x-0 top-0 z-10 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-amber-400 text-black">
            <Car size={24} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">AUTO CUSTOM GARAGE</p>
            <h1 className="text-lg font-black leading-tight sm:text-2xl">{currentCarName}</h1>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white/80 sm:flex">
          <Rotate3D size={16} /> Arrastra para rotar - Scroll para zoom
        </div>
      </div>
    </div>
  );
}

export function BottomStats({ selectedCount, total }: { selectedCount: number; total: number }) {
  return (
    <div className="pointer-events-none relative z-10 mt-auto hidden gap-3 p-4 sm:grid sm:grid-cols-3 sm:p-6 lg:p-8">
      {[
        { icon: Gauge, label: "Motor 3D", value: "Procedural + Math" },
        { icon: PackagePlus, label: "Accesorios", value: selectedCount },
        { icon: CircleDollarSign, label: "Total", value: currency.format(total) },
      ].map(({ icon: Icon, label, value }) => (
        <div key={label} className="rounded-lg border border-white/10 bg-black/38 p-4 shadow-2xl backdrop-blur-xl">
          <Icon size={18} className="mb-3 text-amber-300" />
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">{label}</p>
          <p className="mt-1 text-2xl font-black">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ModelSelector({
  currentPreset,
  changePreset,
}: {
  currentPreset: CarPresetId;
  changePreset: (preset: CarPresetId) => void;
}) {
  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <Car size={17} />
        <h3 className="text-sm font-black uppercase tracking-[0.12em]">Modelo de vehiculo</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(carPresets) as CarPresetId[]).map((key) => (
          <button
            key={key}
            onClick={() => changePreset(key)}
            className={`rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition ${
              currentPreset === key
                ? "border-amber-500 bg-white shadow-sm"
                : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"
            }`}
          >
            {carPresets[key].name}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-zinc-500">Cambiar modelo actualiza automaticamente toda la geometria 3D via parametros matematicos.</p>
    </section>
  );
}

function PaintSelector({ paint, setPaint }: { paint: PaintId; setPaint: (paint: PaintId) => void }) {
  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <Paintbrush size={17} />
        <h3 className="text-sm font-black uppercase tracking-[0.12em]">Pintura</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(paints) as [PaintId, (typeof paints)[PaintId]][]).map(([id, item]) => (
          <button
            key={id}
            onClick={() => setPaint(id)}
            className={`flex min-h-14 items-center gap-3 rounded-lg border px-3 text-left text-sm font-bold transition ${
              paint === id ? "border-zinc-950 bg-white shadow-sm" : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"
            }`}
          >
            <span className="h-6 w-6 rounded-full border border-black/20" style={{ backgroundColor: item.color }} />
            {item.name}
          </button>
        ))}
      </div>
    </section>
  );
}

function AccessoriesSelector({
  selectedSet,
  toggleAccessory,
}: {
  selectedSet: Set<AccessoryId>;
  toggleAccessory: (id: AccessoryId) => void;
}) {
  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={17} />
        <h3 className="text-sm font-black uppercase tracking-[0.12em]">Inventario de accesorios</h3>
      </div>
      <div className="grid gap-3">
        {accessories.map((item) => {
          const active = selectedSet.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggleAccessory(item.id)}
              className={`rounded-lg border p-4 text-left transition ${active ? "border-amber-500 bg-white shadow-sm" : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"}`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">{item.category}</p>
                  <h4 className="text-base font-black">{item.name}</h4>
                </div>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border ${active ? "border-amber-500 bg-amber-400 text-black" : "border-zinc-300 bg-white text-transparent"}`}>
                  <Check size={16} />
                </span>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-zinc-600">{item.description}</p>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-md bg-zinc-900 px-2 py-1 text-white">Pieza {currency.format(item.price)}</span>
                <span className="rounded-md bg-amber-100 px-2 py-1 text-amber-900">Instalacion {currency.format(item.install)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PriceSummary({
  selectedAccessories,
  withInstall,
  setWithInstall,
  partsTotal,
  installTotal,
  total,
}: {
  selectedAccessories: Accessory[];
  withInstall: boolean;
  setWithInstall: (value: boolean) => void;
  partsTotal: number;
  installTotal: number;
  total: number;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShoppingCart size={17} />
          <h3 className="text-sm font-black uppercase tracking-[0.12em]">Resumen del pedido</h3>
        </div>
        <button
          onClick={() => setWithInstall(!withInstall)}
          className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition ${withInstall ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-zinc-200 bg-zinc-50 text-zinc-600"}`}
        >
          <Wrench size={14} /> {withInstall ? "Con instalacion" : "Solo piezas"}
        </button>
      </div>

      {selectedAccessories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5 text-center text-sm font-semibold text-zinc-500">
          Selecciona accesorios para comenzar.
        </div>
      ) : (
        <div className="space-y-3">
          {selectedAccessories.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-zinc-500">{withInstall ? "Con instalacion" : "Solo pieza"}</p>
              </div>
              <p className="font-black">{currency.format(accessoryLineTotal(item, withInstall))}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-sm">
        <div className="flex justify-between text-zinc-600"><span>Repuestos</span><span>{currency.format(partsTotal)}</span></div>
        <div className="flex justify-between text-zinc-600"><span>Instalacion</span><span>{currency.format(installTotal)}</span></div>
        <div className="flex justify-between pt-2 text-xl font-black"><span>Total</span><span>{currency.format(total)}</span></div>
      </div>

      <button
        disabled={selectedAccessories.length === 0}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        <Zap size={17} /> Generar orden + PDF
      </button>
    </section>
  );
}

export function ConfigSidebar({
  currentPreset,
  paint,
  withInstall,
  selectedSet,
  selectedAccessories,
  partsTotal,
  installTotal,
  total,
  setPaint,
  setWithInstall,
  toggleAccessory,
  changePreset,
}: ReturnType<typeof useCarConfigurator>) {
  return (
    <aside className="border-l border-black/10 bg-[#f8f4ec] px-4 py-6 sm:px-6 lg:h-screen lg:overflow-y-auto lg:px-7">
      <div className="mb-6">
        <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-amber-700">CONFIGURADOR AVANZADO</p>
        <h2 className="text-3xl font-black tracking-tight">Disena tu vehiculo</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Modelo procedural con matematicas parametricas. Cambia de auto o agrega accesorios. Facil de extender para nuevos modelos.
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
      />

      <div className="mt-4 text-center text-[10px] text-zinc-500">
        Sistema 100% procedural - Matematicas parametricas - Facil de extender para nuevos vehiculos
      </div>
    </aside>
  );
}

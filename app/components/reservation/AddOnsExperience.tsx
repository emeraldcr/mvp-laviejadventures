"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, MapPin, SlidersHorizontal, X } from "lucide-react";
import { ADDON_OPTIONS } from "@/lib/reservation/constants";
import type { AddOnOption, ReservationAddonDetails } from "@/lib/reservation/types";

type Lang = "es" | "en";

type AddOnsExperienceProps = {
  lang: Lang;
  selectedAddons: string[];
  addonDetails: ReservationAddonDetails;
  onAddonToggle?: (addonId: string) => void;
  onAddonDetailsChange?: (details: ReservationAddonDetails) => void;
  showReserveLink?: boolean;
};

const CATEGORY_LABELS: Record<AddOnOption["category"], { es: string; en: string }> = {
  food: { es: "Comida", en: "Food" },
  lodging: { es: "Hospedaje", en: "Lodging" },
  transport: { es: "Transporte", en: "Transport" },
  service: { es: "Servicio", en: "Service" },
  media: { es: "Fotos", en: "Photos" },
};

const FOOD_OPTIONS = ["Casado con pollo", "Casado con res", "Vegetariano", "Menú infantil"];
const PROTEIN_OPTIONS = ["Pollo", "Res", "Vegetariano", "Sin preferencia"];
const PICKUP_OPTIONS = [
  { id: "san-carlos", label: "San Carlos" },
  { id: "la-fortuna", label: "La Fortuna" },
  { id: "ciudad-quesada", label: "Ciudad Quesada" },
  { id: "san-jose", label: "San Jose" },
  { id: "hotel-airbnb", label: "Hotel / Airbnb" },
  { id: "hotel-la-fortuna-central", label: "Hotel - La Fortuna central" },
  { id: "hotel-arenal-area", label: "Hotel - Arenal area" },
  { id: "hotel-san-vicente", label: "Hotel - San Vicente" },
  { id: "hotel-ciudad-quesada", label: "Hotel - Ciudad Quesada" },
  { id: "hotel-san-jose-airport", label: "Hotel - SJO airport area" },
];
const DROPOFF_OPTIONS = [
  { id: "la-vieja-adventures", label: "La Vieja Adventures" },
  { id: "san-vicente", label: "San Vicente" },
  { id: "la-fortuna", label: "La Fortuna" },
  { id: "san-jose", label: "San José" },
  { id: "same-pickup", label: "Mismo pickup" },
];

export default function AddOnsExperience({
  lang,
  selectedAddons,
  addonDetails,
  onAddonToggle,
  onAddonDetailsChange,
  showReserveLink = false,
}: AddOnsExperienceProps) {
  const canSelect = Boolean(onAddonToggle);
  const [activeAddonId, setActiveAddonId] = useState<string | null>(null);
  const activeAddon = useMemo(
    () => ADDON_OPTIONS.find((addon) => addon.id === activeAddonId) ?? null,
    [activeAddonId],
  );

  const updateDetails = (patch: ReservationAddonDetails) => {
    onAddonDetailsChange?.({ ...addonDetails, ...patch });
  };

  const toggleAddon = (addon: AddOnOption) => {
    onAddonToggle?.(addon.id);
    if (addon.configurable) {
      setActiveAddonId(addon.id);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/70 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500">
            {lang === "es" ? "Extras premium" : "Premium add-ons"}
          </p>
          <h3 className="mt-1 text-xl font-black leading-tight text-zinc-900 dark:text-zinc-50">
            {lang === "es" ? "Arme el día completo" : "Build the full day"}
          </h3>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
            {lang === "es"
              ? "Comida, hospedaje, transporte y detalles extra. Seleccione lo que ocupa y deje las preferencias listas para confirmar."
              : "Food, lodging, transport, and extra details. Choose what you need and set preferences for confirmation."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!showReserveLink && (
            <Link
              href="/add-ons"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-black text-zinc-800 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {lang === "es" ? "Ver extras" : "View add-ons"}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
          {showReserveLink && (
            <Link
              href="/reservar"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-500"
            >
              {lang === "es" ? "Reservar ahora" : "Reserve now"}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ADDON_OPTIONS.map((addon) => {
          const selected = selectedAddons.includes(addon.id);
          const Icon = addon.icon;
          const name = lang === "es" ? addon.nameEs : addon.nameEn;
          const description = lang === "es" ? addon.descriptionEs : addon.descriptionEn;
          const priceNote = lang === "es" ? addon.priceNoteEs : addon.priceNoteEn;

          return (
            <article
              key={addon.id}
              className={`flex min-h-[190px] flex-col rounded-2xl border p-4 transition-all ${
                selected
                  ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10 dark:bg-emerald-950/25"
                  : "border-zinc-200 bg-zinc-50 hover:border-emerald-300 dark:border-zinc-700 dark:bg-zinc-950/35"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  selected ? "bg-emerald-500 text-white" : "bg-white text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                }`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                  {CATEGORY_LABELS[addon.category][lang]}
                </span>
              </div>

              <div className="mt-4 flex-1">
                <h4 className="text-base font-black leading-tight text-zinc-950 dark:text-zinc-50">{name}</h4>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">{priceNote}</p>
                  <p className="text-2xl font-black text-zinc-950 dark:text-zinc-50">${addon.price}</p>
                </div>
                <div className="flex gap-2">
                  {addon.configurable && (
                    <button
                      type="button"
                      onClick={() => setActiveAddonId(addon.id)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                      aria-label={lang === "es" ? `Configurar ${name}` : `Configure ${name}`}
                    >
                      <SlidersHorizontal className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                  {canSelect && (
                    <button
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      aria-pressed={selected}
                      className={`flex h-11 min-w-11 items-center justify-center rounded-xl px-3 font-black transition ${
                        selected
                          ? "bg-emerald-600 text-white hover:bg-emerald-500"
                          : "bg-zinc-950 text-white hover:bg-emerald-700 dark:bg-zinc-100 dark:text-zinc-950"
                      }`}
                    >
                      {selected ? <Check className="h-4 w-4" aria-hidden /> : "+"}
                    </button>
                  )}
                  {!canSelect && !addon.configurable && (
                    <Link
                      href="/reservar"
                      className="flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-3 text-sm font-black text-white transition hover:bg-emerald-700 dark:bg-zinc-100 dark:text-zinc-950"
                    >
                      {lang === "es" ? "Reservar" : "Book"}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {activeAddon && (
        <AddonModal
          addon={activeAddon}
          lang={lang}
          details={addonDetails}
          updateDetails={updateDetails}
          close={() => setActiveAddonId(null)}
          selected={selectedAddons.includes(activeAddon.id)}
          canSelect={canSelect}
          onSelect={() => {
            if (!selectedAddons.includes(activeAddon.id)) {
              onAddonToggle?.(activeAddon.id);
            }
            setActiveAddonId(null);
          }}
        />
      )}
    </section>
  );
}

function AddonModal({
  addon,
  lang,
  details,
  updateDetails,
  close,
  selected,
  canSelect,
  onSelect,
}: {
  addon: AddOnOption;
  lang: Lang;
  details: ReservationAddonDetails;
  updateDetails: (patch: ReservationAddonDetails) => void;
  close: () => void;
  selected: boolean;
  canSelect: boolean;
  onSelect: () => void;
}) {
  const name = lang === "es" ? addon.nameEs : addon.nameEn;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/70 p-3 backdrop-blur-sm sm:items-center">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-white p-5 shadow-2xl dark:bg-zinc-950">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500">
              {lang === "es" ? "Configurar extra" : "Configure add-on"}
            </p>
            <h3 className="mt-1 text-2xl font-black text-zinc-950 dark:text-zinc-50">{name}</h3>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
            aria-label={lang === "es" ? "Cerrar" : "Close"}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {addon.id === "alojamiento" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <OptionSelect
              label={lang === "es" ? "Tipo" : "Type"}
              value={details.lodgingType ?? "cabin"}
              onChange={(value) => updateDetails({ lodgingType: value as ReservationAddonDetails["lodgingType"] })}
              options={[
                ["hostel", lang === "es" ? "Hostal" : "Hostel"],
                ["hotel", "Hotel"],
                ["cabin", lang === "es" ? "Cabina" : "Cabin"],
              ]}
            />
            <OptionSelect
              label={lang === "es" ? "Noches" : "Nights"}
              value={String(details.lodgingNights ?? 1)}
              onChange={(value) => updateDetails({ lodgingNights: Number(value) })}
              options={[["1", "1"], ["2", "2"], ["3", "3+"]]}
            />
            <TextInput
              className="sm:col-span-2"
              label={lang === "es" ? "Preferencia de cuarto" : "Room preference"}
              value={details.lodgingRoom ?? ""}
              onChange={(value) => updateDetails({ lodgingRoom: value })}
              placeholder={lang === "es" ? "Ej: matrimonial, dos camas, vista bosque" : "Ex: queen bed, two beds, forest view"}
            />
          </div>
        )}

        {addon.id === "almuerzo" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <OptionSelect
              label={lang === "es" ? "Comida" : "Meal"}
              value={details.restaurantMeal ?? FOOD_OPTIONS[0]}
              onChange={(value) => updateDetails({ restaurantMeal: value })}
              options={FOOD_OPTIONS.map((option) => [option, option])}
            />
            <OptionSelect
              label={lang === "es" ? "Proteína" : "Protein"}
              value={details.restaurantProtein ?? PROTEIN_OPTIONS[0]}
              onChange={(value) => updateDetails({ restaurantProtein: value })}
              options={PROTEIN_OPTIONS.map((option) => [option, option])}
            />
            <TextInput
              className="sm:col-span-2"
              label={lang === "es" ? "Notas de comida" : "Food notes"}
              value={details.restaurantNotes ?? ""}
              onChange={(value) => updateDetails({ restaurantNotes: value })}
              placeholder={lang === "es" ? "Alergias, sin gluten, cumpleaños, etc." : "Allergies, gluten-free, birthday, etc."}
            />
          </div>
        )}

        {addon.id === "transporte" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <OptionSelect
              label={lang === "es" ? "Tipo de transporte" : "Transport type"}
              value={details.transportType ?? "private"}
              onChange={(value) => updateDetails({ transportType: value as ReservationAddonDetails["transportType"] })}
              options={[
                ["private", lang === "es" ? "Privado 4x4" : "Private 4x4"],
                ["shared", lang === "es" ? "Compartido" : "Shared shuttle"],
              ]}
            />
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-200">
              <MapPin className="mb-1 h-4 w-4" aria-hidden />
              {lang === "es"
                ? "La ruta final se confirma según clima, camino y horario. Seguridad primero, mae."
                : "Final route is confirmed by weather, road conditions, and schedule. Safety first."}
            </div>
            <OptionSelect
              label={lang === "es" ? "Pickup" : "Pickup"}
              value={details.pickupLocation ?? PICKUP_OPTIONS[0].id}
              onChange={(value) => updateDetails({ pickupLocation: value })}
              options={PICKUP_OPTIONS.map((option) => [option.id, option.label])}
            />
            <OptionSelect
              label={lang === "es" ? "Drop-off" : "Drop-off"}
              value={details.dropoffLocation ?? DROPOFF_OPTIONS[0].id}
              onChange={(value) => updateDetails({ dropoffLocation: value })}
              options={DROPOFF_OPTIONS.map((option) => [option.id, option.label])}
            />
            <TextInput
              className="sm:col-span-2"
              label={lang === "es" ? "Notas de transporte" : "Transport notes"}
              value={details.transportNotes ?? ""}
              onChange={(value) => updateDetails({ transportNotes: value })}
              placeholder={lang === "es" ? "Nombre del hotel, vuelo, hora ideal..." : "Hotel name, flight, ideal time..."}
            />
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={close}
            className="min-h-11 rounded-xl border border-zinc-300 px-5 py-2 font-bold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            {lang === "es" ? "Cerrar" : "Close"}
          </button>
          {canSelect ? (
            <button
              type="button"
              onClick={onSelect}
              className="min-h-11 rounded-xl bg-emerald-600 px-5 py-2 font-black text-white hover:bg-emerald-500"
            >
              {selected ? (lang === "es" ? "Guardar cambios" : "Save changes") : (lang === "es" ? "Agregar extra" : "Add add-on")}
            </button>
          ) : (
            <Link
              href="/reservar"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2 font-black text-white hover:bg-emerald-500"
            >
              {lang === "es" ? "Reservar con este extra" : "Book with this add-on"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-zinc-700 dark:text-zinc-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-3 font-semibold text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-zinc-700 dark:text-zinc-300">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-3 font-semibold text-zinc-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
    </label>
  );
}

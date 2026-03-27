"use client";

import { FormEvent, type ReactNode, useMemo, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clock3,
  Info,
  MapPin,
  Minus,
  ShieldCheck,
  Sparkles,
  Trees,
  Utensils,
  Waves,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReservaStore } from "@/components/reserva/store";
import type { PackageOption, ScheduleOption, Step } from "@/components/reserva/types";

const neon = "#22c55e";

const scheduleOptions: ScheduleOption[] = [
  { id: "8am", label: "8:00 AM", subtitle: "Más fresco" },
  { id: "9am", label: "9:00 AM", subtitle: "Balance ideal" },
  { id: "10am", label: "10:00 AM", subtitle: "Salida tardía" },
];

const packageOptions: PackageOption[] = [
  {
    id: "esencial",
    title: "Paquete Esencial",
    shortBenefit: "Ideal para recorrer lo mejor sin complicaciones.",
    fullDescription: "Recorrido guiado con enfoque en naturaleza, seguridad y puntos clave del cañón.",
    benefits: ["Guía certificado local", "Ingreso a zonas naturales", "Briefing de seguridad"],
    pricePerPerson: 79,
    availabilityBadge: "Solo fines de semana",
    availabilityHint: "Disponible sábado y domingo por logística operativa.",
  },
  {
    id: "fullDay",
    title: "Día Completo con Almuerzo",
    shortBenefit: "Más tiempo de exploración + almuerzo típico.",
    fullDescription: "Experiencia extendida con paradas fotográficas, más contexto del ecosistema y comida local.",
    benefits: ["Incluye almuerzo típico", "Ruta extendida todo el día", "Paradas fotográficas"],
    pricePerPerson: 129,
    availabilityBadge: "Solo fines de semana",
    availabilityHint: "Operado en fines de semana para garantizar la experiencia completa.",
  },
  {
    id: "privado",
    title: "Tour Privado",
    shortBenefit: "Atención exclusiva y ritmo personalizado.",
    fullDescription: "Tour premium para parejas o grupos con enfoque personalizado y flexibilidad de ritmo.",
    benefits: ["Atención exclusiva", "Ritmo personalizado", "Ideal para parejas o grupos"],
    pricePerPerson: 179,
    availabilityBadge: "Solo lunes-viernes",
    availabilityHint: "Disponible entre semana para una experiencia más privada.",
  },
];

const steps: { id: Step; label: string }[] = [
  { id: 1, label: "Horario y experiencia" },
  { id: 2, label: "Paquete del tour" },
  { id: 3, label: "Datos + pago" },
];

export default function ReservaFlow() {
  const {
    currentStep,
    selectedPackage,
    selectedSchedule,
    setSchedule,
    setPackage,
    setPeople,
    form,
    updateFormField,
    errors,
    validateField,
    validateAll,
  } = useReservaStore();

  const step2Ref = useRef<HTMLDivElement | null>(null);
  const step3Ref = useRef<HTMLDivElement | null>(null);

  const selectedScheduleLabel = scheduleOptions.find((s) => s.id === selectedSchedule)?.label;
  const selectedPackageData = packageOptions.find((p) => p.id === selectedPackage);

  const total = useMemo(() => {
    const price = selectedPackageData?.pricePerPerson ?? 0;
    return price * form.people;
  }, [selectedPackageData, form.people]);

  const handleSelectSchedule = (id: string) => {
    setSchedule(id);
    requestAnimationFrame(() => {
      step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSelectPackage = (id: PackageOption["id"]) => {
    setPackage(id);
    requestAnimationFrame(() => {
      step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const valid = validateAll();
    if (!selectedSchedule || !selectedPackage || !valid) return;
    window.alert("¡Reserva lista para confirmar y pagar!");
  };

  return (
    <Tooltip.Provider delayDuration={150}>
      <main className="min-h-screen bg-[#05070b] text-zinc-100">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 pb-28 md:p-8">
          <header className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 md:p-8">
            <div
              className="absolute inset-0 opacity-35"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(5,7,11,0.3) 0%, rgba(5,7,11,0.9) 80%), url('/wildo/Adventures in the Verdant Canyon.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="relative space-y-6">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
                  Reserva para martes, 31 de marzo de 2026
                </h1>
                <TourInfoDialog />
              </div>
              <Stepper currentStep={currentStep} />
            </div>
          </header>

          <section className="space-y-4 rounded-3xl border border-emerald-400/30 bg-zinc-950/70 p-5 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold md:text-xl">Paso 1 · Horario y experiencia</h2>
              {selectedSchedule && <Check className="h-5 w-5 text-emerald-400" />}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {scheduleOptions.map((option) => {
                const active = selectedSchedule === option.id;
                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectSchedule(option.id)}
                    className={cn(
                      "rounded-2xl border p-5 text-left transition",
                      active
                        ? "border-emerald-400 bg-emerald-400/10 shadow-[0_0_0_1px_rgba(34,197,94,0.35)]"
                        : "border-zinc-700 bg-zinc-900/80 hover:border-emerald-400/50",
                    )}
                  >
                    <p className="text-xl font-semibold">{option.label}</p>
                    <p className="mt-2 text-sm text-zinc-300">{option.subtitle}</p>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section ref={step2Ref} className="space-y-4 rounded-3xl border border-zinc-700 bg-zinc-950/70 p-5 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold md:text-xl">Paso 2 · Paquete del tour</h2>
              {selectedPackage && <Check className="h-5 w-5 text-emerald-400" />}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {packageOptions.map((pack) => {
                const active = selectedPackage === pack.id;
                return (
                  <motion.button
                    key={pack.id}
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "rounded-2xl border p-5 text-left",
                      active
                        ? "border-emerald-400 bg-emerald-400/10"
                        : "border-zinc-700 bg-zinc-900/80 hover:border-emerald-400/45",
                    )}
                    onClick={() => handleSelectPackage(pack.id)}
                  >
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <PackageIcon id={pack.id} />
                      {pack.availabilityBadge ? (
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/20 px-3 py-1 text-xs text-amber-200">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {pack.availabilityBadge}
                            </span>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="max-w-xs rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 shadow-2xl"
                              sideOffset={8}
                            >
                              {pack.availabilityHint}
                              <Tooltip.Arrow className="fill-zinc-900" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      ) : null}
                    </div>
                    <h3 className="text-xl font-semibold">{pack.title}</h3>
                    <p className="mt-2 text-sm text-zinc-300">{pack.shortBenefit}</p>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div className="mt-4 cursor-help rounded-xl border border-zinc-700 bg-zinc-900/80 p-3 text-xs text-zinc-300">
                          Ver detalle y beneficios
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-xs text-zinc-100 shadow-2xl"
                          side="bottom"
                          sideOffset={10}
                        >
                          <p>{pack.fullDescription}</p>
                          <ul className="mt-2 space-y-1 text-zinc-300">
                            {pack.benefits.map((benefit) => (
                              <li key={benefit} className="flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                          <Tooltip.Arrow className="fill-zinc-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                    <p className="mt-4 text-lg font-semibold text-emerald-300">${pack.pricePerPerson} / persona</p>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section ref={step3Ref} className="rounded-3xl border border-zinc-700 bg-zinc-950/70 p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold md:text-xl">Paso 3 · Datos del viajero, resumen y pago</h2>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Cantidad de personas</label>
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-900 p-2">
                    <button
                      type="button"
                      className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 hover:border-emerald-400"
                      onClick={() => setPeople(form.people - 1)}
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="min-w-10 text-center text-xl font-semibold">{form.people}</span>
                    <button
                      type="button"
                      className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 hover:border-emerald-400"
                      onClick={() => setPeople(form.people + 1)}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {errors.people ? <p className="mt-1 text-xs text-red-300">{errors.people}</p> : null}
                </div>
                <InputField
                  label="Nombre completo"
                  value={form.fullName}
                  error={errors.fullName}
                  onChange={(value) => updateFormField("fullName", value)}
                  onBlur={() => validateField("fullName")}
                />
                <InputField
                  label="Email"
                  value={form.email}
                  error={errors.email}
                  onChange={(value) => updateFormField("email", value)}
                  onBlur={() => validateField("email")}
                  type="email"
                />
                <InputField
                  label="Teléfono"
                  value={form.phone}
                  error={errors.phone}
                  onChange={(value) => updateFormField("phone", value)}
                  onBlur={() => validateField("phone")}
                  type="tel"
                />
                <div>
                  <label className="mb-2 block text-sm text-zinc-300">Solicitudes especiales (opcional)</label>
                  <textarea
                    value={form.specialRequests}
                    onChange={(event) => updateFormField("specialRequests", event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-400"
                    placeholder="Alergias, movilidad, celebraciones, etc."
                  />
                </div>
              </div>

              <div className="h-fit space-y-3 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-4">
                <details open className="group rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                    Resumen completo
                    <ChevronRight className="h-4 w-4 transition group-open:rotate-90" />
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-zinc-300">
                    <p>Horario: {selectedScheduleLabel ?? "Sin seleccionar"}</p>
                    <p>Paquete: {selectedPackageData?.title ?? "Sin seleccionar"}</p>
                    <p>Personas: {form.people}</p>
                    <p>Total estimado: <span className="font-semibold text-emerald-300">${total}</span></p>
                  </div>
                </details>
                <p className="text-xs text-zinc-400">Pago seguro y confirmación inmediata por correo.</p>
              </div>

              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="fixed bottom-4 left-4 right-4 z-20 rounded-2xl border border-emerald-400 bg-emerald-500 px-6 py-4 text-base font-semibold text-black shadow-[0_0_40px_rgba(34,197,94,0.25)] transition hover:bg-emerald-400 md:static md:w-full"
                >
                  Confirmar y pagar
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </Tooltip.Provider>
  );
}

function Stepper({ currentStep }: { currentStep: Step }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((step) => {
        const active = currentStep === step.id;
        const done = currentStep > step.id;
        return (
          <motion.div
            key={step.id}
            initial={false}
            animate={{ borderColor: active ? neon : "#3f3f46" }}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-4",
              active ? "bg-emerald-400/15" : "bg-zinc-900/80",
            )}
          >
            <span
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                done ? "border-emerald-300 bg-emerald-400 text-black" : "border-zinc-500",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : step.id}
            </span>
            <p className="text-sm font-medium md:text-base">{step.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

function TourInfoDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/70 bg-zinc-900/60 backdrop-blur hover:bg-zinc-800/80">
          <Info className="h-5 w-5 text-emerald-300" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-emerald-400/25 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-2xl font-semibold">Información del Tour</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-zinc-300">
                Todo lo importante en un solo lugar para reservar sin fricción.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-lg border border-zinc-700 p-2 hover:border-emerald-400">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <InfoPill icon={<Clock3 className="h-4 w-4" />} title="Duración" value="3-4 horas" />
            <InfoPill icon={<Waves className="h-4 w-4" />} title="Recorrido" value="3.5 km" />
            <InfoPill icon={<MapPin className="h-4 w-4" />} title="Ubicación" value="Ciudad Esmeralda · Río La Vieja" />
          </div>
          <div className="mt-4 rounded-2xl border border-zinc-700 bg-zinc-900/70 p-4">
            <p className="mb-2 text-sm font-semibold">Estrategia para reservar sin complicaciones</p>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" />Elige primero fecha y horario para ver disponibilidad real.</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" />Selecciona el paquete según tu estilo: esencial, full day o privado.</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-400" />Completa solo los datos clave; solicitudes especiales van al final.</li>
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PackageIcon({ id }: { id: PackageOption["id"] }) {
  if (id === "esencial") return <Trees className="h-6 w-6 text-emerald-300" />;
  if (id === "fullDay") return <Utensils className="h-6 w-6 text-cyan-300" />;
  return <Sparkles className="h-6 w-6 text-amber-300" />;
}

function InfoPill({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-3">
      <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400">
        {icon}
        {title}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function InputField({
  label,
  value,
  error,
  onChange,
  onBlur,
  type = "text",
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-emerald-400"
      />
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

"use client";

import { create } from "zustand";
import type { PackageType, Step, TravelerForm } from "@/components/reserva/types";

type ValidationErrors = Partial<Record<keyof TravelerForm, string>>;

type ReservaState = {
  currentStep: Step;
  selectedSchedule: string | null;
  selectedPackage: PackageType | null;
  form: TravelerForm;
  errors: ValidationErrors;
  setCurrentStep: (step: Step) => void;
  setSchedule: (scheduleId: string) => void;
  setPackage: (packageId: PackageType) => void;
  setPeople: (value: number) => void;
  updateFormField: <K extends keyof TravelerForm>(key: K, value: TravelerForm[K]) => void;
  validateField: (key: keyof TravelerForm) => void;
  validateAll: () => boolean;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d+()\-\s]{7,20}$/;

const validateSingle = (key: keyof TravelerForm, value: string | number) => {
  if (key === "fullName") {
    if (String(value).trim().length < 3) return "Ingresa tu nombre completo.";
  }
  if (key === "email") {
    if (!emailRegex.test(String(value).trim())) return "Correo inválido.";
  }
  if (key === "phone") {
    if (!phoneRegex.test(String(value).trim())) return "Teléfono inválido.";
  }
  if (key === "people") {
    if (Number(value) < 1) return "Debe ser mínimo 1 persona.";
  }
  return "";
};

export const useReservaStore = create<ReservaState>((set, get) => ({
  currentStep: 1,
  selectedSchedule: null,
  selectedPackage: null,
  form: {
    people: 2,
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
  },
  errors: {},
  setCurrentStep: (step) => set({ currentStep: step }),
  setSchedule: (scheduleId) => set({ selectedSchedule: scheduleId, currentStep: 2 }),
  setPackage: (packageId) => set({ selectedPackage: packageId, currentStep: 3 }),
  setPeople: (value) =>
    set((state) => {
      const people = Math.max(1, value);
      return {
        form: { ...state.form, people },
        errors: {
          ...state.errors,
          people: validateSingle("people", people),
        },
      };
    }),
  updateFormField: (key, value) =>
    set((state) => ({
      form: { ...state.form, [key]: value },
      errors: {
        ...state.errors,
        [key]: key === "specialRequests" ? "" : validateSingle(key, value),
      },
    })),
  validateField: (key) => {
    const { form } = get();
    const error = key === "specialRequests" ? "" : validateSingle(key, form[key]);
    set((state) => ({ errors: { ...state.errors, [key]: error } }));
  },
  validateAll: () => {
    const { form } = get();
    const nextErrors: ValidationErrors = {
      fullName: validateSingle("fullName", form.fullName),
      email: validateSingle("email", form.email),
      phone: validateSingle("phone", form.phone),
      people: validateSingle("people", form.people),
    };
    set({ errors: nextErrors });
    return !Object.values(nextErrors).some(Boolean);
  },
}));

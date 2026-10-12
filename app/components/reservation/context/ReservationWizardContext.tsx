"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { BookingStepId, ReservationChoiceStep } from "@/lib/reservation/types";

type ReservationWizardState = {
  currentStep: BookingStepId;
  setCurrentStep: Dispatch<SetStateAction<BookingStepId>>;
  choiceStep: ReservationChoiceStep;
  setChoiceStep: Dispatch<SetStateAction<ReservationChoiceStep>>;
};

const ReservationWizardContext = createContext<ReservationWizardState | null>(null);

export function ReservationWizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<BookingStepId>(1);
  const [choiceStep, setChoiceStep] = useState<ReservationChoiceStep>(1);

  return (
    <ReservationWizardContext.Provider value={{ currentStep, setCurrentStep, choiceStep, setChoiceStep }}>
      {children}
    </ReservationWizardContext.Provider>
  );
}

export function useReservationWizard() {
  const context = useContext(ReservationWizardContext);
  if (!context) throw new Error("useReservationWizard must be used inside ReservationWizardProvider");
  return context;
}

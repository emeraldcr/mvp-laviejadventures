"use client";

import { useState, useCallback, useMemo } from "react";
import {
  EMAIL_REGEX,
  PHONE_NUMBER_REGEX,
  ReservationFormState,
} from "@/lib/constants/reservation";

export interface ReservationFormValidation {
  isNameValid: boolean;
  isEmailValid: boolean;
  isPhoneNumberValid: boolean;
  isAgreeTermsValid: boolean;
}

export interface UseReservationFormReturn {
  formState: ReservationFormState;
  handleChange: (key: keyof ReservationFormState, value: string | boolean) => void;
  validation: ReservationFormValidation;
}

export function useReservationForm(
  initialState: ReservationFormState
): UseReservationFormReturn {
  const [formState, setFormState] = useState<ReservationFormState>(initialState);

  const handleChange = useCallback(
    (key: keyof ReservationFormState, value: string | boolean) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const validation = useMemo<ReservationFormValidation>(() => {
    const isNameValid = formState.name.trim() !== "";
    const isEmailValid =
      formState.email.trim() !== "" &&
      EMAIL_REGEX.test(formState.email.trim());
    const isPhoneNumberValid =
      formState.phoneNumber.trim() !== "" &&
      PHONE_NUMBER_REGEX.test(formState.phoneNumber.trim());

    return {
      isNameValid,
      isEmailValid,
      isPhoneNumberValid,
      isAgreeTermsValid: formState.agreeTerms,
    };
  }, [formState]);

  return { formState, handleChange, validation };
}

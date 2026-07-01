import { useState, useMemo, useCallback } from "react";
import type { ReservationFormState } from "@/lib/reservation/types";
import { EMAIL_REGEX, PHONE_NUMBER_REGEX } from "@/lib/reservation/constants";

interface UseReservationFormReturn {
  formState: ReservationFormState;
  handleChange: (key: keyof ReservationFormState, value: string | boolean) => void;
  validation: {
    isNameValid: boolean;
    isEmailValid: boolean;
    isPhoneNumberValid: boolean;
    isAgreeTermsValid: boolean;
  };
}

const useReservationForm = (initialState: ReservationFormState): UseReservationFormReturn => {
  const [formState, setFormState] = useState<ReservationFormState>(initialState);

  const handleChange = useCallback(
    (key: keyof ReservationFormState, value: string | boolean) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const validation = useMemo(() => {
    const isNameValid = formState.name.trim() !== "";
    const isEmailValid =
      formState.email.trim() !== "" && EMAIL_REGEX.test(formState.email.trim());
    const isPhoneNumberValid =
      formState.phoneNumber.trim() !== "" &&
      PHONE_NUMBER_REGEX.test(formState.phoneNumber.trim()) &&
      formState.phoneNumber.replace(/\D/g, "").length >= 6;

    return {
      isNameValid,
      isEmailValid,
      isPhoneNumberValid,
      isAgreeTermsValid: formState.agreeTerms,
    };
  }, [formState]);

  return { formState, handleChange, validation };
};

export default useReservationForm;
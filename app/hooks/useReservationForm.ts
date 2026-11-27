import { useState, useMemo, useCallback, useEffect, type Dispatch, type SetStateAction } from "react";
import type { ReservationFormState } from "@/lib/booking/core/types";
import { EMAIL_REGEX, PHONE_NUMBER_REGEX } from "@/lib/booking/core/constants";

interface UseReservationFormReturn {
  formState: ReservationFormState;
  isHydrated: boolean;
  setFormState: Dispatch<SetStateAction<ReservationFormState>>;
  handleChange: (key: keyof ReservationFormState, value: string | boolean) => void;
  validation: {
    isNameValid: boolean;
    isEmailValid: boolean;
    isPhoneNumberValid: boolean;
    isAgreeTermsValid: boolean;
  };
}

export function isValidReservationPhone(phoneCode: string, phoneNumber: string): boolean {
  const localDigits = phoneNumber.replace(/\D/g, "");
  const fullDigits = `${phoneCode}${phoneNumber}`.replace(/\D/g, "");
  return PHONE_NUMBER_REGEX.test(phoneNumber.trim()) && localDigits.length >= 6 && fullDigits.length <= 15;
}

const useReservationForm = (
  initialState: ReservationFormState,
  options: { storageKey?: string } = {},
): UseReservationFormReturn => {
  const [formState, setFormState] = useState<ReservationFormState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const { storageKey } = options;

  useEffect(() => {
    if (!storageKey) {
      setIsHydrated(true);
      return;
    }

    try {
      const stored = sessionStorage.getItem(storageKey);
      if (!stored) {
        setIsHydrated(true);
        return;
      }
      const parsed = JSON.parse(stored) as Partial<ReservationFormState>;
      setFormState((current) => ({
        ...current,
        name: typeof parsed.name === "string" ? parsed.name : current.name,
        email: typeof parsed.email === "string" ? parsed.email : current.email,
        phoneCode: typeof parsed.phoneCode === "string" ? parsed.phoneCode : current.phoneCode,
        phoneNumber: typeof parsed.phoneNumber === "string" ? parsed.phoneNumber : current.phoneNumber,
        specialRequests: typeof parsed.specialRequests === "string" ? parsed.specialRequests : current.specialRequests,
        agreeTerms: false,
      }));
    } catch {
      try { sessionStorage.removeItem(storageKey); } catch { /* Storage may be blocked entirely. */ }
    } finally {
      setIsHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;

    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ ...formState, agreeTerms: false }));
    } catch {
      // Storage can be unavailable in private browsing; the form still works in memory.
    }
  }, [formState, storageKey]);

  const handleChange = useCallback(
    (key: keyof ReservationFormState, value: string | boolean) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const validation = useMemo(() => {
    const normalizedName = formState.name.trim();
    const normalizedEmail = formState.email.trim();
    const isNameValid = normalizedName.length >= 2 && normalizedName.length <= 120;
    const isEmailValid =
      normalizedEmail.length <= 254 && EMAIL_REGEX.test(normalizedEmail);
    const isPhoneNumberValid = isValidReservationPhone(formState.phoneCode, formState.phoneNumber);

    return {
      isNameValid,
      isEmailValid,
      isPhoneNumberValid,
      isAgreeTermsValid: formState.agreeTerms,
    };
  }, [formState]);

  return { formState, isHydrated, setFormState, handleChange, validation };
};

export default useReservationForm;

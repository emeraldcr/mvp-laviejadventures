import type { KeyboardEvent, RefObject } from "react";
import { AlertCircle } from "lucide-react";
import {
  TravelerInputField,
  TravelerPhoneInput,
} from "@/components/reservation/ReservationFormFields";
import type { ReservationFormState } from "@/lib/reservation/types";

type ReservationTranslations = typeof import("@/lib/translations").translations["es"]["reservation"];

interface ReservationDetailsStep2Props {
  travelerSectionRef: RefObject<HTMLDivElement | null>;
  nameInputRef: RefObject<HTMLInputElement | null>;
  emailInputRef: RefObject<HTMLInputElement | null>;
  phoneInputRef: RefObject<HTMLInputElement | null>;
  isStep2Valid: boolean;
  formState: ReservationFormState;
  validation: {
    isNameValid: boolean;
    isEmailValid: boolean;
    isPhoneNumberValid: boolean;
  };
  missingStep2Items: string[];
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneCodeChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onSpecialRequestsChange: (value: string) => void;
  onNameEnter: (event: KeyboardEvent<HTMLInputElement>) => void;
  onEmailEnter: (event: KeyboardEvent<HTMLInputElement>) => void;
  onPhoneEnter: (event: KeyboardEvent<HTMLInputElement>) => void;
  onFieldBlur: (field: "name" | "email" | "phone" | "specialRequests" | "terms") => void;
  tr: ReservationTranslations;
  lang: "es" | "en";
}

export default function ReservationDetailsStep2({
  travelerSectionRef,
  nameInputRef,
  emailInputRef,
  phoneInputRef,
  isStep2Valid,
  formState,
  validation,
  missingStep2Items,
  onNameChange,
  onEmailChange,
  onPhoneCodeChange,
  onPhoneNumberChange,
  onSpecialRequestsChange,
  onNameEnter,
  onEmailEnter,
  onPhoneEnter,
  onFieldBlur,
  tr,
  lang,
}: ReservationDetailsStep2Props) {
  return (
    <>
      <div ref={travelerSectionRef} className={`mb-6 rounded-xl ${!isStep2Valid ? "ring-2 ring-amber-300/70 p-3" : ""}`}>
        <h3 className="mb-4 text-xl font-semibold">{tr.travelerTitle}</h3>
        {!isStep2Valid && (
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" aria-hidden /> {tr.indicators.completeTravelerData}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TravelerInputField
            id="name"
            label={tr.fullName}
            value={formState.name}
            onChange={onNameChange}
            onBlur={() => onFieldBlur("name")}
            onKeyDown={onNameEnter}
            inputRef={nameInputRef}
            placeholder={tr.namePlaceholder}
            isValid={validation.isNameValid}
            validationMessage={tr.nameRequired}
            required
          />
          <TravelerInputField
            id="email"
            label={tr.emailLabel}
            type="email"
            value={formState.email}
            onChange={onEmailChange}
            onBlur={() => onFieldBlur("email")}
            onKeyDown={onEmailEnter}
            inputRef={emailInputRef}
            placeholder={tr.emailPlaceholder}
            isValid={validation.isEmailValid}
            validationMessage={tr.emailInvalid}
            required
          />
          <TravelerPhoneInput
            phoneCode={formState.phoneCode}
            phoneNumber={formState.phoneNumber}
            setPhoneCode={onPhoneCodeChange}
            setPhoneNumber={onPhoneNumberChange}
            onBlur={() => onFieldBlur("phone")}
            onKeyDown={onPhoneEnter}
            inputRef={phoneInputRef}
            isValid={validation.isPhoneNumberValid}
            label={tr.phoneLabel}
            placeholder={tr.phonePlaceholder}
            validationMessage={tr.phoneInvalid}
          />
          <div className="md:col-span-2">
            <label htmlFor="specialRequests" className="mb-2 block text-lg font-semibold">
              {lang === "es" ? "¿Necesitas algo extra?" : "Need anything extra?"}
              <span className="ml-2 text-sm font-normal text-zinc-500">
                {lang === "es" ? "opcional" : "optional"}
              </span>
            </label>
            <textarea
              id="specialRequests"
              value={formState.specialRequests}
              onChange={(event) => onSpecialRequestsChange(event.target.value)}
              onBlur={() => onFieldBlur("specialRequests")}
              rows={3}
              className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder={
                lang === "es"
                  ? "Ej: transporte desde hotel, comida vegetariana, cumpleaños, guia privado, fotos..."
                  : "Ex: hotel pickup, vegetarian meal, birthday, private guide, photos..."
              }
            />
            <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {lang === "es"
                ? "Lo revisamos antes de confirmar si requiere costo adicional."
                : "We review it before confirmation if it requires an extra cost."}
            </p>
          </div>
        </div>
      </div>
      {!isStep2Valid && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{tr.completeStepTwoHint}</p>
          <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
            {missingStep2Items.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

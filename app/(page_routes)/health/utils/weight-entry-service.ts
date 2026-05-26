import { t } from "../i18n";
import type { Language, Person } from "../types";
import { WeightInputHelper } from "./weight-input";

export class WeightEntryService {
  static validateSubmit(params: {
    activePerson: Person;
    weightDigits: string;
    language: Language;
  }) {
    if (!params.activePerson) {
      return { field: "person" as const, error: t(params.language, "personRequired") };
    }

    const weightError = WeightInputHelper.validate(params.weightDigits, params.language);

    if (weightError) {
      return { field: "weight" as const, error: weightError };
    }

    return null;
  }

  static async save(params: {
    activePerson: Person;
    weightDigits: string;
  }) {
    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: params.activePerson,
        weight: WeightInputHelper.parse(params.weightDigits),
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) throw new Error("Failed to save weight entry");
  }
}


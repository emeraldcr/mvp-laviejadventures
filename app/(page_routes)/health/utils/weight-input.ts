import {
  MAX_REASONABLE_WEIGHT_KG,
  MAX_WEIGHT_DIGITS,
  MIN_REASONABLE_WEIGHT_KG,
} from "../constants";
import { t } from "../i18n";
import type { Language } from "../types";

export class WeightInputHelper {
  static sanitizeDigits(value: string) {
    return value.replace(/\D/g, "").slice(0, MAX_WEIGHT_DIGITS);
  }

  static format(digits: string) {
    if (!digits) return "0.000";

    const padded = digits.padEnd(MAX_WEIGHT_DIGITS, "0");
    const kilograms = padded.slice(0, 2).replace(/^0+(?=\d)/, "") || "0";
    const grams = padded.slice(2);

    return `${kilograms}.${grams}`;
  }

  static parse(digits: string) {
    return Number(WeightInputHelper.format(digits));
  }

  static hasInvalidCharacters(value: string, sanitizedValue: string) {
    return value !== sanitizedValue && value.replace(/[.\s,kgKG]/g, "") !== sanitizedValue;
  }

  static validate(digits: string, language: Language) {
    if (!digits) {
      return t(language, "enterWeight");
    }

    if (digits.length > MAX_WEIGHT_DIGITS) {
      return t(language, "useFiveDigits");
    }

    const weight = WeightInputHelper.parse(digits);

    if (!Number.isFinite(weight)) {
      return t(language, "useNumbersOnly");
    }

    if (weight < MIN_REASONABLE_WEIGHT_KG) {
      return t(language, "tooLow", { weight: weight.toFixed(3) });
    }

    if (weight > MAX_REASONABLE_WEIGHT_KG) {
      return t(language, "tooHigh", { weight: weight.toFixed(3) });
    }

    return "";
  }
}

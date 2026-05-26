import {
  MAX_REASONABLE_WEIGHT_KG,
  MAX_WEIGHT_DIGITS,
  MIN_REASONABLE_WEIGHT_KG,
} from "../constants";

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

  static validate(digits: string) {
    if (!digits) {
      return "Enter a weight first.";
    }

    if (digits.length > MAX_WEIGHT_DIGITS) {
      return "Use 5 digits or fewer.";
    }

    const weight = WeightInputHelper.parse(digits);

    if (!Number.isFinite(weight)) {
      return "Use numbers only.";
    }

    if (weight < MIN_REASONABLE_WEIGHT_KG) {
      return `That looks too low: ${weight.toFixed(3)} kg.`;
    }

    if (weight > MAX_REASONABLE_WEIGHT_KG) {
      return `That looks too high: ${weight.toFixed(3)} kg.`;
    }

    return "";
  }
}


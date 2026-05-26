import { t } from "../i18n";
import type { Language, Person, WeightEntry } from "../types";

export class PeopleHelper {
  static normalizeName(name: string) {
    return name.trim().replace(/\s+/g, " ").toUpperCase();
  }

  static mergePeople(storedPeople: Person[], entries: WeightEntry[]) {
    const entryPeople = entries
      .map((entry) => PeopleHelper.normalizeName(entry.name))
      .filter(Boolean);

    return Array.from(new Set([...storedPeople, ...entryPeople])).sort();
  }

  static validateNewPerson(name: string, people: Person[], language: Language) {
    const normalizedName = PeopleHelper.normalizeName(name);

    if (!normalizedName) {
      return { error: t(language, "personNameRequired"), normalizedName };
    }

    if (people.includes(normalizedName)) {
      return { error: t(language, "personExists"), normalizedName };
    }

    return { error: "", normalizedName };
  }
}


import type {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
} from "react";
import type { Language, Person, Theme, Timeframe, WeightEntry } from "../types";

export type HealthContextValue = {
  selectedPerson: Person;
  setSelectedPerson: (person: Person) => void;
  people: Person[];
  addingPerson: boolean;
  newPersonName: string;
  personError: string;
  weightDigits: string;
  formattedWeight: string;
  saving: boolean;
  error: string;
  isLoading: boolean;
  theme: Theme;
  language: Language;
  isDark: boolean;
  entries: WeightEntry[];
  personEntries: WeightEntry[];
  latestEntryTime?: number;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  startAddingPerson: () => void;
  cancelAddingPerson: () => void;
  setNewPersonName: (name: string) => void;
  addPerson: () => void;
  handleWeightChange: (value: string) => void;
  handleWeightKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleWeightPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  handleSubmit: (event: FormEvent) => Promise<void>;
  updateEntry: (entry: WeightEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getFilteredEntries: (timeframe: Timeframe) => WeightEntry[];
};

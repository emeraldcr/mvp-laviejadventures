export type Step = 1 | 2 | 3;

export type ScheduleOption = {
  id: string;
  label: string;
  subtitle: string;
};

export type PackageType = "esencial" | "fullDay" | "privado";

export type PackageOption = {
  id: PackageType;
  title: string;
  shortBenefit: string;
  fullDescription: string;
  benefits: string[];
  pricePerPerson: number;
  availabilityBadge?: string;
  availabilityHint?: string;
};

export type TravelerForm = {
  people: number;
  fullName: string;
  email: string;
  phone: string;
  specialRequests: string;
};

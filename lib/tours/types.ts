export type TourSummary = {
  id: string;
  slug: string;
  titleEs: string;
  titleEn: string;
  descriptionEs?: string;
  descriptionEn?: string;
  duration?: string;
  difficulty?: string;
  priceCRC?: number;
  location?: string;
  inclusions?: string[];
  exclusions?: string[];
  cancellationPolicy?: string;
  restrictions?: string;
  packages?: TourPackageOption[];
  tagEs?: string;
  tagEn?: string;
};

export type TourPackageOption = {
  id?: string;
  name: string;
  nameEs?: string;
  price: number;
  priceCRC?: number | null;
  descriptionEn?: string;
  descriptionEs?: string;
  includes?: string[];
  includesEs?: string[];
  groupTour?: boolean;
  departureTimes?: string[];
  scheduleNote?: string;
};

export type ContactInfo = {
whatsapp: string;
email: string;
youtube: string;
facebook: string;
twitter: string;
instagram: string;
};

export type TourInfo = {
name: string;
duration: string;
price: string;
inclusions: string[];
exclusions: string[];
cancellationPolicy?: string;
location: string;
operator: string;
details: string;
restrictions: string;
contact: ContactInfo;
};

export type TourDocument = {
  _id?: string;
  slug: string;
  iconName: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  duration: string;
  difficulty: string;
  priceCRC: number;
  tagEs: string;
  tagEn: string;
  accent: string;
  border: string;
  type: "public" | "b2b" | "both";
  retailPricePerPax?: number;
  currency?: string;
  minPax?: number;
  maxPax?: number;
  includes?: string[];
  inclusions?: string[];
  exclusions?: string[];
  packages?: TourPackageOption[];
  restrictions?: string;
  location?: string;
  cancellationPolicy?: string;
  isMain?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
};

// Main tour info as served from the API

export type MainTourInfo = {
  name: string;
  operator: string;
  duration: string;
  price: string;
  location: string;
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
  details: string;
  restrictions: string;
  contact: ContactInfo;
};
